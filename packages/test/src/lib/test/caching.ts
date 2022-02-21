import { readable } from 'svelte/store'
import type { Subscriber } from 'svelte/store'
import type { Test } from './types'
import { browser } from '$app/env'

const test: Test = {
    title: 'Caching',
    description: 'SSR pages without maxage are not cached. (10 attempts left)',
    status: 'initial'
}

export const caching = readable<Test>(test, (set) => {
    run(set)
})

async function run(set: Subscriber<Test>) {
    if (!browser) return
    // generate a random slug
    const bytes = new Uint8Array(10)
    crypto.getRandomValues(bytes)
    let slug = ''
    bytes.forEach(n => {
        slug += n.toString(16).padStart(2,'0')
    })
    // init counters
    let countDown = 10
    let sameCount = 0
    let previousTS = []
    // set status
    set({
        ...test,
        status: 'running'
    })
    // set timer to pound the new page
    let intervalId = setInterval(async () => {
        set({
            ...test,
            description: `SSR pages without maxage are not cached. (${countDown} attempts left)`,
            status: 'running'
        })
        let res: Response
        let data: string
        try {
            res = await fetch(`/ssr/${slug}`)
        } catch (error) {
            set({
                ...test,
                description: `SSR pages without maxage are not cached. (${countDown} attempts left)`,
                status: 'failure',
                error: error.toString()
            })
            clearInterval(intervalId)
            return
        }
        try {
            data = await res.text()
        } catch (error) {
            set({
                ...test,
                status: 'failure',
                description: `SSR pages without maxage are not cached. (${countDown} attempts left)`,
                error: error.toString()
            })
            clearInterval(intervalId)
            return
        }
        const re = /Rendered at: (\S*)/g
        const match = re.exec(data)
        if (!match) {
            set({
                ...test,
                status: 'failure',
                description: `SSR pages without maxage are not cached. (${countDown} attempts left)`,
                error: "Didn't find expected pattern in response"
            })
            clearInterval(intervalId)
            return
        }
        if (previousTS.includes(match[1])) {
            set({
                ...test,
                status: 'failure',
                description: `SSR pages without maxage are not cached. (${countDown} attempts left)`,
                error: "A page with same timestamp was served twise"
            })
            clearInterval(intervalId)
            return
        }
        
        previousTS.push(match[1])
        countDown--
        if (countDown <= 0) {
            set({
                ...test,
                status: 'success',
                description: `SSR pages without maxage are not cached.`,
            })
            clearInterval(intervalId)
            return
        }
    }, 1000)

}
