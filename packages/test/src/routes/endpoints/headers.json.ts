import type { RequestHandler } from "@sveltejs/kit";

export const get: RequestHandler = async ({ request }) => {
    const body = {}
    request.headers.forEach((v, k) => { body[k] = v })
    return {
        body,
        headers: {
            'cache-control': 'no-store'
        },
    }
}