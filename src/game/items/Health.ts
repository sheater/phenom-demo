import BaseItem from './BaseItem';
import World from './../World';
import Actor from './../Actor';
import Player from './../Player';

export default class Health extends BaseItem {
    constructor(world: World) {
        super(world, './textures/health.png');
    }

    onTouch (toucher: Actor) {
        if (!(toucher instanceof Player)) {
            return;
        }

        if (toucher.heal(20)) {
            super.onTouch(toucher);
        }
    }
}
