import { Construct } from 'constructs'
import { Fn } from 'aws-cdk-lib'
import * as apiGW from '@aws-cdk/aws-apigatewayv2-alpha'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { DEFAULT_ARTIFACT_PATH, RendererProps, SvelteRendererEndpoint } from "./common"
import { join } from "path";

export interface SvelteApiV2LambdaRendererProps extends RendererProps { }

export class SvelteApiV2LambdaRenderer extends Construct implements SvelteRendererEndpoint {
    api: apiGW.HttpApi
    handler: lambda.Function

    constructor(scope: Construct, id: string, props?: SvelteApiV2LambdaRendererProps) {
        super(scope, id)

        const artifactPath = props?.artifactPath || DEFAULT_ARTIFACT_PATH
        const bundleDir = join(artifactPath, 'lambda/proxy-v2')

        this.handler = new nodeLambda.NodejsFunction(this, 'svelteHandler', {
            entry: join(bundleDir, 'handler.js'),
            handler: 'handler.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            environment: props?.environment,
        })

        const svelteIntegration = new HttpLambdaIntegration('SvelteIntegration', this.handler);

        this.api = new apiGW.HttpApi(this, 'svelteBackendApi')

        this.api.addRoutes({
            path: '/{proxy+}',
            integration: svelteIntegration,
        })

    }

    get httpEndpoint(): string {
        return Fn.select(1, Fn.split('://', this.api.apiEndpoint))
    }

}