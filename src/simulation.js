const Boid = require('./Boid');

const boids = [];
let updateIntervalId;

// Variables that can be tuned.
const amountOfBoids = 1;
const sphereRadius = 80;
const updateInterval = 13.33;

const setupBoids = () => {
  for (let i = 0; i < amountOfBoids; i++) {
    boids[i] = new Boid(sphereRadius);
  }
};

const update = () => {
  boids.forEach((boid) => {
    boid.wander();
    boid.update();
  });
};

setupBoids();

module.exports = {
  start: () => (updateIntervalId = setInterval(() => update(), updateInterval)),
  stop: () => clearInterval(updateIntervalId),
  getBoids: () => boids,
};
