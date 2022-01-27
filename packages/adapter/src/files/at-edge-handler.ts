import { App } from 'APP'
import { manifest } from 'MANIFEST'
import type {
    CloudFrontHeaders,
    CloudFrontRequestHandler,
    CloudFrontRequestResult
} from 'aws-lambda'
import { log, toRawBody } from './util'

const app = new App(manifest)

export const handler: CloudFrontRequestHandler = async (event, context) => {

    log('DEBUG', 'incoming event', event)

    if (event.Records.length !== 1) {
        log('ERROR', 'bad request', event)
        return {
            status: '400',
            statusDescription: 'bad request',
        }
    }
    const request = event.Records[0].cf.request
    const config = event.Records[0].cf.config

    if (request.body && request.body.inputTruncated) {
        log('ERROR', 'input trucated', request)
        log('ERROR', 'ref', 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html#lambda-at-edge-function-restrictions')
        throw new Error("input truncated");
    }

    const domain = request.headers.host.length > 0 ? request.headers.host[0].value : config.distributionDomainName
    const querystring = request.querystring ? `?${request.querystring}` : ''

    const input: Request = new Request(`https://${domain}${request.uri}${querystring}`, {
        headers: transformIncomingHeaders(request.headers),
        method: request.method,
        body: request.body && request.body.data.length > 0 ? toRawBody(request.body) : undefined,
    })

    log('DEBUG', 'render input', input)

    const rendered = await app.render(input)

    if (rendered) {
        log('DEBUG', 'render output', rendered)

        const outgoing: CloudFrontRequestResult = await transformResponse(rendered)
        log('DEBUG', 'outgoing response', outgoing)
        log('INFO', 'handler', {
            path: request.uri,
            status: rendered.status,
        })
        return outgoing
    }


    log('INFO', 'handler', {
        path: request.uri,
        status: 404,
    })
    return {
        status: '404',
        statusDescription: 'not found',
    }
}

function transformIncomingHeaders(headers: CloudFrontHeaders): HeadersInit {
    return Object.fromEntries(
        Object.entries(headers).map(([k, vs]) => (
            [k, vs[0].value]
        ))
    )
}


async function transformResponse(rendered: Response): Promise<CloudFrontRequestResult> {
    // TODO: BINARY RESPONSE???
    const body = await rendered.text()

    return {
        status: rendered.status.toString(),
        headers: transformOutgoingHeaders(rendered.headers),
        body,
        bodyEncoding: 'text',
    }
}

function transformOutgoingHeaders(headers: Headers): CloudFrontHeaders {
    const rv: CloudFrontHeaders = {}
    headers.forEach((v, k) => {
        rv[k.toLowerCase()] = [{
            key: k,
            value: v
        }]
    })
    return rv
}
