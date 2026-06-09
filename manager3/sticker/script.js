let mtSticker = {
	h_isShadow: false,
	e_contain: null, // Element chứa app
	e_type: null, // Element select loại đồng bộ
	e_file_compare: null, // Element select file compare
	e_labelLeft: null, // Element label trái
	e_listLeft: null, // Element ol danh sách trái
	e_labelRight: null, // Element label phải
	e_listRight: null, // Element ol danh sách phải
	e_compareTop: null, // Element ol danh sách có bên trái
	e_compareBottom: null, // Element ol danh sách có bên phải
	m_init: false, // Khởi tạo app
	m_hostname: '', // Tên máy
	m_listLeft: [], // Danh sách tên file/thư mục bên trái
	m_listRight: [], // Danh sách tên file/thư mục bên phải
	m_clientPath: '', // Đường dẫn client
	m_zipPath: '', // Đường dẫn 7-Zip
	m_nameLeft: '', // Tên file hiện tại
	m_nameRight: '', // Tên file drag/drop

	lib: {
		m_path: '',

		async init() {
			this.m_path = mtSticker.m_clientPath + '/lib';
		},
	},
	music: {
		m_path: '',

		async init() {
			this.m_path = await mt.api.config('PATH_MUSIC');
		},
	},
	event: {

		// UI
		async onChangeType() {
			try {

				let type = mtSticker.e_type.value;
				if (type.length == 0)
					return;

				// Call API - lấy hostname
				if (mtSticker.m_hostname.length == 0) {
					let result = await mt.api.cmd('hostname');
					mtSticker.m_hostname = result.stdout.trim();
				}

				let now = mt.utils.convert_DateToStr(new Date());
				let filename = `${mtSticker.m_hostname}-${type}-${now}`;
				mtSticker.m_nameLeft = filename;
				mtSticker.e_labelLeft.innerHTML = filename;

				// Call API - Scan folder
				let path = mtSticker[type].m_path;
				let lst = await mt.file.listFile(path);

				// Reset List
				mtSticker.m_listLeft = [];
				mtSticker.e_listLeft.innerHTML = ''; // Reset html

				let lstFileName = [];
				for (let item of lst) {
					if (
						type == 'lib' && item.isFolder // Chỉ lấy folder thư viện
						||
						type == 'music' && !item.isFolder // Chỉ lấy file mp3
					) {

						mtSticker.m_listLeft.push(item.name);

						// Render
						const li = document.createElement('li');
						li.textContent = item.name;
						mtSticker.e_listLeft.appendChild(li);
					}
				}

				// Scan file compare
				let lstAllFileCompare = await mt.file.listFile(mtSticker.m_clientPath + '/res/sync');
				let lstFileCompare = [];
				for (let item of lstAllFileCompare) {
					let name = item.name;
					if (!item.isFolder
						&& !name.startsWith(mtSticker.m_hostname+'-')
						&& name.includes(`-${type}-`)
						&& name.endsWith('.txt')
					) {
						lstFileCompare.push(name.replace('.txt',''));
					}
				}

				// Update select file compare
				mtSticker.e_file_compare.innerHTML = '';
				const optNone = document.createElement('option');
				optNone.value = '';
				optNone.textContent = '-- Chọn file --';
				mtSticker.e_file_compare.appendChild(optNone);
				for (let name of lstFileCompare) {
					const opt = document.createElement('option');
					opt.value = name;
					opt.textContent = name;
					mtSticker.e_file_compare.appendChild(opt);
				}

				// Log
				mt.h_debug && console.log('[mt.sync.event.onChangeType]', { lstFileCompare });
			}
			catch (ex) {
				console.error('[mt.sync.event.onChangeType]', ex);
			}
		},
		async btnSave() {
			try {

				if (mtSticker.m_listLeft.length == 0) {
					mt.show.toast('warning', 'Chưa scan folder!');
					return;
				}

				let type = mtSticker.e_type.value;
				let now = mt.utils.convert_DateToStr(new Date());

				let filename = mtSticker.m_nameLeft;
				let fullpath = mtSticker.m_clientPath + '/res/sync/' + filename + '.txt';
				let content = mtSticker.m_listLeft.join('\n');

				// Download file
				let res = await mt.file.writeFileText(fullpath, content, false);

				// Notify
				mt.show.toast('success', `Đã lưu "${filename}"`);

				// Log
				mt.h_debug && console.log('[mt.sync.event.btnSave]', {
					type, fullpath, res
				});
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.sync.event.btnSave]', ex);
			}
		},
		async onChangeFile() {
			try {

				mtSticker.e_labelRight.innerHTML = '';
				mtSticker.e_listRight.innerHTML = '';

				let file = mtSticker.e_file_compare.value;
				if (file.length == 0)
					return;

				mtSticker.m_nameRight = file;
				mtSticker.e_labelRight.textContent = file;

				// Load file
				let type = mtSticker.e_type.value;
				let fullpath = mtSticker.m_clientPath + '/res/sync/' + file + '.txt';
				let content = await mt.file.readFile('text', fullpath);

				// tạo list
				let listName = content.trim().split('\n');
				mtSticker.m_listRight = listName;

				// Render
				for (let name of listName) {
					const li = document.createElement('li');
					li.textContent = name;
					mtSticker.e_listRight.appendChild(li);
				}

				// Log
				// mt.h_debug && console.log('[mt.sync.event.onChangeFile]', { content });
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.sync.event.onChangeFile]', ex);
			}
		},
		btnCompare() {
			try {

				if (mtSticker.m_listLeft.length == 0) {
					mt.show.toast('warning', 'Chưa nhập list Left');
					return;
				}

				if (mtSticker.m_listRight.length == 0) {
					mt.show.toast('warning', 'Chưa nhập list Right');
					return;
				}

				let rightSize = mtSticker.m_listRight.length;
				let lstRightFound = new Array(rightSize).fill(false);
				let listCompareLeft = [];
				let listCompareRight = [];

				// Tìm left trong right
				for (let left of mtSticker.m_listLeft) {

					let found = false;
					for (let i=0; i<rightSize; i++) {
						let right = mtSticker.m_listRight[i];
						if (left === right) {
							found = true;
							lstRightFound[i] = true;
							break;
						}
					}

					if (!found)
						listCompareLeft.push(left);
				}

				// Tìm right chưa có
				for (let i=0; i<rightSize; i++) {
					let right = mtSticker.m_listRight[i];
					if (!lstRightFound[i]) {
						listCompareRight.push(right);
					}
				}

				// Render
				mtSticker.e_compareTop.innerHTML = '';
				mtSticker.e_compareBottom.innerHTML = '';
				for (let item of listCompareLeft) {
					const li = document.createElement('li');
					const checkbox = document.createElement('input');
					checkbox.type = 'checkbox';
					li.append(checkbox, item);
					mtSticker.e_compareTop.appendChild(li);
				}
				for (let item of listCompareRight) {
					const li = document.createElement('li');
					li.textContent = item;
					mtSticker.e_compareBottom.appendChild(li);
				}

				// Log
				// mt.h_debug && console.log('[mt.sync.event.btnCompare]', { listCompareLeft, listCompareRight });
			}
			catch (ex) {
				console.error('[mt.sync.event.btnCompare]', ex);
			}
		},
		async btnZip() {
			try {

				// Call API - Lấy zip path
				if (mtSticker.m_zipPath.length == 0)
					mtSticker.m_zipPath = await mt.api.config('PATH_7Z');

				// Lấy danh sách cần nén
				let listZip = [];
				Array.from(mtSticker.e_compareTop.children).forEach(li => {
					const checkbox = li.firstElementChild;
					if (checkbox.checked) {
						const textNode = li.lastChild;
						listZip.push(textNode.nodeValue);
					}
				});

				let type = mtSticker.e_type.value;
				let pathFolder = mtSticker[type].m_path;

				// Tổng hợp lệnh nén
				let file7Z = `${mtSticker.m_clientPath}/res/sync/${mtSticker.m_nameRight}.7z`;
				let cmd = `7z a "${file7Z}"`;
				for (let name of listZip)
					cmd += ` "${pathFolder}/${name}"`;

				// Call API - cmd nén
				let resCmd = await mt.api.cmd(cmd, [mtSticker.m_zipPath]);

				if (resCmd.stdout.length > 0)
					mt.show.toast('success', `Đã nén "${file7Z}"`);

				// Log
				mt.h_debug && console.log('[mt.sync.event.btnZip]', {
					zipPath: mtSticker.m_zipPath,
					listZip,
					cmd,
					resCmd,
				});
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.sync.event.btnZip]', ex);
			}
		},
		checkTopAll(event) {
			let check = event.target.checked;
			Array.from(mtSticker.e_compareTop.children).forEach(li => {
				const checkbox = li.firstElementChild;
				checkbox.checked = check;
			});
		},

		// Global
		async onDrop(e) {
			try {

				const blobs = e.dataTransfer.files;
				if (blobs.length == 0)
					return;

				const blob = blobs[0];
				let text = await blob.text();

				// Lấy tên file drag/drop và render
				let filename = blob.name.replace('.txt','');
				mtSticker.m_nameRight = filename;
				mtSticker.e_labelRight.textContent = filename;

				// tạo list
				let listName = text.trim().split('\n');
				mtSticker.m_listRight = listName;

				mtSticker.e_listRight.innerHTML = ''; // Reset html

				// Render
				for (let name of listName) {
					const li = document.createElement('li');
					li.textContent = name;
					mtSticker.e_listRight.appendChild(li);
				}
			}
			catch (ex) {
				console.error('[mt.sync.onDrop]', ex);
			}
		},
	},

	async init() {

		// Add container
		this.e_contain.id = 'sticker-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Prepare element
		this.e_type = this.e_contain.querySelector('#sticker-type');
		this.e_file_compare = this.e_contain.querySelector('#sticker-file-compare');
		this.e_labelLeft = this.e_contain.querySelector('#sticker-label-left');
		this.e_listLeft = this.e_contain.querySelector('#sticker-list-left');
		this.e_labelRight = this.e_contain.querySelector('#sticker-label-right');
		this.e_listRight = this.e_contain.querySelector('#sticker-list-right');
		this.e_compareTop = this.e_contain.querySelector('#sticker-compare-top');
		this.e_compareBottom = this.e_contain.querySelector('#sticker-compare-bottom');

		// Call API - Lấy PATH_CLIENT
		if (this.m_clientPath.length == 0)
			this.m_clientPath = await mt.api.config('PATH_CLIENT');

		// Init module
		this.lib.init();
		this.music.init();
	},
}
export default mtSticker;