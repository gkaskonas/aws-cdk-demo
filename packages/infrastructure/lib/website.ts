import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';
import { BucketDeployment, Source, } from '@aws-cdk/aws-s3-deployment';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { CachePolicy, CacheQueryStringBehavior, Distribution, LambdaEdgeEventType, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { Builder } from '@sls-next/lambda-at-edge'
import * as path from 'path'
import { Code, Runtime, Function } from '@aws-cdk/aws-lambda';

// The builder wraps nextJS in Compatibility layers for Lambda@Edge; handles the page
// manifest and creating the default-lambda and api-lambda. The final output is an assets
// folder which can be uploaded to s3 on every deploy.
const nextConfigDir = '../application';
const cwd = path.join(process.cwd(), nextConfigDir)
const outputDir = path.join(nextConfigDir, ".serverless_nextjs");

const options = {
  cmd: path.join(cwd, '/node_modules/.bin/next'),
  cwd: cwd,
  env: {},
  args: ['build']
}

const builder = new Builder(
  nextConfigDir,
  outputDir,
  options
);

export class WebsiteStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    
    super(scope, id, props);


    builder.build().then(() => {
      // Lambda functions for handling edge page requests
      const defaultLambda = new Function(this, 'defaultEdgeLambda', {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: Code.fromAsset(path.join(outputDir, 'default-lambda')),
      });

      // Lambda functions for handling edge api requests
      const apiLambda = new Function(this, 'apiEdgeLambda', {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: Code.fromAsset(path.join(outputDir, 'api-lambda')),
      });

      // Lambda functions for handling images
      const imageLambda = new Function(this, 'imageEdgeLambda', {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: Code.fromAsset(path.join(outputDir, 'image-lambda')),
      });

      // Static Asset bucket for cloudfront distribution as default origin
      const myBucket = new Bucket(this, 'myBucket', {
        encryption: BucketEncryption.S3_MANAGED
      });

      // Allow images to be fetched
      myBucket.grantRead(imageLambda)

      const origin = new S3Origin(myBucket);

      // Default distribution requests to the default lambda
      const distribution = new Distribution(this, 'myDist', {
        defaultBehavior: {
          origin: origin,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          edgeLambdas: [
            {
              functionVersion: defaultLambda.currentVersion,
              eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
            }
          ],
        },
        enableLogging: true,
      });

      // Forward static file request to s3 directly
      distribution.addBehavior('_next/static/*', origin, {});

      // Forward API requests to the API edge lambda
      distribution.addBehavior('api/*', origin, {
        edgeLambdas: [
          {
            functionVersion: apiLambda.currentVersion,
            eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
            includeBody: true
          },
        ],
      });

      // Image cache policy extends the default cache policy, but with query params
      const imageCachePolicy = new CachePolicy(this, 'imageCachePolicy', {
        ...CachePolicy.CACHING_OPTIMIZED,
        cachePolicyName: 'ImageCachingPolicy',
        comment: 'Policy to cache images for _next/image',
        queryStringBehavior: CacheQueryStringBehavior.allowList(...['url', 'w', 'q']),
      });

      // Forward image requests
      distribution.addBehavior('_next/image*', origin, {
        edgeLambdas: [
          {
            functionVersion: imageLambda.currentVersion,
            eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
          },
        ],
        cachePolicy: imageCachePolicy
      });
      // Upload deployment bucket
      new BucketDeployment(this, 'nextJsAssets', {
        sources: [Source.asset(path.join(outputDir, 'assets'))],
        destinationBucket: myBucket,
        distribution: distribution,
      });
    }).catch((err) => {
      console.warn('Build failed for NextJS, aborting CDK operation')
      console.error({ err })
      throw err
    })
  }
}