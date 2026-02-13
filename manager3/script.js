import { w2ui, w2layout, w2sidebar, w2grid, w2popup, w2alert, w2utils } from 'w2ui';
import mtAuthen from '/common/authen.js';
import mtCore from '/common/core.js';
import mtLib from '/common/lib.js';
import mtFile from '/common/file.js';
import mtCmd from '/common/cmd.js';
import mtShow from '/common/show.js';

/**
 * https://fontawesome.com/v6/search?ic=free-collection
 * https://w2ui.com/web/docs/2.0/w2layout.set
 * https://fullcalendar.io/
 * https://codemirror.net/
 * https://github.com/markdown-it/markdown-it
 * https://www.abcjs.net/
 * https://flatpickr.js.org/examples/#datetime
 */

/** TODO
 * MATH
 * - https://www.mathjax.org/
 */

var mt = {
	h_debug: true,
	auth: mtAuthen,
	core: mtCore,
	lib: mtLib,
	file: mtFile,
	cmd: mtCmd,
	show: mtShow,

	// Module
	common: {
		m_clientPath: '', // Đường dẫn client
		c_w2layout: null,
		e_contain: null,

		async init() {

			// Left Sidebar
			let c_w2sidebar = new w2sidebar({
				name: 'sidebar',
				nodes: [
					{ id: 'manager', text: 'Manager', group: true, expanded: true, nodes: [
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
					{ id: 'editor', text: 'Editor', group: true, expanded: true, nodes: [
						{ id: 'markdown', text: 'Markdown', icon: 'fa-brands fa-markdown' },
						{ id: 'midi', text: 'Midi', icon: 'fa-brands fa-medium' },
						{ id: 'image', text: 'Image', icon: 'fa-solid fa-image' },
						{ id: 'diagram', text: 'Diagram', icon: 'fa-solid fa-diagram-project' },
					]},
					{ id: 'viewer', text: 'Viewer', group: true, expanded: true, nodes: [
						{ id: 'pdf', text: 'PDF', icon: 'fa-regular fa-file-pdf' },
						{ id: 'gallery', text: 'Gallery', icon: 'fa-solid fa-images' },
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
					{ type: 'main', style: 'background-color: #f5fff1', tabs, html: '<div id="contain"><div>' },
					{ type: 'left', size: 150, resizable: true, html: c_w2sidebar },
					{ type: 'right', size: '50%', resizable: true, hidden: true, html: '' },
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
			this.e_contain.id = 'game-contain';
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
		d_list: [],
		m_init: false,
		e_content: null,

		async init() {

			// Add container
			this.e_contain = document.createElement('div');
			this.e_contain.id = 'contact-contain';
			this.e_contain.style.height = '100%';
			this.e_contain.style.padding = '4px';
			mt.common.e_contain.appendChild(this.e_contain);
			
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
			this.c_w2grid.records = this.d_list;
			this.c_w2grid.refresh();
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

			this.d_list = await mt.file.loadJson(this.h_pathDB);

			for (let i=0; i<this.d_list.length; i++) {
				let contact = this.d_list[i];

				contact.id = i+1;
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
						this.openForm({ id: -1, year: curDate.getFullYear(), name: '', date: mt.utils.convert_DateToStr(curDate) });
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
						this.openForm({ id: -1, year: info.view.currentStart.getFullYear(), name: '', date: info.dateStr }); // Dupclick thì thêm sự kiện
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
						'name': { title: 'Name', type: 'string', format: 'text', minLength: 0, options: { autocomplete: 'off' } },
						'date': { title: 'Date', type: 'string', format: 'date', readonly: true, options: { flatpickr: { locale: 'vn', altInput: true, altFormat: 'd.m.Y', dateFormat: 'Y-m-d' }}},
						'time': { title: 'Time', type: 'string', format: 'time', options: { flatpickr: { locale: 'vn', enableTime: true, noCalendar: true, dateFormat: 'H:i', time_24hr: true }}},
						'location': { title: 'Location', type: 'string', format: 'text', options: { autocomplete: 'off' } },
						'btn_map': { title: 'Open Map', type: 'string', format: 'button', options: { button: { icon: 'location-dot', action: () => this.openMap() }}},
						'btn_save': { title: 'Save', type: 'string', format: 'button', options: { button: { icon: 'save', action: () => this.saveForm() }}},
						'btn_cancel': { title: 'Cancel', type: 'string', format: 'button', options: { button: { icon: 'close', action: () => this.c_modal.close() }}},
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

			// Bổ sung location để hiện field
			formData.location = (formData.location == null) ? '' : (formData.location.lat + ', ' + formData.location.lng);
			if (formData.time == null)
				formData.time = '00:00';
			
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

				// Validate
				// if (formData == null || formData.date == null)
				// 	throw 'Chưa chọn ngày!'

				// Process form data
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
				if (formData.time == '00:00')
					delete formData.time;
				
				// Lưu và cập nhật UI
				if (id == -1) { // Add event
					let newid = this.d_events[year].length;
					formData.id = newid;

					this.d_events[year].push(formData);

					this.c_calendar.addEvent({
						id: id,
						title: formData.name,
						start: formData.date,
						extendedProps: formData,
					});
				}
				else { // Update event
					// let oldData = this.d_events[year][id-1];
					this.d_events[year][id-1] = formData;

					let event = this.c_calendar.getEventById(id);
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
		openMap() {
		
			// Lấy data form
			let formData = this.c_form.getValue();
			let year = formData.year;
			let id = formData.id;

			let event = this.d_events[year][id-1];
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
					{ text: 'Show coordinates', callback: () => console.log('showCoordinates') },
					{ text: 'Center map here', callback: () => console.log('centerMap') },
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
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
				// mt.show.toast('success', 'Đã copy link nhạc.');
			}
			else {
				console.log(URL);
				// mt.show.toast('warning', 'Chưa cấp quyền truy cập bộ nhớ đệm! Lấy link trong console.');
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
			this.e_contain.id = 'midi-contain';
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
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
		async open() {
			if (!this.m_init) {
				this.m_init = true;
				await this.init();
			}
			else {
				this.e_contain.style.display = '';
			}
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
