import * as THREE from 'three';

export class MtWorldBSP extends THREE.Group {

	m_bspTree = null;


	// Method
	constructor(size = 32, height = 1) {
		super();
		this.m_width = size;
		this.m_height = height;
	}

	/**
	 * Tạo thế giới với data
	 */
	generate() {

		// BSP Map
		// let dataBSP = mt.file.bsp.parseMapFile('de_dust2.map');
		// this.m_bspTree = mt.file.bsp.buildBSPTree(dataBSP);
	}

	/**
	 * Tạo UI
	 */
	createUI(gui) {

	}

	update() {
		scene.clear(); // Xóa scene để cập nhật
		const frustum = new THREE.Frustum();
		frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
		renderBSP(bspTree, scene, frustum);
		renderer.render(scene, camera);
	}

}
