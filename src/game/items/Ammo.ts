import BaseItem from './BaseItem';
import World from './../World';
import Actor from './../Actor';
import Player from './../Player';

export default class Ammo extends BaseItem {
    constructor(world: World) {
        super(world, './textures/ammo.png');
    }

    onTouch (toucher: Actor) {
        if (!(toucher instanceof Player)) {
            return;
        }

        if (toucher.addAmmo(200)) {
            super.onTouch(toucher);
        }
    }
}
