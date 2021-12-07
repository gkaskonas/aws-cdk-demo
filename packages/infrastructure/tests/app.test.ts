import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";
import { ApplicationStack } from "../lib/application";

// example test. To run these tests, uncomment this file along with the
// example resource in lib/aws-cdk-demo-stack.ts
test("DynamoDB Created", () => {
  const app = new App();
  // WHEN
  const stack = new ApplicationStack(app, "MyTestStack");
  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DynamoDB::Table", {});
});
