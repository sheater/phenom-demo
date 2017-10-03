import * as THREE from 'three';

import AINode from './AINode';
import ActorController from './../ActorController';
import { IPathfinderRoute } from './types';
import { getDistanceScore } from './utils';
import { vector2yawPitchDist, yawPitch2vector } from './../utils';

enum EAIBotState {
	IDLE,
	HUNT,
	ATTACK,
	HARASSMENT,
	ESCAPE,
}

const NODE_REACH_RADIUS = 0.3;
const ATTACK_RADIUS = 8;
const SIGHT_DISTANCE = 16;
const HUNT_DISTANCE = 32;
const ESCAPE_HEALTH_TRESHOLD = 30;
const ESCAPE_TARGET_RADIUS = 15;
const SIGHT_CONE_HALF_ANGLE = Math.PI * 0.5;
const THINK_CYCLE_INTERVAL = 0.4;
const ATTACKING_TIME = 2;
const HARASSMENT_MAX_TIME = 2;

// TODO:
// - escape
export default class AIController extends ActorController {
	private currentRoute: IPathfinderRoute = null;
	private currentNode: AINode = null;
	private currentNodePrevDist = Infinity;
	private prevPlayerPosition = null;
	private thinkCycleTime = 0;
	private stateTime = 0;
	private stateFunc;
	private alreadyEscaped = false;

	constructor (actor, world) {
		super(actor, world);

		this.stateFunc = {
			[EAIBotState.IDLE]: this.thinkIdle,
			[EAIBotState.HUNT]: this.thinkHunt,
			[EAIBotState.ATTACK]: this.thinkAttack,
			[EAIBotState.HARASSMENT]: this.thinkHarassment,
			[EAIBotState.ESCAPE]: this.thinkEscape,
		};
	}

	private state: EAIBotState = EAIBotState.IDLE;

	private playerOnSight () {
		const { actor, world } = this;

		const deltaVec = actor.position
			.clone()
			.sub(world.player.position);

		const { yaw: yawToPlayer } = vector2yawPitchDist(deltaVec);

		return (
			yawToPlayer > actor.yaw - SIGHT_CONE_HALF_ANGLE &&
			yawToPlayer < actor.yaw + SIGHT_CONE_HALF_ANGLE
		);
	}

	private setActorYawToVector (vec) {
		const { actor } = this;

		const deltaVec = actor.position
			.clone()
			.sub(vec);

		actor.setYaw(vector2yawPitchDist(deltaVec).yaw);
	}

	// check health and escape if need
	private checkHealth () {
		const { actor } = this;

		if (actor.health < ESCAPE_HEALTH_TRESHOLD && !this.alreadyEscaped) {
			this.switchStateTo(EAIBotState.ESCAPE);
		}
	}

	private switchStateTo (target: EAIBotState) {
		this.state = target;
		this.currentRoute = null;
		this.stateTime = 0;
	}

	private move () {
		if (!this.currentRoute) {
			return;
		}

		const { actor } = this;

		if (this.currentNode && !this.hasActorReachedNode(this.currentNode)) {
			const currentDist = actor.position.distanceTo(this.currentNode.center);

			// prevents bot running against the wall
			if (this.currentNodePrevDist < currentDist) {
				this.setActorYawToVector(this.currentNode.center);
			}

			this.currentNodePrevDist = currentDist;
			actor.doMove(0);
		}
		else {
			this.currentNode = this.currentRoute.items.pop();
			this.currentNodePrevDist = Infinity;

			if (!this.currentRoute.items.length) {
				this.currentRoute = null;
				return;
			}
			
			this.setActorYawToVector(this.currentNode.center);
		}
	}

	private thinkIdle = () => {
		const { actor, world } = this;
		const { player, pathfinder } = world;

		const playerDist = actor.position.distanceTo(player.position);

		if (player.isAlive) {
			if (actor.isAlerted) {
				if (playerDist < ATTACK_RADIUS) {
					this.switchStateTo(EAIBotState.ATTACK);
				}
				else if (playerDist < SIGHT_DISTANCE) {
					this.switchStateTo(EAIBotState.HUNT);
				}
			}
			else if (
				playerDist < SIGHT_DISTANCE && this.playerOnSight() &&
				actor.canSeeTarget(player.position)
			) {
				this.switchStateTo(EAIBotState.HUNT);
				actor.isAlerted = true;
			}
		}
	}

	private thinkHunt = () => {
		const { actor, world } = this;
		const { pathfinder, player } = world;

		const playerDist = actor.position.distanceTo(player.position);

		if (playerDist > HUNT_DISTANCE) {
			this.switchStateTo(EAIBotState.IDLE);
			return;
		}
		else if (playerDist < ATTACK_RADIUS && actor.canSeeTarget(player.position)) {
			this.switchStateTo(EAIBotState.ATTACK);
			return;
		}

		if (!this.currentRoute || player.position.distanceTo(this.currentRoute.endNode.center) > ATTACK_RADIUS * 0.5) {
			const nodes = pathfinder.findConnectedNodesAround(player.position, ATTACK_RADIUS);
			const playerNode = pathfinder.findNodeByPoint(player.position);

			if (nodes.length) {
				let targetNode = null;

				if (playerNode === nodes[0] && nodes.length > 1) {
					targetNode = nodes[1];
				}
				else if (playerNode !== nodes[0]) {
					targetNode = nodes[0];
				}

				if (targetNode) {
					this.currentRoute = pathfinder.findPath(actor.position, targetNode);
				}
			}
		}
	}

	private thinkAttack = () => {
		const { actor, world } = this;
		const { player } = world;

		const playerDist = actor.position.distanceTo(player.position);

		if (playerDist > ATTACK_RADIUS || !actor.canSeeTarget(player.position)) {
			this.switchStateTo(EAIBotState.HUNT);
			return;
		}

		this.setActorYawToVector(player.position);

		actor.doAttack();

		// if (this.stateTime > ATTACKING_TIME) {
		// 	this.switchStateTo(EAIBotState.HARASSMENT);
		// }

		// primary mission is to kill player, so we can chill if player is dead
		if (!player.isAlive) {
			this.switchStateTo(EAIBotState.IDLE);
		}
	}

	private thinkHarassment = () => {
		if (this.currentRoute && this.currentNode === this.currentRoute.endNode) {
			this.switchStateTo(EAIBotState.ATTACK);
		}

		// todo: najit nejblizsi dostupne misto ke strelbe
		const { actor, world } = this;

		if (!this.currentRoute) {
			const nodes = world.pathfinder.findConnectedNodesAround(actor.position, ATTACK_RADIUS);

			const node = nodes
				.sort((b, a) => getDistanceScore(b, actor.position) - getDistanceScore(a, actor.position))
				.find((node) => actor.canSeeTarget(world.player.position, node.center));

			if (node) {
				this.currentRoute = world.pathfinder.findPath(actor.position, node.center);
			}
			else {
				this.switchStateTo(EAIBotState.ATTACK);
			}
			// for (const node of nodes) {
			// 	if (actor.canSeeTarget(world.player.position, node.center)) {
			// 		this.currentRoute = world.pathfinder.findPath(actor.position, node.center);
			// 		console.log('new harassment route', this.currentRoute);
			// 		break;
			// 	}
			// }

			// if (!this.currentRoute) {
			// 	this.switchStateTo(EAIBotState.ATTACK);
			// }
		}
	}

	private thinkEscape = () => {
		if (this.currentRoute) {
			return;
		}

		if (this.alreadyEscaped) {
			this.switchStateTo(EAIBotState.IDLE);
			return;
		}

		const { actor, world } = this;
		const { player, pathfinder } = world;
		const nodes = pathfinder.findNodesAround(actor.position, ESCAPE_TARGET_RADIUS);

		const escapeNode = nodes
			.sort((a, b) => getDistanceScore(a, actor.position) - getDistanceScore(b, actor.position))
			.find((node) => !actor.canSeeTarget(player.position, node.center));

		if (escapeNode) {
			this.currentRoute = pathfinder.findPath(actor.position, escapeNode.center);
			console.log('escape path', this.currentRoute);
		}

		this.currentRoute = pathfinder.findPath(this.actor.position, nodes[0]);
		this.alreadyEscaped = true;
	}

	private hasActorReachedNode (node) {
		return this.actor.position.distanceTo(node.center) < NODE_REACH_RADIUS;
	}

	public frame (delta) {
		if (!this.actor.isAlive) {
			return;
		}

		this.thinkCycleTime += delta;
		this.stateTime += delta;
		if (this.thinkCycleTime > THINK_CYCLE_INTERVAL) {
			this.thinkCycleTime = 0;
			
			this.stateFunc[this.state]();
		}

		// life is more important, so state from this function is more relevant
		// this.checkHealth();

		this.move();
	}
}
