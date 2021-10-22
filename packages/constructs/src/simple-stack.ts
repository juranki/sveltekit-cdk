import { DistributionProps } from "@aws-cdk/aws-cloudfront";
import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { SvelteBackendApiV2Lambda, SvelteBackendApiV2LambdaProps } from "./backend-apiv2-lambda";
import { SvelteDistribution, SvelteDistributionProps } from "./distribution";

export interface SimpleSvelteStackProps extends
    StackProps, SvelteDistributionProps, SvelteBackendApiV2LambdaProps { }

export class SimpleSvelteStack extends Stack {
    constructor(scope: Construct, id: string, props?: SimpleSvelteStackProps) {
        super(scope, id, props);

        const backend = new SvelteBackendApiV2Lambda(this, 'svelteBackend', props)
        new SvelteDistribution(this, 'svelteDistribution', {
            backend,
        })

    }
}