import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export class MtWorldPlane extends THREE.Group {


	// Method
	constructor() {
		super();
	}

	/**
	 * Tạo thế giới với data
	 */
	generate() {

		const geometry = new THREE.PlaneGeometry(100, 100, 128, 128); // Kích thước 100x100, 128x128 phân đoạn
		geometry.rotateX(-Math.PI / 2); // Xoay để mặt phẳng nằm ngang

		const textureLoader = new THREE.TextureLoader();
		const heightmap = textureLoader.load('/3D/res/heightmap.jpg');
		const diffuseTexture = textureLoader.load('/3D/res/diffuse.jpg');

		const material = new THREE.ShaderMaterial({
			uniforms: {
				uHeightmap: { value: heightmap },
				uDiffuseTexture: { value: diffuseTexture },
				uHeightScale: { value: 10.0 } // Hệ số độ cao
			},
			vertexShader: this.vertexShader(),
			fragmentShader: this.fragmentShader()
		});

		const terrain = new THREE.Mesh(geometry, material);
		this.add(terrain);
	}

	/**
	 * Tạo UI
	 */
	createUI(gui) {
	}

	update() {
		
	}

	/**
	 * Shader
	 */
	vertexShader() {
		return `
			uniform sampler2D uHeightmap; // Texture heightmap
			uniform float uHeightScale;   // Hệ số phóng đại độ cao
			varying vec2 vUv;            // Truyền UV sang fragment shader
			varying float vHeight;       // Truyền độ cao sang fragment shader

			void main() {
				vUv = uv; // Lưu tọa độ UV
				vec4 heightData = texture2D(uHeightmap, uv); // Lấy giá trị từ heightmap
				float height = heightData.r * uHeightScale;  // Sử dụng kênh đỏ (R) làm độ cao
				vHeight = height; // Lưu độ cao

				vec3 newPosition = position + vec3(0.0, height, 0.0); // Dịch chuyển đỉnh theo trục Y
				gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
			}
		`;
	}
	fragmentShader() {
		return `
			uniform sampler2D uDiffuseTexture; // Texture màu
			varying vec2 vUv;
			varying float vHeight;

			void main() {
				vec3 color = texture2D(uDiffuseTexture, vUv).rgb; // Lấy màu từ texture
				// Tùy chọn: Tô màu dựa trên độ cao
				// vec3 color = mix(vec3(0.0, 0.5, 0.0), vec3(0.8, 0.8, 0.8), vHeight / uHeightScale);
				gl_FragColor = vec4(color, 1.0);
			}
		`;
	}

}
