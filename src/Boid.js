const { Vector3 } = require('./math/Vector3');
const VectorUtils = require('./math/VectorUtils');

const getRandomPointOnUnitSphere = () => {
	const theta = Math.random() * Math.PI * 2;
	const z = Math.random() * 2 - 1;
	const r = Math.sqrt(1 - z * z);
	const x = Math.cos(theta) * r;
	const y = Math.sin(theta) * r;

	return new Vector3(x, y, z);
}

class Boid {
  constructor(radius, pos, vel) {
    this.radius = radius;

		this.pos = pos || getRandomPointOnUnitSphere().setLength(this.radius);
		this.vel = vel || new Vector3();
		this.acc = new Vector3();
    
    this.maxSpeed = 0.1;
		this.maxSteer = 0.001;
    
    this.wanderAngle = 0;
		this.arriveRadius = 0.2 * this.maxSpeed;
		this.departRadius = 0.5 * this.maxSpeed;
    
    // reusable objects
		this._vA = new Vector3();
		this._vB = getRandomPointOnUnitSphere();
  }

	get coordinates() {
		return VectorUtils.vectorToLatLon(this.pos, this.radius);
	}
  
  update() {
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

		// clear acceleration
		this.acc.set(0, 0, 0);
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
		
		const rnd = new Vector3(Math.cos(this.wanderAngle), Math.sin(this.wanderAngle), 0);
		rnd.multiplyScalar(radius);
		rnd.applyAxisAngle(up, Math.PI / 2);

		const target = this.pos.clone().add(this.vel).add(rnd);

		return this.seek(target, { intensity });
	}
}

module.exports = Boid;