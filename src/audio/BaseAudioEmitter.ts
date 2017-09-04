import * as THREE from 'three';

import AudioManager from './AudioManager';
import { IPlaySoundOptions } from './types';

export default abstract class AudioEmitter<T> {
	protected channels: Array<T> = [];

	constructor (protected audioMgr: AudioManager, protected maxChannels = 5) {
	}

	protected abstract createAudio ();

	playSound (name: string, { loop = false, volume = 0.5 }: IPlaySoundOptions = {}) {
		const buffer = this.audioMgr.getBufferFor(name);

		const sound = this.createAudio().setBuffer(buffer);

		sound.setLoop(loop);
		sound.setVolume(volume);

		sound.play();

		return sound;
	}
}
