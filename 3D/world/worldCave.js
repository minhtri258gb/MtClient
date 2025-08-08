import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export class MtWorldCave extends THREE.Group {


	// Method
	constructor() {
		super();
	}

	/**
	 * Tạo thế giới với data
	 */
	generate() {

		// Hang động
		const simplex = new SimplexNoise();
		const cave_points = [];
		for (let i = 0; i < 50; i++) {
			const x = i * 2;
			const y = simplex.noise(i * 0.1, 0) * 5;
			const z = simplex.noise(i * 0.1, 100) * 5;
			cave_points.push(new THREE.Vector3(x, y, z));
		}
		const cave_curve = new THREE.CatmullRomCurve3(cave_points);

		// Tạo hình học hang động
		const cave_tubeGeometry = new THREE.TubeGeometry(cave_curve, 64, 2, 8, false);

		const vertices = cave_tubeGeometry.attributes.position.array;
		for (let i = 0; i < vertices.length; i += 3) {
			const x = vertices[i];
			const y = vertices[i + 1];
			const z = vertices[i + 2];
			const offset = simplex.noise(x * 0.1, y * 0.1, z * 0.1) * 0.5;
			vertices[i] += offset;
			vertices[i + 1] += offset;
			vertices[i + 2] += offset;
		}
		cave_tubeGeometry.attributes.position.needsUpdate = true;

		const cave_material = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
		const cave_mesh = new THREE.Mesh(cave_tubeGeometry, cave_material);
		this.add(cave_mesh);
	}

	/**
	 * Tạo UI
	 */
	createUI(gui) {
	}

	update() {
		
	}

}
