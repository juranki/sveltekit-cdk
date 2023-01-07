# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### SvelteDistribution <a name="SvelteDistribution" id="@sveltekit-cdk/constructs.SvelteDistribution"></a>

#### Initializers <a name="Initializers" id="@sveltekit-cdk/constructs.SvelteDistribution.Initializer"></a>

```typescript
import { SvelteDistribution } from '@sveltekit-cdk/constructs'

new SvelteDistribution(scope: Construct, id: string, props: SvelteDistributionProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.Initializer.parameter.props">props</a></code> | <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps">SvelteDistributionProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@sveltekit-cdk/constructs.SvelteDistribution.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@sveltekit-cdk/constructs.SvelteDistribution.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@sveltekit-cdk/constructs.SvelteDistribution.Initializer.parameter.props"></a>

- *Type:* <a href="#@sveltekit-cdk/constructs.SvelteDistributionProps">SvelteDistributionProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@sveltekit-cdk/constructs.SvelteDistribution.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@sveltekit-cdk/constructs.SvelteDistribution.isConstruct"></a>

```typescript
import { SvelteDistribution } from '@sveltekit-cdk/constructs'

SvelteDistribution.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@sveltekit-cdk/constructs.SvelteDistribution.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.Distribution</code> | *No description.* |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistribution.property.function">function</a></code> | <code>aws-cdk-lib.aws_cloudfront.experimental.EdgeFunction</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="@sveltekit-cdk/constructs.SvelteDistribution.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="@sveltekit-cdk/constructs.SvelteDistribution.property.bucket"></a>

```typescript
public readonly bucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `distribution`<sup>Required</sup> <a name="distribution" id="@sveltekit-cdk/constructs.SvelteDistribution.property.distribution"></a>

```typescript
public readonly distribution: Distribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

---

##### `function`<sup>Optional</sup> <a name="function" id="@sveltekit-cdk/constructs.SvelteDistribution.property.function"></a>

```typescript
public readonly function: EdgeFunction;
```

- *Type:* aws-cdk-lib.aws_cloudfront.experimental.EdgeFunction

---


## Structs <a name="Structs" id="Structs"></a>

### RendererProps <a name="RendererProps" id="@sveltekit-cdk/constructs.RendererProps"></a>

#### Initializer <a name="Initializer" id="@sveltekit-cdk/constructs.RendererProps.Initializer"></a>

```typescript
import { RendererProps } from '@sveltekit-cdk/constructs'

const rendererProps: RendererProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@sveltekit-cdk/constructs.RendererProps.property.artifactPath">artifactPath</a></code> | <code>string</code> | Location of sveltekit artifacts. |
| <code><a href="#@sveltekit-cdk/constructs.RendererProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Environment variables for the backend implementation. |
| <code><a href="#@sveltekit-cdk/constructs.RendererProps.property.logLevel">logLevel</a></code> | <code>string</code> | Logging verbosity (default: INFO). |

---

##### `artifactPath`<sup>Optional</sup> <a name="artifactPath" id="@sveltekit-cdk/constructs.RendererProps.property.artifactPath"></a>

```typescript
public readonly artifactPath: string;
```

- *Type:* string
- *Default:* 'sveltekit'

Location of sveltekit artifacts.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="@sveltekit-cdk/constructs.RendererProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Environment variables for the backend implementation.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@sveltekit-cdk/constructs.RendererProps.property.logLevel"></a>

```typescript
public readonly logLevel: string;
```

- *Type:* string

Logging verbosity (default: INFO).

---

### SvelteDistributionProps <a name="SvelteDistributionProps" id="@sveltekit-cdk/constructs.SvelteDistributionProps"></a>

#### Initializer <a name="Initializer" id="@sveltekit-cdk/constructs.SvelteDistributionProps.Initializer"></a>

```typescript
import { SvelteDistributionProps } from '@sveltekit-cdk/constructs'

const svelteDistributionProps: SvelteDistributionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps.property.artifactPath">artifactPath</a></code> | <code>string</code> | Location of sveltekit artifacts. |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps.property.bucketProps">bucketProps</a></code> | <code>aws-cdk-lib.aws_s3.BucketProps</code> | Bucket props for the svelteStaticBucket s3 bucket. |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps.property.cachePolicy">cachePolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.ICachePolicy</code> | Cache policy determies caching for dynamic content. |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps.property.certificateArn">certificateArn</a></code> | <code>string</code> | Certificate to use with the CloudFront Distribution. |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps.property.domainNames">domainNames</a></code> | <code>string[]</code> | Domain names to associate with the CloudFront Distribution. |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps.property.originRequestPolicy">originRequestPolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy</code> | Origin request policy determines which parts of requests CloudFront passes to your backend. |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps.property.priceClass">priceClass</a></code> | <code>aws-cdk-lib.aws_cloudfront.PriceClass</code> | PriceClass. |
| <code><a href="#@sveltekit-cdk/constructs.SvelteDistributionProps.property.rendererProps">rendererProps</a></code> | <code><a href="#@sveltekit-cdk/constructs.RendererProps">RendererProps</a></code> | Props for Lambda@Edge renderer. |

---

##### `artifactPath`<sup>Optional</sup> <a name="artifactPath" id="@sveltekit-cdk/constructs.SvelteDistributionProps.property.artifactPath"></a>

```typescript
public readonly artifactPath: string;
```

- *Type:* string
- *Default:* 'sveltekit'

Location of sveltekit artifacts.

---

##### `bucketProps`<sup>Optional</sup> <a name="bucketProps" id="@sveltekit-cdk/constructs.SvelteDistributionProps.property.bucketProps"></a>

```typescript
public readonly bucketProps: BucketProps;
```

- *Type:* aws-cdk-lib.aws_s3.BucketProps

Bucket props for the svelteStaticBucket s3 bucket.

> [https://docs.aws.amazon.com/cdk/api/v1/docs/](https://docs.aws.amazon.com/cdk/api/v1/docs/)

---

##### `cachePolicy`<sup>Optional</sup> <a name="cachePolicy" id="@sveltekit-cdk/constructs.SvelteDistributionProps.property.cachePolicy"></a>

```typescript
public readonly cachePolicy: ICachePolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.ICachePolicy
- *Default:* CACHING_DISABLED

Cache policy determies caching for dynamic content.

Note: static content is cached using default setting (CACHING_OPTIMIZED).

> [https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html)

---

##### `certificateArn`<sup>Optional</sup> <a name="certificateArn" id="@sveltekit-cdk/constructs.SvelteDistributionProps.property.certificateArn"></a>

```typescript
public readonly certificateArn: string;
```

- *Type:* string
- *Default:* undefined

Certificate to use with the CloudFront Distribution.

---

##### `domainNames`<sup>Optional</sup> <a name="domainNames" id="@sveltekit-cdk/constructs.SvelteDistributionProps.property.domainNames"></a>

```typescript
public readonly domainNames: string[];
```

- *Type:* string[]
- *Default:* undefined

Domain names to associate with the CloudFront Distribution.

---

##### `originRequestPolicy`<sup>Optional</sup> <a name="originRequestPolicy" id="@sveltekit-cdk/constructs.SvelteDistributionProps.property.originRequestPolicy"></a>

```typescript
public readonly originRequestPolicy: IOriginRequestPolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy
- *Default:* AllViewer managed policy

Origin request policy determines which parts of requests CloudFront passes to your backend.

> [https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html)

---

##### `priceClass`<sup>Optional</sup> <a name="priceClass" id="@sveltekit-cdk/constructs.SvelteDistributionProps.property.priceClass"></a>

```typescript
public readonly priceClass: PriceClass;
```

- *Type:* aws-cdk-lib.aws_cloudfront.PriceClass
- *Default:* PriceClass.PRICE_CLASS_100

PriceClass.

> [https://docs.aws.amazon.com/cdk/api/latest/typescript/api/aws-cloudfront/priceclass.html#aws_cloudfront_PriceClass](https://docs.aws.amazon.com/cdk/api/latest/typescript/api/aws-cloudfront/priceclass.html#aws_cloudfront_PriceClass)

---

##### `rendererProps`<sup>Optional</sup> <a name="rendererProps" id="@sveltekit-cdk/constructs.SvelteDistributionProps.property.rendererProps"></a>

```typescript
public readonly rendererProps: RendererProps;
```

- *Type:* <a href="#@sveltekit-cdk/constructs.RendererProps">RendererProps</a>

Props for Lambda@Edge renderer.

---



