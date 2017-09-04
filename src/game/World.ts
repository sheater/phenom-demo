import * as THREE from 'three';

import { CLEAR_COLOR } from './../const';
import loaders from './../loaders/instance';
import audio from './../audio/instance';
import GPUParticleSystem from './../video/GPUParticleSystem';

import Sky from './Sky';
import Floor from './Floor';
import Entity from './Entity';
import Brush from './Brush';
import Moveable from './Moveable';
import Player from './Player';
import Spawn from './MonsterSpawn';
import Health from './items/Health';
import Ammo from './items/Ammo';
import Pathfinder from './ai/Pathfinder';
import AINode from './ai/AINode';

const MAX_TIME_DELTA = 0.02;

const THEME_MUSIC_NAME = 'theme.mp3';

export default class World extends THREE.Scene {
    private raycaster = new THREE.Raycaster();
    private brushTextureByType: { [s: string]: THREE.Texture } = {};
    public player: Player = null;
    private tick: number = 0;
    private clock: THREE.Clock;
    public camera: THREE.PerspectiveCamera;
    public pathfinder: Pathfinder;
    public particleSystem: GPUParticleSystem;

    constructor(private renderer: THREE.Renderer) {
        super();

        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.rotation.set(0, 0, 0);

        this.camera.add(audio.audioListener);

        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.camera.lookAt(new THREE.Vector3(-1, 0, 0));

        this.clock = new THREE.Clock();

        this.loadAndPlayMusic();
    }

    private async loadAndPlayMusic () {
        await audio.preloadSounds([ THEME_MUSIC_NAME ]);
        audio.createStaticEmitter().playSound(THEME_MUSIC_NAME, { loop: true });
    }

    updateProjection() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    requestFrame(isPaused: boolean) {
        const delta = Math.min(MAX_TIME_DELTA, this.clock.getDelta());
        this.tick = Math.max(0, this.tick + delta);

        if (!isPaused) {
            for (const child of this.children) {
                if (child instanceof Entity) {
                    child.frame(delta);
                }
            }
        }

        this.particleSystem.update(this.tick);

        this.renderer.render(this, this.camera);
    }

    private removeAllChildren () {
        while(this.children.length > 0){ 
            this.remove(this.children[0]); 
        }
    }

    async load(filename: string) {
        this.removeAllChildren();

        this.createFog();
        this.createLights();

        this.pathfinder = new Pathfinder();

        this.add(this.particleSystem = new GPUParticleSystem());
        this.add(new Sky(this));
        this.add(new Floor(this));

        await loaders.map.load(filename, this);

        this.pathfinder.nodeAddingDone();

        for (const child of this.children) {
            if (child instanceof Entity) {
                await child.initialize();
            }
        }
    }

    private createFog () {
        this.fog = new THREE.FogExp2(CLEAR_COLOR, 0.042);
    }

    private createLights () {
        var alight = new THREE.AmbientLight(0xffffff, 0.4);

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        this.add(directionalLight);
        
        this.add(alight);
    }
}
