import * as THREE from 'three';

export default class CachingLoader {
	private cache = {};

	constructor (private loader: any) {}

	async load (filename: string) {
		if (this.cache[filename]) {
			return this.cache[filename];
		}

		const data = await new Promise((resolve, reject) => {
			this.loader.load(filename, (data) => {
				resolve(data);
			}, undefined, reject);
		});

		this.cache[filename] = data;

		return data;
	}
}
