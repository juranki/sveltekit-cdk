import { init, render } from '../output/server/app'
import type {
    APIGatewayProxyHandlerV2,
    APIGatewayProxyEventHeaders,
    APIGatewayProxyEventV2,
    APIGatewayProxyStructuredResultV2
} from 'aws-lambda'
import { URLSearchParams } from 'url'
import type { RequestHeaders, ResponseHeaders } from '@sveltejs/kit/types/helper'
import type { IncomingRequest, RawBody } from '@sveltejs/kit'
import type { ServerResponse } from '@sveltejs/kit/types/hooks'

type ProxyResponseHeadersV2 = {
    [header: string]: boolean | number | string;
} | undefined

const encoder = new TextEncoder()
const LOG_LEVEL = process.env.LOG_LEVEL?.toUpperCase() || 'INFO'
init()

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    log('DEBUG', 'incoming event', event)

    const input: IncomingRequest = {
        headers: transformIncomingHeaders(event.headers, event.cookies),
        host: event.requestContext.domainName,
        method: event.requestContext.http.method,
        path: event.requestContext.http.path,
        query: new URLSearchParams(event.rawQueryString),
        rawBody: transformIncomingBody(event),
    }
    log('DEBUG', 'render input', input)

    const output = await render(input)
    if (output) {
        log('DEBUG', 'render output', output)

        const outgoing = transformResponse(output)
        log('DEBUG', 'outgoing response', outgoing)
        log('INFO', 'handler', {
            path: event.requestContext.http.path,
            status: output.status,
        })
        return outgoing
    }

    log('INFO', 'handler', {
        path: event.requestContext.http.path,
        status: 404,
    })
    return {
        statusCode: 404,
    }
}

function transformIncomingBody(evt: APIGatewayProxyEventV2): RawBody {
    if (!evt.body) {
        return null
    }
    if (evt.isBase64Encoded) {
        return new Uint8Array(Buffer.from(evt.body, 'base64'))
    }
    return encoder.encode(evt.body)
}

function transformIncomingHeaders(proxyHeaders: APIGatewayProxyEventHeaders, cookies: string[] | undefined): RequestHeaders {
    const headers = Object.fromEntries(
        Object.entries(proxyHeaders)
            .filter(([k, v]) => (!!v)) as Array<[string, string]>
    )
    if (cookies) {
        headers.cookie = cookies.join('; ')
    }
    return headers
}

function transformOutgoingHeaders(svelteHeaders: ResponseHeaders): ProxyResponseHeadersV2 {
    return Object.fromEntries<string>(
        Object.entries(svelteHeaders)
            .filter(([k, _]) => (k.toLowerCase() !== 'set-cookie'))
            .map(([k, v]) => {
                if (v instanceof Array) {
                    return [k, v[0]]
                }
                return [k, v]
            })
    )
}

function transformOutgoingCookies(svelteHeaders: ResponseHeaders): string[] | undefined {
    if (!svelteHeaders) return undefined
    const cookieHeaderKeys = Object.keys(svelteHeaders).filter(k => (k.toLowerCase() === 'set-cookie'))
    if (cookieHeaderKeys.length === 0) return undefined
    return cookieHeaderKeys.map(k => svelteHeaders[k]).flat()
}

function transformResponse(resp: ServerResponse): APIGatewayProxyStructuredResultV2 {
    const rv: APIGatewayProxyStructuredResultV2 = {
        statusCode: resp.status,
        isBase64Encoded: false,
        headers: resp.headers ? transformOutgoingHeaders(resp.headers) : undefined,
        cookies: transformOutgoingCookies(resp.headers)
    }

    if (resp.body instanceof Uint8Array) {
        rv.body = Buffer.from(resp.body).toString('base64')
        rv.isBase64Encoded = true
    } else {
        rv.body = resp.body
    }

    return rv
}

const logLevels: { [k: string]: number } = {
    ERROR: 1,
    INFO: 2,
    DEBUG: 3,
}
function log(level: string, msg: string, data: any): void {
    if (logLevels[level] && logLevels[level] >= logLevels[LOG_LEVEL]) {
        console.log(JSON.stringify({ level, msg, data }))
    }
}
