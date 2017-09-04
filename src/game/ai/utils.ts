export function getDistanceScore (a: THREE.Vector3, b: THREE.Vector3): number {
	// powered distance (on 2D plane)
	return Math.pow(a.x - b.x, 2) + Math.pow(a.z - b.z, 2);
}
