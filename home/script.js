import JsonEditorEX from '/lib/mt/json-editor/mt-script.js';
import mtAuthen from '/common/authen.js';

/**
 * https://fontawesome.com/v6/search?ic=free&o=r
 * https://github.com/gridstack/gridstack.js
 * https://gridstackjs.com/doc/html/index.html
 */

var mt = {
	p_authen: mtAuthen,
	apps: [
		'music', 'manager', 'piano', 'midi',
		'API', 'image', 'request',
		'code', 'OCR', 'QR', 'sheet', 'soundHandler',
		'3D', 'calendar', 'contact', 'engine', 'game', 'jigsaw', 'play', 'traitim',
		'endpoints'
	],
	config: {
		h_lstSkip: [
			'.git', '.gitignore', '.vscode', 'package.json', 'package-lock.json', 'node_modules',
			'lib', 'res'
		],
		h_lstExt: [
			'html',
		],
		h_lstExtImage: [
			'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'svg',
		],
		h_lstExtAudio: [
			'wav', 'mp3', 'ogg', 'aac', 'mid', 'midi',
		],
		h_lstExtVideo: [
			'mp4', 'm4v', 'avi', 'mov', 'flv', '3gp',
		],
		h_type: {
			'folder': { },
			'file': { icon: '/res/icons/file16.png' },
			'image': { icon: '/res/icons/image16.png' },
			'audio': { icon: '/res/icons/audio16.png' },
			'video': { icon: '/res/icons/video16.png' },
			'html': { icon: '/res/icons/web16.png' },
		},
	},

	// Module
	mgr: {
		h_pathDB: '/res/DB/home.json',
		m_clientPath: '',

		async loadConfig() {

			// Call API
			let resClientPath = await fetch('/file/getClientPath', {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + mt.p_authen.getToken(),
				},
			});
			this.m_clientPath = await resClientPath.text();
		},
		async loadFromJson() {

			// Call API
			let response = await fetch(this.h_pathDB, {
				method: 'GET',
			});
			if (!response.ok)
				throw { error: true, message: 'Lỗi tải dữ liệu home!', detail: ex };

			let data = await response.json();
			mt.grid.load(data);

			// Log
			// console.log('[mt.mgr.loadFromJson]', { data });
		},
		async saveToJson(data) {
			try {

				// Kiểm tra và lấy client path
				if (this.m_clientPath.length == 0) {
					let response = await fetch('/file/getClientPath', {
						method: 'GET',
						headers: { 'Authorization': 'Bearer '+mt.p_authen.getToken() },
					});
					if (!response.ok)
						throw { error: true, message: await response.text() };

					this.m_clientPath = await response.text();
				}

				// Call API - Lưu dữ liệu
				let paramURL = new URLSearchParams();
				paramURL.set('file', this.m_clientPath + this.h_pathDB);
				paramURL.set('force', true);
				let responseSave = await fetch('/file/writeText?' + paramURL.toString(), {
					method: 'POST',
					headers: {
						'Content-Type': 'text/plain',
						'Authorization': 'Bearer ' + mt.p_authen.getToken(),
					},
					body: JSON.stringify(data),
				});
				if (!responseSave.ok)
					throw { error: true, message: await responseSave.text() };
			}
			catch (ex) {
				console.error('[mt.mgr.saveToJson] Exception', ex);
				throw ex;
			}
		},
	},
	grid: {
		c_btnEdit: null,
		c_btnEditIcon: null,
		c_btnAdd: null,
		c_btnSave: null,
		p_grid: null,
		m_isEdit: false,

		init() {

			// Bind Component
			this.c_btnEdit = document.getElementById('btnEdit');
			this.c_btnEditIcon = document.getElementById('btnEditIcon');
			this.c_btnAdd = document.getElementById('btnAdd');
			this.c_btnSave = document.getElementById('btnSave');

			// Init GridStack
			this.p_grid = GridStack.init({
				staticGrid: !this.m_isEdit,
				float: true,
				cellHeight: 70,
				acceptWidgets: true,
				removable: true,
				lazyLoad: true,
				margin: 5,
			});
		},
		load(serializedData) {

			// Bổ sung id cho từng widget
			for (let i=0, sz=serializedData.length; i<sz; i++) {
				let widget = serializedData[i];
				widget.id = i+1;
				if (widget.customData == null)
					widget.customData = {};
				widget.customData.id = i+1;
				widget.content = widget.customData.name || '';
			}

			// Render
			this.p_grid.load(serializedData);

			// Register Event
			const elWidgets = this.p_grid.getGridItems();
			for (let elWidget of elWidgets)
				elWidget.addEventListener('click', () => this.onWidgetClick(elWidget));

			// Log
			// console.log('[mt.grid.load]', { serializedData });
		},
		edit(toggle) {

			// Đổi cờ
			if (toggle == null)
				this.m_isEdit = !this.m_isEdit;
			else
				this.m_isEdit = toggle;

			// Set GridStack
			this.p_grid.setStatic(!this.m_isEdit);

			// Hiện nút khi edit
			let displayStyle = this.m_isEdit ? 'initial' : 'none';
			this.c_btnAdd.style.display = displayStyle;
			this.c_btnSave.style.display = displayStyle;

			// Đổi icon trên button
			let iconElm = document.getElementById('btnEditIcon');
			let classListElm = iconElm.classList;
			if (this.m_isEdit) {
				classListElm.remove('fa-regular');
				classListElm.add('fa-solid');
			}
			else {
				classListElm.remove('fa-solid');
				classListElm.add('fa-regular');
			}
		},
		add() {
			let elWidget = this.p_grid.addWidget({
				id: 0,
				x: 0,
				y: 0,
				content: 'New',
				customData: { ...mt.form.h_defaultData },
			});
			elWidget.addEventListener('click', () => this.onWidgetClick(elWidget));
			// console.log('[mt.grid.add]', { elWidget });
		},
		async save() {
			try {

				// Get Data
				let layout = this.p_grid.save();
				// console.log('[mt.grid.save]', { layout });

				// Xóa id
				for (let widget of layout) {
					if (widget.id != null) {
						delete widget.id;
						delete widget.customData.id;
						widget.content = '';
					}
				}

				// Call API- Save data
				await mt.mgr.saveToJson(layout);

				// Change state
				this.edit(false);

				// Notify
				mt.utils.toast('success', 'Đã lưu grid.');
			}
			catch (ex) {
				mt.utils.toast('error', ex.message);
				console.error('[mt.grid.save]', ex);
			}
		},
		async onWidgetClick(elWidget) {

			// Lấy Id widget
			let id = +elWidget.getAttribute('gs-id');

			if (isNaN(id) || id == 0) {
				console.warn('[mt.grid.add] widget không có id', { id, elWidget });
				return; // Bỏ qua các widget ko có id
			}

			// Widget
			let lstWidget = this.p_grid.getGridItems();
			let widget = lstWidget.find(item => item.gridstackNode.id === id);

			// Nếu là chỉnh sửa thì mở form
			if (this.m_isEdit) {
				mt.form.open(widget);
			}
			// Di chuyển đến màn ứng dụng
			else {
				let data = widget.gridstackNode.customData;
				if (data.link != null && data.link.length > 0) {
					let isConfirm = await mt.utils.confirmPrimary(`Xác nhận mở app ${data.name}?`, 'Đến');
					if (isConfirm)
						window.open(data.link);
				}
				else
					mt.utils.toast('warning', 'Chưa có link ứng dụng!');
			}

			// Log
			// console.log('[mt.grid.add]', { id, elWidget });
		},
	},
	form: {
		h_defaultData: { id: 0, name: '', icon: '', link: '' },
		m_editor: null, // Json Editor

		init() {

			// Init Editor
			JsonEditorEX.RateRegister();
		},
		async open(widget) {

			// Open Modal
			let result = await Swal.fire({
				title: 'Sự kiện',
				html: '<div id="json-editor" class="json-editor"></div>',
				showDenyButton: true,
				showCancelButton: true,
				confirmButtonText: 'Lưu',
				denyButtonText: 'Xóa',
				cancelButtonText: 'Đóng',
				// showClass: {
				// 	popup: '',
				// },
				// hideClass: {
				// 	popup: '',
				// },
				didOpen: () => this.initForm(widget),
				didClose: () => this.m_editor.destroy(),
				preConfirm: () => {
					try {
						return this.m_editor.getValue();
					}
					catch (ex) {
						Swal.showValidationMessage("Dữ liệu nhập chưa hợp lệ!");
						console.error('[mt.form.open.preConfirm] Exception:', ex);
					}
				},
			});
			if (result.isConfirmed)
				this.onSave(widget, result.value);
			else if (result.isDenied)
				this.onDelete(widget, {
					id: widget.id,
					...widget.customData
				});
		},
		initForm(widget) {

			let objForm = Object.assign({ ...this.h_defaultData }, widget.gridstackNode.customData);

			// Init Form
			const element = document.getElementById('json-editor');
			this.m_editor = new JSONEditor(element, {
				use_name_attributes: false,
				theme: 'barebones',
				iconlib: 'fontawesome5',
				disable_edit_json: true,
				disable_properties: true,
				disable_collapse: true,
				startval: objForm,
				schema: {
					title: 'Event Calendar',
					type: 'object',
					required: [],
					properties: {
						'id': { type: 'string', format: 'hidden', options: { titleHidden: true } },
						'name': { title: 'Name', type: 'string', format: 'text' },
						'icon': { title: 'Icon', type: 'string', format: 'text' },
						'link': { title: 'Link', type: 'string', format: 'url' },
					},
				},
			});
		},
		onSave(widget, data) {

			// Cập nhật id
			data.id = Number.parseInt(data.id);

			let widgetOtps = widget.gridstackNode;
			widgetOtps.content = data.name;
			widgetOtps.customData = data;

			// Update grid
			mt.grid.p_grid.update(widget, widgetOtps);

			// Log
			console.log('[mt.form.onSave]', { widget, data });
		},
		onDelete(widget, data) {

		},
	},
	utils: {
		p_toast: null, // Sweetalert2 - Toast

		init() {

			// Init Sweetlert2
			this.p_toast = Swal.mixin({
				toast: true,
				position: 'bottom-end',
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
				didOpen: (toast) => {
					toast.onmouseenter = Swal.stopTimer;
					toast.onmouseleave = Swal.resumeTimer;
				},
			});
		},
		toast(type, message) {

			let title = '';
			switch (type) {
				case 'info':
					title = 'Thông báo';
					break;
				case 'success':
					title = 'Thành công';
					break;
				case 'warning':
					title = 'Cảnh báo';
					break;
				case 'error':
					title = 'Lỗi';
					break;
				default:
					throw { error: true, message: 'Type không hợp lệ!' };
			}

			// Prepare
			let opts = {
				icon: type,
				title: message,
			};

			// Show Toast
			this.p_toast.fire(opts);
		},
		async confirmPrimary(message, action) {
			let result = await Swal.fire({
				title: message,
				icon: 'info',
				showCancelButton: true,
				confirmButtonColor: '#0054e9',
				confirmButtonText: action,
				cancelButtonText: 'Đóng'
			});
			return result.isConfirmed;
		},
		async confirmDanger(message, action) {
			let result = await Swal.fire({
				title: message,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#c5000f',
				confirmButtonText: action,
				cancelButtonText: 'Đóng'
			});
			return result.isConfirmed;
		},
	},

	// Method
	async init() {

		// Bind Global
		window.mt = mt;

		// Authen
		await this.p_authen.init();

		// Read config
		await this.mgr.loadConfig();

		// Init
		this.grid.init();
		this.initUI();
		this.utils.init();

		// First load
		await this.mgr.loadFromJson();
	},
	initUI() {

		// Init packgrid
		mt.pg = $('#packgrid').packery({
			itemSelector: '.pgi',
			gutter: 10,
			columnWidth: 100,
			rowHeight: 100,
		});
		mt.pg.on('click', '.pgi', (event) => {
			if ($(event.currentTarget).hasClass('pgis')) {
				window.location.href = "/"+$(event.currentTarget).html();
			} else {
				$('.pgis').removeClass('pgis');
				$(event.currentTarget).toggleClass('pgis');
				mt.pg.packery('layout');
				// pg.packery('shiftLayout');
			}
		});

		// Add app to packgrid
		for (let i in mt.apps) {
			let cell = $('<div class="pgi">'+mt.apps[i]+'</div>');
			let type = Math.floor(Math.random() * 4) + 1;
			switch (type) {
				case 2: cell.addClass('pgimh'); break;
				case 3: cell.addClass('pgimw'); break;
				case 4: cell.addClass('pgimh'); cell.addClass('pgimw'); break;
			}
			mt.pg.append(cell).packery('appended', cell);
		}


		// Config Tree
		$('#jstree').jstree({
			core: {
				data: {
					url: '/file/jstree',
					headers: {
						'Authorization': 'Bearer '+this.p_authen.getToken(),
					},
					dataType: 'json',
					data: (node) => {
						let folder = node.original?.path || mt.mgr.m_clientPath; // Lấy path
						return { folder };
					},
					success: (data) => this.processNode(data),
				},
			},
			plugins: ['types', 'contextmenu', 'search'],
			types: this.config.h_type,
			contextmenu: {
				items: (node) => this.contextmenu(node)
			},
		});

		// Đăng ký sự kiện Double click
		$('#jstree').on('dblclick', '.jstree-anchor', function(e) {
			e.preventDefault();
			let instance = $.jstree.reference(this);
			let node = instance.get_node(this);
			mt.doubleClick(node);
		});


		// Search
		$('#fieldSearch').on('keypress', (event) => {
			if (event.which === 13)
				$('#jstree').jstree('search', $('#fieldSearch').val());
		});
	},
	processNode(data) { // Khi load node con
		for (let i = data.length - 1; i >= 0; i--) {
			let item = data[i];

			// Danh sách ẩn
			if (this.config.h_lstSkip.includes(item.text)){
				data.splice(i, 1);
				continue;
			}

			// Phân loại
			if (item.isFolder) { // Folder
				item.children = true; // Hiển thị action expand
				item.type = 'folder';
			}
			else { // File
				item.type = this.getType(item.text);
				item.a_attr = { class: 'custom-node' };
			}
		}
		return data;
	},
	contextmenu(node) { // Click phải
		// doc: https://www.jstree.com/api/#/?q=$.jstree.defaults.contextmenu&f=$.jstree.defaults.contextmenu.items

		let options = {};

		if (node.type == 'folder')
			return options;

		if (node.type == 'html') {
			options.open = {
				label: "Open",
				icon: '/res/icons/play.png',
				action: (obj) => {
					let path = node.original.path;
					path = path.replaceAll(mt.mgr.m_clientPath, '');
					window.open(path, '_blank');
				}
			};
		}

		return options;

		// return {
		// 	renameItem: {
		// 		label: "Rename",
		// 		icon: "fa fa-edit",
		// 		action: function (obj) {
		// 			$('#jstree').jstree(true).edit(node);
		// 		}
		// 	},
		// 	deleteItem: {
		// 		label: "Delete",
		// 		icon: "fa fa-trash",
		// 		action: function (obj) {
		// 			$('#jstree').jstree(true).delete_node(node);
		// 		}
		// 	},
		// 	customItem: {
		// 		label: "Say Hello",
		// 		action: function () {
		// 			alert("Hello from node: " + node.text);
		// 		}
		// 	}
		// };
	},
	doubleClick(node) { // Nhấn đúp
		if (node.type == 'html') {
			let path = node.original.path;
			path = path.replaceAll(mt.mgr.m_clientPath, '');
			window.open(path, '_blank');
		}
	},
	getType(filename) { // Lấy type tương ứng trên JsTree
		let pos = filename.indexOf('.');
		let ext = filename.substring(pos+1);
		if (this.config.h_lstExt.includes(ext))
			return ext;
		else if (this.config.h_lstExtImage.includes(ext))
			return 'image';
		else if (this.config.h_lstExtAudio.includes(ext))
			return 'audio';
		return 'file';
	},
};
document.addEventListener('DOMContentLoaded', () => mt.init());
