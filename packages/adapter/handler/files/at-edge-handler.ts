import { init, render } from '../output/server/app'
import type {
    CloudFrontHeaders,
    CloudFrontRequestHandler,
    CloudFrontRequestResult
} from 'aws-lambda'
import { BodyInfo, fromStrictBody, log, toRawBody } from './util'
import type { IncomingRequest } from '@sveltejs/kit'
import type { RequestHeaders, ResponseHeaders } from '@sveltejs/kit/types/helper'
import type { ServerResponse } from '@sveltejs/kit/types/hooks'

init()

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

    const input: Partial<IncomingRequest> = {
        headers: transformIncomingHeaders(request.headers),
        host: request.headers.host.length > 0 ? request.headers.host[0].value : config.distributionDomainName,
        method: request.method,
        path: request.uri,
        query: new URLSearchParams(request.querystring),
        rawBody: request.body ? toRawBody(request.body) : undefined,
    }

    log('DEBUG', 'render input', input)

    //@ts-ignore
    const rendered = await render(input)

    if (rendered) {
        log('DEBUG', 'render output', rendered)

        const outgoing: CloudFrontRequestResult = transformResponse(rendered)
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

function transformIncomingHeaders(headers: CloudFrontHeaders): RequestHeaders {
    return Object.fromEntries(
        Object.entries(headers).map(([k, vs]) => (
            [k, vs[0].value]
        ))
    )
}


function transformResponse(rendered: ServerResponse): CloudFrontRequestResult {
    const body: BodyInfo | undefined = rendered.body ? fromStrictBody(rendered.body) : undefined
    return {
        status: rendered.status.toString(),
        headers: transformOutgoingHeaders(rendered.headers),
        body: body?.data || '',
        bodyEncoding: body?.encoding || 'text',
    }
}

function transformOutgoingHeaders(headers: ResponseHeaders): CloudFrontHeaders {
    return Object.fromEntries(Object.entries(headers).map(
        ([k, vs]) => (
            [k, typeof vs === 'string' ? [{ value: vs }] : vs.map(v => ({ value: v }))]
        )
    ))
}

