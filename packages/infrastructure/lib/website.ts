import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

/**
 * A stack for our simple Lambda-powered web service
 */
export class WebsiteStack extends Stack {
  /**
   * The URL of the API Gateway endpoint, for use in the integ tests
   */
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "websiteBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });

    new BucketDeployment(this, "bucketDeployment", {
      destinationBucket: bucket,
      sources: [Source.asset("../application/public")],
    });

    this.urlOutput = new CfnOutput(this, "Url", {
      value: bucket.bucketWebsiteUrl,
    });
  }
}
