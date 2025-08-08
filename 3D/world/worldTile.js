import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export class MtWorldTile extends THREE.Group {


	// Method
	constructor() {
		super();
	}

	/**
	 * Tạo thế giới với data
	 */
	generate() {

		// Tạo đất liền
		const geometry = new THREE.PlaneGeometry(100, 100, 1, 1); // Kích thước 100x100, 1x1 phân đoạn
		geometry.rotateX(-Math.PI / 2); // Xoay để mặt phẳng nằm ngang
		const material = new THREE.MeshBasicMaterial({ color: 0x007700 });
		const mesh = new THREE.Mesh(geometry, material);
		// mesh.position.set(0, 0, 0);
		this.add(mesh);

		// Sky
		const cubeTextureLoader = new THREE.CubeTextureLoader();
		mt.graphic.m_scene.background = cubeTextureLoader.load([
			'/3D/res/skybox/cloudy/bluecloud_lf.jpg',
			'/3D/res/skybox/cloudy/bluecloud_rt.jpg',
			'/3D/res/skybox/cloudy/bluecloud_dn.jpg',
			'/3D/res/skybox/cloudy/bluecloud_up.jpg',
			'/3D/res/skybox/cloudy/bluecloud_ft.jpg',
			'/3D/res/skybox/cloudy/bluecloud_bk.jpg',
		]);
	}

	/**
	 * Tạo UI
	 */
	createUI(gui) {
	}

	update() {
		
	}

}
