import mtAuthen from '/common/authen.js';

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
	m_clientPath: '',

	// Module
	dashboard: {
		p_grid: null,
		m_isEdit: false,

		init() {

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

			// this.p_grid.addWidget({w: 2, content: 'item 1'});

			const serializedData = [
				{x: 0, y: 0, w: 2, h: 2},
				{x: 2, y: 3, w: 3, content: 'item 2'},
				{x: 1, y: 3},

				{x: 0, y: 0, w: 2, h: 2, id: '0'},
				{x: 3, y: 1, h: 2, id: 'no_move', noMove: true, content: 'no move'},
				{x: 4, y: 1, id: '2'},
				{x: 2, y: 3, w: 3, id: 'no_resize', noResize: true, content: 'no resize'},
				{x: 1, y: 3, id: 'locked', locked: true, content: 'locked'}
			];

			this.p_grid.load(serializedData);
		},
		editDashboard() {

			// Đổi cờ
			this.m_isEdit = !this.m_isEdit;

			// Set GridStack
			this.p_grid.setStatic(!this.m_isEdit);

			// Đổi icon trên button
			let iconElm = document.getElementById('btnEditDashboardIcon');
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
		addWidget() {
			this.p_grid.addWidget({x: 0, y: 0, content: "new item"});
		},
	},

	// Method
	async init() {

		// Bind Global
		window.mt = mt;

		// Authen
		await this.p_authen.init();

		// Read config
		let resClientPath = await fetch('/file/getClientPath', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer '+this.p_authen.getToken(),
			},
		});
		this.m_clientPath = await resClientPath.json();

		// Init
		this.dashboard.init();
		this.initUI();

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
						let folder = node.original?.path || this.m_clientPath; // Lấy path
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
					path = path.replaceAll(this.m_clientPath, '');
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
			path = path.replaceAll(this.m_clientPath, '');
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

$(document).ready(() => mt.init());
