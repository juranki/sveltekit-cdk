import type { RequestHandler } from "@sveltejs/kit";

export const get: RequestHandler = async ({ clientAddress }) => {
    const body = { clientAddress }
    return {
        body,
    }
}