import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  SecurityPolicyProtocol,
  SSLMethod,
  ViewerCertificate,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { CloudFrontCertificates, TargetAccounts } from "../utils/environments";

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

    const oai = new OriginAccessIdentity(this, "oai");

    const bucket = new Bucket(this, "websiteBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const certArn = this.account === TargetAccounts.DEV ? CloudFrontCertificates.DEV : CloudFrontCertificates.PROD

    const alias = this.account === TargetAccounts.DEV ? "dev.peterkaskonas.com" : "peterkaskonas.com"

    const certificate = Certificate.fromCertificateArn(this, "cert", certArn)

    const distro = new CloudFrontWebDistribution(this, "distro", {

      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
          ],
        },

      ],
      viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [alias],
        securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021,
        sslMethod: SSLMethod.SNI
      })
    });

    new BucketDeployment(this, "bucketDeployment", {
      destinationBucket: bucket,
      sources: [Source.asset("../application/build")],
      distribution: distro,
    });

    this.urlOutput = new CfnOutput(this, "Url", {
      value: distro.distributionDomainName,
    });
  }
}
