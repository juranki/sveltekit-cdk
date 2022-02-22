import type { StrictBody } from "@sveltejs/kit/types/hooks"


// LOGGING UTILITIES
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

const LOG_LEVEL = (process.env.LOG_LEVEL?.toUpperCase() || 'INFO') as LogLevel
const logLevels: { [k: string]: number } = {
    ERROR: 4,
    WARN: 3,
    INFO: 2,
    DEBUG: 1,
}
export function log(level: LogLevel, msg: string, data: any): void {
    if (logLevels[level] && logLevels[level] >= logLevels[LOG_LEVEL]) {
        console.log(JSON.stringify({ level, msg, data }))
    }
}


// REQUEST TRANSFORMATION UTILITIES
export interface BodyInfo {
    data: string
    encoding: 'base64' | 'text'
}

export function toRawBody(body: BodyInfo): BodyInit {
    return body.encoding === 'base64'
        ? Buffer.from(body.data, 'base64')
        : body.data
}

export function fromStrictBody(body: StrictBody): BodyInfo {
    if (body instanceof Uint8Array) {
        return {
            data: Buffer.from(body).toString('base64'),
            encoding: 'base64',
        }
    }
    return {
        data: body,
        encoding: 'text'
    }
}