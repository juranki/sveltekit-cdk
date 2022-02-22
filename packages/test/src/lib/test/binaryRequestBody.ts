import { readable } from 'svelte/store'
import type { Subscriber } from 'svelte/store'
import type { Test } from './types'
import { pack } from 'msgpackr'

const test: Test = {
    title: 'Binary request body',
    description: 'Adapter can handle binary request body',
    status: 'initial'
}

export const binaryRequestBody = readable<Test>(test, (set) => {
    run(set)
})

async function run(set: Subscriber<Test>) {
    let res: Response
    set({
        ...test,
        status: 'running'
    })
    try {
        res = await fetch('/endpoints/msgpack.json', {
            method: 'POST',
            body: pack({
                test: 'payload'
            }), 
            headers: {
                'content-type': 'application/x-msgpack'
            }
        })
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
    let body:any
    try {
        body = await res.json()
    } catch (error) {
        set({
            ...test,
            status: 'failure',
            error: error.toString()
        })
        return
    }
    if (body.test !== 'payload') {
        set({
            ...test,
            status: 'failure',
            error: 'unexpected return value'
        })
        return
    }
    set({
        ...test,
        status: 'success',
    })
}
