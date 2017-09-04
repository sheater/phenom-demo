import * as THREE from 'three';

import { IPathfinderRoute } from './types';
import { getDistanceScore } from './utils';
import AINode from './AINode';

export default class Pathfinder {
	private nodes: Array<AINode> = [];

	addNode (node): void {
		this.nodes.push(node);
	}

	nodeAddingDone (): void {
		this.nodes.forEach((sector) => {
			sector.createConnections(this.nodes);
		});
	}

	findNodeByPoint (point: THREE.Vector3): AINode | null {
		for (const node of this.nodes) {
			if (node.isPointInside(point)) {
				return node;
			}
		}

		return null;
	}

	findNodesAround (position, radius) {
		const radiusPow = Math.pow(radius, 2);
		const nodes = [];

		for (const node of this.nodes) {
			if (Math.pow(node.x - position.x, 2) + Math.pow(node.z - position.z, 2) < radiusPow) {
				nodes.push(node);
			}
		}

		return nodes;
	}

	filterConnectedNodesToRoot (nodes, root) {
		if (!nodes.length) {
			return [];
		}

		const connectedNodes = [ root ];
		let currentNode = null;

		let i = 0;
		do {
			currentNode = connectedNodes[i++];

			for (const node of nodes) {
				// node is connected but not present in connected nodes list
				if (currentNode.connections.has(node) && !connectedNodes.some((connectedNode) => connectedNode === node)) {
					connectedNodes.push(node);
				}
			}
		} while (i < connectedNodes.length);

		return connectedNodes;
	}

	findConnectedNodesAround (position, radius) {
		const nodes = this.findNodesAround(position, radius);

		// find nearest node
		const nearestNode = nodes.sort((a, b) => getDistanceScore(a, position) - getDistanceScore(b, position))[0];

		return this.filterConnectedNodesToRoot(nodes, nearestNode);
	}

	findPath (start: THREE.Vector3, end: THREE.Vector3): IPathfinderRoute {
		const startNode = this.findNodeByPoint(start);
		if (!startNode) {
			return {
				startNode: null,
				endNode: null,
				items: [],
			};
		}

		const endNode = this.findNodeByPoint(end);
		if (!endNode) {
			return {
				startNode,
				endNode: null,
				items: [],
			};
		}

		interface INodeScore {
			gScore: number;
			fScore: number;
		}

		const openedNodes: Set<AINode> = new Set([ startNode ]);
		const closedNodes: Set<AINode> = new Set();
		const scoreByNode: Map<AINode, INodeScore> = new Map();
		const cameFrom: Map<AINode, AINode> = new Map();
		let items: Array<AINode> = [];

		for (const node of this.nodes) {
			scoreByNode.set(node, {
				gScore: Infinity,
				fScore: Infinity,
			});
		}

		scoreByNode.set(startNode, {
			gScore: 0,
			fScore: getDistanceScore(start, end),
		});

		while (openedNodes.size) {
			let minCost = Infinity;
			let current: AINode = null;

			// select node with lowest cost
			for (const node of openedNodes) {
				const score = scoreByNode.get(node);

				if (score.fScore < minCost) {
					minCost = score.fScore;
					current = node;
				}
			}

			// check if we reached final destination
			if (current === endNode) {
				items.push(current);

				while (cameFrom.has(current)) {
					current = cameFrom.get(current);
					items.push(current);
				}

				break;
			}

			openedNodes.delete(current);
			closedNodes.add(current);

			const currentScore = scoreByNode.get(current);

			// iterate over neighborhood
			for (const [ neighbor, connection ] of current.connections) {
				if (closedNodes.has(neighbor)) {
					continue;
				}

				openedNodes.add(neighbor);

				const neigborScore = scoreByNode.get(neighbor);

				const tentativeScore = currentScore.gScore + connection.distanceScore;
				if (tentativeScore >= neigborScore.gScore) {
					continue;
				}

				cameFrom.set(neighbor, current);
				scoreByNode.set(neighbor, {
					gScore: tentativeScore,
					fScore: tentativeScore + getDistanceScore(neighbor.center, end),
				});
			}
		}

		return {
			startNode,
			endNode,
			items,
		};
	}
}
