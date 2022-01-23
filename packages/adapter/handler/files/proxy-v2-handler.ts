import { App } from 'APP'
import { manifest } from 'MANIFEST'
import type {
    APIGatewayProxyHandlerV2,
    APIGatewayProxyEventHeaders,
    APIGatewayProxyEventV2,
    APIGatewayProxyStructuredResultV2
} from 'aws-lambda'
import type { ResponseHeaders } from '@sveltejs/kit/types/helper'
import { log, toRawBody } from './util'
import { resolve } from 'dns'
import { buffer } from 'stream/consumers'

type ProxyResponseHeadersV2 = {
    [header: string]: boolean | number | string;
} | undefined

const app = new App(manifest)

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    log('DEBUG', 'incoming event', event)

    const querystring = event.rawQueryString ? `?${event.rawQueryString}` : ''
    const input: Request = new Request(`${event.requestContext.http.protocol}://${event.requestContext.domainName}${event.requestContext.http.path}${querystring}`, {
        headers: transformIncomingHeaders(event.headers, event.cookies),
        method: event.requestContext.http.method,
        body: transformIncomingBody(event),
    })

    log('DEBUG', 'render input', input)

    const output = await app.render(input)
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

function transformIncomingBody(evt: APIGatewayProxyEventV2): string | undefined {
    return evt.body?.length > 0 ? toRawBody({
        encoding: evt.isBase64Encoded ? 'base64' : 'text',
        data: evt.body
    }) : undefined
}

function transformIncomingHeaders(proxyHeaders: APIGatewayProxyEventHeaders, cookies: string[] | undefined): HeadersInit {
    const headers = Object.fromEntries(
        Object.entries(proxyHeaders)
            .filter(([k, v]) => (!!v)) as Array<[string, string]>
    )
    if (cookies) {
        headers.cookie = cookies.join('; ')
    }
    return headers
}

function transformOutgoingHeaders(svelteHeaders: Headers): ProxyResponseHeadersV2 {
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

function transformOutgoingCookies(svelteHeaders: Headers): string[] | undefined {
    if (!svelteHeaders) return undefined
    const cookieHeaderKeys = Object.keys(svelteHeaders).filter(k => (k.toLowerCase() === 'set-cookie'))
    if (cookieHeaderKeys.length === 0) return undefined
    return cookieHeaderKeys.map(k => svelteHeaders[k]).flat()
}

async function transformResponse(resp: Response): Promise<APIGatewayProxyStructuredResultV2> {
    // TODO: BINARY RESPONSE???
    const body = await resp.text()
    const rv: APIGatewayProxyStructuredResultV2 = {
        body,
        statusCode: resp.status,
        isBase64Encoded: false,
        headers: resp.headers ? transformOutgoingHeaders(resp.headers) : undefined,
        cookies: transformOutgoingCookies(resp.headers)
    }
    
    return rv
}
