const { IoTClient, CreateKeysAndCertificateCommand } = require("@aws-sdk/client-iot");
const path = require('path');
const fs = require('fs/promises');
const fsConstants = require('fs').constants;
const yargs = require('yargs/yargs')

const argv = yargs(process.argv)
  .option('profile')
  .nargs('profile', 1)
  .describe('profile', 'AWS profile to use')
  .demandOption([ 'profile' ])
  .argv;

const certDirPath = path.join(__dirname, '..', 'cert');
const certDataPath = path.join(certDirPath, 'cert-data.json');

main();

async function main() {
  try {
    await fs.mkdir(certDirPath);
  } catch (error) {
    // Ignore 
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  let certDataFileExists = true

  try {
    await fs.access(certDataPath, fsConstants.F_OK);
  } catch (err) {
    certDataFileExists = false;
  }

  if (certDataFileExists) {
    console.log('Certificate exists... Not requesting new...')
    return;
  }

  // Set the AWS_PROFILE environment variable so correct account is used with IoTClient.
  process.env.AWS_PROFILE = argv.profile;

  const client = new IoTClient();
  const command = new CreateKeysAndCertificateCommand({ setAsActive: true });
  const response = await client.send(command);

  const responseJson = JSON.stringify(response);

  await fs.writeFile(certDataPath, responseJson);
}
