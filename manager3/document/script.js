let mtDocument = {
	h_isShadow: false,
	h_pathDoc: '', // Link folder on Server
	e_contain: null,
	m_init: false,
	m_currentFile: '', // Current reading

	mgr: {
		async init() {

			// Read Config
			mtDocument.h_pathDoc = await mt.api.config('PATH_DOCUMENT');
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
						url: '/api/jstree',
						headers: {
							// 'Authorization': 'Bearer ' + mt.api.getToken(),
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
				let content = await mt.api.fileRead(filepath, 'text');

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

			this.e_content = mtDocument.e_contain.querySelector('#document-content');

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
			this.c_markdown.use(markdownitTaskLists);

			// Init Mermaid
			mermaid.initialize({ startOnLoad: false });

		},
		async load(content) {

			// Replace Image Path
			// let urlGetImg = '/file/read?file=';
			// let curPath = mt.document.m_currentFile;
			// let imgPath = curPath.substring(0, curPath.lastIndexOf('.md')) + '/';
			// content = content.replaceAll('](./', '](' + urlGetImg + imgPath);
			// content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
			// 	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
			// 		return match; // Không thay đổi nếu là URL
			// 	} else {
			// 		// Thay đổi đường dẫn tương đối thành đường dẫn tuyệt đối
			// 		const absolutePath = mt.h_pathDoc + '/' + imagePath;
			// 		return `![${altText}](${absolutePath})`;
			// 	}
			// });

			// Insert Table of Content
			content = '${toc}\n' + content;

			// Convert MD to HTML
			const html = this.c_markdown.render(content);

			// Parse Text HTML to DOM
			const domParser = new DOMParser();
			const mdDom = domParser.parseFromString(html, 'text/html');

			// Process Table of Content
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
			this.processTreeList(elmMdDoc);
			elmMdcontain.appendChild(elmMdDoc);

			// Render Mermaid
			mermaid.run({ querySelector: '.language-mermaid', postRenderCallback: (svgId) => {
				let el = mtDocument.e_contain.querySelector('#'+svgId);
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
						const toggleBtn = document.createElement('span');
						toggleBtn.textContent = '⊖';
						toggleBtn.style.cursor = 'pointer';
						toggleBtn.style.display = 'inline-block';
						toggleBtn.style.marginRight = '4px';

						// Chèn button vào đầu li
						li.prepend(toggleBtn);

						// Xóa text cũ và thêm lại (để tránh trùng lặp)
						const textNode = li.childNodes[1];
						if (textNode && textNode.nodeType === 3) {
							textNode.textContent = text;
						}

						// Thêm sự kiện toggle
						toggleBtn.addEventListener('click', (e) => {
							e.stopPropagation();
							if (toggleBtn.textContent == '⊖') {
								toggleBtn.textContent = '⊕';

								// Collapse Animation
								childOl.style.overflow = 'hidden';
								const sectionHeight = childOl.scrollHeight;
								const anim = childOl.animate([
									{ maxHeight: sectionHeight + 'px', opacity: 1, marginTop: '4.8px', marginBottom: '4.8px' },
									{ maxHeight: '0px', opacity: 0, marginTop: '0', marginBottom: '0' }
								], {
									duration: 300,
									easing: 'ease-in-out',
									fill: 'forwards'
								});
								anim.onfinish = () => {
									childOl.style.display = 'none';
									anim.cancel();
								};
							}
							else {
								toggleBtn.textContent = '⊖';

								// Expand Animation
								childOl.style.display = '';
								const sectionHeight = childOl.scrollHeight;
								const anim = childOl.animate([
									{ maxHeight: '0px', opacity: 0, marginTop: '0', marginBottom: '0' },
									{ maxHeight: sectionHeight + 'px', opacity: 1, marginTop: '4.8px', marginBottom: '4.8px' }
								], {
									duration: 300,
									easing: 'ease-in-out',
									fill: 'forwards'
								});
								anim.onfinish = () => {
									childOl.style.overflow = '';
									anim.cancel();
								};
							}
						});

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
		processTreeList(elmMdDoc) {
			// Tìm tất cả các thẻ <li> có chứa thẻ <ul> con
			elmMdDoc.querySelectorAll('li').forEach(li => {

				const childUl = li.querySelector(':scope > ul');
				if (childUl) {
					// Lấy nội dung text của li (bỏ qua child ul)
					const text = li.childNodes[0]?.textContent?.trim() || '';

					// Tạo button collapse
					const toggleBtn = document.createElement('span');
					toggleBtn.textContent = '⊖';
					toggleBtn.style.cursor = 'pointer';
					toggleBtn.style.display = 'inline-block';
					toggleBtn.style.marginRight = '4px';

					// Chèn button vào đầu li
					li.prepend(toggleBtn);

					// Xóa text cũ và thêm lại (để tránh trùng lặp)
					const textNode = li.childNodes[1];
					if (textNode && textNode.nodeType === 3) {
						textNode.textContent = text;
					}

					// Thêm sự kiện toggle
					toggleBtn.addEventListener('click', function(e) {
						e.stopPropagation();
						const ul = this.parentElement.querySelector(':scope > ul');
						if (ul) {
							if (this.textContent == '⊖') {
								this.textContent = '⊕';

								// Collapse Animation
								ul.style.overflow = 'hidden';
								const sectionHeight = ul.scrollHeight;
								const anim = ul.animate([
									{ maxHeight: sectionHeight + 'px', opacity: 1, marginTop: '4.8px', marginBottom: '4.8px' },
									{ maxHeight: '0px', opacity: 0, marginTop: '0', marginBottom: '0' }
								], {
									duration: 300,
									easing: 'ease-in-out',
									fill: 'forwards'
								});
								anim.onfinish = () => {
									ul.style.display = 'none';
									anim.cancel();
								};
							}
							else {
								this.textContent = '⊖';

								// Expand Animation
								ul.style.display = '';
								const sectionHeight = ul.scrollHeight;
								const anim = ul.animate([
									{ maxHeight: '0px', opacity: 0, marginTop: '0', marginBottom: '0' },
									{ maxHeight: sectionHeight + 'px', opacity: 1, marginTop: '4.8px', marginBottom: '4.8px' }
								], {
									duration: 300,
									easing: 'ease-in-out',
									fill: 'forwards'
								});
								anim.onfinish = () => {
									ul.style.overflow = '';
									anim.cancel();
								};
							}
						}
					});

					// Mặc định mở cấp đầu tiên, đóng các cấp con
					// if (li.closest('li')) {
					// 	childUl.style.display = 'none';
					// 	toggleBtn.textContent = '▶ ';
					// }
				}
			});
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
				// mt.h_debug && console.log('[mt.document.event.onDrop]', { text });
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
			let content = await mt.api.fileRead(filepath, 'text');

			// Render
			await this.content.load(content);

			// Focus fragment
			if (window.location.hash) {
				const targetId = window.location.hash.substring(1);
				const target = mtDocument.e_contain.querySelector(`[id="${targetId}"]`);
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
			let IP = await mt.api.infoIP();
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