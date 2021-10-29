import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { SvelteDistribution } from "./distribution";
/**
 * Deploy sveltekit site to Cloudfront distribution with 
 * Lambda@Edge renderer, triggered by origin request event.
 */
export class SimpleSvelteStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        new SvelteDistribution(this, 'svelteDistribution', {
            renderer: {
                type: 'VIEWER_REQ',
                rendererProps: {
                    environment: {
                        LOG_LEVEL: 'DEBUG',
                    },
                }
            }
        })

    }
}