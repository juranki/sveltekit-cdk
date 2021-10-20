import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { SvelteBackendApiV2Lambda } from "./backend-apiv2-lambda";
import { SvelteDistribution } from "./distribution";

export interface SimpleSvelteStackProps extends StackProps {
    /**
     * Location of sveltekit artifacts
     * 
     * @default 'sveltekit'
     */
     artifactPath?: string
}

export class SimpleSvelteStack extends Stack {
    constructor(scope: Construct, id: string, props?: SimpleSvelteStackProps) {
        super(scope, id, props);
        const artifactPath = props?.artifactPath || 'sveltekit'

        const backend = new SvelteBackendApiV2Lambda(this, 'svelteBackend', {
            artifactPath
        })

        new SvelteDistribution(this, 'svelteDistribution', {
            artifactPath,
            backend,
        })

    }
}