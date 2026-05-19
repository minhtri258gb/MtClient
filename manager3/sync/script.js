let mtSync = {
	h_isShadow: false,
	e_contain: null,
	e_type: null,
	e_device: null,
	e_listLeft: null,
	e_listRight: null,
	e_compareTop: null,
	e_compareBottom: null,
	m_init: false,
	m_listLeft: [],
	m_listRight: [],

	lib: {
		m_path: '',

		async init() {
			this.m_path = await mt.api.config('PATH_CLIENT') + '/lib';
		},
		async scan() {

			// Call API
			let lst = await mt.file.listFile(this.m_path);

			// Reset List
			mtSync.m_listLeft = [];
			mtSync.e_listLeft.innerHTML = ''; // Reset html

			let lstFileName = [];
			for (let item of lst) {
				if (item.isFolder) { // Chỉ lấy folder thư viện

					mtSync.m_listLeft.push(item.name);

					// Render
					const li = document.createElement('li');
					li.textContent = item.name;
					mtSync.e_listLeft.appendChild(li);
				}
			}

			// Log
			// mt.h_debug && console.log('[mt.sync.lib.scan]', { lstName: mtSync.m_listLeft });
		},
	},
	music: {
		m_path: '',

		async init() {
			this.m_path = await mt.api.config('PATH_MUSIC');
		},
		async scan() {

			// Call API
			let lst = await mt.file.listFile(this.m_path);

			// Reset List
			mtSync.m_listLeft = [];
			mtSync.e_listLeft.innerHTML = '';

			// Process and render
			for (let item of lst) {
				if (!item.isFolder) { // Chỉ lấy file MP3

					mtSync.m_listLeft.push(item.name);

					// Render
					const li = document.createElement('li');
					li.textContent = item.name;
					mtSync.e_listLeft.appendChild(li);
				}
			}

			// Log
			// console.log('[mt.sync.music.scan]', { lstName: mtSync.m_listLeft });
		},
	},
	event: {

		// UI
		onChangeType() {
			try {

				let type = mtSync.e_type.value;
				if (type.length == 0)
					return;

				// Call Scan module
				mtSync[type].scan();

				// Log
				// mt.h_debug && console.log('[mt.sync.event.onChangeType]', { type });
			}
			catch (ex) {
				console.error('[mt.sync.event.btnScan]', ex);
			}
		},
		btnDownload() {
			try {

				if (mtSync.m_listLeft.length == 0) {
					mt.show.toast('warning', 'Chưa scan folder!');
					return;
				}

				let type = mtSync.e_type.value;
				let device = mtSync.e_device.value;
				let now = mt.utils.convert_DateToStr(new Date());
				let filename = `${device}-${type}-${now}.txt`;

				let content = mtSync.m_listLeft.join('\n');

				// Download file
				mt.file.downloadFileText(filename, content);

				// Log
				mt.h_debug && console.log('[mt.sync.event.btnDownload]', { type, filename });
			}
			catch (ex) {
				console.error('[mt.sync.event.btnDownload]', ex);
			}
		},
		btnCompare() {
			try {

				if (mtSync.m_listLeft.length == 0) {
					mt.show.toast('[mt.sync.event.btnCompare]', 'Chưa nhập list Left');
					return;
				}

				if (mtSync.m_listRight.length == 0) {
					mt.show.toast('[mt.sync.event.btnCompare]', 'Chưa nhập list Right');
					return;
				}

				let rightSize = mtSync.m_listRight.length;
				let lstRightFound = new Array(rightSize).fill(false);
				let listCompareLeft = [];
				let listCompareRight = [];

				// Tìm left trong right
				for (let left of mtSync.m_listLeft) {

					let found = false;
					for (let i=0; i<rightSize; i++) {
						let right = mtSync.m_listRight[i];
						if (left === right) {
							found = true;
							break;
						}
					}

					if (found)
						lstRightFound[i] = true;
					else {
						listCompareLeft.push(left);
					}
				}

				// Tìm right chưa có
				for (let i=0; i<rightSize; i++) {
					let right = mtSync.m_listRight[i];
					if (!lstRightFound[i]) {
						listCompareRight.push(right);
					}
				}

				// Render
				// #TODO
			}
			catch (ex) {
				console.log('[mt.sync.event.btnCompare]', ex);
			}
		},

		// Global
		async onDrop(e) {
			try {

				const blobs = e.dataTransfer.files;
				if (blobs.length == 0)
					return;

				const blob = blobs[0];
				let text = await blob.text();

				// tạo list
				let listName = text.trim().split('\n');
				mtSync.m_listRight = listName;

				mtSync.e_listRight.innerHTML = ''; // Reset html

				// Render
				for (let name of listName) {
					const li = document.createElement('li');
					li.textContent = name;
					mtSync.e_listRight.appendChild(li);
				}
			}
			catch (ex) {
				console.error('[mt.sync.onDrop]', ex);
			}
		},
	},

	async init() {

		// Import Library
		// await mt.lib.import(['QrCode','zxing','bwip']);

		// Add container
		this.e_contain.id = 'sync-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Prepare element
		this.e_type = document.getElementById('sync-type');
		this.e_device = document.getElementById('sync-device');
		this.e_listLeft = document.getElementById('sync-list-left');
		this.e_listRight = document.getElementById('sync-list-right');
		this.e_compareTop = document.getElementById('sync-compare-top');
		this.e_compareBottom = document.getElementById('sync-compare-bottom');

		// Init module
		this.lib.init();
		this.music.init();
	},
}
export default mtSync;