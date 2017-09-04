import * as THREE from 'three';

import CachingLoader from './CachingLoader';
import MapLoader from './MapLoader';

const model = new CachingLoader(new THREE.JSONLoader());
const texture = new CachingLoader(new THREE.TextureLoader());
const audio = new CachingLoader(new THREE.AudioLoader());
const map = new MapLoader();

const loaders = { model, texture, audio, map };
export default loaders;
