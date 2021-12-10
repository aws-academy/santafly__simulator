const mqtt = require('./mqtt');
const simulation = require('./simulation');
const yargs = require('yargs/yargs');

const argv = yargs(process.argv)
  .option('endpoint')
  .nargs('endpoint', 1)
  .describe(
    'endpoint',
    'AWS IoT endpoint to connect to. \n aws iot --profile <your_aws_cli_profile> describe-endpoint'
  )
  .demandOption(['endpoint']).argv;

async function main() {
  const connection = await mqtt.createConnection(argv.endpoint);

  await connection.connect();

  const textdecoder = new TextDecoder('utf8');
  await connection.subscribe('santa/+/location', 0, (topic, payload) => {
    console.log(`topic ${topic}: ${textdecoder.decode(payload)}`);
  });

  simulation.start();

  const intervalId = setInterval(() => {
    simulation.getBoids().forEach((boid, i) => {
      connection.publish(
        `santa/${i}/location`,
        JSON.stringify(boid.coordinates),
        0
      );
    });
  }, 2000);

  console.log('press q and ENTER to exit');

  // Handle quitting cleanly
  process.stdin.on('data', async (chunk) => {
    if (chunk.toString().includes('q')) {
      clearInterval(intervalId);
      await connection.disconnect();
      simulation.stop();
      process.exit(0);
    }
  });
}

main().catch((error) => console.error(error));
