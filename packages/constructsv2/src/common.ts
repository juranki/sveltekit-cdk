export const DEFAULT_ARTIFACT_PATH = 'sveltekit'

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
    /**
     * Logging verbosity (default: INFO)
     */
    logLevel?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
}

export type StaticRoutes = Record<string, 'prerendered' | 'static'>
