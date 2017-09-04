import * as THREE from 'three';

import Entity from './Entity';
import Brush from './Brush';
import ModelEntity from './ModelEntity';
import { lineBoxIntersection } from './utils';
// import Projectile from './Projectile';
declare const Projectile: any;

export default class Moveable extends ModelEntity {
    protected velocity = new THREE.Vector3();

    constructor (world) {
        super(world);

        this.collisionOptions = {
            canCollide: false,
            canCollideWithBrushesOnly: false,
            isSolid: false,
            size: new THREE.Vector3(0.5, 0.5, 0.5),
        };
    }

    public canSeeTarget (target: THREE.Vector3, position = this.position) {
        for (const child of this.world.children) {
            if (!(child instanceof Brush) || !child.collisionOptions || !child.collisionOptions.isSolid) {
                continue;
            }

            if (lineBoxIntersection(position, target, child.collisionHull)) {
                return false;
            }
        }

        return true;
    }

    private checkCollision (displacement): boolean {
        const { min, max } = this.collisionHull;

        const hull = new THREE.Box3(
            min.clone().add(displacement),
            max.clone().add(displacement)
        );

        return this.world.children
            .filter((child) => child instanceof Entity && child.collisionHull && child !== this)
            .some((child: Entity) => {
                if (!child.collisionHull.intersectsBox(hull)) {
                    return false;
                }

                this.onTouch(child);

                if (!child.collisionOptions.isSolid) {
                    return false;
                }

                if (this.collisionOptions.canCollideWithBrushesOnly && !(child instanceof Brush)) {
                    return false;
                }

                return true;
            });
    }

    onTouch (entity: Entity): void {}
    onMove (delta): void {}

    private displace (delta): void {
        const { collisionOptions } = this;

        if (!collisionOptions) {
            return;
        }

        this.updateCollisionHull();

        const displacement = this.velocity.clone().multiplyScalar(delta);

        if (collisionOptions.canCollide) {
            if (this.checkCollision(new THREE.Vector3(displacement.x, 0, 0))) {
                displacement.setX(0);
            }

            if (this.checkCollision(new THREE.Vector3(0, 0, displacement.z))) {
                displacement.setZ(0);
            }
        }

        this.position.add(displacement);
    }

	frame (delta): void {
        super.frame(delta);

        this.displace(delta);
	}
}
