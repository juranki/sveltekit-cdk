import { DistributionProps } from "@aws-cdk/aws-cloudfront";
import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { SvelteApiV2LambdaRenderer, SvelteApiV2LambdaRendererProps } from "./apiv2-lambda-renderer";
import { SvelteDistribution, SvelteDistributionProps } from "./distribution";

export interface SimpleSvelteStackProps extends
    StackProps, SvelteDistributionProps { }

export class SimpleSvelteStack extends Stack {
    constructor(scope: Construct, id: string, props?: SimpleSvelteStackProps) {
        super(scope, id, props);

        // const renderer = new SvelteApiV2LambdaRenderer(this, 'svelteBackend', props)
        const renderer = props?.renderer || {
            type: 'AT_EDGE',
            rendererProps: {}
        }
        new SvelteDistribution(this, 'svelteDistribution', {
            renderer: {
                type: 'AT_EDGE',
                rendererProps: {
                    environment: {

                    }
                }
            },
        })

    }
}