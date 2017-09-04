import * as $ from 'jquery';

import Entity from './Entity';
import World from './World';
import BaseMonster from './monsters/BaseMonster';

const RESPAWN_TIME = 3;

export default class MonsterSpawn extends Entity {
    private spawnedCount = 0;
    private spawnTime = 0;
    private monster = null;

    private async spawn() {
        this.monster = new BaseMonster(this.world);

        await this.monster.loadResources();
        this.monster.onLoadingDone();

        $.extend(this.monster.position, this.position);

        this.world.add(this.monster);
        this.spawnedCount++;
    }

    frame(delta: number) {
        // if (!this.spawnedCount) {
        //     this.spawn();
        // }
        const { monster } = this;

        if (!monster || !monster.isAlive) {
            this.spawnTime += delta;

            if (this.spawnTime > RESPAWN_TIME) {
                this.spawnTime = 0;
                this.spawn();
            }
        }
    }
}
