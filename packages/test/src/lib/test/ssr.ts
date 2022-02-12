import { readable } from 'svelte/store'
import type { Subscriber } from 'svelte/store'
import type { Test } from './types'

const test: Test = {
    title: 'SSR pages',
    description: 'Adapter is able to render SSR pages.',
    status: 'initial'
}

export const ssr = readable<Test>(test, (set) => {
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
        res = await fetch('/ssr/dynamic')
    } catch (error) {
        set({
            ...test,
            status: 'failure',
            error: error.toString()
        })
        return
    }
    try {
        data = await res.text()
    } catch (error) {
        set({
            ...test,
            status: 'failure',
            error: error.toString()
        })
        return
    }
    const re = /Prerendering: ([a-z]*)/g
    const match = re.exec(data)
    if (!match) {
        set({
            ...test,
            status: 'failure',
            error: "Didn't find expected pattern in response"
        })
        return
    }
    if (match[1] !== 'false') {
        set({
            ...test,
            status: 'failure',
            error: `Expected prerendering = "false", got "${match[1]}"`
        })
        return
    }

    set({
        ...test,
        status: 'success',
    })
}
