export const DEFAULT_ARTIFACT_PATH = 'sveltekit'

export interface SvelteBackend {
    get httpEndpoint(): string
}
