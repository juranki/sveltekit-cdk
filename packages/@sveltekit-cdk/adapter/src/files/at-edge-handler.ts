/* eslint-disable import/no-unresolved */
import type {
  CloudFrontHeaders,
  CloudFrontRequest,
  CloudFrontRequestHandler,
  CloudFrontResultResponse,
} from 'aws-lambda';
import { manifest } from 'MANIFEST';
import { prerenderedPages } from 'PRERENDERED';
import { Server } from 'SERVER';
import { isBlaclisted } from './header-blacklist';
import { log, toRawBody } from './util';

const server = new Server(manifest);
let envReady = false;
let initDone = false;
const svelteEnv: { [key: string]: string } = {};

export const handler: CloudFrontRequestHandler = async (event) => {

  log('DEBUG', 'incoming event', event);

  if (event.Records.length !== 1) {
    log('ERROR', 'bad request', event);
    return {
      status: '400',
      statusDescription: 'bad request',
    };
  }
  const request = event.Records[0].cf.request;
  const config = event.Records[0].cf.config;
  const customHeaders = request.origin?.s3?.customHeaders;
  const uri: string = request.uri === '' ? '/' : request.uri;

  if (prerenderedPages[uri]) {
    log('DEBUG', 'loadPrerendered', {
      uri: request.uri,
      path: prerenderedPages[uri],
    });
    request.uri = `/${prerenderedPages[uri]}`;
    request.headers = getS3Headers(request);
    return request;
  }

  if (!envReady && SVELTEKIT_CDK_ENV_MAP && customHeaders) {
    for (const headerName in SVELTEKIT_CDK_ENV_MAP) {
      process.env[SVELTEKIT_CDK_ENV_MAP[headerName]] = customHeaders[headerName][0].value;
      svelteEnv[SVELTEKIT_CDK_ENV_MAP[headerName]] = customHeaders[headerName][0].value;
    }
    log('DEBUG', 'process.env', process.env);
    envReady = true;
  }

  if (!initDone) {
    await server.init({ env: svelteEnv });
    initDone = true;
  }

  if (request.body && request.body.inputTruncated) {
    log('ERROR', 'input trucated', request);
    log('ERROR', 'ref', 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html#lambda-at-edge-function-restrictions');
    throw new Error('input truncated');
  }

  const domain = request.headers.host.length > 0 ? request.headers.host[0].value : config.distributionDomainName;
  const querystring = request.querystring ? `?${request.querystring}` : '';

  const headers = transformIncomingHeaders(request.headers);
  log('DEBUG', 'request headers', headers);
  log('DEBUG', 'domain', headers);

  const input: Request = new Request(`https://${domain}${request.uri}${querystring}`, {
    headers,
    method: request.method,
    body: request.body && request.body.data.length > 0 ? toRawBody(request.body) : undefined,
  });

  const rendered = await server.respond(input, {
    getClientAddress() {
      const addrHeader = request.headers['x-forwarded-for'];
      if (addrHeader) {
        return addrHeader[0].value;
      }
      return '';
    },
  });

  if (rendered) {
    const outgoing: CloudFrontResultResponse = await transformResponse(rendered);
    log('DEBUG', 'outgoing response', outgoing);
    log('INFO', 'handler', {
      path: request.uri,
      status: rendered.status,
    });
    return outgoing;
  }

  log('INFO', 'handler', {
    path: request.uri,
    status: 404,
  });
  return {
    status: '404',
    statusDescription: 'not found',
  };
};

function transformIncomingHeaders(headers: CloudFrontHeaders): HeadersInit {
  return Object.fromEntries(
    Object.entries(headers).map(([k, vs]) => (
      [k, vs[0].value]
    )),
  );
}

function bodyEncondingFromMime(mime: string | null): 'base64' | 'text' | undefined {
  if (!mime) return undefined;
  mime = mime.split(';')[0]; // remove parameters
  if (mime.startsWith('text/')) return 'text';
  if (mime.endsWith('+xml')) return 'text';
  if ([
    'application/json',
    'application/xml',
    'application/js',
    'application/javascript',
  ].includes(mime)) return 'text';

  return 'base64';
}

async function transformResponse(rendered: Response): Promise<CloudFrontResultResponse> {
  const bodyEncoding = bodyEncondingFromMime(rendered.headers.get('content-type'));
  let body: string | undefined;

  if (bodyEncoding === 'text') {
    body = await rendered.text();
  } else if (bodyEncoding === 'base64') {
    const aBuf = await rendered.arrayBuffer();
    const buf = Buffer.from(aBuf);
    body = buf.toString('base64');
  }

  return {
    status: rendered.status.toString(),
    headers: transformOutgoingHeaders(rendered.headers),
    body,
    bodyEncoding,
  };
}

function transformOutgoingHeaders(headers: Headers): CloudFrontHeaders {
  const rv: CloudFrontHeaders = {};
  headers.forEach((v: string, k: string) => {
    if (isBlaclisted(k.toLowerCase())) return;
    rv[k.toLowerCase()] = [{
      key: k,
      value: v,
    }];
  });
  // default to not caching SSR content
  if (!rv['cache-control']) {
    rv['cache-control'] = [{
      key: 'Cache-Control',
      value: 'no-store',
    }];
  }
  return rv;
}

/**
 * Headers for s3 GetObject request
 */
function getS3Headers(request: CloudFrontRequest): CloudFrontHeaders {
  return {
    'host': [{ key: 'Host', value: request.origin!.s3!.domainName }],
    'accept': request.headers.accept,
    'x-forwarded-for': request.headers['x-forwarded-for'],
    'user-agent': [{ key: 'User-Agent', value: 'Amazon CloudFront' }],
    'via': request.headers.via,
    'pragma': [{ key: 'Pragma', value: 'no-cache' }],
    'cache-control': [{ key: 'Cache-Control', value: 'no-cache' }],
  };
}

