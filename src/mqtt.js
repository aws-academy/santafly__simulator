const path = require("path");
const { mqtt, iot } = require("aws-iot-device-sdk-v2");
const fs = require("fs/promises");
const { createWriteStream } = require("fs");
const https = require("https");
const certData = require("../cert/cert-data.json");

const caPath = path.join(__dirname, "..", "cert", "AmazonRootCA1.pem");

const getAmazonRootCA = async () => {
  let ca;

  try {
    ca = await fs.readFile(caPath);
  } catch (error) {
    return new Promise((resolve) => {
      https.get(
        "https://www.amazontrust.com/repository/AmazonRootCA1.pem",
        (response) => {
          const fileStream = createWriteStream(caPath);
          response.pipe(fileStream);
          fileStream.on('finish', async () => {
            fileStream.close();
            ca = await fs.readFile(caPath);
            resolve(ca.toString());
          })
        }
      );
    });
  }

  return ca.toString();
};

const createConnection = async (endpoint) => {
  const ca = await getAmazonRootCA();

  let config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(
    certData.certificatePem,
    certData.keyPair.PrivateKey
  );
  config_builder.with_certificate_authority(ca);

  config_builder.with_clean_session(false);
  config_builder.with_client_id(
    "santa-" + Math.floor(Math.random() * 100000000)
  );

  config_builder.with_endpoint(endpoint);

  const config = config_builder.build();

  const client = new mqtt.MqttClient();
  return client.new_connection(config);
};

module.exports = {
  createConnection,
};
