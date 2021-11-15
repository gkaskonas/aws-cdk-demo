import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';
import { BucketDeployment, Source, } from '@aws-cdk/aws-s3-deployment';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { Distribution } from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
export class WebsiteStack extends Stack {
  public readonly cloudfrontEndpoint: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    
    super(scope, id, props);

    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
        websiteIndexDocument: 'index.html',
        publicReadAccess: true,
        encryption: BucketEncryption.S3_MANAGED
      });

    const distribution = new Distribution(this, 'Distribution', {
        defaultBehavior: { origin: new S3Origin(websiteBucket) },

      });

     new BucketDeployment(this, "deployment", {
        sources: [Source.asset("../application/out")],
        destinationBucket: websiteBucket,
        distribution
    })

    this.cloudfrontEndpoint = new CfnOutput(this, 'cloudfrontUrl', {
      value: distribution.distributionDomainName,
    });
  }
}