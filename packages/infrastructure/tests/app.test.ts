import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";
import { ApplicationStack } from "../lib/stacks/application";
import { WebsiteStack } from "../lib/stacks/website";

// example test. To run these tests, uncomment this file along with the
// example resource in lib/aws-cdk-demo-stack.ts
test("DynamoDB Created", () => {
  const app = new App();
  // WHEN
  const stack = new ApplicationStack(app, "MyTestStack");
  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    PointInTimeRecoverySpecification: {
      PointInTimeRecoveryEnabled: true,
    },
    SSESpecification: {
      SSEEnabled: true,
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  });
});

test("S3 Bucket Created", () => {
  const app = new App();
  // WHEN
  const stack = new WebsiteStack(app, "MyTestStack");
  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::S3::Bucket", {
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: "AES256",
          },
        },
      ],
    },
  });
});
