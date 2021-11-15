import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { WebsiteStack } from './website';

/**
 * Deployable unit of web service app
 */
export class Website extends Stage {

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new WebsiteStack(this, 'website');



  }
}