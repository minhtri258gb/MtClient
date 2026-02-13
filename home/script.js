import mtAuthen from '/common/authen.js';
import mtLib from '/common/lib.js';
import mtShow from '/common/show.js';

/**
 * https://fontawesome.com/v6/search?ic=free-collection
 * https://github.com/gridstack/gridstack.js
 * https://gridstackjs.com/doc/html/index.html
 */

var mt = {
	auth: mtAuthen,
	lib: mtLib,
	show: mtShow,

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
					'Authorization': 'Bearer ' + mt.auth.getToken(),
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
						headers: { 'Authorization': 'Bearer '+mt.auth.getToken() },
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
						'Authorization': 'Bearer ' + mt.auth.getToken(),
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
				mt.show.toast('success', 'Đã lưu grid.');
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.grid.save]', ex);
			}
		},
		buildContent() {
			
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
					mt.show.toast('warning', 'Chưa có link ứng dụng!');
			}

			// Log
			// console.log('[mt.grid.add]', { id, elWidget });
		},
	},
	form: {
		h_defaultData: { id: 0, name: '', icon: '', link: '' },
		c_modal: null, // tingle
		c_form: null, // jsoneditor
		m_widget: null, // Current widget

		async init() {

			// Import Library
			await mt.lib.import(['tingle','jsonEditor']);

			// Init popup - tingle
			this.c_modal = new tingle.modal({
				footer: false,
				stickyFooter: false,
				closeMethods: ['button', 'escape'], // 'overlay'
				closeLabel: 'Đóng',
			});

			// Contain Form
			const elementForm = document.createElement('div');
			elementForm.style.width = '500px';
			this.c_modal.modalBox.style.width = 'unset'; // Bỏ width gốc
			this.c_modal.modalBoxContent.appendChild(elementForm); // Đặt contain form vào modal

			// Init form - JsonEditor
			mt.lib.jsonEditor.ex.RateRegister();
			this.c_form = new JSONEditor(elementForm, {
				use_name_attributes: false,
				theme: 'barebones',
				iconlib: 'fontawesome5',
				disable_edit_json: true,
				disable_properties: true,
				disable_collapse: true,
				schema: {
					title: 'App Info',
					type: 'object',
					required: [],
					properties: {
						'id': { type: 'integer', format: 'hidden', options: { titleHidden: true } },
						'name': { title: 'Name', type: 'string', format: 'text' },
						'icon': { title: 'Icon', type: 'string', format: 'text' },
						'link': { title: 'Link', type: 'string', format: 'url' },
						'btn_save': { title: 'Save', type: 'string', format: 'button', options: { button: { icon: 'save', action: () => this.onSave() }}},
						'btn_delete': { title: 'Delete', type: 'string', format: 'button', options: { button: { icon: 'trash-can', action: () => this.onDelete() }}},
						'btn_cancel': { title: 'Cancel', type: 'string', format: 'button', options: { button: { icon: 'close', action: () => this.c_modal.close() }}},
					},
				},
			});
		},
		async open(widget) {

			// Prepare data
			this.m_widget = widget;
			let formData = Object.assign({ ...this.h_defaultData }, widget.gridstackNode.customData);

			// Set form data
			this.c_form.setValue(formData);
			
			// Open Modal
			this.c_modal.open();

			// Log
			mt.h_debug && console.log('[mt.form.open]', { widget, formData });
		},
		onSave() {
			try {

				let widget = this.m_widget;
				this.m_widget = null;
				let formData = this.c_form.getValue();

				// Cập nhật id
				formData.id = Number.parseInt(formData.id);

				let widgetOtps = widget.gridstackNode;
				widgetOtps.content = formData.name;
				widgetOtps.customData = formData;

				// Update grid
				mt.grid.p_grid.update(widget, widgetOtps);
				
				// Toast
				mt.show.toast('success', 'Đã lưu thay đổi');

				// Close modal
				this.c_modal.close();

				// Log
				mt.h_debug && console.log('[mt.form.onSave]', { widget, formData });
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.form.onSave]', ex);
			}
		},
		onDelete() {
			try {
				let widget = this.m_widget;
				this.m_widget = null;
				let formData = this.c_form.getValue();
				// #TODO
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.form.onDelete]', ex);
			}
		},
	},
	utils: {

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
		await this.auth.init();
		await this.show.initToast();

		// Read config
		await this.mgr.loadConfig();

		// Init
		this.grid.init();
		this.form.init();
		this.initUI();

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
						'Authorization': 'Bearer '+this.auth.getToken(),
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
