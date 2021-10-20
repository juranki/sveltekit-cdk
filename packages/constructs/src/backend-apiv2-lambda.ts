import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { Construct, Fn } from "@aws-cdk/core";
import { SvelteBackend } from "backend";
import { join } from "path";

export interface SvelteBackendApiV2LambdaProps {
    /**
     * Location of sveltekit artifacts
     * 
     * @default 'sveltekit'
     */
    artifactPath: string
    /**
     * Environment variables for the backend implementation
     */
    environment?: {
        [key: string]: string;
    }
}

export class SvelteBackendApiV2Lambda extends Construct implements SvelteBackend {
    api: HttpApi
    handler: NodejsFunction
    constructor(scope: Construct, id: string, props: SvelteBackendApiV2LambdaProps) {
        super(scope, id)

        this.handler = new NodejsFunction(this, 'svelteHandler', {
            entry: join(props.artifactPath, 'server/proxy-handler-v2.js'),
            environment: props.environment,
        })

        const svelteIntegration = new LambdaProxyIntegration({
            handler: this.handler,
        })

        this.api = new HttpApi(this, 'svelteBackendApi')

        this.api.addRoutes({
            path: '/{proxy+}',
            integration: svelteIntegration,
        })

    }
    get httpEndpoint(): string {
        return Fn.select(1, Fn.split('://', this.api.apiEndpoint))
    }
}