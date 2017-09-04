import * as THREE from 'three';
import axios from 'axios';

import World from './../game/World';

import MapBuilder from './MapBuilder';

export default class MapLoader {
	async load (name, world: World) {
		console.log('loading data');
		const response = await axios.get(name);

		// (data: any, textStatus: string, jqXHR: JQueryXHR) => {
        //     // data.map.forEach((row: string, z: number) => {
        //     //     row.split('').forEach((type: string, x: number) => {
        //     //     });
        //     // });

        //     // console.log('Num brushes:', this.brushes.length);
        //     // console.log('Num entities:', this.entities.length);

        //     // this.pathfinder.nodeAddingDone();

        //     // // todo: merge brushes
        //     // console.log('done');
		// }

		// const data = JSON.parse(response.data);

		const builder = new MapBuilder(world);
		
		builder.build(response.data.map);
	}
}
