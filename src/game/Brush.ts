import * as THREE from 'three';

import loaders from './../loaders/instance';

import Entity from './Entity';

const TEXTURE_BY_TYPE: { [s: string]: string } = {
    'A': './textures/wall2.jpg',
    'B': './textures/wall.jpg',
};

const textureByType = {};

export default class Brush extends Entity {
	mesh: THREE.Mesh;

	constructor (protected brushType, protected size, world) {
		super(world);
	}

	private createMaterial () {
		if (this.brushType === 'B') {
			return new THREE.MeshPhongMaterial({
				color: 0xffffff,
				map: textureByType[this.brushType],
				opacity: 0.8,
				transparent: true,
			});
		}
		else {
			return new THREE.MeshPhongMaterial({
				color: 0xffffff,
				map: textureByType[this.brushType],
				lights: true,
			});
		}
	}

	async initialize () {
		const { size } = this;

		if (!textureByType.hasOwnProperty(this.brushType)) {
			const texture = textureByType[this.brushType] = await loaders.texture.load(TEXTURE_BY_TYPE[this.brushType]);

			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
		}

		const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

		geometry.faces.forEach((face, i) => {
			const faceUvs = geometry.faceVertexUvs[0][i];

			const verts = [ face.a, face.b, face.c ].map((idx, j) => {
				return geometry.vertices[idx];
			});

			const distX = Math.max(...verts.map((vert) => vert.x)) - Math.min(...verts.map((vert) => vert.x));
			const distZ = Math.max(...verts.map((vert) => vert.z)) - Math.min(...verts.map((vert) => vert.z));

			const scale = Math.max(distX, distZ);

			for (let j = 0; j < faceUvs.length; j++) {
				faceUvs[j].x *= scale;
			}
		});

		const material = this.createMaterial();

		const cube = new THREE.Mesh(geometry, material);

		this.collisionOptions = {
			isSolid: true,
            canCollide: false,
			canCollideWithBrushesOnly: false,
            size,
		};
		
		this.updateCollisionHull();

		this.add(cube);
	}
}
