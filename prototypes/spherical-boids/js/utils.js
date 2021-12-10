import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/mode=imports/optimized/three.js';

export const getRandomPointOnUnitSphere = () => {
	const theta = Math.random() * Math.PI * 2;
	const z = Math.random() * 2 - 1;
	const r = Math.sqrt(1 - z * z);
	const x = Math.cos(theta) * r;
	const y = Math.sin(theta) * r;

	return new THREE.Vector3(x, y, z);
}

function radiansToDegrees(radians)
{
  return radians * (180/Math.PI);
}

export const vectorToLatLon = (vector, radius) => {
  const lat = radiansToDegrees(Math.asin(vector.z/radius));
  const lon = radiansToDegrees(Math.atan2(vector.y, vector.x));
  return { lat, lon };
}