import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/mode=imports/optimized/three.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/examples/jsm/controls/TrackballControls.js';

import { Boid } from './boid.js';
import { getRandomPointOnUnitSphere, vectorToLatLon } from './utils.js';

const behaviors = ['wander', 'seek', 'flee', 'arrive', 'seek-sequence'];
let curr = 0;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.z = 300;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement);

const radius = 80;

// const geometry = new THREE.SphereGeometry(radius * 0.95, 32, 32);
const geometry = new THREE.SphereGeometry(radius, 32, 32);
const material = new THREE.MeshStandardMaterial({
  color: 0xC8C8C8,
  emissive: 0x072534,
  roughness: 1,
  transparent: true,
  opacity: 0.9,
});

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const light = new THREE.PointLight(0xFFFFFF);
light.position.set(10, 100, -100);
camera.add(light);
scene.add(camera);

const controls = new TrackballControls(camera, renderer.domElement);

const count = 3;
const boids = [];

for (let i = 0; i < count; i++) {
  const color = (!i) ? 0xe5004f : 0xC8C8C8;
  const pos = getRandomPointOnUnitSphere().setLength(radius);
  const vel = null;
  const b = new Boid(radius, color, pos, vel);
  boids.push(b);
	scene.add(b.object3D);
}

boids[0].maxSpeed *= 1.2;

function animate() {
  requestAnimationFrame(animate);
  update();
  draw();
};

function update() {
  if (controls) controls.update();
  
  const b0 = boids[0];
  b0.wander();
	b0.update();
  
  for (let i = 1; i < boids.length; i++) {
    const b = boids[i];
    
    switch (behaviors[curr]) {
				default:
				case 'wander': {
					b.wander();
					break;
				}
				case 'seek': {
					b.seek(b0.pos);
					b.wander({ intensity: 0.8 });
					break;
				}
				case 'flee': {
					b.flee(b0.pos);
					b.wander({ intensity: 0.8 });
					break;
				}
				case 'arrive': {
					b.arrive(b0.pos);
					b.wander({ angle: 0.1, intensity: 0.05 });
					break;
				}
				case 'seek-sequence': {
					b.seek(boids[i - 1].pos);
					break;
				}
			}
    
    b.update();
  }
}
 
const latlong1 = document.querySelector('.latlong1');
const vector1 = document.querySelector('.vector1');
function draw() {
	vector1.innerText = JSON.stringify(boids[0].pos);
	latlong1.innerText = JSON.stringify(vectorToLatLon(boids[0].pos, radius));
  renderer.render(scene, camera);
};

animate();

// UI
// -------------------------------------------

const btn = document.querySelector('button');
const lbl = document.querySelector('label');

btn.addEventListener('click', () => {
  if (curr < behaviors.length - 1) curr++;
  else curr = 0;
  
  lbl.innerText = behaviors[curr];
});