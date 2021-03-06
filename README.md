# Santafly - Simulator

GPS simulator for AWS that uses wander steering behaviour for autonomous characters by Craig Reynolds.

The simulation is based on [CodePen by Henry Sadrak](https://codepen.io/hendrysadrak/pen/JqNVWm)
and some of the math libraries (Vector3, Quaternion and MathUtils) are ripped out of THREE.js project.

The simulator is called santafly because the original idea was to study AWS IoT services by simulating
flying santa claus.

## Project structure

The project was initialized with

```
cdk init app --language javascript
```

```
santafly__simulator/
├─ bin/         -- Contains entrypoint for CDK and script for creating/fetching certificates.
├─ cdk.out/     -- Output directory of CDK (generated by cdk).
├─ cert/        -- Contains certificate and keys generated by "npm run create-keys". KEEP SAFE.
├─ lib/         -- CDK stack definitions.
├─ prototypes/  -- Slightly modified simulation with UI (for testing use e.g. lite-server).
├─ src/         -- Code for the actual simulator app.
```

## Notes

The way the certificates are fetched here is **NOT a production ready** way and only suitable for
testing/developing. See https://d1.awsstatic.com/whitepapers/device-manufacturing-provisioning.pdf
for production ready ways.

## Requirements

- Node.js and npm
- AWS cli configured account profile
- CDK cli https://docs.aws.amazon.com/cdk/v2/guide/cli.html
- AWS account must be CDK bootstrapped
  - This is required to be done only once per account 
  - **Not needed for people in AWS academy because I already did it for the account**
  - see https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html

## Installation

Download or clone the repository and `cd` to the project in terminal.

To name the CloudFormation stack and tag it, create `.env` file at projects
root directory with following contents (use whatever values you wish).

**AWS academy**: make sure to change these so the names wont overlap in AWS.

```
SSTACK_NAME=santafly-pontinen-stack
STAG_NAME=santafly-pontinen-stack
STAG_OWNER=pontinen
STAG_ORIGIN=saranen
```

Install dependencies.

```
npm install
```

Create IoT certificate for your AWS account. The certificate, private key, public key
and other data will be at `./cert/cert-data.json`.

**You will need the file to find the certificate in AWS if you want to delete it.**

```
npm run create-keys -- --profile <your_aws_cli_profile>
```

Deploy the CDK stack to attach a policy to the created certificate.

```
cdk deploy --profile <your_aws_cli_profile>
```

## Usage

See what is your IoT Core endpoint where the simulation should send data with MQTT.

```
aws iot describe-endpoint --endpoint-type iot:Data-ATS --profile <your_aws_cli_profile> 
```

Start the simulation. Insert the endpointAddress from the command before to this.

```
npm start -- --endpoint <your_iot_endpoint>
```

Now you should see the messages being published to `santa/+/location` topic. You can test this in the AWS console too by subscribing to the topic in IoT Core -> Test -> MQTT test client.

## Uninstall

You can delete all created resources (except the certificate) with CDK cli.
Alternatively you can delete the created stack in AWS console CloudFormation.

**The following command wont work if you deleted the cert-data.json first.** If thats the case then you have to use CloudFormation in AWS console to delete the stack.

```
cdk destroy --profile <your_aws_cli_profile>
```

**The certificate has to be deleted manually because it is not managed by CDK.**

You can delete it for e.g. in AWS console -> IoT core -> Secure -> Certificates.
Look for ID that matches the `certificateId` in `/cert/cert-data.json`.
