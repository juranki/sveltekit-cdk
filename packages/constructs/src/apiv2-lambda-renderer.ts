import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda'
import { Construct, Fn } from "@aws-cdk/core";
import { DEFAULT_ARTIFACT_PATH, RendererProps, SvelteRendererEndpoint } from "./common";
import { join } from "path";

export interface SvelteApiV2LambdaRendererProps extends RendererProps { }

export class SvelteApiV2LambdaRenderer extends Construct implements SvelteRendererEndpoint {
    api: HttpApi
    handler: Function

    constructor(scope: Construct, id: string, props?: SvelteApiV2LambdaRendererProps) {
        super(scope, id)

        const artifactPath = props?.artifactPath || DEFAULT_ARTIFACT_PATH
        const bundleDir = join(artifactPath, 'lambda/proxy-v2')

        this.handler = new Function(this, 'svelteHandler', {
            code: Code.fromAsset(bundleDir),
            handler: 'handler.handler',
            runtime: Runtime.NODEJS_14_X,
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