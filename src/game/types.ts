import * as THREE from 'three';

export interface ICollisionOptions {
	isSolid: boolean; // je teleso pevne - tzn. muze do nej neco narazit?
	canCollide: boolean; // muze teleso s necim kolidovat?
	canCollideWithBrushesOnly: boolean;
	size: THREE.Vector3;
}

export interface IActorControllerInterface {
	doMove (moveAngle: number): void;
	doAttack (): void;
	setYaw(yaw): void;
	setPitch(pitch): void;
	canSeeTarget (target: THREE.Vector3, position?: THREE.Vector3);

	health: number;
	isAlive: boolean;
	isAlerted: boolean;
	position: THREE.Vector3;
	yaw: number;
	pitch: number;
}
