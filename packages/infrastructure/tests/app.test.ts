import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";
import { WebsiteStack } from "../lib/stacks/website";

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
