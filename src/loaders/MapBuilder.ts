import * as THREE from 'three';

import AINode from './../game/ai/AINode';
import World from './../game/World';
import Brush from './../game/Brush';
import Player from './../game/Player';
import BaseMonster from './../game/monsters/BaseMonster';
import Health from './../game/items/Health';
import Ammo from './../game/items/Ammo';
import MonsterSpawn from './../game/MonsterSpawn';

import MapRawMatrix from './MapRawMatrix';

const BRUSH_CHARS = /[A-Z]/;
const ENTITY_MAP = /[a-z]/;

export default class MapBuilder {
	constructor (private world: World) {}

	private createAINode = (x, z, c) => {
		if (c !== null) {
			return;
		}

		const node = new AINode(x, z, 1, 1);

		this.world.pathfinder.addNode(node);
	}

	private brushIterator = (x, z, c, map: MapRawMatrix) => {
		if (c === null) {
			return;
		}

		const toRightCount = map.countRepetitionToRight(x, z);
		const toDownCount = map.countRepetitionToDown(x, z);

		let w = 1, d = 1;

		if (toRightCount >= toDownCount) {
			w = toRightCount;
		}
		else {
			d = toDownCount;
		}

		map.fillRect(null, x, z, w, d);

		const size = new THREE.Vector3(w, 2, d);
		const brush = new Brush(c, size, this.world);

		brush.position.set(x + w * 0.5, 0, z + d * 0.5);

		this.world.add(brush);
	}

	private entityIterator = (x, z, type) => {
		const { world } = this;

		let entity = null;

		switch (type) {
			case 'p':
				if (world.player) {
					return;
				}

				world.player = entity = new Player(world, world.camera);
				break;

			case 'm':
				entity = new BaseMonster(world);
				break;

			case 'h':
				entity = new Health(world);
				break;

			case 'a':
				entity = new Ammo(world);
				break;

			case 's':
				entity = new MonsterSpawn(world);
				break;
		}

		if (entity) {
			entity.position.x = x + 0.5;
			entity.position.z = z + 0.5;

			world.add(entity);
		}
	}

	build (mapData: Array<string>) {
		const map = new MapRawMatrix(mapData.map((row) => row.split('')));

		map.clone()
			.filter((type) => BRUSH_CHARS.test(type))
			.forEach(this.createAINode)
			.forEach(this.brushIterator);

		map.clone()
			.filter((type) => ENTITY_MAP.test(type))
			.forEach(this.entityIterator);
	}
}
