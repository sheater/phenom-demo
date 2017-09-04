import * as THREE from 'three';

export function vector2yawPitchDist (vec: THREE.Vector3) {
	const { x, y, z } = vec;

	const distance = Math.sqrt(z * z + x * x);
	const pitch = Math.atan2(distance, y);
	const yaw = Math.atan2(-z, x);

	return {
		distance, pitch, yaw,
	};
}

export function yawPitch2vector (yaw: number, pitch: number) {
	return new THREE.Vector3(
		-Math.cos(pitch) * Math.cos(yaw),
		-Math.sin(pitch),
		Math.cos(pitch) * Math.sin(yaw),
	);
}

export function randomizeNumber (base: number, tolerance: number) {
	return base + (Math.random() - 0.5) * 2 * tolerance;
}

export function getRandomItem <T> (arr: Array<T>): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getIntersection (
	dst1: number, dst2: number,
	p1: THREE.Vector3, p2: THREE.Vector3,
	hit: THREE.Vector3
) {
	if (dst1 * dst2 >= 0) {
		return false;
	}

	if (dst1 === dst2) {
		return false;
	}

	const pdiff = p2.clone().sub(p1);
	const zav = -dst1 / (dst2 - dst1);

	hit.copy(p1.clone().add(pdiff.clone().multiplyScalar(zav)));

	return true;
}

function inBox (hit, min, max, axis) {
	return (
		axis === 1 && hit.z > min.z && hit.z < max.z && hit.y > min.y && hit.y < max.y ||
		axis === 2 && hit.z > min.z && hit.z < max.z && hit.x > min.x && hit.x < max.x ||
		axis === 3 && hit.x > min.x && hit.x < max.x && hit.y > min.y && hit.y < max.y
	);
}

export function lineBoxIntersection (
	lineStart: THREE.Vector3, lineEnd: THREE.Vector3,
	box: THREE.Box3
) {
	const { min, max } = box;

	if (
		lineEnd.x < min.x && lineStart.x < min.x ||
		lineEnd.x > max.x && lineStart.x > max.x ||
		lineEnd.y < min.y && lineStart.y < min.y ||
		lineEnd.y > max.y && lineStart.y > max.y ||
		lineEnd.z < min.z && lineStart.z < min.z ||
		lineEnd.z > max.z && lineStart.z > max.z
	) {
		return false;
	}

	if (
		lineStart.x > min.x && lineStart.x < max.x &&
		lineStart.y > min.y && lineStart.y < max.y &&
		lineStart.z > min.z && lineStart.z < max.z
	) {
		return true;
	}

	const hit = new THREE.Vector3(); // ignore for now

	if (
		getIntersection(lineStart.x - min.x, lineEnd.x - min.x, lineStart, lineEnd, hit) && inBox(hit, min, max, 1) ||
		getIntersection(lineStart.y - min.y, lineEnd.y - min.y, lineStart, lineEnd, hit) && inBox(hit, min, max, 2) ||
		getIntersection(lineStart.z - min.z, lineEnd.z - min.z, lineStart, lineEnd, hit) && inBox(hit, min, max, 3) ||
		getIntersection(lineStart.x - max.x, lineEnd.x - max.x, lineStart, lineEnd, hit) && inBox(hit, min, max, 1) ||
		getIntersection(lineStart.y - max.y, lineEnd.y - max.y, lineStart, lineEnd, hit) && inBox(hit, min, max, 2) ||
		getIntersection(lineStart.z - max.z, lineEnd.z - max.z, lineStart, lineEnd, hit) && inBox(hit, min, max, 3)
	) {
		return true;
	}

	return false;
}
