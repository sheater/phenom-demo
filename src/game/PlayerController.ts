import { keyboard, mouse } from './../input/index';

import ActorController from './ActorController';

export default class PlayerController extends ActorController {
    private isAttackKeyPressed = false;

    constructor (actor, world) {
        super(actor, world);

        mouse.addMouseMoveListener((relativeX, relativeY) => {
            if (!actor.isAlive) {
                return;
            }

            const PI_2 = Math.PI / 2;
            
            actor.yaw -= relativeX * 0.002;
            actor.pitch = Math.max(-PI_2, Math.min(PI_2, actor.pitch + relativeY * 0.002));
        });

        mouse.addMousePressListener((pressed) => {
            this.isAttackKeyPressed = pressed;
        });
    }

	frame() {
		let straight = 0, side = 0;
		
		if (keyboard.state.moveForward) straight += 1;
		if (keyboard.state.moveBackward) straight -= 1;
		if (keyboard.state.moveLeft) side += 1;
		if (keyboard.state.moveRight) side -= 1;

		if (straight || side) {
            let moveAngle = 0;

            if (straight > 0) {
                if (side > 0) {
                    moveAngle += Math.PI / 4;
                }
                else if (side < 0) {
                    moveAngle -= Math.PI / 4;
                }
            }
            else if (straight < 0) {
                if (side > 0) {
                    moveAngle -= 5 * Math.PI / 4;
                }
                else if (side < 0) {
                    moveAngle += 5 * Math.PI / 4;
                }
                else {
                    moveAngle -= Math.PI;
                }
            }
            else if (side !== 0) {
                if (side > 0) {
                    moveAngle += Math.PI / 2;
                }
                else if (side < 0) {
                    moveAngle -= Math.PI / 2;
                }
			}

			this.actor.doMove(moveAngle);
        }

        if (this.isAttackKeyPressed) {
            this.actor.doAttack();
        }
	}
}
