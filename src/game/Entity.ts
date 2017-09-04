import * as THREE from 'three';

import loaders from './../loaders/instance';

import World from './World';
import Moveable from './Moveable';
import { ICollisionOptions } from './types';

export default class Entity extends THREE.Group {
    protected mesh: THREE.Mesh = null;
    public collisionHull: THREE.Box3 = null;
    public collisionOptions: ICollisionOptions = null;

    constructor (protected world: World) {
        super();
    }

    protected updateCollisionHull () {
        const { collisionOptions, position } = this;

        if (!collisionOptions) {
            return;
        }

        let { collisionHull } = this;

        const min = collisionOptions.size.clone().multiplyScalar(-0.5).add(position);
        const max = collisionOptions.size.clone().multiplyScalar(0.5).add(position);

        if (collisionHull) {
            collisionHull.min.copy(min);
            collisionHull.max.copy(max);
        }
        else {
            this.collisionHull = new THREE.Box3(min, max);
        }
    }

    async initialize () {
        await this.loadResources();

        this.onLoadingDone();
    }

    async loadResources () {}
    onLoadingDone () {}

    frame(delta: number) {}
}
