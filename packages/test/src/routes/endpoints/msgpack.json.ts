import type { RequestHandler } from '@sveltejs/kit'
import {unpack} from 'msgpackr'

export const post: RequestHandler = async ({request}) => {
    const buf = await request.arrayBuffer()
    
    return {
        body: unpack(Buffer.from(buf)),
        headers: {
            'cache-control': 'no-store',
        },
    }
}