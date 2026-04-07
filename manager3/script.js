import { w2ui, w2layout, w2toolbar, w2sidebar, w2grid, w2popup, w2alert, w2utils } from 'w2ui';
import mtAuthen from '/common/authen.js';
import mtCore from '/common/core.js';
import mtLib from '/common/lib.js';
import mtFile from '/common/file.js';
import mtCmd from '/common/cmd.js';
import mtShow from '/common/show.js';

/**
 * https://fontawesome.com/v6/search?ic=free-collection
 * https://codemirror.net/
 * https://github.com/markdown-it/markdown-it
 * https://flatpickr.js.org/examples/#datetime
 */

/** TODO
 * https://d3js.org/getting-started
 * https://awesome-javascript.js.org/resources/misc.html
 * https://github.com/uhub/awesome-javascript
 */

let mt = {
	h_debug: true,
	auth: mtAuthen,
	core: mtCore,
	lib: mtLib,
	file: mtFile,
	cmd: mtCmd,
	show: mtShow,

	// Module
	common: {

		/**
		 * https://w2ui.com/web/docs/2.0/w2layout.set
		 */

		m_clientPath: '', // Đường dẫn client
		c_w2layout: null,
		e_contain: null,

		async init() {

			// Top Toolbar
			let c_w2toolbar = new w2toolbar({
				name: 'toolbar',
				items: [
					{ type: 'check', id: 'menu', text: 'Menu', icon: 'fa-solid fa-bars', checked: true },
					{ type: 'break' },
					{ type: 'button', id: 'home', text: 'Home', icon: 'fa-solid fa-house' },
					{ type: 'button', id: 'item1', text: 'Button', icon: 'w2ui-icon-colors' },
					{ type: 'break' },
					{ type: 'check', id: 'item2', text: 'Check 1', icon: 'w2ui-icon-check' },
					{ type: 'check', id: 'item3', text: 'Check 2', icon: 'w2ui-icon-check' },
					{ type: 'break' },
					{ type: 'radio', id: 'item4', group: '1', text: 'Radio 1', icon: 'w2ui-icon-info', checked: true },
					{ type: 'radio', id: 'item5', group: '1', text: 'Radio 2', icon: 'w2ui-icon-paste' },
					{ type: 'break' },
					{ type: 'button', id: 'share', text: 'Share', icon: 'fa-regular fa-share-from-square' },
					{ type: 'spacer' },
					{ type: 'button', id: 'item6', text: 'Button', icon: 'w2ui-icon-cross' }
				],
				onClick: (event) => {
					switch (event.target) {
						case 'home': mt.home.open(); break;
						case 'menu': this.btnMenu(!event.object.checked); break;
						case 'share': this.btnShare(); break;
					}
				}
			});

			// Left Sidebar
			let c_w2sidebar = new w2sidebar({
				name: 'sidebar',
				nodes: [
					{ id: 'app', text: 'Apps', group: true, expanded: true, nodes: [
						{ id: 'home', text: 'Home', icon: 'fa-solid fa-house-chimney' },
						{ id: 'music', text: 'Music', icon: 'fa-solid fa-music' },
						{ id: 'piano', text: 'Piano', icon: 'fa-solid fa-guitar' },
						{ id: 'dynamic', text: 'Dynamic', icon: 'fa-solid fa-pager' },
					]},
					{ id: 'manager', text: 'Manager', group: true, expanded: true, nodes: [
						{ id: 'explorer', text: 'Explorer', icon: 'fa-solid fa-folder-tree' },
						{ id: 'document', text: 'Document', icon: 'fa-solid fa-book' },
						{ id: 'contact', text: 'Contact', icon: 'fa-solid fa-address-book' },
						{ id: 'calendar', text: 'Calendar', icon: 'fa-solid fa-calendar-days' },
						{ id: 'map', text: 'Map', icon: 'fa-solid fa-map-location-dot' },
						{ id: 'server', text: 'Server', icon: 'fa-solid fa-server' },
						{ id: 'account', text: 'Account', icon: 'fa-solid fa-key' },
					]},
					{ id: 'entertainment', text: 'Entertainment', group: true, expanded: true, nodes: [
						{ id: 'anime', text: 'Anime', icon: 'fa-brands fa-gratipay' },
						{ id: 'game', text: 'Game', icon: 'fa-solid fa-gamepad' },
						{ id: 'movie', text: 'Movie', icon: 'fa-solid fa-film' },
						{ id: 'manga', text: 'Manga', icon: 'fa-solid fa-book-open' },
					]},
					{ id: 'social', text: 'Social', group: true, expanded: true, nodes: [
						{ id: 'chat', text: 'Chat', icon: 'fa-solid fa-comment-dots' },
					]},
					{ id: 'editor', text: 'Editor', group: true, expanded: true, nodes: [
						{ id: 'markdown', text: 'Markdown', icon: 'fa-brands fa-markdown' },
						{ id: 'midi', text: 'Midi', icon: 'fa-brands fa-medium' },
						{ id: 'image', text: 'Image', icon: 'fa-solid fa-image' },
						{ id: 'diagram', text: 'Diagram', icon: 'fa-solid fa-diagram-project' },
						{ id: 'sheet', text: 'Sheet', icon: 'fa-solid fa-table' },
					]},
					{ id: 'viewer', text: 'Viewer', group: true, expanded: true, nodes: [
						{ id: 'pdf', text: 'PDF', icon: 'fa-regular fa-file-pdf' },
						{ id: 'gallery', text: 'Gallery', icon: 'fa-solid fa-images' },
						{ id: 'pivot', text: 'Pivot', icon: 'fa-solid fa-table' },
					]},
					{ id: 'tools', text: 'Tools', group: true, expanded: true, nodes: [
						{ id: 'math', text: 'Math', icon: 'fa-solid fa-calculator' },
						{ id: 'qrcode', text: 'QR Code', icon: 'fa-solid fa-qrcode' },
					]},
					{ id: 'games', text: 'Games', group: true, expanded: true, nodes: [
						{ id: 'minesweeper', text: 'Mine Sweeper', icon: 'fa-solid fa-land-mine-on' },
					]},
				],
				onClick: async (event) => {
					let moduleName = event.target;
					let module = mt[moduleName];

					// Build Module EXT
					if (module == 'ext') {
						module = await this.loadModule(moduleName);
						mt[moduleName] = module; // ReBind mt
					}

					if (module != null) {
						this.resetLayout();

						// Default open func
						if (module.open == null) {
							module.open = async function() {
								if (!this.m_init) {
									this.m_init = true;
									await this.init();
								}
								else {
									this.e_contain.style.display = '';
								}
							}
						}
						module.open();
					}
					else {
						mt.show.toast('warning', `App "${moduleName}" chưa có sẵn!`);
						return;
					}
				},
			});

			// Layout
			this.c_w2layout = new w2layout({
				box: '#layout',
				name: 'layout',
				panels: [
					{ type: 'top', size: 38, html: c_w2toolbar },
					{ type: 'main', style: 'background-color: #f5fff1', html: '<div id="contain"><div>' },
					{ type: 'left', size: 150, resizable: true, html: c_w2sidebar },
					{ type: 'right', size: '50%', resizable: true, hidden: true, html: '' },
				]
			});

			this.e_contain = document.getElementById('contain');

			// Process Params
			this.processParams();
		},
		processParams() {
			let urlParams = new URLSearchParams(window.location.search);
			let tabCode = urlParams.get('tab');
			if (tabCode != null) {

				// Search tab
				let tab = null;
				for (let group of w2ui.sidebar.nodes) {
					for (let node of group.nodes) {
						if (node.id == tabCode) {
							tab = node;
							break;
						}
					}
					if (tab != null)
						break;
				}

				// Open tab
				tab.sidebar.click(tab.id);
			}
		},

		async loadModule(moduleName) {

			let pathModule = window.location.pathname + moduleName;

			// Load HTML
			let [
				resHtml,
				resCss,
				resJs
			] = await Promise.all([
				fetch(pathModule + '/index.html', { method: 'GET' }),
				fetch(pathModule + '/style.css', { method: 'GET' }),
				fetch(pathModule + '/script.js', { method: 'GET' }),
			]);

			let [
				htmlText,
				cssText,
				jsText,
			] = await Promise.all([
				resHtml.text(),
				resCss.text(),
				resJs.text(),
			]);

			// Process JS
			let module = window.eval(jsText);

			// Prepare CSS
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(cssText);

			// Build
			if (module.h_isShadow) {
				module.shadow = this.attachShadow({ mode: 'open' });
				module.shadow.adoptedStyleSheets = [sheet]; // CSS Shadow
				module.shadow.innerHTML = htmlText; // HTML
			}
			else {
				document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]; // CSS Global

				// Add container
				module.e_contain = document.createElement('div');
				module.e_contain.innerHTML = htmlText; // HTML
				this.e_contain.appendChild(module.e_contain);
			}

			return module;
		},
		resetLayout() {

			// Hide all container
			for (let i = 0; i < this.e_contain.children.length; i++)
				this.e_contain.children[i].style.display = 'none';

			// Hide right panel
			this.c_w2layout.hide('right');
		},

		btnMenu(toogle) {
			// let panel = this.c_w2layout.get('left');
			// if (panel.hidden)
			if (toogle)
				this.c_w2layout.show('left');
			else
				this.c_w2layout.hide('left');
		},
		async btnShare() {
			try {

				// Lấy div hiển thị
				const visibleDivs = Array.from(this.e_contain.children).filter(div => window.getComputedStyle(div).display !== 'none');

				// Lấy id div
				let tabId = '';
				if (visibleDivs.length > 0)
					tabId = visibleDivs[0].id;
				if (tabId.includes('-contain'))
					tabId = tabId.replace('-contain', '');

				if (tabId.length == 0)
					throw new Error('Không tìm thấy URL trang hiện tại!');

				// Lấy URL hiện tại
				let urlShare = location.origin + location.pathname;
				if (urlShare.indexOf('localhost') > -1) {

					// Call API - Get IP
					let response = await fetch('/common/getIPLocal', { method: 'GET' });
					if (!response.ok)
						throw { error: true, message: await response.text() };

					let IP = await response.text();

					urlShare = urlShare.replace('localhost', IP);
				}

				let paramsURL = null;
				if (mt[tabId]?.getShareParams) {
					paramsURL = mt[tabId].getShareParams();
				}
				else {
					paramsURL = new URLSearchParams();
					paramsURL.append('tab', tabId);
				}

				urlShare += '?' + paramsURL.toString();

				// Copy Clipboard
				if (window.isSecureContext) {
					await navigator.clipboard.writeText(urlShare);
					mt.show.toast('success', `Đã copy URL`); // Notify
				}
				else {
					console.log(urlShare);
					mt.show.toast('success', 'Đã print console.');
				}

				// Log
				mt.h_debug && console.log('[mt.common.btnShare]', { visibleDivs, tabId, urlShare });
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.common.btnShare]', ex);
			}
		},
	},
	utils: {
		convert_DateToStr(date) {
			let pad = (num) => num < 10 ? '0'+num : ''+num;
			return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
		},
		confirmRedirect(title, message, link) {
			w2popup.open({
				title: title,
				text: message,
				actions: ['Ok', 'Cancel'],
				width: 500,
				height: 300,
				modal: true,
				showClose: false
			})
			.ok((evt) => {
				w2popup.close();
				window.open(link);
			})
			.cancel(() => w2popup.close());
		}
	},
	home: {
		open() {
			mt.utils.confirmRedirect('Chuyển hướng', 'Xác nhận mở trang Home', '/home');
		}
	},
	music: {
		open() {
			mt.utils.confirmRedirect('Chuyển hướng', 'Xác nhận mở trang Music', '/music2');
		}
	},
	piano: {
		open() {
			mt.utils.confirmRedirect('Chuyển hướng', 'Xác nhận mở trang Piano', '/piano');
		}
	},
	dynamic: {
		e_contain: null,
		c_w2grid: null,
		m_init: false,
		d_list: [],

		async init() {

		},
		// open() {
		// 	mt.utils.confirmRedirect('Chuyển hướng', 'Xác nhận mở trang Dynamic - testList', '/dynamic?page=testList');
		// }
	},
	anime: {
		h_pathDB: '/res/DB/anime.json',
		e_contain: null,
		c_w2grid: null,
		m_init: false,
		d_list: [],

		async init() {

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'anime-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			// Column score
			let ratingProp = {
				size: '60px',
				sortable: true,
				attr: 'align=center',
				editable: { type: 'int', min: 1, max: 5 },
				render: (row, target) => {
					if (target.value >= 1 && target.value <= 5)
						return `<img src="/res/icons/rating${target.value}.png" />`;
					return 'N/A';
				},
			};

			// Grid
			this.c_w2grid = new w2grid({
				name: 'grid-anime',
				recid: 'id',
				show: {
					toolbar: true,
					footer: true,
					lineNumbers: true,
					selectColumn: false,
					expandColumn: true,
					toolbarAdd: true,
					toolbarSave: true,
				},
				// toolbar: {
				// 	items: [
				// 		{ id: 'add', type: 'button', text: 'Add Record', icon: 'w2ui-icon-plus' },
				// 		{ type: 'break' },
				// 		{ type: 'button', id: 'showChanges', text: 'Show Changes' }
				// 	],
				// 	onClick(event) {
				// 		if (event.target == 'add') {
							
				// 		}
				// 		else if (event.target == 'showChanges') {
				// 			showChanged()
				// 		}
				// 	}
				// },
				columns: [
					{ field: 'img', text: 'Image', size: '120px', resizable: true, editable: { type: 'text' } },
					{ field: 'name', text: 'Name', resizable: true, sortable: true, searchable: { operator: 'contains' }, editable: { type: 'text' } },
					{ field: 'story', text: 'Story', ...ratingProp },
					{ field: 'art', text: 'Art', ...ratingProp },
					{ field: 'sound', text: 'Sound', ...ratingProp },
					{ field: 'fantasy', text: 'Fantasy', ...ratingProp },
					{ field: 'sad', text: 'Sad', ...ratingProp },
					{ field: 'joke', text: 'Joke', ...ratingProp },
					{ field: 'brand', text: 'Brand', ...ratingProp },
					{ field: 'review', text: 'Review', ...ratingProp },
					{ field: 'end', text: 'End', size: '120px', sortable: true, editable: { type: 'text' } },
					{ field: 'character', text: 'Character', size: '120px', sortable: true, editable: { type: 'text' } },
					{ field: 'time', text: 'Time', size: '120px', sortable: true },
				],
				liveSearch: true,
				multiSearch: false,
				textSearch: 'contains',
				searches: [
					{ field: 'name', label: 'Name', type: 'text' },
				],
				onExpand: function(event) {

					let row = this.get(event.detail.recid);
					
					$('#'+event.detail.box_id).html(`
						<img src="${row.img}" style="max-width:100%;">
					`).animate({ height: 220 }, 100);

					$('#'+event.detail.fbox_id).animate({ height: 220 }, 100);

					mt.h_debug && console.log('[mt.anime.init.w2grid.onExpand]', { event, row });
				},
				onAdd: function (event) {
					let id = this.records.length + 1;
					let time = Math.floor(Date.now() / 1000);
					this.add({ id, time });
					this.scrollIntoView(1); // Scroll top
				},
				onEdit: function (event) {
					w2alert('edit');
				},
				onSave: async function (event) {
					let confirm = await new Promise((resolve, reject) => {
						w2popup.open({
							title: 'Records Changes',
							with: 600,
							height: 550,
							body: `<pre>${JSON.stringify(this.getChanges(), null, 4)}</pre>`,
							actions: {
								Ok: () => resolve(true),
								Cancel: () => resolve(false),
							}
						});
					});
					if (!confirm)
						event.preventDefault();
					w2popup.close();
				},
			});

			// Load data
			this.d_list = await mt.file.loadJson(this.h_pathDB);
			for (let i=0, sz=this.d_list.length; i<sz; i++) {
				let anime = this.d_list[i];
				anime.id = i+1; // Thêm ID
			}

			// this.c_w2grid.total = this.d_list.length + 100;
			this.c_w2grid.records = this.d_list;
			this.c_w2grid.sort('time', 'desc');
			// this.c_w2grid.refresh();

			// this.c_w2grid.box = this.e_contain;
			this.c_w2grid.render(this.e_contain);
			// this.e_contain.innerHTML = 'AAAAAAAAAA';
		},
	},
	game: {
		h_pathDB: '/res/DB/game.json',
		d_list: [],
		c_w2grid: null,
		m_init: false,
		e_contain: null,

		async init() {

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'game-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			// Column score
			let imgProp = {
				size: '51px',
				attr: 'align=center',
				render: (row, target) => {
					if (target.value)
						return `<img src="/res/images/game/${target.value}" />`;
					return '';
				},
				editable: { type: 'text' },
			};
			let ratingProp = {
				size: '70px',
				sortable: true,
				attr: 'align=center',
				editable: { type: 'int', min: 1, max: 5 },
				render: (row, target) => {
					if (target.value >= 1 && target.value <= 5)
						return `<img src="/res/icons/rating${target.value}.png" />`;
					return 'N/A';
				},
			};

			// Grid
			this.c_w2grid = new w2grid({
				name: 'grid-game',
				recid: 'id',
				show: {
					toolbar: true,
					footer: true,
					lineNumbers: true,
					selectColumn: false,
					expandColumn: false,
					toolbarAdd: true,
					toolbarSave: true,
				},
				// toolbar: {
				// 	items: [
				// 		{ id: 'add', type: 'button', text: 'Add Record', icon: 'w2ui-icon-plus' },
				// 		{ type: 'break' },
				// 		{ type: 'button', id: 'showChanges', text: 'Show Changes' }
				// 	],
				// 	onClick(event) {
				// 		if (event.target == 'add') {
							
				// 		}
				// 		else if (event.target == 'showChanges') {
				// 			showChanged()
				// 		}
				// 	}
				// },
				columns: [
					{ field: 'img', text: 'Image', ...imgProp },
					{ field: 'name', text: 'Name', resizable: true, sortable: true, searchable: { operator: 'contains' }, editable: { type: 'text' } },
					{ field: 'graphic', text: 'Graphic', ...ratingProp },
					{ field: 'audio', text: 'Audio', ...ratingProp },
					{ field: 'gameplay', text: 'Gameplay', ...ratingProp },
					{ field: 'story', text: 'Story', ...ratingProp },
					{ field: 'review', text: 'Review', ...ratingProp },
					{ field: 'status', text: 'Status', size: '180px', editable: { type: 'text' } },
					{ field: 'tags', text: 'Tags', size: '320px', searchable: { operator: 'contains' }, editable: { type: 'text' } },
					{ field: 'date', text: 'Date', size: '74px', sortable: true },
					{ field: 'size', text: 'Size', size: '46px', sortable: true, editable: { type: 'text' } },
				],
				liveSearch: true,
				multiSearch: false,
				textSearch: 'contains',
				searches: [
					{ field: 'name', label: 'Name', type: 'text' },
				],
				onAdd: (event) => {
					let id = this.c_w2grid.records.length + 1;
					// let time = Math.floor(Date.now() / 1000);
					let date = mt.utils.convert_DateToStr(new Date());
					this.c_w2grid.add({ id, date });
					this.c_w2grid.scrollIntoView(1); // Scroll top
				},
				onEdit: (event) => {
					w2alert('edit');
				},
				onSave: async (event) => {
					let dataChange = this.c_w2grid.getChanges();
					let confirm = await new Promise((resolve) => {
						w2popup.open({
							title: 'Records Changes',
							with: 600,
							height: 550,
							body: `<pre>${JSON.stringify(dataChange, null, 4)}</pre>`,
							actions: {
								Ok: () => resolve(true),
								Cancel: () => resolve(false),
							}
						});
					});
					if (!confirm)
						event.preventDefault();
					w2popup.close();

					this.saveRow(dataChange);
				},
			});

			// Load data
			this.d_list = await mt.file.loadJson(this.h_pathDB);
			for (let i=0, sz=this.d_list.length; i<sz; i++) {
				let game = this.d_list[i];
				game.id = i+1; // Thêm ID
			}

			// this.c_w2grid.total = this.d_list.length + 100;
			this.c_w2grid.records = this.d_list;
			this.c_w2grid.sort('date', 'desc');
			// this.c_w2grid.refresh();

			// this.c_w2grid.box = this.e_contain;
			this.c_w2grid.render(this.e_contain);
			// this.e_contain.innerHTML = 'AAAAAAAAAA';
		},
		async saveRow(listChange) {
			try {

				// Save data
				let urlDB = '/' + this.h_pathDB;
				let cloneData = JSON.parse(JSON.stringify(this.d_list));
				for (let game of cloneData) {
					delete game.id;
					delete game.recid;
					delete game.w2ui;
				}
				await mt.file.saveJson(urlDB, cloneData);

				// Toast
				mt.show.toast('success', 'Đã lưu lại.');

				// Log
				mt.h_debug && console.log('[mt.game.saveRow]', { listChange, data: this.d_list });
			}
			catch (ex) {
				console.error('[mt.game.saveRow]', ex);
			}
		},
	},
	explorer: {
		h_config: {
			lstSkip: [
				'.git', '.gitignore', '.vscode', 'package.json', 'package-lock.json', 'node_modules',
				'lib', 'res'
			],
			lstExt: [
				'html',
			],
			lstExtImage: [
				'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'svg',
			],
			lstExtAudio: [
				'wav', 'mp3', 'ogg', 'aac', 'mid', 'midi',
			],
			lstExtVideo: [
				'mp4', 'm4v', 'avi', 'mov', 'flv', '3gp',
			],
			type: {
				'folder': { },
				'file': { icon: '/res/icons/file16.png' },
				'image': { icon: '/res/icons/image16.png' },
				'audio': { icon: '/res/icons/audio16.png' },
				'video': { icon: '/res/icons/video16.png' },
				'html': { icon: '/res/icons/web16.png' },
			},
		},
		e_contain: null,
		m_init: false,
		m_clientPath: '',

		async init() {

			// Import library
			await mt.lib.import(['jstree']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'explorer-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `

				<!-- Input Search -->
				<div class="ui icon input" style="margin:16px 16px;">
					<input id="explorer-search" type="text" placeholder="Search...">
					<i class="search icon"></i>
				</div>

				<!-- JSTree -->
				<div id="explorer-jstree"></div>
			`.trim().split('\n').map(v=>v.trim()).join('\n');

			// Call API
			let resClientPath = await fetch('/file/getClientPath', {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + mt.auth.getToken(),
				},
			});
			this.m_clientPath = await resClientPath.text();

			// JSTree Init
			$('#explorer-jstree').jstree({
				core: {
					data: {
						url: '/file/jstree',
						headers: {
							'Authorization': 'Bearer ' + mt.auth.getToken(),
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
				types: this.h_config.type,
				contextmenu: {
					items: (node) => this.contextmenu(node)
				},
			});

			// Đăng ký sự kiện Double click
			$('#explorer-jstree').on('dblclick', '.jstree-anchor', function(e) {
				e.preventDefault();
				let instance = $.jstree.reference(this);
				let node = instance.get_node(this);
				mt.doubleClick(node);
			});


			// Search
			// $('#fieldSearch').on('keypress', (event) => {
			// 	if (event.which === 13)
			// 		$('#jstree').jstree('search', $('#fieldSearch').val());
			// });
		},
		processNode(data) { // Khi load node con
			for (let i = data.length - 1; i >= 0; i--) {
				let item = data[i];

				// Danh sách ẩn
				if (this.h_config.lstSkip.includes(item.text)){
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
			if (this.h_config.lstExt.includes(ext))
				return ext;
			else if (this.h_config.lstExtImage.includes(ext))
				return 'image';
			else if (this.h_config.lstExtAudio.includes(ext))
				return 'audio';
			return 'file';
		},
	},
	document: {
		h_pathDB: '/res/DB/document.json',
		e_contain: null,
		c_w2grid: null,
		c_markdown: null,
		m_init: false,
		m_docId: null,
		d_list: [],

		async init() {

			// Import library
			await mt.lib.import(['mermaid']); // Import mermaid trước markdownIt
			await mt.lib.import(['markdownIt', 'highlightjs']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'document-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			let renderAction = (row, actions) => {
				let htmlBtn = '<div style="display:flex;gap:4px;">';
				htmlBtn += `<button onclick="mt.document.btnRead(${row.id})"><i class="fa-solid fa-eye"></i></button>`;
				let act = ',' + actions + ',';
				// if (act.includes(',build,'))
				// 	htmlBtn += `<button onclick="mt.server.btnSSH(${row.id},true)"><i class="fa-solid fa-hammer"></i></button>`;
				// if (row.status === false && act.includes(',start,'))
				// 	htmlBtn += `<button onclick="mt.server.btnSSH(${row.id},false)"><i class="fa-solid fa-play"></i></button>`;
				if (row.status === true && act.includes(',link,'))
					htmlBtn += `<button onclick="mt.server.btnLink(${row.id})"><i class="fa-solid fa-link"></i></button>`;
				return htmlBtn + '</div>';
			}

			// Grid
			this.c_w2grid = new w2grid({
				name: 'grid-document',
				recid: 'id',
				show: {
					toolbar: true,
					footer: true,
					lineNumbers: true,
				},
				toolbar: {
					items: [
						{ type: 'button', id: 'share', text: 'Share', icon: 'fa-solid fa-share-from-square' },
					],
					onClick: (event) => {
						if (event.target == 'share')
							this.btnShare();
					}
				},
				columns: [
					{ field: 'actions', text: 'Actions', size: '60px', render: (row, target) => renderAction(row, target.value) },
					{ field: 'name', text: 'Name', resizable: true, sortable: true, searchable: { operator: 'contains' } },
				],
				liveSearch: true,
				multiSearch: true,
				textSearch: 'contains',
				searches: [
					{ field: 'name', label: 'Name', type: 'text' },
				],
			});

			// Load data
			await this.load();
			
			// this.c_w2grid.total = this.d_list.length + 100;
			this.c_w2grid.records = this.d_list;
			// this.c_w2grid.sort('time', 'desc');
			this.c_w2grid.refresh();

			this.c_w2grid.render(this.e_contain);

			// Markdown
			this.c_markdown = markdownit({
				html: false,
				xhtmlOut: true,
				typographer: true,
				highlight: function (str, lang) {
					if (lang && hljs.getLanguage(lang)) {
						try {
							return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
						}
						catch (__) {}
					}
					return str;
				}
			});

			// Markdown Plugin
			this.c_markdown.use(markdownItAnchor, { permalink: markdownItAnchor.permalink.headerLink() });
			this.c_markdown.use(markdownItTocDoneRight, { containerId: 'mdToC', listType: 'ol' });
			this.c_markdown.use(markdownitDeflist);
			this.c_markdown.use(markdownitEmoji);
			this.c_markdown.use(markdownitFootnote);
			this.c_markdown.use(markdownitIns);
			this.c_markdown.use(markdownitIns);
			this.c_markdown.use(markdownitMultimdTable);
			this.c_markdown.use(markdownitSub);
			this.c_markdown.use(markdownitSup);

			// Init Mermaid
			mermaid.initialize({ startOnLoad: false });
			
			// Init CSS
			this.initCSS();

			// Process Params
			this.processParams();
		},
		async initCSS() {
			const style = document.createElement('style');
			style.textContent = `
				.md-contain { display: flex; height: 100%; }
				.md-toc {
					flex: 0 0 auto; width: fit-content; overflow: auto; border-right: 1px solid #ddd;
					ol { padding-left: 24px; text-decoration: none; }
				}
				.md-doc {
					flex: 1 1 auto; margin-left: 16px; overflow: auto;
					a { color: #974908; text-decoration: none; }
				}
			`.trim();
			document.head.appendChild(style);
		},
		async load() {
			
			// Call API
			this.d_list = await mt.file.loadJson(this.h_pathDB);

			for (let i=0, sz=this.d_list.length; i<sz; i++) {
				let doc = this.d_list[i];
				doc.id = i+1; // Thêm ID
			}

		},
		async processParams() {
			let urlParams = new URLSearchParams(window.location.search);
			let docName = urlParams.get('doc');
			if (docName != null) {

				// Add filter grid
				this.c_w2grid.search([{ field: 'name', value: docName, operator: 'contains' }], 'AND');

				// Search
				for (let doc of this.d_list) {
					if (doc.name == docName) {

						// Load MD
						await this.btnRead(doc.id);
						
						// Focus fragment
						if (window.location.hash) {
							const targetId = window.location.hash.substring(1);
							const target = document.getElementById(targetId);
							if (target)
								target.scrollIntoView({ behavior: 'smooth' });
						}

						break;
					}
				}
			}
		},
		async btnShare() {

			// Lấy Port hiện tại
			let URL = location.origin + location.pathname;
			if (URL.indexOf('localhost') > -1) {

				// Call API - Get IP
				let response = await fetch('/common/getIPLocal', { method: 'GET' });
				if (!response.ok)
					throw { error: true, message: await response.text() };

				let IP = await response.text();

				URL = URL.replace('localhost', IP);
			}

			// Thêm params query
			let paramURL = new URLSearchParams();
			let tabName = w2ui.layout_main_tabs.active;
			paramURL.set('tab', tabName);
			if (this.m_docId != null) {
				let doc = this.c_w2grid.get(this.m_docId);
				paramURL.set('doc', doc.name);
			}
			URL += '?' + paramURL.toString();
			if (window.location.hash)
				URL += decodeURIComponent(window.location.hash);

			// Tự động copy
			if (window.isSecureContext) {
				await navigator.clipboard.writeText(URL);
				// mt.show.toast('success', 'Đã copy link nhạc.');
			}
			else {
				console.log(URL);
				// mt.show.toast('warning', 'Chưa cấp quyền truy cập bộ nhớ đệm! Lấy link trong console.');
			}
		},
		async btnRead(docId) {

			this.m_docId = docId;
			let doc = this.c_w2grid.get(docId);

			// Show right panel
			mt.common.c_w2layout.set('right', { size: '70%' });
			mt.common.c_w2layout.show('right');

			// Load markdown
			// let content = await this.loadMarkdown(doc.path);
			let content = await mt.file.readFile('text', doc.path);
			content = '${toc}\n' + content;

			// Convert HTML
			const html = this.c_markdown.render(content);
			const domParser = new DOMParser();
			const mdDom = domParser.parseFromString(html, 'text/html');
			const contentDiv = mdDom.getElementById('mdToC');
			const tocHtml = contentDiv.outerHTML;
			contentDiv.remove();

			// CSS

			// Render
			mt.common.c_w2layout.html('right', `
				<div class="md-contain">
					<div class="md-toc">${tocHtml}</div>
					<div class="md-doc">${mdDom.body.innerHTML}</div>
				</div>
			`.trim());

			// Render Mermaid
			mermaid.run({ querySelector: '.language-mermaid', postRenderCallback: (svgId) => {
				let el = document.getElementById(svgId);
				let pre = el.parentElement.parentElement;
				pre.after(el);
				pre.remove();
			}});

			// Log
			// mt.h_debug && console.log('[mt.document.btnRead]', { content, html });
		},
	},
	contact: {
		h_pathDB: '/res/DB/contact.json',
		d_list: [], // Danh sách liên lạc
		d_map: [], // Chuyển thành map để truy cập nhanh
		m_init: false,
		e_content: null,
		c_network: null, // Vis Network
		c_nodes: null, // Vis - node
		c_edges: null, // Vis - edge

		async init() {

			// Import Library
			await mt.lib.import(['visjs']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'contact-contain';
			this.e_contain.style.height = '100%';
			this.e_contain.style.display = 'flex';
			mt.common.e_contain.appendChild(this.e_contain);

			let containList = document.createElement('div');
			containList.id = 'contact-list';
			containList.style.width = '50%';
			containList.style.height = '100%';
			this.e_contain.appendChild(containList);

			let containTree = document.createElement('div');
			containTree.id = 'contact-tree';
			containTree.style.width = '50%';
			containTree.style.height = '100%';
			this.e_contain.appendChild(containTree);

			let renderAction = (row, actions) => {
				let htmlBtn = '<div style="display:flex;gap:4px;">';
				if (row.relationship)
					htmlBtn += `<button onclick="mt.contact.btnShow(${row.id})"><i class="fa-solid fa-eye"></i></button>`;
				return htmlBtn + '</div>';
			}
			
			// Grid
			this.c_w2grid = new w2grid({
				name: 'contact-grid',
				recid: 'id',
				group: 'group',
				show: {
					toolbar: true,
					footer: true,
					lineNumbers: true,
					// toolbarAdd: true,
					// toolbarSave: true,
				},
				toolbar: {
					items: [
						// { type: 'button', id: 'add', text: 'Add Record', icon: 'w2ui-icon-plus' },
						// { type: 'break' },
						// { type: 'button', id: 'showChanges', text: 'Show Changes' },
						{ type: 'button', id: 'refresh_all', text: 'Refresh All', icon: 'fa-solid fa-arrows-rotate' },
						{ type: 'button', id: 'share', text: 'Share', icon: 'fa-solid fa-share-from-square' },
					],
					onClick: (event) => {
						if (event.target == 'refresh_all')
							this.btnRefreshAll();
						else if (event.target == 'share')
							this.btnShare();
					}
				},
				columns: [
					{ field: 'actions', text: 'Actions', size: '120px', render: (row, target) => renderAction(row, target.value) },
					// { field: 'status', text: 'Status', size: '52px', attr: 'align=center', render: (row, target) => renderStatus(target.value)},
					{ field: 'ho', text: 'Họ', size: '300px', resizable: true, sortable: true, searchable: { operator: 'contains' }, editable: { type: 'text' } },
					{ field: 'ten', text: 'Tên', size: '300px', resizable: true, sortable: true, searchable: { operator: 'contains' }, editable: { type: 'text' } },
					// { field: 'url', text: 'URL', size: '128px', sortable: true, resizable: true, editable: { type: 'text' } },
					// { field: 'tags', text: 'Tags', size: '300px', render: (row, target) => renderTag(target.value) },
				],
				liveSearch: true,
				multiSearch: true,
				textSearch: 'contains',
				searches: [
					{ field: 'name', label: 'Name', type: 'text', operator: 'contains' },
					{ field: 'tags', label: 'Tags', type: 'text', operator: 'contains' },
				],
			});
			this.c_w2grid.render(containList);

			// Init Vis
			this.c_nodes = new vis.DataSet([]);
			this.c_edges = new vis.DataSet([]);
			this.c_network = new vis.Network(containTree, { nodes: this.c_nodes, edges: this.c_edges }, {
				// layout: {
				// 	hierarchical: {
				// 		direction: 'UD',
				// 	},
				// },
			});

			// Load data
			await this.load();
			this.c_w2grid.records = this.d_list;
			this.c_w2grid.refresh();
		},
		async load() {

			this.d_list = await mt.file.loadJson(this.h_pathDB);

			this.d_map = {};
			for (let i=0; i<this.d_list.length; i++) {
				let contact = this.d_list[i];

				// Convert maping
				this.d_map[contact.id] = contact;
			}
		},
		async btnShow(rootContactId) {

			const delayTime = 500; // ms

			this.c_nodes.clear();
			this.c_edges.clear();
			
			// Xây cây quan hệ
			let stacks = [rootContactId]; // dùng để khử đệ quy, duyệt sâu
			// let nodes = []; // Danh sách nút
			// let edges = []; // Danh sách cạnh
			while (stacks.length > 0) { // Loop duyệt khử đệ quy
				let contactId = stacks.pop();
				let contact = this.d_map[contactId];

				// Bổ sung child
				if (contact.relationship)
					stacks = stacks.concat(contact.relationship);

				// Thêm node
				// nodes.add({ id: contact.id, label: contact.ten, level: contact.level });
				this.c_nodes.add({ id: contact.id, label: contact.ten, level: contact.level });

				// Thêm edge
				if (contact.relationship)
					for (let id of contact.relationship)
						this.c_edges.add({ from: contact.id, to: id });
						// edges.push({ from: contact.id, to: id });
				
				// Delay 300 ms
				await new Promise((resolve) => setTimeout(() => resolve(null), delayTime));
			}
		},
	},
	calendar: {

		/**
		 * https://fullcalendar.io/
		 */
		h_pathDB: 'res/DB/calendar/',
		m_init: false,
		d_events: {}, // Map year -> list event
		c_calendar: null, // fullcalendar
		c_modal: null, // tingle
		c_form: null, // jsoneditor
		e_content: null,
		t_tmp: {}, // Quản lý sự kiện tạm

		async init() {

			// Import Library
			await mt.lib.import(['FullCalendar','solarLunar','tingle','jsonEditor','flatpickr']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'calendar-contain';
			this.e_contain.style.height = '100%';
			this.e_contain.style.padding = '4px';
			mt.common.e_contain.appendChild(this.e_contain);

			// Init Calendar
			this.c_calendar = new FullCalendar.Calendar(this.e_contain, {
				initialView: 'dayGridMonth',
				// initialDate: '2024-12-08', // #DEBUG
				locale: 'vi',
				timeZone: 'Asia/Ho_Chi_Minh',
				height: 'parent',
				// Toolbar
				headerToolbar: {
					left: 'prev,next today',
					center: 'title',
					right: 'addEvent dayGridMonth,timeGridWeek,timeGridDay,listWeek'
				},
				// UI Setting
				firstDay: 1, // Thứ 2 đầu tuần
				weekNumbers: true, // Hiện số tuần của năm
				businessHours: false, // Sẫm màu 2 ngày cuối tuần
				showNonCurrentDates: false, // Sẫm màu các ngày ko thuộc tháng
				buttonText: { // Phiên dịch
					today: 'Hôm nay',
					month: 'Tháng',
					week: 'Tuần',
					day: 'Ngày',
					list: 'Sự kiện'
				},
				// Other
				editable: false,
				selectable: true,
				dayMaxEvents: true, // allow "more" link when too many events
				// Data
				events: [],
				// Custom Button
				customButtons: {
					addEvent: { text: 'Thêm', click: () => {
						let curDate = new Date();
						this.openForm({ id: -1, year: curDate.getFullYear(), name: '', date: mt.utils.convert_DateToStr(curDate), type: 'event' });
					}},
				},
				// Register Event
				datesSet: async (info) => { // khi đổi tháng, kiểu view, ngày, ...
					let year = info.view.currentStart.getFullYear();
					await this.load(year);
				},
				eventClick: (info) => this.openForm(info.event.extendedProps),
				dateClick: (info) => {
					if (this.t_tmp.clickDate == info.dateStr) {
						delete this.t_tmp.clickDate;
						this.openForm({ id: -1, year: info.view.currentStart.getFullYear(), name: '', date: info.dateStr, type: 'event' }); // Dupclick thì thêm sự kiện
					}
					else this.t_tmp.clickDate = info.dateStr; // Đánh dấu là nhấn vào ngày này
				},
			});
			this.c_calendar.render();

			// Init popup - tingle
			this.c_modal = new tingle.modal({
				footer: false,
				stickyFooter: false,
				closeMethods: ['button', 'escape'], // 'overlay'
				closeLabel: "Đóng",
				onOpen: function() {
					// console.log('modal opened');
				},
				onClose: function() {
					// console.log('modal closed');
				},
				beforeClose: function() {
					// Return true to close the modal, false to prevent closing
					return true;
				},
			});

			// Contain Form
			const elementForm = document.createElement('div');
			elementForm.style.width = '500px';
			this.c_modal.modalBox.style.width = 'unset'; // Bỏ width gốc
			this.c_modal.modalBoxContent.appendChild(elementForm); // Đặt contain form vào modal

			// Init form - JsonEditor
			// mt.lib.jsonEditor.ex.RateRegister();
			// mt.lib.jsonEditor.ex.TagBoxRegister();
			this.c_form = new JSONEditor(elementForm, {
				use_name_attributes: false,
				theme: 'barebones',
				iconlib: 'fontawesome5',
				disable_edit_json: true,
				disable_properties: true,
				disable_collapse: true,
				schema: {
					title: 'Lịch sự kiện',
					type: 'object',
					required: ['name', 'date'],
					properties: {
						'id': { type: 'integer', format: 'hidden', options: { titleHidden: true } },
						'year': { type: 'integer', format: 'hidden', options: { titleHidden: true } },
						'date': { title: 'Date', type: 'string', format: 'date', readonly: true, options: { flatpickr: { locale: 'vn', altInput: true, altFormat: 'd.m.Y', dateFormat: 'Y-m-d' }}},
						'name': { title: 'Name', type: 'string', format: 'text', minLength: 0, options: { autocomplete: 'off' } },
						'type': { title: 'Type', type: 'string', enum: ['normal','meet','birthday','holiday','note'] },
						'time': { title: 'Time', type: 'string', format: 'time', options: { flatpickr: { locale: 'vn', enableTime: true, noCalendar: true, dateFormat: 'H:i', time_24hr: true }}},
						'location': { title: 'Location', type: 'string', format: 'text', options: { autocomplete: 'off' } },
						'btn_map': { title: 'Open Map', type: 'string', format: 'button', options: { button: { icon: 'location-dot', action: () => this.btnOpenMap() }}},
						'btn_save': { title: 'Save', type: 'string', format: 'button', options: { button: { icon: 'save', action: () => this.saveForm() }}},
						'btn_cancel': { title: 'Cancel', type: 'string', format: 'button', options: { button: { icon: 'close', action: () => this.c_modal.close() }}},
					}
				},
			});
		},
		async load(year) {

			// Nếu đã có data thì bỏ qua
			if (this.d_events[year] != null)
				return;

			let urlDB = '/' + this.h_pathDB + year + '.json';

			// Call API
			let listEvent = await mt.file.loadJson(urlDB);

			// Auto gen
			if (listEvent.length == 0)
				listEvent = await this.generate(year);

			// Process
			for (let i=0; i<listEvent.length; i++) {
				let event = listEvent[i];
				
				// Bổ sung Id
				event.id = i+1;

				// Bổ sung year
				event.year = Number.parseInt(event.date.substring(0, 4));
			}

			// Bind Data
			this.d_events[year] = listEvent;

			// Set into calendar
			this.setEvents(listEvent);

			// Log
			mt.h_debug && console.log('[mt.calendar.load]', { year, listEvent });
		},
		async openForm(event) {

			// Clone
			let formData = JSON.parse(JSON.stringify(event));

			// Bổ sung field để hiển thị
			if (formData.time == null)
				formData.time = '00:00';
			if (formData.type == null)
				formData.type = 'normal';
			formData.location = (formData.location == null) ? '' : (formData.location.lat + ', ' + formData.location.lng);
			
			// Set form data
			this.c_form.setValue(formData);
			
			// Open Modal
			this.c_modal.open();

			// Log
			mt.h_debug && console.log('[mt.calendar.openForm]', { event, formData });
		},
		async saveForm() {
			try {

				// Lấy data form
				let formData = this.c_form.getValue();
				let year = formData.year;
				let id = formData.id;

				// Process form data
				if (formData.time == '00:00')
					delete formData.time;

				if (formData.type == 'normal')
					delete formData.type;

				let locationInput = formData.location;
				delete formData.location;
				if (locationInput != null && locationInput.length > 0) { // location từ 'lat, lng' thành { lat: ... , lng: ... }
					let locPath = locationInput.split(', ');
					if (locPath.length == 2) {
						try {
							let location = {
								lat: Number.parseFloat(locPath[0]),
								lng: Number.parseFloat(locPath[1])
							};
							formData.location = location;
						}
						catch (ex) {} // skip nếu lỗi
					}
				}
				
				// Lưu và cập nhật UI
				if (id == -1) { // Add event
					let newid = this.d_events[year].length;
					formData.id = newid;

					this.d_events[year].push(formData);

					let style = this.getTypeColor(formData.type);
					this.c_calendar.addEvent({
						id: id,
						title: formData.name,
						start: formData.date,
						backgroundColor: style.bgColor,
						textColor: style.color,
						borderColor: style.bdColor,
						extendedProps: formData,
					});
				}
				else { // Update event
					let oldData = this.d_events[year][id-1];
					this.d_events[year][id-1] = formData;
					let event = this.c_calendar.getEventById(id);

					if (formData.name != oldData.name)
						event.setProp('title', formData.name);

					if (formData.type != oldData.type) {
						let style = this.getTypeColor(formData.type);
						event.setProp('backgroundColor', style.bgColor);
						event.setProp('textColor', style.color);
						event.setProp('borderColor', style.bdColor);
					}

					for (let prop in formData) {
						if (prop == 'id' || prop == 'date')
							continue;
						event.setExtendedProp(prop, formData[prop]);
					}
				}

				// Save data
				let urlDB = '/' + this.h_pathDB + year + '.json';
				let cloneData = JSON.parse(JSON.stringify(this.d_events[year]));
				for (let event of cloneData) {
					delete event.id;
					delete event.year;
				}
				await mt.file.saveJson(urlDB, cloneData);

				// Toast
				mt.show.toast('success', 'Đã lưu lịch.');

				// Close modal
				this.c_modal.close();

				// Log
				mt.h_debug && console.log('[mt.calendar.saveForm]', { formData });
			}
			catch (ex) {
				mt.show.toast('error', 'Dữ liệu nhập chưa hợp lệ!');
				console.error('[mt.calendar.saveForm] Exception:', ex);
			}
		},
		btnOpenMap() {
		
			// Lấy data form
			let formData = this.c_form.getValue();
			let year = formData.year;
			let id = formData.id;

			let event = this.d_events[year][id-1];

			if (!event.location) {
				mt.show.toast('warning', 'Chưa nhập Location');
				return;
			}

			let url = `/manager3/?tab=map&lat=${event.location.lat}&lng=${event.location.lng}`;
			window.open(url);
		},
		async generate(year) { // Tạo data của năm

			// Generate
			let urlDB = '/' + this.h_pathDB + 'gen.json';

			// Call API load
			let listGen = await mt.file.loadJson(urlDB);

			// Gen
			let listEvent = [];
			for (let gen of listGen) {
				let event = null;
				switch (gen.gen) {
					case 'yearly':
						event = { date: year + gen.date.slice(4), name: gen.name };
						break;
					case 'yearly-lunar':
						event = { date: this.convert_Lunar2Solar(year + gen.date.slice(4)), name: gen.name };
						break;
					default:
						continue;
				}
				if (gen.type) // Bổ sung type
					event.type = gen.type;
				listEvent.push(event); // Thêm vào danh sách
			}

			// Lưu lại
			mt.file.saveJson('/' + this.h_pathDB + year + '.json', listEvent);

			// Thông báo
			// w2alert(`Đã tạo dữ liệu năm ${year}.`);
			w2utils.notify(`Đã tạo dữ liệu năm ${year}.`, { class: 'custom-class', where: '#preview-box' });
			
			// Log
			mt.h_debug && console.log('[mt.calendar.generate]', { listGen, listEvent });

			// Return
			return listEvent;
		},
		setEvents(listEvent) {
			let lstData = [];
			for (let i=0, sz=listEvent.length; i<sz; i++) {
				let event = listEvent[i];
				let style = this.getTypeColor(event.type);
				lstData.push({
					id: event.id,
					title: event.name,
					start: event.date,
					backgroundColor: style.bgColor,
					textColor: style.color,
					borderColor: style.bdColor,
					extendedProps: event,
				});
			}
			this.c_calendar.addEventSource(lstData);
		},
		getTypeColor(type) {
			let bgColor = '#ffffff', color = '#000000', bdColor = '#ffffff';
			switch (type) {
				case 'meet': bgColor ='#3788d8'; color = '#fff'; break;
				case 'birthday': bgColor ='#9dfca5'; break;
				case 'holiday': bgColor ='#f19dfc'; break;
				case 'note': bgColor ='#fcfa9d'; break;
			}
			return { bgColor, color, bdColor };
		},
		convert_Lunar2Solar(lunarDateStr) {
			let year = Number.parseInt(lunarDateStr.substring(0, 4));
			let month = Number.parseInt(lunarDateStr.substring(5, 7));
			let day = Number.parseInt(lunarDateStr.substring(8, 10));
			let sonarDate = solarLunar.lunar2solar(year, month, day, false);
			let funcPad = (num) => (num < 10) ? '0'+num : ''+num;
			return `${sonarDate.cYear}-${funcPad(sonarDate.cMonth)}-${funcPad(sonarDate.cDay)}`;
		},
	},
	map: {

		/**
		 * Tải file map
		 * https://download.geofabrik.de/asia/vietnam.html
		 * 
		 * Tải planetiler
		 * https://github.com/onthegomap/planetiler/releases/tag/v0.9.3
		 * 
		 * Convert ".osm.pbf" -> ".mbtiles"
		 * java -jar "planetiler.jar" --osm-path="vietnam.osm.pbf" --output="vietnam.mbtiles" --download
		 * 
		 * 
		 * 
		 * 
		 * Tải tilemaker: https://github.com/systemed/tilemaker/releases/tag/v3.0.0
		 * Convert ".osm.pbf" -> ".mbtiles": tilemaker --input data.osm.pbf --output data.mbtiles
		 * "D:\Apps\tilemaker\build\RelWithDebInfo\tilemaker.exe" --input "vietnam-260201.osm.pbf" --output "C:\Users\Admin\Downloads\map\vietnam-260201.mbtiles"
		 * 
		 * Tải gdal: https://www.gisinternals.com/query.html?content=filelist&file=release-1944-x64-gdal-3-12-1-mapserver-8-6-0.zip
		 * 
		 * Convert ".osm.pbf" -> "": gdal-3-12-1\bin\gdal\apps\ogr2ogr -f "ESRI Shapefile" vietnam.shp vietnam-latest.osm.pbf
		 * "D:\Apps\gdal-3-12-1\bin\gdal\apps\ogr2ogr.exe" -f "ESRI Shapefile" vietnam.shp vietnam-260201.osm.pbf
		 * 
		 * 
		 */

		// h_url_online: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
		h_url_online: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		h_url_offline: '/map/tiles/?z={z}&x={x}&y={y}',
		m_init: false,
		e_contain: null,
		c_map: null, // Leaflet
		c_layer: null, // Leaflet

		async init() {

			// Import Library
			await mt.lib.import(['leaflet']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'map-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			// Init Map - leaflet
			this.c_map = new L.Map('map-contain', {
				contextmenu: true,
				contextmenuWidth: 140,
				contextmenuItems: [
					{ text: 'Copy position', callback: (e) => this.copyPosition(e) },
					{ text: 'Mark', callback: (e) => this.addMark(e) },
					'-',
					{ text: 'Zoom in', icon: 'images/zoom-in.png', callback: () => console.log('zoomIn') },
					{ text: 'Zoom out', icon: 'images/zoom-out.png', callback: () => console.log('zoomOut') },
				],
				attributionControl: false,
			}).setView([10.7769, 106.7009], 12);
			// this.c_map = new L.Map('map-contain').fitWorld();

			// Add tile Layer
			this.c_layer = L.tileLayer(this.h_url_online, { attribution: '' }).addTo(this.c_map);

			// Add Button, Tạo custom control chứa input text
			let inputControl = L.control({position: 'topright'}); // vị trí: topleft, topright, bottomleft, bottomright
			inputControl.onAdd = (map) => {
				let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
				let input = L.DomUtil.create('input', '', div);
				input.type = 'text';
				input.placeholder = 'latiture, longtiture';
				input.style.padding = '4px';
				input.style.width = '120px';
				L.DomEvent.disableClickPropagation(div); // Ngăn sự kiện chuột trên input ảnh hưởng đến map (ví dụ zoom, drag)
				input.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						e.preventDefault(); // ngăn submit form nếu có
						let value = input.value.trim();
						if (value) {
							let part = value.split(', ');
							if (part.length == 2) {
								let lat = Number.parseFloat(part[0]);
								let lng = Number.parseFloat(part[1]);
								map.setView([lat, lng], 15); // Focus
								let marker = L.marker([lat, lng]).addTo(this.c_map); // Add marker
							}
						}
					}
				});
				return div;
			};
			inputControl.addTo(this.c_map); // Thêm control vào map

			// Add Button current location
			let locationControl = L.control({position: 'topleft'});
			locationControl.onAdd = (map) => {
				let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
				let button = L.DomUtil.create('button', '', div);
				button.innerHTML = '<i class="fa-solid fa-location-crosshairs" style="font-size:16px;"></i>';
				button.style.width = '30px';
				button.style.height = '30px';
				button.style.padding = '0';
				button.style.border = 'none';
				button.style.cursor = 'pointer';
				L.DomEvent.disableClickPropagation(div);
				button.addEventListener("click", function() {
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(pos) {
							let lat = pos.coords.latitude;
							let lng = pos.coords.longitude;
							map.setView([lat, lng], 15);
							L.marker([lat, lng]).addTo(map).bindPopup("Bạn đang ở đây").openPopup();
						}, function(err) {
							alert("Không lấy được vị trí: " + err.message);
						});
					}
					else {
						alert("Trình duyệt không hỗ trợ Geolocation");
					}
				});
				return div;
			}
			locationControl.addTo(this.c_map);

			// Test route
			// let startPoint = L.latLng(10.8231, 106.6297); // HCM
			// let endPoint = L.latLng(10.762622, 106.660172); // Quận 1
			// // Tạo route
			// L.Routing.control({
			// 	waypoints: [startPoint, endPoint],
			// 	routeWhileDragging: true,
			// 	lineOptions: {
			// 		styles: [{color: 'blue', weight: 6}]
			// 	},
			// 	createMarker: function(i, waypoint, n) {
			// 		return L.marker(waypoint.latLng, {
			// 			icon: L.icon({
			// 				iconUrl: i === 0 ? 'marker-start.png' : 'marker-end.png',
			// 				iconSize: [32, 32]
			// 			})
			// 		});
			// 	}
			// }).addTo(this.c_map);

			// Process Params
			this.processParams();
		},
		processParams() {
			let urlParams = new URLSearchParams(window.location.search);
			let latStr = urlParams.get('lat');
			let lngStr = urlParams.get('lng');
			if (latStr != null && lngStr != null) {
				let lat = Number.parseFloat(latStr);
				let lng = Number.parseFloat(lngStr);

				let marker = L.marker([lat, lng]).addTo(this.c_map);

				this.c_map.setView([lat, lng], 16);
			}
		},
		tile2bbox(x, y, z) {
			const n = Math.pow(2, z);
			const lng_left = x / n * 360.0 - 180.0;
			const lng_right = (x + 1) / n * 360.0 - 180.0;
			const lat_top = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
			const lat_bottom = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180 / Math.PI;
			return [lng_left, lat_bottom, lng_right, lat_top];
		},
		getTile(x, y, z) {
			// const bbox = this.tile2bbox(parseInt(x), parseInt(y), parseInt(z));
			// const inputFile = '/path/to/input.tif';
			// const outFile = path.join(__dirname, `tile_${z}_${x}_${y}.png`);
			// const cmd = `gdal_translate -projwin ${bbox[0]} ${bbox[3]} ${bbox[2]} ${bbox[1]} -of PNG ${inputFile} ${outFile}`
		},
		async copyPosition(event) {
			let pos = event.latlng.lat + ', ' + event.latlng.lng;
			if (window.isSecureContext) {
				await navigator.clipboard.writeText(pos); // Copy clipboard
				mt.show.toast('success', 'Đã copy vị trí: '+pos);
			}
			else {
				console.log(pos); // Log
				mt.show.toast('warning', 'Chưa cấp quyền truy cập bộ nhớ đệm! Lấy link trong console.');
			}
		},
		addMark(event) {
			let lat = event.latlng.lat;
			let lng = event.latlng.lng;
			L.marker([lat, lng]).addTo(this.c_map);
		},
	},
	server: {
		h_pathDB: '/res/DB/server.json',
		h_pathNmap: 'D:/Apps/Nmap',
		d_list: [],
		d_map: {},
		c_w2grid: null,
		m_init: false,
		e_contain: null,

		async init() {

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'server-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			let renderAction = (row, actions) => {
				let htmlBtn = '<div style="display:flex;gap:4px;">';
				htmlBtn += `<button onclick="mt.server.btnRefresh(${row.id})"><i class="fa-solid fa-arrows-rotate"></i></button>`;
				let act = ',' + actions + ',';
				// if (act.includes(',build,'))
				// 	htmlBtn += `<button onclick="mt.server.btnSSH(${row.id},true)"><i class="fa-solid fa-hammer"></i></button>`;
				// if (row.status === false && act.includes(',start,'))
				// 	htmlBtn += `<button onclick="mt.server.btnSSH(${row.id},false)"><i class="fa-solid fa-play"></i></button>`;
				if (row.status === true && act.includes(',link,'))
					htmlBtn += `<button onclick="mt.server.btnLink(${row.id})"><i class="fa-solid fa-link"></i></button>`;
				return htmlBtn + '</div>';
			}
			let renderStatus = (status) => {
				if (status === undefined)
					return `...`;
				else if (status === null)
					return `<i class="fa-solid fa-spinner fa-lg anim-rotate"></i>`;
				return `<i class="fa-solid fa-circle-${status === true ? 'check' : 'xmark'} fa-lg"
					style="color:#${status === true ? '4ade80' : 'f87171'}"></i>`;
			}
			let renderTag = (tags) => {
				let htmlBtn = '<div style="display:flex;gap:4px;">';
				for (let tag of tags) {
					htmlBtn += `<button onclick="mt.server.btnTag('${tag}')">${tag}</button>`;
				}
				return htmlBtn + '</div>';
			}

			// Grid
			this.c_w2grid = new w2grid({
				name: 'grid-server',
				recid: 'id',
				group: 'group',
				show: {
					toolbar: true,
					footer: true,
					lineNumbers: true,
					// toolbarAdd: true,
					// toolbarSave: true,
				},
				toolbar: {
					items: [
						// { type: 'button', id: 'add', text: 'Add Record', icon: 'w2ui-icon-plus' },
						// { type: 'break' },
						// { type: 'button', id: 'showChanges', text: 'Show Changes' },
						{ type: 'button', id: 'refresh_all', text: 'Refresh All', icon: 'fa-solid fa-arrows-rotate' },
						{ type: 'button', id: 'share', text: 'Share', icon: 'fa-solid fa-share-from-square' },
					],
					onClick: (event) => {
						if (event.target == 'refresh_all')
							this.btnRefreshAll();
						else if (event.target == 'share')
							this.btnShare();
					}
				},
				columns: [
					{ field: 'actions', text: 'Actions', size: '120px', render: (row, target) => renderAction(row, target.value) },
					{ field: 'status', text: 'Status', size: '52px', attr: 'align=center', render: (row, target) => renderStatus(target.value)},
					{ field: 'name', text: 'Name', size: '300px', resizable: true, sortable: true, searchable: { operator: 'contains' }, editable: { type: 'text' } },
					{ field: 'url', text: 'URL', size: '128px', sortable: true, resizable: true, editable: { type: 'text' } },
					{ field: 'tags', text: 'Tags', size: '300px', render: (row, target) => renderTag(target.value) },
				],
				liveSearch: true,
				multiSearch: true,
				textSearch: 'contains',
				searches: [
					{ field: 'name', label: 'Name', type: 'text', operator: 'contains' },
					{ field: 'tags', label: 'Tags', type: 'text', operator: 'contains' },
				],
			});
			this.c_w2grid.render(this.e_contain);

			// Load data
			await this.load();
			
			// this.c_w2grid.total = this.d_list.length + 100;
			this.c_w2grid.records = this.d_list;
			// this.c_w2grid.sort('time', 'desc');
			this.c_w2grid.refresh();

			// Process Params
			this.processParams();
		},
		async load() {

			this.d_list = await mt.file.loadJson(this.h_pathDB);

			let processNode = (server, id) => {

				// Bổ sung id
				server.id = id;

				// Lấy host và port
				if (server.url.includes(':')) {
					let pathUrl = server.url.split(':');
					server.host = pathUrl[0];
					server.port = +pathUrl[1];
				}
				else {
					server.host = server.url;
					server.port = null;
				}
				
				// Link reference
				this.d_map[id] = server;
			}

			let id = 1;
			for (let server of this.d_list) {
				processNode(server, id++);

				// Cấu trúc cây w2ui
				if (server.list == null)
					continue;

				for (let subserver of server.list) // Bổ sung id
					processNode(subserver, id++);

				server.w2ui = { children: server.list };
				delete server.list;
			}
		},
		processParams() {
			let urlParams = new URLSearchParams(window.location.search);
			let tag = urlParams.get('tag');
			if (tag != null) {
				this.c_w2grid.search([{ field: 'tags', value: tag, operator: 'contains' }], 'AND');
				this.btnRefreshAll(); // Tự động check khi có sẵn tag
			}
		},
		async check(host, port) {
			let cmd = '';
			if (port != null)
				cmd = `nmap -p ${port} ${host}`;
			else
				cmd = `nmap ${host}`;
			let result = await mt.cmd.exec(cmd, [this.h_pathNmap]);
			let stdout = result?.stdout || '';
			// let stderr = result?.stderr || '';
			
			mt.h_debug && console.log('[mt.server.check]', { result });
			
			return stdout.includes('open');
		},
		btnRefreshAll() {
			this.c_w2grid.selectAll();
			let ids = this.c_w2grid.getSelection();
			this.c_w2grid.selectNone();

			for (let id of ids) {
				this.btnRefresh(id); // No Await
			}
		},
		async btnRefresh(serverId) {
			this.c_w2grid.set(serverId, { status: null });
			let server = this.d_map[serverId];
			this.c_w2grid.set(serverId, { status: await this.check(server.host, server.port) });
		},
		async btnShare() {

			// Lấy Port hiện tại
			let URL = location.origin + location.pathname;
			if (URL.indexOf('localhost') > -1) {

				// Call API - Get IP
				let response = await fetch('/common/getIPLocal', { method: 'GET' });
				if (!response.ok)
					throw { error: true, message: await response.text() };
				let IP = await response.text();

				URL = URL.replace('localhost', IP);
			}

			// Thêm params query
			let paramURL = new URLSearchParams();
			let tabName = w2ui.layout_main_tabs.active;
			paramURL.set('tab', tabName);
			let tags = mt.server.c_w2grid.getSearchData('tags');
			if (tags != null)
				paramURL.set('tag', tags.value);
			URL += '?' + paramURL.toString();
			if (window.location.hash)
				URL += decodeURIComponent(window.location.hash);

			// Tự động copy
			if (window.isSecureContext) {
				await navigator.clipboard.writeText(URL);
				mt.show.toast('success', 'Đã copy link chia sẻ');
			}
			else {
				console.log(URL);
				mt.show.toast('warning', 'Chưa cấp quyền truy cập bộ nhớ đệm! Lấy link trong console.');
			}
		},
		btnLink(serverId) {
			let server = this.d_map[serverId];
			window.open('http://' + server.url, '_blank');
		},
		btnTag(tag) {
			this.c_w2grid.search([{ field: 'tags', value: tag, operator: 'contains' }], 'AND');
		},
	},
	chat: {
		m_init: false,
		e_contain: null,

		async init() {
			
			// Import Library
			// await mt.lib.import(['SimpleMDE','marked','mermaid']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'chat-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `<textarea id="chat-editor"></textarea>`;

		},
	},
	markdown: {

		/**
		 * https://github.com/sparksuite/simplemde-markdown-editor
		 */

		m_init: false,
		e_contain: null,

		async init() {
			
			// Import Library
			let isNeedInitMermaid = !mt.lib.mermaid.init;
			await mt.lib.import(['SimpleMDE','marked','mermaid']);

			if (isNeedInitMermaid) {
				mermaid.initialize({
					startOnLoad: false,
					theme: 'default'
				});
			}

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'markdown-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `<textarea id="markdown-editor"></textarea>`;

			// Init marked
			const renderer = new marked.Renderer();
			renderer.code = (params) => {
				// Kiểm tra nếu ngôn ngữ của khối mã là 'mermaid'
				if (params.lang === 'mermaid')
					return '<div class="mermaid">' + params.text + '</div>';
				// Đối với các loại mã khác, sử dụng renderer mặc định của Marked.js
				return '<pre><code class="' + params.lang + '">' + params.text + '</code></pre>';
			};
			marked.setOptions({ renderer: renderer });

			// Init SimpleMDE
			let toggleState = false;
			this.m_editor = new SimpleMDE({
				element: document.getElementById("markdown-editor"),
				spellChecker: false,
				status: false,
				tabSize: 4,
				toolbar: [
					'bold','italic','strikethrough','|',
					'heading-1','heading-2','heading-3','|',
					'code','quote','unordered-list','ordered-list','clean-block','|',
					'link','image','table','horizontal-rule','|',
					{ name: "mermaid", title: "Insert Mermaid Diagram", className: "fa fa-area-chart", action: (editor) => {

						toggleState = !toggleState; // Đảo trạng thái

						// // Ví dụ: thay đổi nội dung hoặc style theo trạng thái
						// if (toggleState) {
						// 		editor.codemirror.setOption("theme", "monokai"); // bật theme tối
						// 		alert("Toggle ON");
						// } else {
						// 		editor.codemirror.setOption("theme", "default"); // tắt
						// 		alert("Toggle OFF");
						// }

						// // Cập nhật icon / style của nút trên toolbar
						// let toolbarButton = editor.toolbarElements.mermaid;
						// if (!toolbarButton)
						// 	return;

						// if (toggleState)
						// 	toolbarButton.classList.add("active");
						// else
						// 	toolbarButton.classList.remove("active");

						editor.codemirror.replaceSelection('```mermaid\ngraph TD;\n    A-->B;\n```\n');
					}},'|',
					'preview','side-by-side','fullscreen','|',
					'guide',
				],
				previewRender: (plainText, preview) => {
					preview.innerHTML = marked.parse(plainText);
					setTimeout(() => mermaid.run({ querySelector: '.mermaid' }), 0);
					return preview.innerHTML;
				},
			});

		},
	},
	midi: 'ext',
	image: {
		m_init: false,
		e_contain: null,
		c_canvas: null,

		async init() {

			// Import Library
			await mt.lib.import(['fabricjs']);
			
			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'image-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			let canvasElm = document.createElement('canvas');
			canvasElm.style.width = '100%';
			canvasElm.style.height = '100%';
			canvasElm.style.border = '1px solid #000';
			this.e_contain.appendChild(canvasElm);

			// Init Fabric
			this.c_canvas = new fabric.Canvas(canvasElm);
			const helloWorld = new fabric.FabricText('Hello world!', {
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
			this.c_canvas.add(helloWorld);
			this.c_canvas.centerObject(helloWorld);

		},
		getImage() {
			return this.c_canvas.toDataURL();
		}
	},
	diagram: {
		m_init: false,
		e_contain: null,
		
		async init() {

			// Import Library
			await mt.lib.import(['CodeMirror']);
			await mt.lib.import(['CodeMirror-md',]);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'diagram-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `
				<textarea id="diagram-input" rows="10" cols="60"></textarea>
				<br>
				<button onclick="mt.diagram.renderABC()">Render</button>
				<br>
				<div id="diagram-audio"></div>
				<br>
				<div id="diagram-notation"></div>
			`.trim().split('\n').map(v=>v.trim()).join('\n');

			// Init Editor
			let textarea = document.getElementById('diagram-input');
			this.m_editor = CodeMirror.fromTextArea(textarea, {
				mode: 'markdown',
				lineNumbers: true,
				lineWrapping: true,
				// extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
				foldGutter: true,
				gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
			});
			this.setCode(`
				# Header 1
				## Header 2
				* Wat
					- tree1
					- tree2
					- tree3
				- [ ] TODO 1
				- [ ] TODO 2
			`.trim().split('\n').map(v=>v.trim()).join('\n'));
		},
		setCode(code) {
			this.m_editor.setValue(code);
		},
		getCode() {
			return this.m_editor.getValue();
		},
	},
	sheet: {

		/**
		 * http://localhost:958/manager3/?tab=sheet&file=D:/Projects/MtClient/res/private/contacts.csv
		 * https://github.com/myliang/x-spreadsheet
		 * https://www.npmjs.com/package/x-data-spreadsheet
		 */

		m_init: false,
		c_sheet: null, // x_spreadsheet
		e_contain: null,
		d_dataText: '',
		d_dataParse: '',
		d_dataObj: [],
		
		async init() {

			// Import Library
			// xspreadsheet (x_spreadsheet): UI
			// papaparse (Papa): CSV Format
			await mt.lib.import(['xspreadsheet','papaparse']);

			// Fix CSS
			for (let sheet of document.styleSheets) {
				if (sheet.href.includes('xspreadsheet')) {
					
					for (let rule of sheet.cssRules) {
						if (rule.selectorText == '.x-spreadsheet-toolbar, .x-spreadsheet-bottombar') {
							rule.style.padding = '';
							break;
						}
					}

					break;
				}
			}

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'sheet-contain';
			this.e_contain.style.height = '100%';
			this.e_contain.style.weight = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			// Init Sheet
			// const rows10 = { len: 1000 };
			// for (let i = 0; i < 1000; i += 1) {
			// 	rows10[i] = {
			// 		cells: {
			// 			0: { text: 'A-' + i },
			// 			1: { text: 'B-' + i },
			// 			2: { text: 'C-' + i },
			// 			3: { text: 'D-' + i },
			// 			4: { text: 'E-' + i },
			// 			5: { text: 'F-' + i },
			// 		}
			// 	};
			// }
			// const rows = {
			// 	len: 80,
			// 	1: {
			// 		cells: {
			// 			0: { text: 'testingtesttestetst' },
			// 			2: { text: 'testing' },
			// 		},
			// 	},
			// 	2: {
			// 		cells: {
			// 			0: { text: 'render', style: 0 },
			// 			1: { text: 'Hello' },
			// 			2: { text: 'haha', merge: [1, 1] },
			// 		}
			// 	},
			// 	8: {
			// 		cells: {
			// 			8: { text: 'border test', style: 0 },
			// 		}
			// 	}
			// };
			
			// x_spreadsheet.locale('zh-cn');
			
			let saveIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTc3MTc3MDkyOTg4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI2NzgiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTIxMy4zMzMzMzMgMTI4aDU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMgODUuMzMzMzMzdjU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMgODUuMzMzMzMzSDIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMtODUuMzMzMzMzVjIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMtODUuMzMzMzMzeiBtMzY2LjkzMzMzNCAxMjhoMzQuMTMzMzMzYTI1LjYgMjUuNiAwIDAgMSAyNS42IDI1LjZ2MTE5LjQ2NjY2N2EyNS42IDI1LjYgMCAwIDEtMjUuNiAyNS42aC0zNC4xMzMzMzNhMjUuNiAyNS42IDAgMCAxLTI1LjYtMjUuNlYyODEuNmEyNS42IDI1LjYgMCAwIDEgMjUuNi0yNS42ek0yMTMuMzMzMzMzIDIxMy4zMzMzMzN2NTk3LjMzMzMzNGg1OTcuMzMzMzM0VjIxMy4zMzMzMzNIMjEzLjMzMzMzM3ogbTEyOCAwdjI1NmgzNDEuMzMzMzM0VjIxMy4zMzMzMzNoODUuMzMzMzMzdjI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjcgNDIuNjY2NjY3SDI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjctNDIuNjY2NjY3VjIxMy4zMzMzMzNoODUuMzMzMzMzek0yNTYgMjEzLjMzMzMzM2g4NS4zMzMzMzMtODUuMzMzMzMzeiBtNDI2LjY2NjY2NyAwaDg1LjMzMzMzMy04NS4zMzMzMzN6IG0wIDU5Ny4zMzMzMzR2LTEyOEgzNDEuMzMzMzMzdjEyOEgyNTZ2LTE3MC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjctNDIuNjY2NjY3aDQyNi42NjY2NjZhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjcgNDIuNjY2NjY3djE3MC42NjY2NjdoLTg1LjMzMzMzM3ogbTg1LjMzMzMzMyAwaC04NS4zMzMzMzMgODUuMzMzMzMzek0zNDEuMzMzMzMzIDgxMC42NjY2NjdIMjU2aDg1LjMzMzMzM3oiIHAtaWQ9IjI2NzkiIGZpbGw9IiMyYzJjMmMiPjwvcGF0aD48L3N2Zz4='
			let previewEl = document.createElement('img')
			previewEl.src = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjIxMzI4NTkxMjQzIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjU2NjMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj48L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNNTEyIDE4Ny45MDRhNDM1LjM5MiA0MzUuMzkyIDAgMCAwLTQxOC41NiAzMTUuNjQ4IDQzNS4zMjggNDM1LjMyOCAwIDAgMCA4MzcuMTIgMEE0MzUuNDU2IDQzNS40NTYgMCAwIDAgNTEyIDE4Ny45MDR6TTUxMiAzMjBhMTkyIDE5MiAwIDEgMSAwIDM4NCAxOTIgMTkyIDAgMCAxIDAtMzg0eiBtMCA3Ni44YTExNS4yIDExNS4yIDAgMSAwIDAgMjMwLjQgMTE1LjIgMTE1LjIgMCAwIDAgMC0yMzAuNHpNMTQuMDggNTAzLjQ4OEwxOC41NiA0ODUuNzZsNC44NjQtMTYuMzg0IDQuOTI4LTE0Ljg0OCA4LjA2NC0yMS41NjggNC4wMzItOS43OTIgNC43MzYtMTAuODggOS4zNDQtMTkuNDU2IDEwLjc1Mi0yMC4wOTYgMTIuNjA4LTIxLjMxMkE1MTEuNjE2IDUxMS42MTYgMCAwIDEgNTEyIDExMS4xMDRhNTExLjQ4OCA1MTEuNDg4IDAgMCAxIDQyNC41MTIgMjI1LjY2NGwxMC4yNCAxNS42OGMxMS45MDQgMTkuMiAyMi41OTIgMzkuMTA0IDMyIDU5Ljc3NmwxMC40OTYgMjQuOTYgNC44NjQgMTMuMTg0IDYuNCAxOC45NDQgNC40MTYgMTQuODQ4IDQuOTkyIDE5LjM5Mi0zLjIgMTIuODY0LTMuNTg0IDEyLjgtNi40IDIwLjA5Ni00LjQ4IDEyLjYwOC00Ljk5MiAxMi45MjhhNTExLjM2IDUxMS4zNiAwIDAgMS0xNy4yOCAzOC40bC0xMi4wMzIgMjIuNC0xMS45NjggMjAuMDk2QTUxMS41NTIgNTExLjU1MiAwIDAgMSA1MTIgODk2YTUxMS40ODggNTExLjQ4OCAwIDAgMS00MjQuNDQ4LTIyNS42bC0xMS4zMjgtMTcuNTM2YTUxMS4yMzIgNTExLjIzMiAwIDAgMS0xOS44NC0zNS4wMDhMNTMuMzc2IDYxMS44NGwtOC42NC0xOC4yNC0xMC4xMTItMjQuMTI4LTcuMTY4LTE5LjY0OC04LjMyLTI2LjYyNC0yLjYyNC05Ljc5Mi0yLjQ5Ni05LjkyeiIgcC1pZD0iNTY2NCI+PC9wYXRoPjwvc3ZnPg=='
			previewEl.width = 16;
			previewEl.height = 16;

			// Init x-spreadsheet
			let xs = x_spreadsheet(this.e_contain, { // '#x-spreadsheet'
				showToolbar: true,
				showGrid: true,
				showBottomBar: true,
				extendToolbar: {
					left: [
						{ tip: 'Save', icon: saveIcon, onClick: (data, sheet) => { console.log('click save button: ', data, sheet) }}
					],
					right: [
						{ tip: 'Preview', el: previewEl, onClick: (data, sheet) => { console.log('click preview button: ', data) }}
					],
				},
				view: {
					height: () => this.e_contain.clientHeight,
					width: () => this.e_contain.clientWidth,// - 60,
				},
			});
				// .loadData([
				// 	{
				// 		freeze: 'B3',
				// 		styles: [
				// 			{
				// 				bgcolor: '#f4f5f8',
				// 				textwrap: true,
				// 				color: '#900b09',
				// 				border: {
				// 					top: ['thin', '#0366d6'],
				// 					bottom: ['thin', '#0366d6'],
				// 					right: ['thin', '#0366d6'],
				// 					left: ['thin', '#0366d6'],
				// 				},
				// 			},
				// 		],
				// 		merges: [
				// 			'C3:D4',
				// 		],
				// 		cols: {
				// 			len: 10,
				// 			2: { width: 200 },
				// 		},
				// 		rows,
				// 	},
				// 	{ name: 'sheet-test', rows: rows10 }
				// ])
				// .change((cdata) => {
				// 	// console.log(cdata);
				// 	console.log('>>>', xs.getData());
				// });

			// xs.on('cell-selected', (cell, ri, ci) => { console.log('cell:', cell, ', ri:', ri, ', ci:', ci); })
			// 	.on('cell-edited', (text, ri, ci) => { console.log('text:', text, ', ri: ', ri, ', ci:', ci); })
			// 	.on('pasted-clipboard', (data) => { console.log('>>>> data is ', data); });

			this.c_sheet = xs;

			// setTimeout(() => {
			// 	// xs.loadData([{ rows }]);
			// 	xs.cellText(14, 3, 'cell-text').reRender();
			// 	console.log('cell(8, 8):', xs.cell(8, 8));
			// 	console.log('cellStyle(8, 8):', xs.cellStyle(8, 8));
			// }, 5000);
			
			// Process Params
			await this.processParams();
		},
		async processParams() {
			let urlParams = new URLSearchParams(window.location.search);
			let filepath = urlParams.get('file');
			if (filepath != null)
				this.load(filepath);
		},
		async load(filepath) {

			// Load file
			this.d_dataText = await mt.file.readFile('text', filepath);

			// Parse
			this.d_dataParse = Papa.parse(this.d_dataText, {
				header: true,          // dùng dòng đầu làm key
				skipEmptyLines: true,  // bỏ qua dòng trống
				dynamicTyping: true    // tự động convert số
			});

			// Tạo col
			let sRowHeader = { cells: {} };
			let colIndex = 0;
			for (let header of this.d_dataParse.meta.fields)
				sRowHeader.cells[colIndex++] = { text: header };

			let sRows = { len: this.d_dataParse.data.length };
				sRows[0] = sRowHeader;

			let rowIndex = 1;
			for (let pRow of this.d_dataParse.data) {
				colIndex = 0;
				let sRow = { cells: {} };

				for (let pCol in pRow) {

					let val = pRow[pCol];
					if (val != null)
						sRow.cells[colIndex] = { text: val };

					colIndex++
				}

				sRows[rowIndex] = sRow;
				rowIndex++;
			}

			// Load to sheet
			this.c_sheet.loadData([{
				cols: { len: this.d_dataParse.meta.fields.length },
				rows: sRows,
			}]);

			// Log
			mt.h_debug && console.log('[mt.sheet.load]', { filepath, csvText: this.d_dataText, results: this.d_dataParse });
		}
	},
	pdf: {
		m_init: false,
		e_contain: null,

		async init() {
			try {

				// Import Library
				await mt.lib.import(['pdfjs']);
				// await mt.lib.import(['pdfjs-viewer']);

				// Add container
				this.e_contain = document.createElement('div');
				this.e_contain.id = 'pdf-contain';
				this.e_contain.style.height = '100%';
				mt.common.e_contain.appendChild(this.e_contain);

				// Import PDF Viewer
				let path = '/lib/pdfjs-5.4.624/web/';
				await mt.lib.loadCSS(path+'viewer.css');
				let objectHtml = {};
				await mtLib.loadHTML(path+'viewer.html', 'html', objectHtml),

				this.e_contain.innerHTML = objectHtml.html;

				// Đợi DOM khởi tạo
				// await new Promise(resolve => {
				// 	const obs = new MutationObserver(() => {
				// 		obs.disconnect();
				// 		resolve();
				// 	});
				// 	obs.observe(this.e_contain, { childList: true, subtree: true });
				// });

				await new Promise(resolve => requestAnimationFrame(resolve)); // Đợi DOM khởi tạo
				// setTimeout(async () => {
				await mtLib.loadJS(path+'viewer.mjs', 'es', 'PDFViewer');
				// }, 2000);

				// Chuyển locate về lib / pdfjs
				// Chọn file từ blob hoặc base64

				// demo: https://mozilla.github.io/pdf.js/web/viewer.html

				// Dùng URL Param để load: http://localhost:958/manager3/?tab=pdf&file=1ZH92G830310976050.pdf

				// Dùng JS
				// PDFViewerApplication.open({url:'/res/pdf/1ZH92G830310976050.pdf'});
				// PDFViewerApplication.open({data:'base64 string .....................'});

				// PDFViewer.PDFViewerApplicationOptions.getAll();
				PDFViewer.PDFViewerApplicationOptions.set('localeProperties', {lang: 'vi'});
				PDFViewer.PDFViewerApplicationOptions.set('viewerCssTheme', 1); // 0: dark, 1: light
				// PDFViewer.PDFViewerApplicationOptions.set('defaultUrl', '/res/pdf/1ZH92G830310976050.pdf');
				PDFViewer.PDFViewerApplicationOptions.set('defaultUrl', '');
				PDFViewer.webViewerLoad();

				// this.e_contain.innerHTML = `
				// 	<canvas id="pdf-canvas"></canvas>
				// `.trim().split('\n').map(v=>v.trim()).join('\n');

				// // Init PDF
				// // const worker = new pdfjsWorker.PDFWorker();
				// // pdfjsLib.GlobalWorkerOptions.workerPort = worker.port;

				// // Load
				// let pdfData = atob(
				// 	'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog' +
				// 	'IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv' +
				// 	'TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K' +
				// 	'Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg' +
				// 	'L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+' +
				// 	'PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u' +
				// 	'dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq' +
				// 	'Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU' +
				// 	'CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu' +
				// 	'ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g' +
				// 	'CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw' +
				// 	'MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v' +
				// 	'dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G');
				// let loadingTask = pdfjsLib.getDocument({data: pdfData});
				// let pdf = await new Promise((resolve, reject) => {
				// 	loadingTask.promise.then((pdf) => resolve(pdf), (reason) => reject(reason));
				// });

				// // Fetch the first page
				// let pageNumber = 1;
				// let page = await pdf.getPage(pageNumber);

				// let scale = 1.5;
				// let viewport = page.getViewport({scale: scale});

				// // Prepare canvas using PDF page dimensions
				// let canvas = document.getElementById('pdf-canvas');
				// let context = canvas.getContext('2d');
				// canvas.height = viewport.height;
				// canvas.width = viewport.width;

				// // Render PDF page into canvas context
				// let renderContext = {
				// 	canvasContext: context,
				// 	viewport: viewport
				// };
				
				// let renderTask = page.render(renderContext);
				// await new Promise((resolve, reject) => {
				// 	renderTask.promise.then(() => resolve(), (reason) => reject(reason));
				// });

			// Process Params
				await this.processParams();
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.pdf.init]', ex);
			}
		},
		async processParams() {
			let urlParams = new URLSearchParams(window.location.search);
			let filepath = urlParams.get('filepath');
			if (filepath != null) {
				// filepath=C:/Users/Admin/Downloads/doc/6_phieu_trinh_to_trinh_du_kien_ket_qua_chi_tieu_nam_2024_cum_thi_dua_5_tp_signed.pdf

				// Load file
				let blob = await mt.file.readFile('blob', filepath);
				let pdfData = await blob.arrayBuffer();
				PDFViewer.PDFViewerApplication.open({data: pdfData});
				
			}
		},
	},
	gallery: {
		h_pathWallpaper: '', // Link folder on Server
		h_pathDB: '/res/DB/image.json', // Link Data Client
		m_init: false,
		d_wallpaper: [], // List Image
		c_modal: null, // tingle
		c_form: null, // jsoneditor
		e_contain: null,
		
		async init() {

			// Import Library
			await mt.lib.import(['nanogallery2','tingle','jsonEditor']);
			// <link href="/lib/sweetalert2-11.22.4/sweetalert2.css" rel="stylesheet" type="text/css">
			// <script src="/lib/sweetalert2-11.22.4/sweetalert2.all.min.js" type="text/javascript"></script>
			// <script src="/lib/splitjs/split.min.js"></script>

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'gallery-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `
				<div id="gallery-nanogallery2"></div>
			`.trim().split('\n').map(v=>v.trim()).join('\n');

			// Read config
			this.h_pathWallpaper = await mt.core.config('PATH_WALLPAPER');

			// First load
			this.d_wallpaper = await mt.file.loadJson(this.h_pathDB);
			for (let i=0; i<this.d_wallpaper.length; i++) {
				let img = this.d_wallpaper[i];
				img.id = i+1; // Bổ sung Id
			}

			// Tạo list ảnh cho nanogallery2
			let listItem = [];
			for (let i=0; i<this.d_wallpaper.length; i++) {
				let img = this.d_wallpaper[i];
				listItem.push({
					ID: i+1+'',
					src: img.name,
					srct: img.name,
					title: img.name,
					kind: 'image',
					// tags: img.tags != null ? img.tags.join(',') : '',
					customData: Object.assign({
						name: '',
						tags: [],
						rate: 3,
					}, img),
				});
			}

			// Init Nano Gallery 2
			$('#gallery-nanogallery2').nanogallery2({

				// Data
				itemsBaseURL: `/file/static?folder=${this.h_pathWallpaper}&file=`,
				items: listItem,

				// Gallery
				galleryDisplayMode: 'fullContent',
				gallerySorting: 'random',
				galleryTheme : { 
					thumbnail: { titleShadow : 'none', titleColor: '#fff', borderColor: '#fff' },
					navigationBreadcrumb: { background : '#3C4B5B' },
					navigationFilter: { background : '#003C3F', backgroundSelected: '#2E7C7F', color: '#fff' }
				},

				// Thumbnail
				thumbnailWidth: 'auto',
				thumbnailHeight: 150,
				thumbnailDisplayTransition: 'scaleDown',
				thumbnailHoverEffect2: 'scale120',
				thumbnailToolbarImage: { topLeft:'', topRight: 'custom1', bottomLeft: '', bottomRight: ''},

				// Filter
				galleryFilterTags: true,
				galleryFilterTagsMode: 'multiple',
				// galleryFilterTagsMode: 'multi',

				// Toolbar
				viewerTools: {
					topLeft: 'previousButton, pageCounter, nextButton, playPauseButton',
					topRight: 'custom1, zoomButton, rotateLeft, rotateRight, fullscreenButton, closeButton',
				},
				viewerToolbar: {
					display: true,
					standard: 'minimizeButton, label',
					minimized: 'minimizeButton, label, shareButton, shoppingcart, linkOriginalButton, downloadButton, infoButton, ',
				},

				// Icons
				icons: {
					thumbnailCustomTool1: '<i class="fa-regular fa-pen-to-square"></i>',
					viewerCustomTool1: '<i class="fa-regular fa-pen-to-square"></i>',
				},

				// Event
				fnThumbnailToolCustAction: (toolCode, item) => {
					switch (toolCode) {
						case 'custom1':
							mt.gallery.openForm(item);
							break;
					}
					mt.h_debug && console.log('[mt.gallery.init.fnThumbnailToolCustAction]', { toolCode, item });
				},
				fnImgToolbarCustClick: (toolCode, element, item) => {
					switch (toolCode) {
						case 'custom1':
							mt.gallery.openForm(item);
							break;
					}
					mt.h_debug && console.log('[mt.gallery.init.fnImgToolbarCustClick]', { toolCode, element, item });
				},
				// viewerToolbar: {
				// 	standard:  'minimizeButton, previousButton, pageCounter, nextButton, playPauseButton, fullscreenButton, closeButton',
				// 	// thêm custom button của bạn
				// 	custom: '<a class="nGY2ViewerCustomBtn" title="Tải về"><i class="fa fa-download"></i></a>'
				// },
				// fnViewerToolbar: ($customElement, item, data) => {
				// 	$customElement.filter('.nGY2ViewerCustomBtn').on('click', e => {
				// 		e.preventDefault();
				// 		alert('Bạn vừa click custom button cho: ' + item.title);
				// 		// ở đây bạn có thể viết code download, share, like...
				// 	});
				// }
			});
			
			// Init popup - tingle
			this.c_modal = new tingle.modal({
				footer: false,
				stickyFooter: false,
				closeMethods: ['button', 'escape'], // 'overlay'
				closeLabel: 'Đóng',
				onOpen: function() {
					// console.log('modal opened');
				},
				onClose: function() {
					// console.log('modal closed');
				},
				beforeClose: function() {
					// Return true to close the modal, false to prevent closing
					return true;
				},
			});

			// Contain Form
			const elementForm = document.createElement('div');
			elementForm.style.width = '500px';
			// this.c_modal.modal.style.zIndex = 1004; // Lên trước nanogallery2 - viewer là 1001
			this.c_modal.modalBox.style.width = 'unset'; // Bỏ width gốc
			this.c_modal.modalBoxContent.appendChild(elementForm); // Đặt contain form vào modal

			// Init form - JsonEditor
			mt.lib.jsonEditor.ex.RateRegister();
			mt.lib.jsonEditor.ex.TagBoxRegister();
			this.c_form = new JSONEditor(elementForm, {
				use_name_attributes: false,
				theme: 'barebones',
				iconlib: 'fontawesome5',
				disable_edit_json: true,
				disable_properties: true,
				disable_collapse: true,
				schema: {
					title: 'Wallpaper',
					type: 'object',
					required: ['name', 'tags', 'rate'],
					properties: {
						'id': { type: 'integer', format: 'hidden', options: { titleHidden: true } },
						'name': { title: 'Name', type: 'string', format: 'text', minLength: 0 },
						'tags': { title: 'Tags', type: 'array', format: 'tagbox', items: { type: 'string' } },
						'rate': { title: 'Rate', type: 'integer', format: 'rate', default: 3 },
						'btn_save': { title: 'Save', type: 'string', format: 'button', options: { button: { icon: 'save', action: () => this.saveForm() }}},
						'btn_cancel': { title: 'Cancel', type: 'string', format: 'button', options: { button: { icon: 'close', action: () => this.c_modal.close() }}},
					}
				},
			});
		},
		async openForm(item) {

			// Clone
			let formData = JSON.parse(JSON.stringify(item.customData));

			// Set form data
			this.c_form.setValue(formData);
			
			// Open Modal
			this.c_modal.open();

			// Log
			mt.h_debug && console.log('[mt.gallery.openForm]', { item, formData });
		},
		async saveForm() {
			try {

				// Lấy data form
				let formData = this.c_form.getValue();
				let id = formData.id;

				// // Lưu và cập nhật UI
				// if (id == -1) { // Add event
				// 	let newid = this.d_events[year].length;
				// 	formData.id = newid;

				// 	this.d_events[year].push(formData);

				// 	this.c_calendar.addEvent({
				// 		id: id,
				// 		title: formData.name,
				// 		start: formData.date,
				// 		extendedProps: formData,
				// 	});
				// }
				// else { // Update event
				// 	// let oldData = this.d_events[year][id-1];
				// 	this.d_events[year][id-1] = formData;

				// 	let event = this.c_calendar.getEventById(id);
				// 	event.setProp('title', formData.name);
				// 	for (let prop in formData) {
				// 		if (prop == 'id' || prop == 'date')
				// 			continue;
				// 		event.setExtendedProp(prop, formData[prop]);
				// 	}
				// }

				// // Save data
				// let urlDB = '/' + this.h_pathDB + year + '.json';
				// let cloneData = JSON.parse(JSON.stringify(this.d_events[year]));
				// for (let event of cloneData) {
				// 	delete event.id;
				// 	delete event.year;
				// }
				// await mt.file.saveJson(urlDB, cloneData);

				// Toast
				mt.show.toast('success', 'Đã lưu lịch.');

				// Close modal
				this.c_modal.close();

				// Log
				mt.h_debug && console.log('[mt.saveForm.saveForm]', { formData });
			}
			catch (ex) {
				mt.show.toast('error', 'Dữ liệu nhập chưa hợp lệ!');
				console.error('[mt.gallery.saveForm] Exception:', ex);
			}
		},
	},
	pivot: {
		m_init: false,
		e_contain: null,

		async init() {

			// Import library
			await mt.lib.import(['jquery-ui', 'd3', 'c3']);
			await mt.lib.import(['pivottable']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'pivot-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `
				<div id="pivot-table"></div>
			`.trim().split('\n').map(v=>v.trim()).join('\n');

			// Init Pivot Table
			$('#pivot-table').pivotUI([
				{color: 'blue', shape: 'circle'},
				{color: 'red', shape: 'triangle'}
			], {
				rows: ['color'],
				cols: ['shape']
			});
		},
	},
	math: {

		/**
		 * https://www.mathjax.org/
		 * https://mauriciopoppe.github.io/function-plot/
		 */

		m_init: false,
		d_wallpaper: [], // List Image
		c_modal: null, // tingle
		c_form: null, // jsoneditor
		e_contain: null,
		
		async init() {

			// Config library
			window.MathJax = {
				options: {
					enableMenu: false, // tắt menu context nếu muốn
				},
				loader: {
					load: ['input/tex', 'output/chtml'], // chỉ load những gói cần thiết
				},
				a11y: {
					speech: false // tắt speech extension để không load speech-worker.js
				}
			};

			// Import Library
			await mt.lib.import(['mathjs','mathjax','function-plot']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'math-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `
				<div class="input-group">
					<span class="input-group-text">With textarea</span>
					<textarea class="form-control" aria-label="With textarea"></textarea>
				</div>
				
				<span>Markdown biểu thức</span>
				<br>
				<p id="math-recipe"></p>

				<input id="math-input" type="text" />
				<button id="math-btn">Tính</button>
				<div id="math-result"></div>

				<br>
				<br>
				<br>
				<div id="math-quadratic"></div>
			`.trim().split('\n').map(v=>v.trim()).join('\n');


			// Render biểu thức
			let recipeCaculator = document.getElementById('math-recipe');
			recipeCaculator.innerHTML = `
				When \\(a \\ne 0\\), there are two solutions to \\(ax^2 + bx + c = 0\\) and they are
				\\[x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.\\]
			`;

			MathJax.typesetPromise([recipeCaculator]).then(() => {
				console.log("Render hoàn tất!");
			}).catch((err) => console.log(err.message));


			// Tính toán
			let ipCaculator = document.getElementById('math-input');
			let btnCaculator = document.getElementById('math-btn');
			let resCaculator = document.getElementById('math-result');

			ipCaculator.value = '2 * (9 - 3)';

			btnCaculator.addEventListener('click', () => {
				let text = ipCaculator.value;
				let result = math.evaluate(text);
				resCaculator.innerHTML = result;
			});


			// Đồ thị hàm số
			functionPlot({
				target: '#math-quadratic',
				tip: {
					xLine: true, // dashed line parallel to y = 0
					yLine: true, // dashed line parallel to x = 0
					renderer: function (x, y, index) {
						// the returning value will be shown in the tip
					}
				},
				data: [
					{ fn: 'x^2' },
					{ fn: 'x', skipTip: true },
				]
			})
		},
	},
	qrcode: {
		m_init: false,
		e_contain: null,

		async init() {

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'qrcode-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `
				QRCode
			`.trim().split('\n').map(v=>v.trim()).join('\n');

		},
	},
	minesweeper: {
		enum: {
			NONE: -1,
			MINE: 9,
			FLAG: 10
		},
		h_skin: "/res/game/minesweeper",
		e_contain: null,
		m_init: false,
		m_width: 16,
		m_height: 16,
		m_mine: 50,
		m_opened: 0,
		m_help: 5,
		m_map: [],

		async init() {

			// Import Library

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'minesweeper-contain';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `
				<div id="minesweeper-tool">
					<!-- #TODO -->
				</div>
				<div id="minesweeper-content-bound">
					<div id="minesweeper-content" oncontextmenu="return false;" style="margin:auto"></div>
					<div id="minesweeper-content2" style="margin:auto;"></div>
				</div>
			`.trim().split('\n').map(v=>v.trim()).join('\n');

			// Generator
			this.generator();

			// Init Contain
			let html = '<table class="board" style="border-collapse:collapse;border:0;padding:0;line-height:0;margin:auto;"><tbody>';
			for (let h=0; h<this.m_height; h++) {
				html += '<tr>';
				for (let w=0; w<this.m_width; w++) {
					let pos = h * this.m_height + w;
					html += `<td class="cell" style="border:1px #000000 solid;padding:0;margin:0;width:30px;height:30px;background-color:#ffffff;">`;
					html += `<img alt="" id="minesweeper-c${pos}" src="${this.h_skin}/cell.png"`;
					html += ' onmousedown="return mt.minesweeper.cellClick(event)"';
					html += '></td>';
				}
				html += '</tr>';
			}
			html += '</tbody></table>';

			let contentElm = document.querySelector('#minesweeper-content');
			contentElm.innerHTML = html;
		},
		generator() {

			// Fill default data to map
			this.m_map = new Array(this.m_height * this.m_width).fill().map( u => { return {
				type: -1,
				mine: false,
				flag: false
			}; });

			// Fill mine
			let mineNum = 0;
			while (mineNum < this.m_mine) {
				let pos = Math.floor(Math.random() * this.m_width * this.m_height);
				if (!this.m_map[pos].mine) {
					this.m_map[pos].mine = true;
					mineNum++;
				}
			}
		},
		quickAction(pos) {
			let nFlag = 0, nMine = 0, nNone = 0;
			this.around(pos, (pos) => {
				let cell = this.m_map[pos];
				if (cell.flag) nFlag++;
				if (cell.mine) nMine++;
				if (cell.type == -1) nNone++;
			});

			if (nMine == nNone) {
				this.around(pos, (pos) => {
					let cell = this.m_map[pos];
					if (cell.type == -1 && cell.flag == false) {
						this.flag(pos);
					}
				});
			}
			else if (nFlag == nMine) {
				this.around(pos, (pos) => {
					let cell = this.m_map[pos];
					if (cell.type == -1 && cell.flag == false) {
						this.openCell(pos);
						if (cell.type == 0) {
							this.expendZone(pos);
						}
					}
				});
			}
		},
		expendZone(pos) {
			let w = pos % this.m_width;
			let h = Math.floor(pos / this.m_width);
			let stack = [
				{w:w-1, h:h-1},
				{w:w-1, h:h  },
				{w:w-1, h:h+1},
				{w:w  , h:h-1},
				{w:w  , h:h+1},
				{w:w+1, h:h-1},
				{w:w+1, h:h  },
				{w:w+1, h:h+1}
			];

			while (stack.length > 0) {

				let coord = stack.pop();
				w = coord.w;
				h = coord.h;

				// Check bounding
				if (w < 0 || w >= this.m_width || h < 0 || h >= this.m_height)
					continue;

				pos = h * this.m_width + w;
				let cell = this.m_map[pos];

				// Nếu chưa mở
				if (cell.type == -1) {
					this.openCell(pos);

					// Nếu là khoảng an toàn thì check xung quanh
					if (cell.type == 0) {
						let lstAround = [
							{w:w-1, h:h-1},
							{w:w-1, h:h  },
							{w:w-1, h:h+1},
							{w:w  , h:h-1},
							{w:w  , h:h+1},
							{w:w+1, h:h-1},
							{w:w+1, h:h  },
							{w:w+1, h:h+1},
						];
						stack = stack.concat(lstAround);
					}
				}
			}
		},
		checkWin() {
			return (this.opened == mt.game.width * mt.game.height - mt.game.mine);
		},
		around(pos, callback) {
			let w = pos % this.m_width;
			let h = Math.floor(pos / this.m_width);
			let lst = [{w:w-1,h:h-1},{w:w-1,h:h},{w:w-1,h:h+1},{w:w,h:h-1},{w:w,h:h+1},{w:w+1,h:h-1},{w:w+1,h:h},{w:w+1,h:h+1}];
			for (let i=0; i<8; i++) {
				w = lst[i].w;
				h = lst[i].h;
				if (w < 0 || h < 0 || w >= this.m_width || h >= this.m_height)
					continue;
				callback(h * this.m_width + w);
			}
		},
		getCell(pos) {
			if (this.m_map[pos].mine)
				return this.enum.MINE;

			let num = 0;
			this.around(pos, (pos) => {
				if (this.m_map[pos].mine)
					num++;
			});
			return num;
		},
		openCell(pos) {
			let cell = this.m_map[pos];
			cell.type = this.getCell(pos);

			if (this.help > 0) {
				if (cell.type == 0)
					this.help = 0;
				else
					this.help--;
				if (cell.type == this.enum.MINE) {
					cell.type = -1;
					this.flag(pos);
					return;
				}
			}

			this.setImage(pos, cell.type);
			this.opened++;
			
			if (cell.type == 9)
				this.lost();
		},
		flag(pos) {
			let cell = this.m_map[pos];
			if (cell.flag) {
				this.setImage(pos, this.enum.NONE);
				cell.flag = false;
			}
			else {
				this.setImage(pos, this.enum.FLAG);
				cell.flag = true;
			}
		},
		win() {
			alert("Win");
		},
		lost() {
			alert('Fail');
		},
		cellClick(event) {
			let pos = parseInt(event.target.id.substring(13));
			let cell = this.m_map[pos];

			if (event.button == 0) {
				if (cell.flag)
					return;

				if (cell.type != this.enum.NONE) {
					if (cell.type > 0 && cell.type < 9)
						this.quickAction(pos);
				}
				else {
					this.openCell(pos);
					if (cell.type == 0) {
						this.expendZone(pos);
					}
				}
				if (this.checkWin())
					this.win();
			}
			else if (event.button == 2) {
				if (cell.type == -1) {
					this.flag(pos);
				}
			}
			
			// cancel event
			// return mt.event.cancel(event);
		},
		setImage(pos, num) {
			let path = this.h_skin + '/';
			switch(num) {
				case -1: path += "cell.png"; break;
				case 0: path += "blank.png"; break;
				case 1: path += "one.png"; break;
				case 2: path += "two.png"; break;
				case 3: path += "three.png"; break;
				case 4: path += "four.png"; break;
				case 5: path += "five.png"; break;
				case 6: path += "six.png"; break;
				case 7: path += "seven.png"; break;
				case 8: path += "eight.png"; break;
				case 9: path += "mine.png"; break;
				case 10: path += "flag.png"; break;
			}
			$('#minesweeper-c'+pos).attr("src", path)
		},
	},

	// Method
	async init() {

		// Bind Global
		globalThis.mt = this;

		// Init
		await this.auth.init();
		await this.show.initToast();

		// Init
		this.common.init();
	},
};
document.addEventListener('DOMContentLoaded', () => mt.init());
