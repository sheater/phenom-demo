import * as THREE from 'three';

import BaseAudioEmitter from './../audio/BaseAudioEmitter';
import ActorController from './ActorController';
import Moveable from './Moveable';
import World from './World';
import { IActorControllerInterface } from './types';

export default class Actor extends Moveable implements IActorControllerInterface {
    protected ATTACK_RATE = 1;
    protected MAX_HEALTH = 100;
    protected MAX_ACCELERATION = 500;
    protected ACCELERATION_GAIN = 1500;

    protected audioEmitter: BaseAudioEmitter<any>;
    protected pitchObject = new THREE.Object3D();
    protected controller: ActorController;
    protected acceleration = 0;
    protected moveAngle: number | null = null; // null = no movement
    protected isMoving = false;
    protected isAttacking = false;
    protected attackTimer = 0;
    protected footstepsTimer = 0;
    
    isAlerted = false;
    health = this.MAX_HEALTH;

    constructor (world, controllerConstructor: typeof ActorController) {
        super(world);

        this.controller = new controllerConstructor(this, world);

        this.collisionOptions = {
            isSolid: true,
            canCollide: true,
            canCollideWithBrushesOnly: false,
            size: new THREE.Vector3(0.7, 1.2, 0.7),
        };
    }

    get yaw () { return this.rotation.y; }
    set yaw (value) { this.rotation.y = value; }

    get pitch () { return this.pitchObject.rotation.z; }
    set pitch (value) { this.pitchObject.rotation.z = value; }

    get isAlive () { return this.health > 0; }

    protected makeAttack () {}

    protected checkAttack (delta) {
        if (this.isAttacking) {
            this.attackTimer += delta;
            if (this.attackTimer < 1 / this.ATTACK_RATE) {
                return;
            }

            this.makeAttack();
            this.attackTimer = 0;
            this.isAttacking = false;
        }
        else {
            this.attackTimer = 0;
        }
    }

    heal (amount: number): boolean {
        if (this.health >= this.MAX_HEALTH) {
            return false;
        }

        this.health = Math.min(this.MAX_HEALTH, this.health + amount);

        return true;
    }

    damage (amount: number, attacker) {
        this.health = Math.max(0, this.health - amount);
    }

    doAttack () {
        this.isAttacking = true;
    }

    doMove (moveAngle) {
        this.isMoving = true;
        this.moveAngle = moveAngle;
    }

    setYaw (yaw) {
        this.yaw = yaw;
    }

    setPitch (pitch) {
        this.pitch = pitch;
    }

    onKill () {}

    frame (delta: number) {
        this.isMoving = false;

        this.controller.frame(delta);

        if (this.isAlive) {
            this.checkAttack(delta);

            let moveYaw = this.yaw;

            if (this.isMoving) {
                this.acceleration += this.ACCELERATION_GAIN * delta;
            }
            else {
                this.acceleration -= 2 * this.ACCELERATION_GAIN * delta;
            }

            this.acceleration = Math.min(Math.max(0, this.acceleration), this.MAX_ACCELERATION);

            if (this.acceleration > 0) {
                const velocity = this.acceleration * delta;

                moveYaw += this.moveAngle;
                this.velocity.x = -velocity * Math.cos(moveYaw);
                this.velocity.z = velocity * Math.sin(moveYaw);
                this.onMove(delta);
            }
        }

        super.frame(delta);

        this.velocity.set(0, 0, 0);
    }
}
