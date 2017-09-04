import * as THREE from 'three';

import { keyboard, mouse } from './input/index';
import * as ui from './ui/instance';
import World from './game/World';

export default class Game {
    constructor() {
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const world = new World(renderer);
        
        world.load('./maps/intro.json');

        let isPaused = true;
        ui.splash.show();

        document.addEventListener('click', (event) => {
            mouse.requestPointerLock();

            isPaused = false;
            ui.splash.hide();
        }, false);

        (function render () {
            requestAnimationFrame(render);

            world.requestFrame(isPaused);
        })();

        function onWindowResize() {
            world.updateProjection();

            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize, false);
    }
}
