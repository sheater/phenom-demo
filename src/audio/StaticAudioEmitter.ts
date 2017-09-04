import * as THREE from 'three';

import BaseAudioEmitter from './BaseAudioEmitter';
import { IPlaySoundOptions } from './types';

export default class StaticAudioEmitter extends BaseAudioEmitter<THREE.Audio> {
	protected createAudio () {
		return new THREE.Audio(this.audioMgr.audioListener);
	}
}
