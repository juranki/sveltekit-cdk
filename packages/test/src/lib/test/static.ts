import { readable } from 'svelte/store'
import type { Subscriber } from 'svelte/store'
import type { Test } from './types'

const test: Test = {
    title: 'Static assets',
    description: 'Static assets are served',
    status: 'initial'
}

export const staticContent = readable<Test>(test, (set) => {
    run(set)
})

async function run(set: Subscriber<Test>) {
    let res: Response
    set({
        ...test,
        status: 'running'
    })
    try {
        res = await fetch('/favicon.png')
    } catch (error) {
        set({
            ...test,
            status: 'failure',
            error: error.toString()
        })
        return
    }
    const t = res.status
    if (res.status !== 200) {
        set({
            ...test,
            status: 'failure',
            error: `Expected status 200, got ${res.status}`
        })
        return
    }
    set({
        ...test,
        status: 'success',
    })
}
