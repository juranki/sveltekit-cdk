
// LOGGING UTILITIES
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

const logLevels: { [k: string]: number } = {
    ERROR: 4,
    WARN: 3,
    INFO: 2,
    DEBUG: 1,
}
export function log(level: LogLevel, msg: string, data: any): void {
    if (logLevels[level] && logLevels[level] >= logLevels[SVELTEKIT_CDK_LOG_LEVEL]) {
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
