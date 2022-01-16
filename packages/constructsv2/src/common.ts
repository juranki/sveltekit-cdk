export const DEFAULT_ARTIFACT_PATH = 'sveltekit'

export interface SvelteRendererEndpoint {
    readonly httpEndpoint: string;
}

export interface RendererProps {
    /**
     * Location of sveltekit artifacts
     * 
     * @default 'sveltekit'
     */
    artifactPath?: string
    /**
     * Environment variables for the backend implementation
     */
    environment?: {
        [key: string]: string;
    }
}