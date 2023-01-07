export const DEFAULT_ARTIFACT_PATH = 'sveltekit';

export interface RendererProps {
  /**
   * Location of sveltekit artifacts
   *
   * @default 'sveltekit'
   */
  readonly artifactPath?: string;
  /**
   * Environment variables for the backend implementation
   */
  readonly environment?: {
    [key: string]: string;
  };
  /**
   * Logging verbosity (default: INFO)
   */
  readonly logLevel?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
}

export type StaticRoutes = Record<string, 'prerendered' | 'static'>
