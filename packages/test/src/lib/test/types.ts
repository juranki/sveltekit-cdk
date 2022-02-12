export interface Test {
    title: string
    description: string
    error?: string
    status: 'initial' | 'running' | 'success' | 'failure' | 'todo'
}