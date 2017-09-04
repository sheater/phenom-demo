import * as THREE from 'three';

import { IAINodeConnection } from './types';
import { getDistanceScore } from './utils';

export default class AINode {
	public readonly center: THREE.Vector3 = null;
	public readonly connections: Map<AINode, IAINodeConnection> = new Map();

	constructor (
		public readonly x,
		public readonly z,
		public readonly w,
		public readonly d
	) {
		// this.center = new THREE.Vector3(this.x - 0.5 * this.w, 0, this.z - 0.5 * this.d);
		this.center = new THREE.Vector3(this.x + 0.5 * this.w, 0, this.z + 0.5 * this.d);
	}

	createConnections (nodes: Array<AINode>) {
		nodes
			.filter((node) => {
				if (node === this) {
					return false;
				}

				const isNearLeft = this.x === node.x + node.w;
				const isNearRight = this.x + this.w === node.x;
				const isInRow = this.z < node.z + node.d && this.z + this.d > node.z;

				const isNearBottom = this.z === node.z + node.d;
				const isNearTop = this.z + this.d === node.z;
				const isInColumn = this.x < node.x + node.w && this.x + this.w > node.x;

				return ((isNearLeft || isNearRight) && isInRow) ||
					((isNearBottom || isNearTop) && isInColumn);
			})
			.forEach((node) => {
				const connection: IAINodeConnection = {
					distanceScore: getDistanceScore(this.center, node.center),
				};

				this.connections.set(node, connection);
			});
	}

	isPointInside (point: THREE.Vector3) {
		const { x, z } = point;

		return x >= this.x && x < this.x + this.w &&
			z >= this.z && z < this.z + this.d;
	}
}
