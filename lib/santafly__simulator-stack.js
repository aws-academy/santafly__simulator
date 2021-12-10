const awsCdk = require('aws-cdk-lib');
const Stack = awsCdk.Stack;
const iot = awsCdk.aws_iot;
const certData = require('../cert/cert-data.json');

class SantaflySimulatorStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['iot:Publish', 'iot:Receive', 'iot:RetainPublish'],
          Resource: [
            `arn:aws:iot:${this.region}:${this.account}:topic/santa/*/location`,
          ],
        },
        {
          Effect: 'Allow',
          Action: ['iot:Subscribe'],
          Resource: [
            `arn:aws:iot:${this.region}:${this.account}:topicfilter/santa/*`,
          ],
        },
        {
          Effect: 'Allow',
          Action: ['iot:Connect'],
          Resource: [
            `arn:aws:iot:${this.region}:${this.account}:client/santa-*`,
          ],
        },
      ],
    };

    const cfnPolicy = new iot.CfnPolicy(
      this,
      process.env.SSTACK_NAME + 'CertificatePolicy',
      {
        policyName: process.env.SSTACK_NAME + 'CertificatePolicy',
        policyDocument: JSON.stringify(policy),
      }
    );

    const cfnPolicyPrincipalAttachment = new iot.CfnPolicyPrincipalAttachment(
      this,
      process.env.SSTACK_NAME + 'PrincipalAttachment',
      {
        policyName: cfnPolicy.policyName,
        principal: certData.certificateArn,
      }
    );

    cfnPolicyPrincipalAttachment.node.addDependency(cfnPolicy);
  }
}

module.exports = { SantaflySimulatorStack };
