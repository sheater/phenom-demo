import * as THREE from 'three';

import Actor from './../Actor';
import World from './../World';
import Projectile from './../Projectile';
import AIController from './../ai/AIController';
import audio from './../../audio/instance';
import { getRandomItem } from './../utils';

const mapSoundPath = (name) => `./monster/${name}`;

const FOOTSTEP_SOUNDS = [
    'imp_footstep_01.ogg', 'imp_footstep_02.ogg',
    'imp_footstep_03.ogg', 'imp_footstep_04.ogg',
].map(mapSoundPath);

const DEATH_SOUNDS = [
    'imp_death_01.ogg', 'imp_death_02.ogg',
    'imp_death_03.ogg', 'imp_death_04.ogg',
].map(mapSoundPath);

const SIGHT_SOUNDS = [
    'imp_sight_01.ogg', 'imp_sight_02.ogg',
    'imp_sight_03.ogg', 'imp_sight_04.ogg',
].map(mapSoundPath);

const WEAPON_SOUNDS = [
    'machgun_shot_1v2.wav', 'machgun_shot_2v2.wav', 'machgun_shot_3v2.wav',
    'machgun_shot_4v2.wav', 'machgun_shot_5v2.wav',
].map((name) => `weapon/${name}`);

export default class Monster extends Actor {
    ATTACK_RATE = 1.5;
    MAX_ACCELERATION = 250;

    constructor(world: World) {
        super(world, AIController);

        this.audioEmitter = audio.createDynamicEmitter(this);
    }
    
    async loadResources () {
        await this.loadModel('./models/monster.json', './textures/monster.png');
        await audio.preloadSounds(FOOTSTEP_SOUNDS);
        await audio.preloadSounds(DEATH_SOUNDS);
        await audio.preloadSounds(SIGHT_SOUNDS);
        await audio.preloadSounds(WEAPON_SOUNDS);
    }

    onLoadingDone () {
        super.onLoadingDone();
        this.mesh.position.y = -0.35;
        this.playAnimation('stand');
    }

    protected makeAttack () {
        this.playAnimation('attack', false, true);

        const projectile = new Projectile(this.world, this);

        this.audioEmitter.playSound(getRandomItem(WEAPON_SOUNDS));

        projectile.position.copy(this.position);
        projectile.setVelocityFromRotation(this.yaw, this.pitch);

        this.world.add(projectile);
    }

    private spawnBlood () {
        const options = {
            position: this.position.clone(),
            positionRandomness: 0.5,
            velocity: new THREE.Vector3(0, -0.1, 0),
            velocityRandomness: 0.3,
            color: 0xff0000,
            colorRandomness: 0,
            turbulence: 0,
            lifetime: 1,
            size: 70,
            sizeRandomness: 0,
            smoothPosition: true,
        };

        for (let i = 0; i < 7; i++) {
            this.world.particleSystem.spawnParticle(options);
        }
    }

    damage (amount, attacker) {
        if (this.health <= 0) {
            return;
        }

        super.damage(amount, attacker);

        this.spawnBlood();
        this.isAlerted = true;

        if (this.health <= 0) {
            this.collisionOptions.isSolid = false;
            this.playAnimation('deathb', false, true);
            this.audioEmitter.playSound(getRandomItem(DEATH_SOUNDS));
            attacker.onKill(this);
        }
        else {
            this.audioEmitter.playSound(getRandomItem(SIGHT_SOUNDS));
        }
    }

    onMove (delta) {
        this.footstepsTimer += delta;
        if (this.footstepsTimer > 0.35) {
            this.audioEmitter.playSound(getRandomItem(FOOTSTEP_SOUNDS));
            this.footstepsTimer = 0;
        }
    }

    doMove (moveAngle) {
        if (this.currentSequenceName !== 'run') {
            this.playAnimation('run');
        }

        super.doMove(moveAngle);
    }

    frame (delta) {
        if (this.currentSequenceName === 'run' && !this.acceleration && !this.isAttacking) {
            this.playAnimation('stand');
        }

        super.frame(delta);
    }
}
