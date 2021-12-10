#!/usr/bin/env node
require('dotenv').config()

const { Tags } = require("aws-cdk-lib");
const cdk = require("aws-cdk-lib");
const { SantaflySimulatorStack } = require("../lib/santafly__simulator-stack");

process.env.SSTACK_NAME = process.env.SSTACK_NAME || 'santafly-pontinen-stack';

const app = new cdk.App();
const stack = new SantaflySimulatorStack(app, process.env.SSTACK_NAME, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

if (
  process.env.STAG_NAME &&
  process.env.STAG_OWNER &&
  process.env.STAG_ORIGIN
) {
  console.log('Tagging resources...');
  Tags.of(stack).add('Name', process.env.STAG_NAME);
  Tags.of(stack).add('Owner', process.env.STAG_OWNER);
  Tags.of(stack).add('Origin', process.env.STAG_ORIGIN);
}
