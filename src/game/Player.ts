import * as THREE from 'three';

import audio from './../audio/instance';
import * as ui from './../ui/instance';
import Actor from './Actor';
import World from './World';
import Projectile from './Projectile';
import PlayerController from './PlayerController';
import { getRandomItem } from './utils';

const PLAYER_WEAPON_FIRE_RATE = 10; // 10 vystrelu za sekundu
const PLAYER_WEAPON_FIRE_PERIOD = 1 / PLAYER_WEAPON_FIRE_RATE;
const WEAPON_MESH_SCALE = 0.7;
const DEATH_ANIM_DURATION = 0.6;

const MAX_PLAYER_AMMO = 300;

const mapSoundPath = (name) => `player/${name}`;

const FOOTSTEP_SOUNDS = [
    'step01.ogg', 'step02.ogg', 'step03.ogg', 'step05.ogg', 'step07.ogg',
    'step09.ogg', 'step10.ogg', 'step11.ogg', 'step13.ogg',
].map(mapSoundPath);

const PAIN_SOUNDS = [
    'smallpain_01.ogg', 'smallpain_02.ogg', 'smallpain_03.ogg',
].map(mapSoundPath);

const DEATH_SOUNDS = [
    'death_01.ogg', 'death_02.ogg', 'death_03.ogg', 'death_04.ogg',
].map(mapSoundPath);

const WEAPON_SOUNDS = [
    'machgun_shot_1v2.wav', 'machgun_shot_2v2.wav', 'machgun_shot_3v2.wav',
    'machgun_shot_4v2.wav', 'machgun_shot_5v2.wav',
].map((name) => `weapon/${name}`);

export default class Player extends Actor {
    protected ATTACK_RATE = 10;
    private deathAnimTimer = 0;

    health = 100;
    ammo = 100;
    score = 0;

    constructor (world: World, private camera: THREE.Camera) {
        super(world, PlayerController);

        this.pitchObject.add(camera);
        this.add(this.pitchObject);

        this.audioEmitter = audio.createStaticEmitter();

        ui.hud.registerPlayer(this);
    }

    async loadResources () {
        await this.loadModel('./models/chaingun.json', './textures/chaingun.jpg');
        await audio.preloadSounds(FOOTSTEP_SOUNDS);
        await audio.preloadSounds(PAIN_SOUNDS);
        await audio.preloadSounds(DEATH_SOUNDS);
        await audio.preloadSounds(WEAPON_SOUNDS);
    }

    onLoadingDone () {
        this.mesh.scale.setScalar(WEAPON_MESH_SCALE);
        this.pitchObject.add(this.mesh);
        this.playAnimation('idle');
    }

    heal (amount: number): boolean {
        if (super.heal(amount)) {
            ui.hud.redraw();

            return true;
        }

        return false;
    }

    damage (amount: number, attacker) {
        super.damage(amount, attacker);

        ui.hud.redraw();

        if (this.isAlive) {
            ui.hud.painEffect(0.5);
            this.audioEmitter.playSound(getRandomItem(PAIN_SOUNDS));
        }
        else if (!this.deathAnimTimer) {
            ui.hud.painEffect(1);
            this.mesh.visible = false;
            this.audioEmitter.playSound(getRandomItem(DEATH_SOUNDS));
        }
    }

    onKill () {
        this.score++;
        ui.hud.redraw();
    }

    onMove (delta) {
        this.footstepsTimer += delta;
        if (this.footstepsTimer > 0.3) {
            this.audioEmitter.playSound(getRandomItem(FOOTSTEP_SOUNDS));
            this.footstepsTimer = 0;
        }
    }

    addAmmo (amount: number): boolean {
        if (this.ammo >= MAX_PLAYER_AMMO) {
            return false;
        }

        this.ammo = Math.min(MAX_PLAYER_AMMO, this.ammo + amount);
        ui.hud.redraw();

        return true;
    }

    protected makeAttack () {
        this.ammo--;
        ui.hud.redraw();

        ui.hud.muzzleFlashEffect();
        this.audioEmitter.playSound(getRandomItem(WEAPON_SOUNDS));

        const projectile = new Projectile(this.world, this);
        projectile.position.copy(this.position);
        projectile.setVelocityFromRotation(this.yaw, this.pitch);
        this.world.add(projectile);
    }

    protected checkAttack (delta) {
        if (this.ammo > 0) {
            super.checkAttack(delta);
        }
    }

    private animateDeath (delta) {
        if (this.isAlive || this.deathAnimTimer > DEATH_ANIM_DURATION) {
            return;
        }

        this.deathAnimTimer += delta;

        const progress = this.deathAnimTimer / DEATH_ANIM_DURATION;

        this.pitchObject.position.y = -0.6 * progress;
        this.pitchObject.rotation.x = Math.PI * 0.15 * progress;
    }

    frame (delta) {
        this.animateDeath(delta);

        super.frame(delta);
    }
}
