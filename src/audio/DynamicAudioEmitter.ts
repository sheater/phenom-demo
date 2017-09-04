import * as THREE from 'three';

import BaseAudioEmitter from './BaseAudioEmitter';
import { IPlaySoundOptions } from './types';

export default class DynamicAudioEmitter extends BaseAudioEmitter<THREE.PositionalAudio> {
	constructor (private object, audioMgr, maxChannels) {
		super(audioMgr, maxChannels);
	}

	protected createAudio () {
		return new THREE.PositionalAudio(this.audioMgr.audioListener);
	}

	playSound (name, options: IPlaySoundOptions = {}) {
		const sound = super.playSound(name, options);

		this.object.add(sound);
	}
}
