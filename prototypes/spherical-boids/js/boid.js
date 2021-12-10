import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/mode=imports/optimized/three.js';
import { getRandomPointOnUnitSphere } from './utils.js';

export class Boid {
  constructor(radius, color, pos, vel) {
    this.radius = radius;

		this.pos = pos || new THREE.Vector3();
		this.vel = vel || new THREE.Vector3();
		this.acc = new THREE.Vector3();
		this.qtn = new THREE.Quaternion();
    
    this.color = color;
    
    this.maxSpeed = 0.2;
		this.maxSteer = 0.001;
    
    this.wanderAngle = 0;
		this.arriveRadius = 0.2 * this.maxSpeed;
		this.departRadius = 0.5 * this.maxSpeed;
    
    // reusable objects
		this._vA = new THREE.Vector3();
		this._vB = getRandomPointOnUnitSphere();
		this._mat = new THREE.Matrix4();
		this._qtn = new THREE.Quaternion();
    
    this.initMesh();
  }
  
  initMesh() {
    const geometry = new THREE.ConeBufferGeometry(3, 6, 4);
    geometry.scale(1, 1, 0.5);
    const material = new THREE.MeshBasicMaterial({ color: this.color  });
    const mesh = new THREE.Mesh(geometry, material);
    this.object3D = mesh;
  }
  
  update() {
		const oldPos = this.pos.clone();

		// limit acceleration
		if (this.acc.lengthSq() > this.maxSteer * this.maxSteer) this.acc.setLength(this.maxSteer);
		// update velocity
		this.vel.add(this.acc);
		// limit velocity
		if (this.vel.lengthSq() > this.maxSpeed * this.maxSpeed) this.vel.setLength(this.maxSpeed);

		// set velocity tangent to sphere
		const vLength = this.vel.length();
		const newPos = this.pos.clone().add(this.vel).setLength(this.radius);
		this.vel.copy(newPos.sub(this.pos).setLength(vLength));

		// update position
		this.pos.add(this.vel);

		// update rotation
		const t = this.vel.length() / this.maxSpeed;
		this.up = this.pos.clone().normalize();
		this._mat.identity().lookAt(this.pos, oldPos.negate(), this.up);
		this._qtn.setFromRotationMatrix(this._mat);
		this.qtn.slerp(this._qtn, t);
		
		// clear acceleration
		this.acc.set(0, 0, 0);
    
    // update object3D
    this.object3D.position.copy(this.pos);
		this.object3D.up.copy(this.up);
		this.object3D.quaternion.copy(this.qtn);
	}
  
  seek(target, { intensity = 1 } = {}) {
		const steering = this._vA.subVectors(target, this.pos);
		this.acc.add(steering.multiplyScalar(intensity));
	}

	flee(target, { intensity = 1 } = {}) {
		const steering = this._vA.subVectors(this.pos, target);
		this.acc.add(steering.multiplyScalar(intensity));
	}
  
  arrive(target, { intensity = 1 } = {}) {
		const direction = this._vA.subVectors(target, this.pos);
		const distance = this.pos.angleTo(target);
		const targetSpeed = (distance > this.arriveRadius) ? this.maxSpeed : this.maxSpeed * distance / this.arriveRadius;
		const targetVelocity = direction.setLength(targetSpeed);

		const steering = this._vA.subVectors(targetVelocity, this.vel);
		this.acc.add(steering.multiplyScalar(intensity));
	}
  
  wander({ angle = 0.25, radius = 20, intensity = 1 } = {}) {
		this.wanderAngle += Math.random() * angle * 2 - angle;

		const up = this._vA.copy(this.pos).normalize();
		
		const rnd = new THREE.Vector3(Math.cos(this.wanderAngle), Math.sin(this.wanderAngle), 0);
		rnd.multiplyScalar(radius);
		rnd.applyAxisAngle(up, Math.PI / 2);

		const target = this.pos.clone().add(this.vel).add(rnd);

		return this.seek(target, { intensity });
	}
}