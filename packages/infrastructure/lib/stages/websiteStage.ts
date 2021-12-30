import { CfnOutput, Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ContactFormStack } from "../stacks/contact-form";
import { WebsiteStack } from "../stacks/website";

/**
 * Deployable unit of web service app
 */
export class WebsiteStage extends Stage {
  public readonly urlOutput: CfnOutput;
  public readonly contactFormUrl: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const website = new WebsiteStack(this, "Website");
    const contactForm = new ContactFormStack(this, "contactForm");

    // Expose CdkpipelinesDemoStack's output one level higher
    this.urlOutput = website.urlOutput;
    this.contactFormUrl = contactForm.urlOutput;
  }
}
