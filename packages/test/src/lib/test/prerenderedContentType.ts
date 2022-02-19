import { readable } from 'svelte/store'
import type { Subscriber } from 'svelte/store'
import type { Test } from './types'

const test: Test = {
    title: 'Prerendered page content type',
    description: 'Content type of prerendered pages is text/html',
    status: 'initial'
}

export const prerenderedContentType = readable<Test>(test, (set) => {
    run(set)
})

async function run(set: Subscriber<Test>) {
    let res: Response
    let data: string
    set({
        ...test,
        status: 'running'
    })
    try {
        res = await fetch('/ssr/prerendered')
    } catch (error) {
        set({
            ...test,
            status: 'failure',
            error: error.toString()
        })
        return
    }
    const t = res.headers.get('content-type')
    if (t !== 'text/html') {
        set({
            ...test,
            status: 'failure',
            error: `Expected "text/html", got "${t}"`
        })
        return
    }
    set({
        ...test,
        status: 'success',
    })
}
