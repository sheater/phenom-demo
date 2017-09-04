import * as THREE from 'three';

import loaders from './../loaders/instance';

import Entity from './Entity';

const options = {
    position: new THREE.Vector3(),
    positionRandomness: 0,
    velocity: new THREE.Vector3(0, 0.5, 0),
    velocityRandomness: 0.5,
    color: 0x8B008B,
    colorRandomness: 0,
    turbulence: 0,
    lifetime: 15,
    size: 200,
    sizeRandomness: 0,
};

export default class Sky extends Entity {
	async initialize () {
		const skyGeo = new THREE.BoxGeometry(100, 100, 100);

		const texture = await loaders.texture.load('./fx/windy.jpg');

		const material = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			map: texture,
			depthTest: false,
		});

		this.mesh = new THREE.Mesh(skyGeo, material);

		this.add(this.mesh);
	}

	frame (delta: number) {
		const { player } = this.world;

		if (player) {
			this.position.copy(player.position);
		}

		if (Math.random() > 0.995) {
            options.position.x = -40 + (Math.random() > 0.5 ? 1 : 0) * 80;
            options.position.y = -2;
			options.position.z = -40 + (Math.random() > 0.5 ? 1 : 0) * 80;

			this.world.particleSystem.spawnParticle( options );
        }
	}
}
