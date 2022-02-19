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
}

export type StaticRoutes = Record<string, 'prerendered' | 'static'>
