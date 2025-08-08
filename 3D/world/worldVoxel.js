import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export class MtWorldVoxel extends THREE.Group {

  /**
   * Lưu tọa độ từng khối với id và instance
   * @type {{
   *  id: number,
   *  instanceId: number
   * }[][][]}
   */
  m_data = [];

  /**
   * Kích thước chiều rộng
   * @type {number}
   */
  m_width = 0;

  /**
   * Kích thước chiều cao
   * @type {number}
   */
  m_height = 0;

  /**
   * @type {number}
   */
  m_noise_scale = 30;
  /**
   * @type {number}
   */
  m_noise_magniiture = 0.5;
  /**
   * @type {number}
   */
  m_noise_offset = 0.2;


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
    this.generateTerrain();
    this.generateMesh();
  }

  /**
   * Tạo địa hình
   */
  generateTerrain() {

    // Init
    this.m_data = [];
    for (let x=0; x<this.m_width; x++) {
      const slice = [];
      for (let y=0; y<this.m_height; y++) {
        const row = [];
        for (let z=0; z<this.m_width; z++)
          row.push({ id: 0, instanceId: null });
        slice.push(row);
      }
      this.m_data.push(slice);
    }

    // Generate
    const simplex = new SimplexNoise();
    for (let x=0; x<this.m_width; x++) {
      for (let z=0; z<this.m_width; z++) {

        // Compute noise (-1.0 -> 1.0)
        const value = simplex.noise(
          x / this.m_noise_scale,
          z / this.m_noise_scale
        );

        const scaledNoise = this.m_noise_offset + this.m_noise_magniiture * value;

        // Computing
        let height = Math.floor(this.m_height * scaledNoise);

        // Claim
        height = Math.max(0, Math.min(height, this.m_height - 1));

        // Fill data
        for (let y=0; y<=height; y++)
          this.setBlockId(x, y, z, 1);

      }
    }

  }

  /**
   * Tạo khối không gian
   */
  generateMesh() {

    // Clear Old Mesh
    this.clear();

    // Hình dáng và vật liệu
    const geometry = new THREE.BoxGeometry( 3, 1, 3 ); // width, height, depth
    const material = new THREE.MeshPhongMaterial( { color: 0xfb8e00  } );

    // Tạo InstancedMesh
    const maxCount = this.m_width * this.m_width * this.m_height;
    const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    mesh.count = 0;

    // Tạo modal matrix để lưu vị trí
    const modalMatrix = new THREE.Matrix4();

    // For qua 3 chiều
    for (let x=0; x<this.m_width; x++) {
      for (let y=0; y<this.m_height; y++) {
        for (let z=0; z<this.m_width; z++) {

          const blockId = this.getBlock(x, y, z).id; // Lấy loại block
          const instanceId = mesh.count;

          // Ko render block id = 0
          if (blockId == 0)
            continue;

          // Chọn vị trí
          modalMatrix.setPosition(x+0.5, y+0.5, z+0.5);

          // Lưu vị trí mesh tại instance mới
          mesh.setMatrixAt(instanceId, modalMatrix);

          // Lưu vào data
          this.setBlockInstanceId(x, y, z, instanceId);

          // Tăng instance Mesh 
          mesh.count++;
        }
      } 
    }

    this.add(mesh);
  }

  /**
   * Tạo UI
   */
  createUI(gui) {

    // Nếu đã có thì bỏ qua
    let lstFolder = gui.folders;
    for (let f of lstFolder)
      if (f._title == 'VoxelTerrain')
        return;

    // Tạo UI
    const folder = gui.addFolder('VoxelTerrain');
    folder.add(this, 'm_width', 8, 128, 1).name('Width');
    folder.add(this, 'm_height', 1, 64, 1).name('Height');
    folder.add(this, 'm_noise_scale', 1, 64, 1).name('Noise scale');
    folder.add(this, 'm_noise_magniiture', 0, 1, 0.1).name('Noise magniiture');
    folder.add(this, 'm_noise_offset', 0, 1, 0.1).name('Noise offset');
    folder.add(this, 'generate').name('Generate');

    // gui.onChange(() => this.generate());
  }

	update() {
		
	}

  /**
   * Get block at (x, y, z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {{id: number, instanceId: number}}
   */
  getBlock(x, y, z) {
    if (this.inBounds(x, y, z))
      return this.m_data[x][y][z];
    else
      return null;
  }

  /**
   * Set block id at (x, y, z, id)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} id
   */
  setBlockId(x, y, z, id) {
    if (this.inBounds(x, y, z))
      this.m_data[x][y][z].id = id;
  }

  /**
   * Set block instance at (x, y, z, id)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} instanceId
   */
  setBlockInstanceId(x, y, z, instanceId) {
    if (this.inBounds(x, y, z))
      this.m_data[x][y][z].instanceId = instanceId;
  }

  /**
   * Check origin (x, y, z) in size and height
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  inBounds(x, y, z) {
    return (
      x >= 0 && x < this.m_width &&
      y >= 0 && y < this.m_height &&
      z >= 0 && z < this.m_width
    );  
  }

}
