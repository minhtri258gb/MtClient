/**
 * 
 */

let mtImage = {
	h_isShadow: false,
	e_contain: null,
	m_init: false,
	m_width: 1500, // Default size
	m_height: 512,

	mgr: {
		e_list: null, // Element danh sách
		d_map: {}, // Danh sách object
		m_maxIndex: 1, // Index cho Object mới
		m_currentItem: '', // Mục đang chọn

		init() {
			this.e_list = document.getElementById('image-list');
		},
		add(toolName, obj) {

			let indexNew = this.m_maxIndex++;
			let code = toolName + '-' + indexNew;

			// Thêm ref cho obj để map
			obj.code = code;

			// Render list
			const li = document.createElement('li');
			li.id = 'image-list-item-' + indexNew;
			li.textContent = code;
			li.style.background = '#DDD'; // Highlight trên list
			li.addEventListener('click', () => mtImage.event.onListSelect(code));
			this.e_list.appendChild(li);

			// Add to list
			let item = {
				id: indexNew,
				code: code,
				obj: obj,
				elm: li,
			};
			this.d_map[code] = item;

			return item;
		},
	},
	canvas: {
		c_fabric: null,

		init() {

			// Tạo Canvas
			let canvasElm = document.createElement('canvas');
			canvasElm.width = mtImage.m_width;
			canvasElm.height = mtImage.m_height;
			canvasElm.style.width = mtImage.m_width + 'px';
			canvasElm.style.height = mtImage.m_height + 'px';
			canvasElm.style.border = '1px solid #000';

			let elmRender = document.getElementById('image-render');
			elmRender.appendChild(canvasElm);

			// Cancas tạo dragdrop file ảnh

			// Init Fabric
			this.c_fabric = new fabric.Canvas(canvasElm);

			// Event select
			this.c_fabric.on('selection:created', (e) => mtImage.event.onCanvasSelect(e));
			this.c_fabric.on('selection:updated', (e) => mtImage.event.onCanvasSelect(e));
			this.c_fabric.on('selection:cleared', (e) => mtImage.event.onCanvasSelect(e));
		},
		getImage() {
			return this.c_fabric.toDataURL();
		},
		resize(width, height) {

			// Lưu biến
			mtImage.m_width = width;
			mtImage.m_height = height;

			// Cập nhật Fabric
			this.c_fabric.setDimensions({ width, height });
		},
	},
	tool: {
		m_currentTool: '',

		size: {
			e_width: null,
			e_height: null,

			init() {
				this.e_width = document.getElementById('image-tool-size-w');
				this.e_width.value = mtImage.m_width;
				this.e_width.addEventListener('change', () => mtImage.event.onChangeSize());

				this.e_height = document.getElementById('image-tool-size-h');
				this.e_height.value = mtImage.m_height;
				this.e_height.addEventListener('change', () => mtImage.event.onChangeSize());
			},
		},
		text: {
			e_prop: null,
			e_input: null,

			init() {
				this.e_prop = document.getElementById('image-tool-text');
				this.e_input = document.getElementById('image-tool-text-input');
			},
		},

		init() {
			this.size.init();
			this.text.init();
		},
		show(tool) {

			// Ẩn tool trước
			if (this.m_currentTool.length > 0)
				this[this.m_currentTool].e_prop.style.display = 'none';

			// Lưu tool hiện tại
			this.m_currentTool = tool;

			// Hiện tool hiện tại
			this[tool].e_prop.style.display = '';
		},
	},
	event: {

		// List
		onListSelect(code) { // Select on List

			// DeSelect old
			if (mtImage.mgr.m_currentItem.length > 0) {
				let oldCode = mtImage.mgr.m_currentItem;
				let item = mtImage.mgr.d_map[oldCode]; // Lấy item active cũ
				item.elm.style.background = ''; // Bỏ highlight trên list
			}
			mtImage.mgr.m_currentItem = code; // Đánh dấu mục chọn hiện tại

			let item = mtImage.mgr.d_map[code]; // Lấy item hiện tại
			item.elm.style.background = '#DDD'; // Highlight trên list

			// Select text trên canvas
			this.m_blockCanvasSelect = true;
			mtImage.canvas.c_fabric.setActiveObject(item.obj); // Active object
			mtImage.canvas.c_fabric.requestRenderAll(); // Render highlight

			// Fill prop
			let elmInputText = mtImage.tool.text.e_input;
			elmInputText.value = item.obj.text;

			// Log
			mt.h_debug && console.log('[mt.image.event.onListSelect]', { code, item });
		},

		// Canvas
		m_blockCanvasSelect: false,
		onCanvasSelect(e) { // Sự kiện chọn object trên canvas

			if (this.m_blockCanvasSelect) {
				this.m_blockCanvasSelect = false;
				return;
			}

			// Bỏ chọn
			if (e.deselected != null) {
				for (let deselected of e.deselected) {
					let code = deselected.code;
					let item = mtImage.mgr.d_map[code];
					item.elm.style.background = ''; // Bỏ highlight trên list
				}
			}

			// Chọn
			if (e.selected != null) {
				for (let selected of e.selected) {
					let code = selected.code;
					let item = mtImage.mgr.d_map[code];
					item.elm.style.background = '#DDD'; // Highlight trên list

					// Fill prop
					let elmInputText = mtImage.tool.text.e_input;
					elmInputText.value = item.obj.text;
				}
			}

			// Log
			// mt.h_debug && console.log('[mt.image.event.onCanvasSelect]', { e });
		},

		// Tools
		onChangeSize() { // Đổi size từ "tool - size"
			try {
				let width = +mtImage.tool.size.e_width.value;
				let height = +mtImage.tool.size.e_height.value;
				mtImage.canvas.resize(width, height);
			}
			catch (ex) {
				console.error('[mt.image.onChangeSize]', ex);
			}
		},
		btnTextAdd() { // Button add text

			// Get text
			let elmInputText = mtImage.tool.text.e_input;
			let value = elmInputText.value; // Get text

			// Validate
			if (value.length == 0) {
				mt.show.toast('warning', 'Chưa nhập text!');
				return;
			}

			// Tạo Obj Fabric
			const text = new fabric.FabricText(value, {
				// cornerStyle: 'round',
				// cornerStrokeColor: 'blue',
				// cornerColor: 'lightblue',
				cornerStyle: 'circle',
				// padding: 10,
				// transparentCorners: false,
				// cornerDashArray: [2, 2],
				borderColor: 'orange',
				// borderDashArray: [3, 1, 3],
				// borderScaleFactor: 2,
			});

			// Thêm vào canvas
			let fabricCanvas = mtImage.canvas.c_fabric;
			fabricCanvas.add(text); // Thêm vào canvas
			fabricCanvas.centerObject(text); // Căn giữa

			// Add Mgr
			let item = mtImage.mgr.add('text', text);

			// DeSelect old
			if (mtImage.mgr.m_currentItem.length > 0) {
				let oldCode = mtImage.mgr.m_currentItem;
				let oldItem = mtImage.mgr.d_map[oldCode]; // Lấy item active cũ
				oldItem.elm.style.background = ''; // Bỏ highlight trên list
			}
			mtImage.mgr.m_currentItem = item.code; // Đánh dấu mục chọn hiện tại

			// Select new
			this.m_blockCanvasSelect = true;
			fabricCanvas.setActiveObject(text); // Active object
			fabricCanvas.requestRenderAll(); // Render highlight

			// Log
			mt.h_debug && console.log('[mt.image.event.btnTextAdd]', { value });
		},

		// Public Event
		async onPaste() {

			const auth = navigator.permissions.query({ name: 'clipboard-read' });
			if (auth.state === 'denied') {
				mt.show.toast('warning', 'Chưa cấp quyền dùng clipboard!');
				console.warn('[mt.image.onPaste] Chưa cấp quyền dùng clipboard!', { auth });
				return;
			}

			// Đọc danh sách clipboard
			let item_list = await navigator.clipboard.read();
			let image_type = '';

			// Tìm bộ nhớ về ảnh
			const itemClipboard = item_list.find(item =>
				item.types.some(type => {
					if (type.startsWith('image/')) {
						image_type = type;
						return true;
					}
				})
			);

			// Nếu ko tìm ra
			if (!itemClipboard) {
				mt.show.toast('warning', 'Không tìm thấy ảnh trong Clipboard!');
				console.warn('[mt.image.onPaste] Không tìm thấy ảnh trong Clipboard!', { item_list });
				return;
			}

			// Đọc nội dung clipboard
			let blobImg = await itemClipboard.getType(image_type);
			const urlImg = URL.createObjectURL(blobImg);

			// Create Fabric Image
			let imgFabric = await fabric.Image.fromURL(urlImg);
			URL.revokeObjectURL(urlImg);

			// Add to fabric canvas
			let fabricCanvas = mtImage.canvas.c_fabric;
			fabricCanvas.add(imgFabric); // Thêm vào canvas
			fabricCanvas.centerObject(imgFabric); // Căn giữa

			// Add Mgr
			let item = mtImage.mgr.add('img', imgFabric);

			// DeSelect old
			if (mtImage.mgr.m_currentItem.length > 0) {
				let oldCode = mtImage.mgr.m_currentItem;
				let oldItem = mtImage.mgr.d_map[oldCode]; // Lấy item active cũ
				oldItem.elm.style.background = ''; // Bỏ highlight trên list
			}
			mtImage.mgr.m_currentItem = item.code; // Đánh dấu mục chọn hiện tại

			// Select new
			this.m_blockCanvasSelect = true;
			fabricCanvas.setActiveObject(imgFabric); // Active object
			fabricCanvas.requestRenderAll(); // Render highlight

			// Log
			mt.h_debug && console.log('[mt.image.event.onPaste]', { imgFabric });
		},
		async onDrop(e) {
			try {

				const blobs = e.dataTransfer.files;
				if (blobs.length == 0)
					return;

				const blobImg = blobs[0];
				const urlImg = URL.createObjectURL(blobImg);

				// Create Fabric Image
				let imgFabric = await fabric.Image.fromURL(urlImg);
				URL.revokeObjectURL(urlImg);

				// Add to fabric canvas
				let fabricCanvas = mtImage.canvas.c_fabric;
				fabricCanvas.add(imgFabric); // Thêm vào canvas
				fabricCanvas.centerObject(imgFabric); // Căn giữa

				// Add Mgr
				let item = mtImage.mgr.add('img', imgFabric);

				// DeSelect old
				if (mtImage.mgr.m_currentItem.length > 0) {
					let oldCode = mtImage.mgr.m_currentItem;
					let oldItem = mtImage.mgr.d_map[oldCode]; // Lấy item active cũ
					oldItem.elm.style.background = ''; // Bỏ highlight trên list
				}
				mtImage.mgr.m_currentItem = item.code; // Đánh dấu mục chọn hiện tại

				// Select new
				this.m_blockCanvasSelect = true;
				fabricCanvas.setActiveObject(imgFabric); // Active object
				fabricCanvas.requestRenderAll(); // Render highlight

				// Log
				mt.h_debug && console.log('[mt.image.event.onDrop]', { imgFabric });
			}
			catch (ex) {
				console.error('[mt.image.onDrop]', ex);
			}
		},
	},

	async init() {

		// Import Library
		await mt.lib.import(['fabricjs']);

		// Add container
		this.e_contain.id = 'image-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Init module
		this.mgr.init();
		this.canvas.init();
		this.tool.init();
	},
}
export default mtImage;