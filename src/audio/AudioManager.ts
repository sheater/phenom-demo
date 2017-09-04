import * as THREE from 'three';

import StaticAudioEmitter from './StaticAudioEmitter';
import DynamicAudioEmitter from './DynamicAudioEmitter';
import loaders from './../loaders/instance';

export default class AudioManager {
	public audioListener = new THREE.AudioListener();
	private bufferByName: { [s: string]: THREE.AudioBuffer } = {};

	async preloadSounds (names: Array<string>) {
		for (const name of names) {
			if (this.bufferByName.hasOwnProperty(name)) {
				continue;
			}

			this.bufferByName[name] = await loaders.audio.load(`./sound/${name}`);
		}
	}

	getBufferFor (name) {
		if (!this.bufferByName.hasOwnProperty(name)) {
			throw new Error(`Sound "${name}" was not preloaded.`);
		}

		return this.bufferByName[name];
	}

	// max channels are useless for now
	createStaticEmitter (maxChannels = 5) {
		return new StaticAudioEmitter(this, maxChannels);
	}

	createDynamicEmitter (object, maxChannels = 5) {
		return new DynamicAudioEmitter(object, this, maxChannels);
	}
}
