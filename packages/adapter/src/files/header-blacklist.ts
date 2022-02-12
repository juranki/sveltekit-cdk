// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html

export function isBlaclisted(header: string): boolean {
    if (blacklist.includes(header)) {
        return true
    }
    if (readonly.includes(header)) {
        return true
    }
    for (const b of prefixBlacklist) {
        if (header.startsWith(b)) {
            return true
        }
    }
    return false
}

const blacklist = [
    'connection',
    'expect',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'proxy-connection',
    'trailer',
    'upgrade',
    'x-accel-buffering',
    'x-accel-charset',
    'x-accel-limit-rate',
    'x-accel-redirect',
    'x-cache',
    'x-forwarded-proto',
    'x-real-ip',
]

const prefixBlacklist = [
    'x-amz-cf-',
    'x-edge-',
]

const readonly = [
    'accept-encoding',
    'content-length',
    'if-modified-since',
    'if-none-match',
    'if-range',
    'if-unmodified-since',
    'transfer-encoding',
    'via',
]