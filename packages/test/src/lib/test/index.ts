import { readable } from 'svelte/store'
import type { Test } from './types'

export { prerendered } from './prerendered'
export { prerenderedContentType } from './prerenderedContentType'
export { staticContent } from './static'
export { ssr } from './ssr'

export const requestHeaders = readable<Test>({
    title: 'Request headers',
    description: 'Some set of important headers is successfully passed to an endpoint',
    status: 'todo'
})
export const responseHeaders = readable<Test>({
    title: 'Response headers',
    description: 'Some set of important headers is successfully passed from an endpoint',
    status: 'todo'
})
export const cookies = readable<Test>({
    title: 'Cookies',
    description: 'Setting cookies works',
    status: 'todo'
})
export const caching = readable<Test>({
    title: 'Caching',
    description: 'SSR pages are cached and server from cache after initial load',
    status: 'todo'
})
export const cacheControl = readable<Test>({
    title: 'Cache control',
    description: 'Cache obeys cache control headers',
    status: 'todo'
})