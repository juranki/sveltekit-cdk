import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { Construct, Fn } from "@aws-cdk/core";
import { DEFAULT_ARTIFACT_PATH, RendererProps, SvelteRendererEndpoint } from "./common";
import { join } from "path";

export interface SvelteApiV2LambdaRendererProps extends RendererProps{}

export class SvelteApiV2LambdaRenderer extends Construct implements SvelteRendererEndpoint {
    api: HttpApi
    handler: NodejsFunction

    constructor(scope: Construct, id: string, props?: SvelteApiV2LambdaRendererProps) {
        super(scope, id)

        this.handler = new NodejsFunction(this, 'svelteHandler', {
            entry: join(props?.artifactPath || DEFAULT_ARTIFACT_PATH, 'server/proxy-v2/handler.js'),
            environment: props?.environment,
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