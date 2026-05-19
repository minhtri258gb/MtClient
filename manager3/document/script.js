/**
 * https://fontawesome.com/v6/search?ic=free-collection
 */

let mtDocument = {
	h_isShadow: false,
	h_pathDoc: '', // Link folder on Server
	e_contain: null,
	m_init: false,
	m_currentFile: '', // Current reading

	mgr: {
		async init() {

			// Read Config
			mtDocument.h_pathDoc = await mt.api.config('PATH_DOC');
		},
	},
	tree: {
		h_config: {
			lstSkip: ['Account.md','_Convert_MD_2_DOCX_PDF.bat'],
			lstExt: ['md'],
			type: {
				'folder': { },
				'md': { icon: 'fa-solid fa-book' },
				'html': { icon: '/res/icons/web16.png' },
				'file': { icon: '/res/icons/file16.png' },
			},
		},

		init() {

			// Hiện file nhạy cảm
			if (mt.api.m_username == 'Massan')
				this.h_config.lstSkip.shift(); // bỏ file account khỏi skip

			// JSTree Init
			$('#document-jstree').jstree({
				core: {
					data: {
						url: '/file/jstree',
						headers: {
							'Authorization': 'Bearer ' + mt.api.getToken(),
						},
						dataType: 'json',
						data: (node) => {
							let folder = node.original?.path || mtDocument.h_pathDoc; // Lấy path
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
			$('#document-jstree').on('dblclick', '.jstree-anchor', function(e) {
				e.preventDefault();
				let instance = $.jstree.reference(this);
				let node = instance.get_node(this);
				mtDocument.tree.doubleClick(node);
			});

			// Search
			$('#document-tree-search').on('keypress', (event) => {
				if (event.which === 13)
					$('#document-jstree').jstree('search', $('#document-tree-search').val());
			});
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

			return options;
		},
		async doubleClick(node) { // Nhấn đúp
			if (node.type == 'md') {

				let filepath = node.original.path;

				// Lưu path file hiện tại
				mtDocument.m_currentFile = filepath;

				// Call API - read file
				let content = await mt.file.readFile('text', filepath);

				// Render
				mtDocument.content.load(content);
			}
		},
		getType(filename) { // Lấy type tương ứng trên JsTree
			let pos = filename.indexOf('.');
			let ext = filename.substring(pos+1);

			if (ext == 'md') return 'md';
			else if (ext == 'html') return 'html';

			return 'file';
		},
	},
	content: {
		e_content: null, // Element content
		c_markdown: null, // Lib

		init() {

			this.e_content = document.getElementById('document-content');

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

		},
		async load(content) {

			// Insert Table of Content
			content = '${toc}\n' + content;

			// Convert HTML
			const html = this.c_markdown.render(content);
			const domParser = new DOMParser();
			const mdDom = domParser.parseFromString(html, 'text/html');
			const contentDiv = mdDom.getElementById('mdToC');
			this.processTOC(contentDiv);
			const tocHtml = contentDiv.outerHTML;
			contentDiv.remove();

			// Render
			this.e_content.replaceChildren(); // Xóa toàn bộ DOM con

			const elmMdcontain = document.createElement('div'); // Tạo div layout
			elmMdcontain.classList.add('md-contain');
			this.e_content.appendChild(elmMdcontain);

			const elmMdToc = document.createElement('div'); // Tạo div table of content
			elmMdToc.classList.add('md-toc');
			elmMdToc.appendChild(contentDiv);
			elmMdcontain.appendChild(elmMdToc);

			const elmMdDoc = document.createElement('div'); // Tạo div content
			elmMdDoc.classList.add('md-doc');
			elmMdDoc.append(...mdDom.body.childNodes);
			elmMdcontain.appendChild(elmMdDoc);

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
		processTOC(contentDiv) {

			if (!contentDiv)
				return;

			let fooRecursion = (elmOL) => {
				Array.from(elmOL.children).forEach(li => { // Duyệt li trong ol
					const childOl = li.querySelector('ol'); // Tìm nhánh con
					if (childOl) { // Nếu có nhánh con

						// Thêm button collapse / expend
						const btn = document.createElement('button');
						btn.innerHTML = '<i class="fa-solid fa-minus"></i>';
						btn.style.padding = '0 1px';
						btn.style.marginLeft = '4px';

						// Event ẩn hiện
						btn.addEventListener('click', () => {
							if (childOl.style.display === 'none') {
								childOl.style.display = 'block';
								btn.innerHTML = '<i class="fa-solid fa-minus"></i>';
							}
							else {
								childOl.style.display = 'none';
								btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
							}
						});

						// Thêm button vào DOM
						li.insertBefore(btn, childOl);

						// Đệ quy xử lý nhánh con
						fooRecursion(childOl);
					}
				});
			}

			// Start with root
			const childOl = contentDiv.querySelector('ol');
			if (childOl)
				fooRecursion(childOl);
		},
	},
	event: {

		// Global
		async onDrop(e) {
			try {

				const blobs = e.dataTransfer.files;
				if (blobs.length == 0)
					return;

				const blob = blobs[0];
				const content = await blob.text();

				// Bỏ path vì drop ko nhận đc filepath
				mtDocument.m_currentFile = '';

				// Render
				mtDocument.content.load(content);

				// Log
				mt.h_debug && console.log('[mt.document.event.onDrop]', { text });
			}
			catch (ex) {
				console.error('[mt.document.onDrop]', ex);
			}
		},
	},

	async init() {

		// Import library
		await mt.lib.import(['mermaid']); // Import mermaid trước markdownIt
		await mt.lib.import(['markdownIt', 'highlightjs', 'jstree']);

		// Add container
		this.e_contain.id = 'document-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Init Module
		await this.mgr.init();
		await this.tree.init();
		await this.content.init();

		// Process Params
		this.processParams();
	},
	async processParams() {

		let urlParams = new URLSearchParams(window.location.search);
		let filepath = urlParams.get('path');

		if (filepath != null && filepath.length > 0) {

			// Lưu path file hiện tại
			this.m_currentFile = filepath;

			// Call API - read file
			let content = await mt.file.readFile('text', filepath);

			// Render
			await this.content.load(content);

			// Focus fragment
			if (window.location.hash) {
				const targetId = window.location.hash.substring(1);
				const target = document.getElementById(targetId);
				if (target)
					target.scrollIntoView({ behavior: 'smooth' });
			}

		}
	},
	async share() {

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
		paramURL.set('app', 'document');
		if (this.m_currentFile != null)
			paramURL.set('path', this.m_currentFile);
		URL += '?' + paramURL.toString();

		// Thêm hash tag
		if (window.location.hash)
			URL += decodeURIComponent(window.location.hash);

		// Tự động copy
		if (window.isSecureContext) {
			await navigator.clipboard.writeText(URL);
			mt.show.toast('success', 'Đã sao chép liên kết');
		}
		else {
			console.log(URL);
			mt.show.toast('success', 'Đã print console.');
		}
	},
}
export default mtDocument;