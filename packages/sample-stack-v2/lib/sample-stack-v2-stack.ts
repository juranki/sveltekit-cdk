import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SvelteDistribution } from '@sveltekit-cdk/constructsv2'
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';

export interface SimpleSvelteStackProps extends StackProps {
  zoneName: string
  fqdn: string
}

export class SimpleSvelteStack extends Stack {
  constructor(scope: Construct, id: string, props: SimpleSvelteStackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.zoneName
    })

    const cert = new DnsValidatedCertificate(this, 'Certificate', {
      domainName: props.fqdn,
      hostedZone,
      // CloudFront certs must be on us-east-1
      region: 'us-east-1'
    })

    const svelteSite = new SvelteDistribution(this, 'svelteDistribution', {
      rendererProps: {
        logLevel: 'DEBUG',
      },
      certificateArn: cert.certificateArn,
      domainNames: [props.fqdn]
    })

    new ARecord(this, 'DNSRecord', {
      zone: hostedZone,
      recordName: props.fqdn,
      target: RecordTarget.fromAlias(new CloudFrontTarget(svelteSite.distribution))
    })

  }
}