const { Vector } = require('./Vector3');
const MathUtils = require('./MathUtils');

const vectorToLatLon = (vector, radius) => {
  const lat = MathUtils.radToDeg(Math.asin(vector.z / radius));
  const lon = MathUtils.radToDeg(Math.atan2(vector.y, vector.x));
  return { lat, lon };
};

const latLonToVector = (latlon, radius) => {
  /*
  If your trigonometric functions expect radians (which they probably do), you will need to convert your longitude and latitude to radians first. You obviously need a decimal representation, not degrees\minutes\seconds (see e.g. here about conversion).
  */
  const latRadians = MathUtils.degToRad(latlon.lat);
  const lonRadians = MathUtils.degToRad(latlon.lon);

  const x = radius * Math.cos(latRadians) * Math.cos(lonRadians);
  const y = radius * Math.cos(latRadians) * Math.sin(lonRadians);
  const z = radius * Math.sin(latRadians);

  return new Vector(x, y, z);
};

module.exports = {
  latLonToVector,
  vectorToLatLon,
};
