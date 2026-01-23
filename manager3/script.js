import { w2ui, w2layout, w2sidebar, w2grid, w2popup, w2alert, w2utils } from 'w2ui';
import mtAuthen from '/common/authen.js';

/**
 * https://w2ui.com/web/docs/2.0/w2layout.set
 * https://fullcalendar.io/
 * https://fontawesome.com/v6/search?ic=free-collection
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
		
		'ABCJS': { init: false, async load () {
			await Promise.all([
				mt.lib.loadCSS('/lib/abcjs/abcjs-audio.css'),
				mt.lib.loadJS('/lib/abcjs/abcjs-basic-min.js'),
				// mt.lib.loadJS('/res/soundfont/marimba-mp3.js'),
			]);
			await mt.lib.loadJS('/lib/abcjs/abcjs-plugin-min.js');
		}},
		'CodeMirror': { init: false, async load () {
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
		'FullCalendar': { init: false, async load () {
			await mt.lib.loadJS('/lib/fullcalendar-6.1.18/index.global.min.js');
		}},
		'highlightjs': { init: false, async load () {
			await Promise.all([
				mt.lib.loadCSS('/lib/highlightjs/default.min.css'),
				mt.lib.loadJS('/lib/highlightjs/highlight.min.js'),
			]);
		}},
		'markdownIt': { init: false, async load () {
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
		'mermaid': { init: false, async load () {
			await mt.lib.loadJS('/lib/mermaid-11.12.2/mermaid.min.js');
		}},
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
		c_calendar: null,
		e_content: null,

		async init() {

			// Import Library
			await mt.lib.import(['FullCalendar']);

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'contain-calendar';
			this.e_contain.style.height = '100%';
			mt.common.e_contain.appendChild(this.e_contain);

			this.c_calendar = new FullCalendar.Calendar(this.e_contain, {
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
					addEvent: { text: 'Thêm', click: () => mt.form.open(null) },
				},
				// Register Event
				// datesSet: (info) => this.changeDate(info),
				// eventClick: (item) => mt.form.open(item),
				// dateClick: () => this.dateClick(),
			});

			this.c_calendar.render();

			// Load data
			let year = new Date().getFullYear();
			await this.load(year);
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

			let urlDB = '/' + this.h_pathDB + year + '.json';

			// Call API
			let listEvent = await mt.common.loadJson(urlDB);

			// Auto gen
			if (listEvent.length == 0)
				listEvent = await this.generate(year);

			this.d_events[year] = listEvent;

			// Set into calendar
			this.setEvents(listEvent);

			// Log
			mt.h_debug && console.log('[mt.calendar.load]', { year, listEvent });
		},
		async generate(year) { // Tạo data của năm

			// Generate
			let urlDB = '/' + this.h_pathDB + 'gen.json';

			// Call API load
			let listGen = await mt.common.loadJson(urlDB);

			// Gen
			let listEvent = [];
			for (let gen of listGen) {
				if (gen.type == 'yearly') {
					listEvent.push({
						date: year + gen.date.slice(4),
						name: gen.name
					});
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
					id: i+1,
					title: event.name,
					start: event.date,
					extendedProps: event,
				});
			}
			this.c_calendar.addEventSource(lstData);
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
