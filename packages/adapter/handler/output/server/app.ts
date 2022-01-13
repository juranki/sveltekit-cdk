/**
 * Dummy page renderer to provide the interface to code proxy handler(s)
 */

import type { IncomingRequest } from '@sveltejs/kit'
import { ServerResponse } from '@sveltejs/kit/types/hooks'

export class App {
    constructor(manifest) { }

    render(incoming: IncomingRequest): Promise<ServerResponse> {
        return new Promise((resolve) => {
            resolve({
                status: 200,
                headers: {},
            });
        });
    }
}
