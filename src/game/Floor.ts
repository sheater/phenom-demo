import * as THREE from 'three';

import loaders from './../loaders/instance';

import Entity from './Entity';

export default class Floor extends Entity {
	async initialize () {
		const geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(0, -1, 0);

        const floorTexture = await loaders.texture.load('./textures/floor/lfwall26.png');
        const bumpMap = await loaders.texture.load('./textures/floor/lfwall26_local.png');
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	    floorTexture.repeat.set(50, 50);

        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0x222222,
            shininess: 25,
            map: floorTexture,
            bumpMap,
            bumpScale: 12,
        });

        const mesh = new THREE.Mesh( geometry, material );
        mesh.receiveShadow = true;
        this.add(mesh);
	}
}
