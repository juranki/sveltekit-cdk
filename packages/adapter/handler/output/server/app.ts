/**
 * Dummy page renderer to provide the interface to code proxy handler(s)
 */

import type { IncomingRequest} from '@sveltejs/kit'
import { ServerResponse } from '@sveltejs/kit/types/hooks'

export function init(): void {}
export async function render(incoming:IncomingRequest):Promise<ServerResponse> {
    return {
        headers:{},
        status: 200,
    }
}