import { w2ui, w2layout, w2sidebar, w2grid, w2popup, w2alert, w2utils } from 'w2ui';
import mtAuthen from '/common/authen.js';

/**
 * https://w2ui.com/web/docs/2.0/w2layout.set
 * https://fullcalendar.io/
 * https://fontawesome.com/v6/search?ic=free-collection
 * https://codemirror.net/
 * https://github.com/markdown-it/markdown-it
 * https://www.abcjs.net/
 */

/** TODO
 * MATH
 * - https://www.mathjax.org/
 */

var mt = {
	h_debug: true,
	p_authen: mtAuthen,

	// Module
	common: {
		m_clientPath: '', // Đường dẫn client
		c_w2layout: null,
		e_contain: null,

		init() {

			// Left Sidebar
			let c_w2sidebar = new w2sidebar({
				name: 'sidebar',
				nodes: [
					{ id: 'entertainment', text: 'Entertainment', group: true, expanded: true, nodes: [
						{ id: 'anime', text: 'Anime', icon: 'fa-brands fa-gratipay' },
						{ id: 'game', text: 'Game', icon: 'fa-solid fa-gamepad' },
						{ id: 'movie', text: 'Movie', icon: 'fa-solid fa-film' },
						{ id: 'manga', text: 'Manga', icon: 'fa-solid fa-book-open' },
					]},
					{ id: 'manager', text: 'Manager', group: true, expanded: true, nodes: [
						{ id: 'document', text: 'Document', icon: 'fa-solid fa-book' },
						{ id: 'contact', text: 'Contact', icon: 'fa-solid fa-address-book' },
						{ id: 'calendar', text: 'Calendar', icon: 'fa-solid fa-calendar-days' },
						{ id: 'server', text: 'Server', icon: 'fa-solid fa-server' },
						{ id: 'account', text: 'Account', icon: 'fa-solid fa-key' },
					]},
					{ id: 'editor', text: 'Editor', group: true, expanded: true, nodes: [
						{ id: 'markdown', text: 'Markdown', icon: 'fa-brands fa-markdown' },
						{ id: 'midi', text: 'Midi', icon: 'fa-brands fa-medium' },
						{ id: 'image', text: 'Image', icon: 'fa-solid fa-image' },
						{ id: 'diagram', text: 'Diagram', icon: 'fa-solid fa-diagram-project' },
					]},
					{ id: 'viewer', text: 'Viewer', group: true, expanded: true, nodes: [
						{ id: 'pdf', text: 'PDF', icon: 'fa-regular fa-file-pdf' },
					]},
				],
				onClick(event) {
					let tabs = w2ui.layout_main_tabs;
					if (tabs.get(event.target)) {
						tabs.click(event.target);
					}
					else {
						tabs.add({ id: event.target, text: event.object.text, closable: true });
						tabs.refresh();
						tabs.click(event.target);
					}
				},
			});

			// Center Tab
			let tabs = {
				active: 'manager',
				tabs: [],
				onClick: (event) => {
					this.resetLayout();
					let module = event.target;
					mt[module].open();
				},
				onClose: () => {
					this.resetLayout();
				}
			};

			// Layout
			this.c_w2layout = new w2layout({
				box: '#layout',
				name: 'layout',
				panels: [
					// { type: 'top', size: 60, html: 'top panel' },
					{ type: 'main', style: 'background-color: #f5fff1', tabs, html: '<div id="contain" style="height:100%"><div>' },
					{ type: 'left', size: 150, resizable: true, html: c_w2sidebar },
					{ type: 'right', size: '50%', resizable: true, hidden: true, html: 'right' },
				]
			});

			this.e_contain = document.getElementById('contain');

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
				let tabs = w2ui.layout_main_tabs;
				tabs.add({ id: tabCode, text: tab.text, closable: true });
				tabs.refresh();
				tabs.click(tabCode);
			}
		},
		resetLayout() {

			// Hide all container
			for (let i = 0; i < this.e_contain.children.length; i++)
				this.e_contain.children[i].style.display = 'none';

			// Hide right panel
			this.c_w2layout.hide('right');
		},
		async loadJson(url) {
			try {

				// Call API
				let response = await fetch(url, { method: 'GET' });
				if (!response.ok) {
					if (response.status == 404)
						{ } // skip
					else
						throw { error: true, message: await response.text() };
				}
				else
					return await response.json() || [];

				return [];
			}
			catch (ex) {
				console.error('[mt.common.loadJson] Exception', ex);
				throw ex;
			}
		},
		async saveJson(filepath, data) {
			try {

				// Authen
				if (mt.p_authen.checkAuthn() == false)
					await mt.p_authen.init();

				// Kiểm tra và lấy client path
				if (this.m_clientPath.length == 0) {
					let response = await fetch('/file/getClientPath', {
						method: 'GET',
						headers: { 'Authorization': 'Bearer ' + mt.p_authen.getToken() },
					});
					if (!response.ok)
						throw { error: true, message: await response.text() };

					this.m_clientPath = await response.text();
				}

				// Call API - Lưu dữ liệu
				let paramURL = new URLSearchParams();
				paramURL.set('file', this.m_clientPath + filepath);
				paramURL.set('force', true);
				let responseSave = await fetch('/file/writeText?' + paramURL.toString(), {
					method: 'POST',
					headers: {
						'Content-Type': 'text/plain',
						'Authorization': 'Bearer ' + mt.p_authen.getToken(),
					},
					body: JSON.stringify(data),
				});
				if (!responseSave.ok) {
					let errorMessage = await responseSave.text();
					// this.toast('error', errorMessage);
					console.error(errorMessage);
					return;
				}
			}
			catch (ex) {
				console.error('[mt.common.saveJson] Exception', ex);
				throw ex;
			}
		},
		async cmd(cmd, path) {
			let response = await fetch('/common/cmd', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + mt.p_authen.getToken(),
				},
				body: JSON.stringify({ path, cmd }),
			});

			if (!response.ok) {
				if (response.status == 404) { } // skip
				else
					throw { error: true, message: await response.text() };
			}
			
			return await response.json();
		},
	},
	lib: {
		async import(libs) {
			let promise = [];
			for (let name of libs) {
				let lib = this[name];

				if (lib.init)
					continue;
				lib.init = true;

				let p = lib.load();
				promise.push(p);
			}
			await Promise.all(promise); // Đơi load toàn bộ
		},
		async loadJS(url, format, lib) {
			let module = null;
			switch (format) {
				case 'es':
					module = await import(url);
					window[lib] = module.default;
					break;
				case 'cjs':
					module = await new Promise((resolve, reject) => {
						const script = document.createElement('script');
						script.src = url;
						script.onload = () => resolve(window[lib]);
						script.onerror = reject;
						document.head.appendChild(script);
					});
					window[lib] = module;
					break;
				default: // umd
					await import(url);
			}
		},
		async loadCSS(url, lib) {
			return new Promise((resolve, reject) => {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = url;
				
				link.onload = () => resolve();
				link.onerror = () => reject(new Error(`Không thể tải CSS từ: ${url}`));
				
				document.head.appendChild(link);
			});
		},
		
		'ABCJS': { init: false, async load() {
			await Promise.all([
				mt.lib.loadCSS('/lib/abcjs/abcjs-audio.css'),
				mt.lib.loadJS('/lib/abcjs/abcjs-basic-min.js'),
				// mt.lib.loadJS('/res/soundfont/marimba-mp3.js'),
			]);
			await mt.lib.loadJS('/lib/abcjs/abcjs-plugin-min.js');
		}},
		'CodeMirror': { init: false, async load() {
			await Promise.all([
				mt.lib.loadCSS('/lib/codemirror5-5.65.18/lib/codemirror.css'),
				mt.lib.loadCSS('/lib/codemirror5-5.65.18/addon/fold/foldgutter.css'),
				mt.lib.loadJS('/lib/codemirror5-5.65.18/lib/codemirror.js'),
			]);
			await Promise.all([
				mt.lib.loadJS('/lib/codemirror5-5.65.18/addon/fold/foldcode.js'),
				mt.lib.loadJS('/lib/codemirror5-5.65.18/addon/fold/foldgutter.js'),
			]);
		}},
		'CodeMirror-md': { init: false, async load() {
			await Promise.all([
				mt.lib.loadJS('/lib/codemirror5-5.65.18/mode/markdown/markdown.js'),
				mt.lib.loadJS('/lib/codemirror5-5.65.18/addon/fold/markdown-fold.js'),
			]);
		}},
		'flatpickr': { init: false, async load() {
			await Promise.all([
				mt.lib.loadCSS('/lib/flatpickr/flatpickr.min.css'),
				mt.lib.loadJS('/lib/flatpickr/flatpickr.min.js'),
			]);
			await mt.lib.loadJS('/lib/flatpickr/l10n/vn.js');
		}},
		'FullCalendar': { init: false, async load() {
			await mt.lib.loadJS('/lib/fullcalendar-6.1.18/index.global.min.js');
		}},
		'highlightjs': { init: false, async load() {
			await Promise.all([
				mt.lib.loadCSS('/lib/highlightjs/default.min.css'),
				mt.lib.loadJS('/lib/highlightjs/highlight.min.js'),
			]);
		}},
		'jsonEditor': { init: false, async load() {
			await Promise.all([
				mt.lib.loadCSS('/lib/mt/json-editor/mt-style.css'),
				mt.lib.loadJS('/lib/json-editor-2.15.2/jsoneditor.min.js'),
			]);
		}},
		'marked': { init: false, async load() {
			await Promise.all([
				mt.lib.loadJS('/lib/marked-16.1.2/marked.umd.js'),
			]);
		}},
		'markdownIt': { init: false, async load() {
			if (window.mermaid == null)
				throw new Error('Import mermaid trước markdownIt');
			await Promise.all([
				mt.lib.loadJS('/lib/markdown-it/markdown-it.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-deflist.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-emoji-light.min.js',),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-emoji.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-footnote.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-ins.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-mark.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-multimd-table.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-sub.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdown-it-sup.min.js'),
				mt.lib.loadJS('/lib/markdown-it/markdownItAnchor.umd.js'),
				mt.lib.loadJS('/lib/markdown-it/markdownItTocDoneRight.umd.js'),
			]);
		}},
		'mermaid': { init: false, async load() {
			await mt.lib.loadJS('/lib/mermaid-11.12.2/mermaid.min.js');
		}},
		'SimpleMDE': { init: false, async load() {
			await mt.lib.loadCSS('/lib/simplemde-1.11.2-0/simplemde.min.css');
			await mt.lib.loadJS('/lib/simplemde-1.11.2-0/simplemde.min.js');
		}},
		'solarLunar': { init: false, async load() {
			await mt.lib.loadJS('/lib/solarlunar-1.0.0/solarLunar.js');
		}},
		'tingle': { init: false, async load() {
			await mt.lib.loadCSS('/lib/tingle/tingle.min.css');
			await mt.lib.loadCSS('/lib/mt/tingle/mt-style.css');
			await mt.lib.loadJS('/lib/tingle/tingle.min.js');
		}},
	},
	utils: {
		convert_DateToStr(date) {
			let pad = (num) => date < 10 ? '0'+num : ''+num;
			return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
		},
	},
	anime: {
		h_pathDB: '/res/DB/anime.json',
		d_list: [],
		c_w2grid: null,
		m_init: false,
		e_contain: null,

		async init() {

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'contain-anime';
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
			this.d_list = await mt.common.loadJson(this.h_pathDB);
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
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
			this.e_contain.id = 'contain-game';
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
				name: 'grid-game',
				recid: 'id',
				show: {
					toolbar: true,
					footer: true,
					lineNumbers: true,
					selectColumn: true,
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
			this.d_list = await mt.common.loadJson(this.h_pathDB);
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
		},
	},
	document: {
		h_pathDB: '/res/DB/document.json',
		c_w2grid: null,
		d_list: [],
		c_markdown: null,
		m_init: false,
		m_docId: null,
		e_contain: null,

		async init() {

			// Import library
			await mt.lib.import(['mermaid']); // Import mermaid trước markdownIt
			await mt.lib.import(['markdownIt', 'highlightjs']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'contain-document';
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
		},
		async load() {
			
			// Call API
			this.d_list = await mt.common.loadJson(this.h_pathDB);

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
				// mt.utils.toast('success', 'Đã copy link nhạc.');
			}
			else {
				console.log(URL);
				// mt.utils.toast('warning', 'Chưa cấp quyền truy cập bộ nhớ đệm! Lấy link trong console.');
			}
		},
		async btnRead(docId) {

			this.m_docId = docId;
			let doc = this.c_w2grid.get(docId);

			// Show right panel
			mt.common.c_w2layout.set('right', { size: '70%' });
			mt.common.c_w2layout.show('right');

			// Load markdown
			let content = await this.loadMarkdown(doc.path);
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
		async loadMarkdown(filepath) {
			try {

				// Check auth
				if (!mt.p_authen.checkAuthn())
					await mt.p_authen.init();

				// ParamsURL
				let params = new URLSearchParams();
				params.set('file', filepath);

				// Call API
				let response = await fetch('/file/read?' + params.toString(), {
					method: 'GET',
					headers: { 'Authorization': 'Bearer ' + mt.p_authen.getToken() },
				});

				if (!response.ok) {
					if (response.status == 404)
						{ } // skip
					else
						throw { error: true, message: await response.text() };
				}
				return await response.text() || '';
			}
			catch (ex) {
				console.error('[mt.document.loadMarkdown] Exception', ex);
				throw ex;
			}
		},
	},
	calendar: {
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
			this.e_contain.id = 'contain-calendar';
			this.e_contain.style.height = '100%';
			this.e_contain.style.padding = '4px';
			mt.common.e_contain.appendChild(this.e_contain);

			// Init Calendar
			this.c_calendar = new FullCalendar.Calendar(this.e_contain, {
				height: 'parent',
				initialView: 'dayGridMonth',
				// initialDate: '2024-12-08', // #DEBUG
				locale: 'vi',
				timeZone: 'Asia/Ho_Chi_Minh',
				// Toolbar
				headerToolbar: {
					left: 'prev,next today',
					center: 'title',
					right: 'addEvent dayGridMonth,timeGridWeek,timeGridDay,listWeek'
				},
				// UI Setting
				firstDay: 1,
				weekNumbers: true,
				businessHours: false, // Sẫm màu 2 ngày cuối tuần
				showNonCurrentDates: false, // Sâm 4màu các ngày ko thuộc tháng
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
					addEvent: { text: 'Thêm', click: () => this.openForm({ id: -1, name: '', date: mt.utils.convert_DateToStr(new Date()) }) },
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
						this.openForm({ id: -1, name: '', date: info.dateStr }); // Dupclick thì thêm sự kiện
					} else this.t_tmp.clickDate = info.dateStr; // Đánh dấu là nhấn vào ngày này
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
			this.c_modal.setContent('<div id="calenar-form" class="json-editor"></div>');

			// Init form - JsonEditor
			// JsonEditorEX.RateRegister();
			// JsonEditorEX.TagBoxRegister();
			const element = document.getElementById('calenar-form');
			element.style.width = '500px';
			element.parentElement.parentElement.style.width = 'unset'; // Bỏ width gốc
			this.c_form = new JSONEditor(element, {
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
						'name': { title: 'Name', type: 'string', format: 'text', minLength: 0, options: { autocomplete: 'off' } },
						'date': { title: 'Date', type: 'string', format: 'date', readonly: true, options: { flatpickr: { locale: 'vn', altInput: true, altFormat: 'd.m.Y', dateFormat: 'Y-m-d' }}},
						'save': { title: 'Save', type: 'string', format: 'button', options: { button: { icon: 'save', action: () => this.saveForm() }}},
						'cancel': { title: 'Cancel', type: 'string', format: 'button', options: { button: { icon: 'close', action: () => this.c_modal.close() }}},
					}
				},
			});
		},
		async open() {
			
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
		},
		async load(year) {

			// Nếu đã có data thì bỏ qua
			if (this.d_events[year] != null)
				return;

			let urlDB = '/' + this.h_pathDB + year + '.json';

			// Call API
			let listEvent = await mt.common.loadJson(urlDB);

			// Auto gen
			if (listEvent.length == 0)
				listEvent = await this.generate(year);

			// Process
			for (let i=0; i<listEvent.length; i++) {
				let event = listEvent[i];
				event.id = i+1; // Bổ sung Id
			}

			// Bind Data
			this.d_events[year] = listEvent;

			// Set into calendar
			this.setEvents(listEvent);

			// Log
			mt.h_debug && console.log('[mt.calendar.load]', { year, listEvent });
		},
		async openForm(formData) {

			// Set form data
			this.c_form.setValue(formData);
			
			// Open Modal
			this.c_modal.open();

			// Log
			mt.h_debug && console.log('[mt.calendar.openForm]', { formData });
		},
		async saveForm() {
			try {

				// Lấy data form
				let formData = this.c_form.getValue();

				// Validate
				// if (formData == null || formData.date == null)
				// 	throw 'Chưa chọn ngày!'

				// Get year
				let year = Number.parseInt(formData.date.substring(0, 4));

				// Lưu và cập nhật UI
				if (formData.id == -1) { // Add event
					let newid = this.d_events[year].length;
					formData.id = newid;

					this.d_events[year].push(formData);

					this.c_calendar.addEvent({
						id: formData.id,
						title: formData.name,
						start: formData.date,
						extendedProps: formData,
					});
				}
				else { // Update event
					// let oldData = this.d_events[year][formData.id-1];
					this.d_events[year][formData.id-1] = formData;

					let event = this.c_calendar.getEventById(formData.id);
					event.setProp('title', formData.name);
					for (let prop in formData) {
						if (prop == 'id' || prop == 'date')
							continue;
						event.setExtendedProp(prop, formData[prop]);
					}
				}

				// Save data
				let urlDB = '/' + this.h_pathDB + year + '.json';
				let cloneData = JSON.parse(JSON.stringify(this.d_events[year]));
				for (let event of cloneData)
					delete event.id;
				await mt.common.saveJson(urlDB, cloneData);

				// Close modal
				this.c_modal.close();

				// Log
				mt.h_debug && console.log('[mt.calendar.saveForm]', { formData });
			}
			catch (ex) {
				// Swal.showValidationMessage("Dữ liệu nhập chưa hợp lệ!");
				console.error('[mt.calendar.saveForm] Exception:', ex);
			}
		},
		async generate(year) { // Tạo data của năm

			// Generate
			let urlDB = '/' + this.h_pathDB + 'gen.json';

			// Call API load
			let listGen = await mt.common.loadJson(urlDB);

			// Gen
			let listEvent = [];
			for (let gen of listGen) {
				switch (gen.type) {
					case 'yearly':
						listEvent.push({ date: year + gen.date.slice(4), name: gen.name });
						break;
					case 'yearly-lunar':
						listEvent.push({ date: this.convert_Lunar2Solar(year + gen.date.slice(4)), name: gen.name });
						break;
				}
			}

			// Lưu lại
			mt.common.saveJson('/' + this.h_pathDB + year + '.json', listEvent);

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
				lstData.push({
					id: event.id,
					title: event.name,
					start: event.date,
					extendedProps: event,
				});
			}
			this.c_calendar.addEventSource(lstData);
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
			this.e_contain.id = 'contain-server';
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

			// Load
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
		},
		async load() {

			this.d_list = await mt.common.loadJson(this.h_pathDB);

			let processNode = (server, id) => {

				// Bổ sung id
				server.id = id;

				// Lấy host và port
				let pathUrl = server.url.split(':');
				server.host = pathUrl[0];
				server.port = +pathUrl[1];
				
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
			}
		},
		async check(host, port) {
			let result = await mt.common.cmd(`nmap -p ${port} ${host}`, [this.h_pathNmap]);
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
				// mt.utils.toast('success', 'Đã copy link nhạc.');
			}
			else {
				console.log(URL);
				// mt.utils.toast('warning', 'Chưa cấp quyền truy cập bộ nhớ đệm! Lấy link trong console.');
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
	markdown: {
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
			this.e_contain.id = 'contain-markdown';
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
		},
	},
	midi: {
		m_init: false,
		e_contain: null,

		async init() {

			// Import Library
			await mt.lib.import(['ABCJS', 'CodeMirror']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'contain-midi';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.e_contain.innerHTML = `
				<textarea id="midi-input" rows="10" cols="60"></textarea>
				<br>
				<button onclick="mt.midi.renderABC()">Render</button>
				<br>
				<div id="midi-audio"></div>
				<br>
				<div id="midi-notation"></div>
			`.trim().split('\n').map(v=>v.trim()).join('\n');

			// Init Editor
			CodeMirror.defineMode('abc', function(config) {
				return {
					token: function(stream) {
						if (stream.match(/[A-Ga-g]/)) return 'abc-note';
						if (stream.match(/\d+\/?\d*/)) return 'abc-duration';
						if (stream.match(/K:[A-G]/)) return 'abc-key';
						if (stream.match(/M:\d+\/\d+/)) return 'abc-meter';
						if (stream.match(/w:.*/)) return 'abc-lyric';
						stream.next();
						return null;
					}
				};
			});

			let textarea = document.getElementById('midi-input');
			this.m_editor = CodeMirror.fromTextArea(textarea, {
				mode: 'abc',
				lineNumbers: true,
				lineWrapping: true,
				// extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
				foldGutter: true,
				gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
			});
			this.setCode(`
				X: 1
				T: Level Two - DJ Striden
				M: 4/4
				L: 1/8
				Q: 1/4=144
				K: Emin
				%%MIDI program 12
				G/2F/2E G/2F/2E|G E B d|d3/2B3/2 e2 z2
				e/2f/2 g/2f/2e g/2f/2e|g a/2 b d'|d'3/2b3/2 e'2 z2
			`.trim().split('\n').map(v=>v.trim()).join('\n'));

			/*
				G/2 F/2 E|G/2 F/2 E|G E|B d|d3/2 B3/2 e2 z2
				e/2 f/2|g/2 f/2 e|g/2 f/2 e|g a/2 b d' d'3/2 b3/2 e'2 z2
			*/

			/*
				|:D2|"Em"EBBA B2 EB|\
						~B2 AB dBAG|\
						"D"FDAD BDAD|\
						FDAD dAFD|
				"Em"EBBA B2 EB|\
						B2 AB defg|\
						"D"afe^c dBAF|\
						"Em"DEFD E2:|
				|:gf|"Em"eB B2 efge|\
						eB B2 gedB|\
						"D"A2 FA DAFA|\
						A2 FA defg|
				"Em"eB B2 eBgB|\
						eB B2 defg|\
						"D"afe^c dBAF|\
						"Em"DEFD E2:|
			*/

			// abcjsEditor = new ABCJS.Editor("midi-input", {
			//   canvas_id: "paper",
			//   warnings_id: "warnings",
			//   synth: {
			//     el: "#audio",
			//     options: { displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true }
			//   },
			//   abcjsParams: {
			//     add_classes: true,
			//     clickListener: clickListener
			//   },
			//   selectionChangeCallback: selectionChangeCallback
			// });

			// Init CSS
			this.initCSS();
		},
		async initCSS() {
			const style = document.createElement('style');
			style.textContent = `
				.abc-note { color: blue; font-weight: bold; }
				.abc-duration { color: green; }
				.abc-key { color: purple; }
				.abc-meter { color: orange; }
				.abc-lyric { color: brown; font-style: italic; }
			`.trim().split('\n').map(v=>v.trim()).join('\n');
			document.head.appendChild(style);
		},
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
		},
		setCode(code) {
			this.m_editor.setValue(code);
		},
		getCode() {
			return this.m_editor.getValue();
		},
		async renderABC() {
			const abcString = this.getCode();

			// Hiển thị bản nhạc
			ABCJS.renderAbc('midi-notation', abcString, {
				responsive: 'resize',
				add_classes: true,
				jazzchords: true,
				drum: 'dddd 76 77 77 77 60 30 30 30',
			});

			// Phát nhạc (MIDI/WebAudio)
			if (ABCJS.synth.supportsAudio()) {
				const synthControl = new ABCJS.synth.SynthController();
				synthControl.load('#midi-audio', null, {
					// soundFontUrl: "/res/soundfont/marimba-mp3.js",
					displayLoop: true,
					displayRestart: true,
					displayPlay: true,
					displayProgress: true,
					displayWarp: true,
					displayClock: true,
				});
				const visualObj = ABCJS.renderAbc('midi-notation', abcString)[0];
				const synth = new ABCJS.synth.CreateSynth();
				synth.init({
					visualObj: visualObj,
					options: {
						// soundFontUrl: "/res/soundfont/marimba-mp3.js",
						soundFontUrl: '/res/soundfont/FluidR3_Salamander_GM/',
						// instruments: ['marimba'],
						// program: 12, // marimba-mp3
						format: 'mp3',
						soundFontVolume: 1.0,
					}
				}).then(() => {
					synthControl.setTune(visualObj, true);
				});
			}
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
			this.e_contain.id = 'contain-diagram';
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
		},
		setCode(code) {
			this.m_editor.setValue(code);
		},
		getCode() {
			return this.m_editor.getValue();
		},
	},

	// Method
	async init() {

		// Bind Global
		window.mt = this;

		// Init
		await this.p_authen.init();

		// Init
		this.common.init();
	},
};
document.addEventListener('DOMContentLoaded', () => mt.init());
