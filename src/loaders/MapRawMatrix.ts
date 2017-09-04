export default class MapRawMatrix {
	constructor (public data: Array<Array<any>>) {}
	
	fillRect (char, x, z, w, d): MapRawMatrix {
		this.data.forEach((row, iz) => {
			if (iz >= z && iz < z + d) {
				for (let ix = x; ix < x + w; ix++) {
					row[ix] = char;
				}
			}
		});

		return this;
	}

	filter (filterFunc: (char: string) => boolean, defaultChar = null) {
		for (let iz = 0; iz < this.data.length; iz++) {
			const row = this.data[iz];

			for (let ix = 0; ix < row.length; ix++) {
				if (!filterFunc(row[ix])) {
					row[ix] = defaultChar;
				}
			}
		}

		return this;
	}

	countRepetitionToRight (x, z): number {
		const row = this.data[z];
		const refChar = row[x];

		let count = 0;

		for (let ix = x; ix < row.length; ix++, count++) {
			if (row[ix] !== refChar) {
				break;
			}
		}

		return count;
	}

	countRepetitionToDown (x, z): number {
		const refChar = this.data[z][x];
		let count = 0;

		for (let iz = z; iz < this.data.length; iz++, count++) {
			const row = this.data[iz];

			if (refChar !== row[x]) {
				break;
			}
		}

		return count;
	}

	forEach (iteratee: (x: number, z: number, c, self) => void): MapRawMatrix {
		for (let iz = 0; iz < this.data.length; iz++) {
			const row = this.data[iz];

			for (let ix = 0; ix < row.length; ix++) {
				iteratee(ix, iz, row[ix], this);
			}
		}

		return this;
	}

	clone () {
		return new MapRawMatrix(this.data.map((row) => row.slice()));
	}
}
