import * as THREE from 'three';

import Moveable from './Moveable';
import Brush from './Brush';
import Actor from './Actor';
import { yawPitch2vector } from './utils';

const PROJECTILE_SPEED = 20;
const MAX_PROJECTILE_LIFE = 1; // secs
const PARTICLE_SPAWN_PERIOD = 1 / 20;

export default class Projectile extends Moveable {
	private projectileLife = 0;
	private particleTimer = 0;

	constructor (world, protected attacker) {
		super(world);

		this.collisionOptions = {
			isSolid: false,
			canCollide: true,
			canCollideWithBrushesOnly: true,
			size: new THREE.Vector3(0.1, 0.1, 0.1),
		};
	}

	setVelocityFromRotation (yaw: number, pitch: number) {
		this.velocity = yawPitch2vector(yaw, pitch).multiplyScalar(PROJECTILE_SPEED);
	}

	onTouch (toucher: Moveable) {
		if (toucher instanceof Brush) {
			this.world.remove(this);
		}
		else if (toucher instanceof Actor && toucher !== this.attacker && toucher.isAlive) {
			this.world.remove(this);			
			toucher.damage(15, this.attacker);
		}
	}

	frame (delta: number) {
		super.frame(delta);

		this.particleTimer += delta;
		this.projectileLife += delta;

		if (this.projectileLife > MAX_PROJECTILE_LIFE) {
			this.world.remove(this);
		}

		if (this.particleTimer > PARTICLE_SPAWN_PERIOD) {
			const options = {
				position: this.position.clone(),
				positionRandomness: 0.1,
				velocityRandomness: 0.1,
				color: 0xffff99,
				colorRandomness: 0,
				turbulence: 0,
				lifetime: 1,
				size: 20,
				sizeRandomness: 0,
				smoothPosition: true,
			};

			for (let i = 0; i < 7; i++) {
				this.world.particleSystem.spawnParticle(options);
			}

			this.particleTimer = 0;
		}
	}
}
