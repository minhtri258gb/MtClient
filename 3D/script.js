import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { MtWorldPlane } from './world/worldPlane.js';
import { MtWorldTerrain } from './world/worldTerrain.js';
import { MtWorldVoxel } from './world/worldVoxel.js';
import { MtWorldTile } from './world/worldTile.js';
import { MtWorldCave } from './world/worldCave.js';
import { MtWorldBSP } from './world/worldBSP.js';

var mt = {

	// GUI
	m_gui: null, // Lil-UI

	// Properties
	p_world: 'tile',


	// Graphic
	graphic: {
		m_renderer: null, // Dùng để Render 3D
		m_scene: null, // Dùng để quản lý cảnh
		m_camera: null, // Dùng để xem cảnh
		m_frustum: null, // Dùng để cắt cảnh ko trong phạm vi màn hình
		m_control: null, // Dùng để điều chỉnh cảnh
		m_world: null, // Lưu group của toàn bộ entity
		m_stats: null, // Dùng để theo dõi thông số 3D

		init() {

			// Stats
			this.m_stats = new Stats();
			document.body.append(this.m_stats.dom);

			// Render
			this.m_renderer = new THREE.WebGLRenderer({ antialias: true });
			this.m_renderer.setSize( window.innerWidth, window.innerHeight );
			this.m_renderer.setClearColor(0x80a0e0);
			document.body.appendChild( this.m_renderer.domElement );

			// Scene
			this.m_scene = new THREE.Scene();
			// this.m_scene.background = new THREE.Color(0x000000);

			// Camera
			this.m_camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
			this.m_camera.position.set(0, 50, 0);
			this.m_camera.lookAt(10, 50, 10);

			// Frustum Culling
			this.m_frustum = new THREE.Frustum();
			const projMatrix = new THREE.Matrix4().multiplyMatrices(this.m_camera.projectionMatrix, this.m_camera.matrixWorldInverse);
			this.m_frustum.setFromProjectionMatrix(projMatrix);

			// Control
			this.m_control = new OrbitControls(this.m_camera, this.m_renderer.domElement);

		},

		isLeafInFrustum(leaf, frustum) {
			const box = new THREE.Box3().setFromPoints(leaf.vertices);
			return frustum.intersectsBox(box);
		},
		renderBSP(bspTree, scene, frustum) {
			function traverse(node) {
				if (!node) return;
				if (node.faces.length > 0 && isLeafInFrustum(node, frustum)) {
					for (const face of node.faces) {
						const mesh = createMeshFromFace(face);
						scene.add(mesh);
					}
				}
				// Quyết định duyệt phía trước hoặc phía sau dựa trên vị trí camera
				const cameraSide = classifyPoint(camera.position, node.plane);
				if (cameraSide >= 0) {
					traverse(node.front);
					traverse(node.back);
				} else {
					traverse(node.back);
					traverse(node.front);
				}
			}
			traverse(bspTree);
		},
	},


	// Method
	init() {

		// Bind global
		window.mt = this;

		// Register Event
		this.registerEvent();

		// Init
		this.graphic.init();
		this.initUI();

		// Load
		this.load();

		// Start Loop
		this.loop();
	},
	initUI() {
		this.m_gui = new GUI;

		// Select world
		this.m_gui
			.add(this, 'p_world', ['plane','terrain','voxel','tile','cave','bsp'])
			.name('World')
			.onChange(() => this.load());
	},
	load() {

		let scene = this.graphic.m_scene;

		scene.clear();

		// Light
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
		scene.add(ambientLight);

		const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
		dirLight.position.set(10, 20, 0); // x, y, z
		scene.add(dirLight);

		// World Cave
		switch (this.p_world) {
			case 'plane':
				this.m_world = new MtWorldPlane();
				this.m_world.generate();
				this.m_world.createUI(this.m_gui);
				scene.add(this.m_world);
				break;
			case 'terrain':
				this.m_world = new MtWorldTerrain();
				this.m_world.generate();
				this.m_world.createUI(this.m_gui);
				scene.add(this.m_world);
				break;
			case 'voxel':
				this.m_world = new MtWorldVoxel(32, 10);
				this.m_world.generate();
				this.m_world.createUI(this.m_gui);
				scene.add(this.m_world);
				break;
			case 'tile':
				this.m_world = new MtWorldTile(32, 10);
				this.m_world.generate();
				this.m_world.createUI(this.m_gui);
				scene.add(this.m_world);
				break;
			case 'cave':
				this.m_world = new MtWorldCave();
				this.m_world.generate();
				this.m_world.createUI(this.m_gui);
				scene.add(this.m_world);
				break;
			case 'bsp':
				this.m_world = new MtWorldBSP();
				this.m_world.generate();
				this.m_world.createUI(this.m_gui);
				scene.add(this.m_world);
				break;
		}

		// Geometry
		// let geometry = new THREE.PlaneGeometry(3, 3, 32);
		// let geometry = new THREE.BoxGeometry( 3, 1, 3 ); // width, height, depth
		// let geometry = new THREE.CylinderGeometry(1,5, 1.5, 1, 32);
		// let geometry = new THREE.IcosahedronGeometry(1,5, 8);
		// let geometry = new THREE.ConeGeometry(1, 2, 32);
		// let geometry = new THREE.SphereGeometry(1.5, 32, 32);
		
		// Material
		// const material = new THREE.MeshBasicMaterial( { color: 0xfb8e00  } );
		// const material = new THREE.MeshLambertMaterial( { color: 0xfb8e00  } );
		// const material = new THREE.MeshPhongMaterial( { color: 0xfb8e00  } );
		
		// Mesh
		// this.m_mesh = new THREE.Mesh( geometry, material );
		// this.m_mesh.position.set(0, 0, 0); // Optional, 0,0,0 is the default
		// this.m_mesh.rotation.set(15 /180 * Math.PI, 0, 0);
		// this.m_scene.add(this.m_mesh);
		
		// Line
		// const points = [];
		// points.push( new THREE.Vector3( - 10, 0, 0 ) );
		// points.push( new THREE.Vector3( 0, 10, 0 ) );
		// points.push( new THREE.Vector3( 10, 0, 0 ) );
		// const geometry = new THREE.BufferGeometry().setFromPoints( points );
		// const material = new THREE.MeshBasicMaterial( { color: 0xfb8e00  } );
		// const line = new THREE.Line( geometry, material );
		// this.m_scene.add(line);
		
		// Text
		// const geometry = new THREE.TextGeometry( text, parameters );
		
	},

	// Process
	loop() {
		let self = mt;

		requestAnimationFrame(self.loop);

		// self.m_mesh.rotation.x += 0.01;
		// self.m_mesh.rotation.y += 0.01;

		self.graphic.m_renderer.render(self.graphic.m_scene, self.graphic.m_camera);
		self.graphic.m_stats.update();
	},

	// handler

	// Event
	registerEvent() {
		window.addEventListener('resize', () => this.onResize() );
	},
	onResize() {
		this.m_camera.aspect = window.innerWidth / window.innerHeight;
		this.m_camera.updateProjectionMatrix();
		this.m_renderer.setSize(window.innerWidth, window.innerHeight);
	},

	// Utilities
	file: {
		bsp: {
			/**
			 * Load BSP Map
			 * @param {string} filePath - file path bsp map.
			 */
			parseMapFile(filePath) {
				const data = fs.readFileSync(filePath, 'utf8');
				// Phân tích dữ liệu thành brushes, faces, và entities
				// Trả về mảng các brushes với các mặt phẳng và texture
				return parseMapData(data);
			},
			buildBSPTree(faces) {

				if (faces.length === 0)
					return null;

				// Chọn mặt phẳng phân chia
				const plane = selectPartitionPlane(faces);
				const frontFaces = [];
				const backFaces = [];
				const nodeFaces = [];

				// Phân chia faces
				for (const face of faces) {
					const side = classifyFace(face, plane);
					if (side === 'front') frontFaces.push(face);
					else if (side === 'back') backFaces.push(face);
					else if (side === 'split') {
						const [frontPart, backPart] = splitFace(face, plane);
						frontFaces.push(frontPart);
						backFaces.push(backPart);
					} else {
						nodeFaces.push(face); // Nằm trên mặt phẳng
					}
				}

				// Tạo node
				const node = new BSPNode(plane);
				node.faces = nodeFaces;
				node.front = this.buildBSPTree(frontFaces);
				node.back = this.buildBSPTree(backFaces);
				return node;
			},
			createMeshFromFace(face) {
				const geometry = new THREE.BufferGeometry();
				const vertices = new Float32Array(face.vertices.flat());
				geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
				geometry.computeVertexNormals();

				const texture = new THREE.TextureLoader().load(face.texturePath);
				const material = new THREE.MeshBasicMaterial({ map: texture });
				return new THREE.Mesh(geometry, material);
			},
			addBSPToScene(bspTree, scene) {
				let traverse = function(node) {
					if (!node) return;
					for (const face of node.faces) {
						const mesh = this.createMeshFromFace(face);
						scene.add(mesh);
					}
					traverse(node.front);
					traverse(node.back);
				}
				traverse(bspTree);
			},
		},
	},

};
mt.init();
