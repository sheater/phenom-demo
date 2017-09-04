import * as THREE from 'three';

import Entity from './Entity';
import World from './World';
import Moveable from './Moveable';
import loaders from './../loaders/instance';

export default class ModelEntity extends Entity {
    protected sequences: { [s: string]: THREE.AnimationClip } = null;
    protected currentSequenceName: string = '';
    protected previousAnimationAction: THREE.AnimationAction;
    protected animationMixer: THREE.AnimationMixer = null;

    protected async loadModel (modelFilename, textureFilename) {
        const geometry = await loaders.model.load(modelFilename);
        const texture = await loaders.texture.load(textureFilename);

        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: texture,
            morphTargets: Boolean(geometry.morphTargets),
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;

        if (geometry.morphTargets) {
            this.sequences = {};
            this.animationMixer = new THREE.AnimationMixer(this.mesh);

            const morphTargetGroups = {};

            for (const morphTarget of geometry.morphTargets) {
                const matches = morphTarget.name.match(/^([a-z]+)([0-9]+)/);

                if (!matches || matches.length !== 3) {
                    throw new Error('Invalid morphTarget name');
                }

                const name = matches[1];
                if (!morphTargetGroups[name]) {
                    morphTargetGroups[name] = [ morphTarget ];
                }
                else {
                    morphTargetGroups[name].push(morphTarget);
                }
            }

            for (const name in morphTargetGroups) {
                const morphTarget = morphTargetGroups[name];
                const clip = THREE.AnimationClip.CreateFromMorphTargetSequence(name, morphTarget, 10, true);
                this.sequences[name] = clip;
            }
        }
    }

    onLoadingDone () {
        if (this.mesh) {
            this.mesh.castShadow = true;
            this.add(this.mesh);
        }
    }

    protected playAnimation (name: string, loop = true, clampWhenFinished = false) {
        if (this.currentSequenceName === name) {
            return;
        }

        if (this.previousAnimationAction) {
            this.previousAnimationAction.stop();
        }

        if (!this.sequences) {
            throw new Error('This entity has no animations.');
        }

        const sequence = this.sequences[name];
        if (!sequence) {
            throw new Error(`Sequence "${name}" was not found.`);
        }

        const clip = this.animationMixer.clipAction(sequence);

        clip.clampWhenFinished = clampWhenFinished;
        if (!loop) {
            // clip.setLoop(true, 0);
            clip.setLoop(THREE.LoopOnce, 1);
        }

        clip.play();

        this.currentSequenceName = name;
        this.previousAnimationAction = clip;
    }

    frame(delta: number) {
        if (this.animationMixer) {
            this.animationMixer.update(delta);
        }
    }
}
