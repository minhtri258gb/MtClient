import mtApi from '/common/api.js';
import mtLib from '/common/lib.js';
import mtFile from '/common/file.js';
import mtShow from '/common/show.js';

let mt = {

	api: mtApi,
	lib: mtLib,
	file: mtFile,
	show: mtShow,

	h_debug: true,
	h_pathDoc: '', // Link folder on Server
	m_currentFile: '', // Current reading
	m_content: '', // Nội dung Markdown

	toolbar: {
		async pdf() {
			try {

				// Lấy file name để download
				let filepath = mt.m_currentFile;
				let pos1 = filepath.lastIndexOf('/');
				let pos2 = filepath.lastIndexOf('.md');
				let filename = filepath.substring(pos1+1, pos2);

				// Render PDf
				// const fontBuffer = await fetch('/res/font/OpenSans-Regular.ttf').then((res) => res.arrayBuffer());

				// Get Target Element
				let targets = document.getElementsByClassName('md-doc');
				let target = targets[0];

				// Start Export
				const blob = await dompdf(target, {
					pagination: true,
					format: 'a4',
					pageConfig: {
						header: {
							content: 'Document Header',
							height: 50,
							contentFontSize: 12,
							contentPosition: 'center',
						},
						footer: {
							content: 'Page ${currentPage} / ${totalPages}',
							height: 50,
							contentFontSize: 12,
							contentPosition: 'center',
						},
					},
					// fontConfig: {
					// 	fontFamily: 'Open Sans',
					// 	fontBytes: new Uint8Array(fontBuffer),
					// 	fontStyle: 'normal',
					// 	fontWeight: 400,
					// },
					onProgress(progress) {
						if (progress.stage === 'countingPages' && progress.totalPages) {
							mt.h_debug && console.log(`Total pages: ${progress.totalPages}`);
						}
						if (progress.stage === 'rendering' && progress.currentPage && progress.totalPages) {
							mt.h_debug && console.log(`Rendering page ${progress.currentPage}/${progress.totalPages}`);
						}
					},
				});

				// Download PDF
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `${filename}.pdf`;
				a.click();
				URL.revokeObjectURL(url);
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.toolbar.pdf]', ex);
			}
		},
		async edit() {
			try {
				let state = mt.editor.isShow();

				// Xác nhận Chuyển
				if (state) {
					let isConfirm = await mt.show.alertConfirmDanger('Mở file sẽ mất chỉnh sửa hiện tại! có muốn chuyển ko?', 'Chuyển');
					if (!isConfirm)
						return; // Ko chuyển
				}

				await mt.editor.show(!state);
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.toolbar.edit]', ex);
			}
		},
		async save() {
			try {

				// Nếu chưa mở editor thì bỏ qua
				if (!mt.editor.isShow())
					return;

				// Nếu chưa chọn file thì bỏ qua
				if (mt.m_currentFile.length == 0)
					return;

				let filename = mt.m_currentFile.substring(mt.m_currentFile.lastIndexOf('/')+1);

				// Xác nhận lưu
				let isConfirm = await mt.show.alertConfirmPrimary(`Lưu thay đổi "${filename}" ?`, 'Lưu');
				if (!isConfirm)
					return;

				let content = mt.editor.val(); // Lấy nội dung editor

				// Call API - File Write
				await mt.api.fileWriteText(mt.m_currentFile, content, true);

				mt.m_content = content; // Lưu lại RAM
				await mt.editor.show(false); // Hiện content
				mt.content.load(content); // Reload content

				mt.show.toast('success', `Lưu thành công "${filename}"`); // Thông báo
				mt.h_debug && console.log('[mt.toolbar.save]', { content }); // Log
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.toolbar.save]', ex);
			}
		},
		async share() {
			try {

				// Lấy Port hiện tại
				let URL = location.origin + location.pathname;
				if (URL.indexOf('localhost') > -1) {

					// Call API - Get IP
					if (!mt.m_IP)
						mt.m_IP = await mt.api.infoIP();
					URL = URL.replace('localhost', mt.m_IP);
				}

				// Thêm params query
				let paramURL = new URLSearchParams();
				if (mt.m_currentFile != null)
					paramURL.set('path', mt.m_currentFile);
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
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.toolbar.share]', ex);
			}
		},
	},
	tree: {
		c_tree: null, // Instance JsTree
		h_config: {
			lstSkip: ['Account.md','_Convert_MD_2_PDF.bat'],
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

			// Config
			$.jstree.defaults.search.show_only_matches = true;

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
							let folder = node.original?.path || mt.h_pathDoc; // Lấy path
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
			this.c_tree = $('#document-jstree').jstree(true);

			// Đăng ký sự kiện Double click
			$('#document-jstree').on('dblclick', '.jstree-anchor', function(e) {
				e.preventDefault();
				let instance = $.jstree.reference(this);
				let node = instance.get_node(this);
				mt.tree.doubleClick(node);
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

			if (node.type == 'folder') { // Folder

				options.newFile = {
					label: 'New File',
					icon: '/res/icons/add.png',
					action: async (obj) => {

						let folderpath = node.original.path
						folderpath = folderpath.replaceAll('\\', '/');

						// Input name
						let filename = prompt('Nhập filename');
						filename += '.md';

						let filepath = folderpath + '/' + filename;

						// Call API - File Write
						await mt.api.fileWriteText(filepath, '', true);

						mt.m_content = '';
						mt.m_currentFile = filepath;

						// Reload tree
						this.c_tree.refresh_node(node.id);

						// Bật editor cho file
						mt.editor.show(true);

						// Thông báo
						mt.show.toast('success', `Tạo file "${filename}" thành công.`);

						// Log
						mt.h_debug && console.log('[mt.tree.contextmenu.newFile]', {
							node,
							obj,
							filepath,
						});
					}
				};
			}
			else { // File

				if (node.type == 'md') {
					options.view = {
						label: 'View',
						icon: '/res/icons/eye16.png',
						action: async (obj) => {
							let filepath = node.original.path;
							filepath = filepath.replaceAll('\\', '/');
							mt.m_currentFile = filepath; // Lưu path file hiện tại
							let content = await mt.api.fileRead(filepath, 'text'); // Call API - read file
							mt.content.load(content); // Render
						}
					};
					options.edit = {
						label: 'Edit',
						icon: '/res/icons/edit16.png',
						action: async (obj) => {
							mt.show.toast('warning', 'Chưa hoàn thiện chức năng');
						}
					};
					options.share = {
						label: 'Share',
						icon: '/res/icons/share.png',
						action: async (obj) => {
							let filepath = node.original.path;

							let urlShare = location.origin + location.pathname;
							if (urlShare.indexOf('localhost') > -1) {
								let IP = await mt.api.infoIP();
								urlShare = urlShare.replace('localhost', IP);
							}
							let paramsURL = new URLSearchParams();
							paramsURL.append('path', filepath);
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
						}
					};
				}

			}

			return options;
		},
		async doubleClick(node) { // Nhấn đúp
			if (node.type == 'md') {

				// Chuyển lại giao diện xem nếu đang edit
				if (mt.editor.isShow()) {

					// Xác nhận chuyển
					let isConfirm = await mt.show.alertConfirmDanger('Mở file sẽ mất chỉnh sửa hiện tại! có muốn chuyển ko?', 'Chuyển');
					if (!isConfirm)
						return; // Ko chuyển

					// Hiện content view
					mt.editor.show(false);
				}

				let filepath = node.original.path;
				filepath = filepath.replaceAll('\\', '/');

				// Lưu path file hiện tại
				mt.m_currentFile = filepath;

				// Call API - read file
				mt.m_content = await mt.api.fileRead(filepath, 'text');

				// Render
				mt.content.load(mt.m_content);
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
			this.processImage(elmMdDoc);
			this.processTreeList(elmMdDoc);
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
		processTOC(contentDiv) { // Table of Content

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
		processImage(elmMdDoc) { // Process Path Image

			let posPath = mt.m_currentFile.lastIndexOf('/');
			let filenameNExt = mt.m_currentFile.substring(posPath + 1).replace('.md', '');
			let folder = mt.m_currentFile.substring(0, posPath).replace(mt.h_pathDoc, '');
			let staticImageURL = window.location.origin + '/static/document' + folder + '/images/' + filenameNExt + '/';

			elmMdDoc.querySelectorAll('img').forEach(img => {
				let fileImageName = img.src.replace(window.location.origin + '/', '');
				img.src = staticImageURL + fileImageName;
			});
		},
		processTreeList(elmMdDoc) { // Fold tree list
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
	editor: {
		m_init: false,
		m_isShow: false, // Chế độ edit / view
		e_content: null, // Element content
		c_editor: null, // CodeMirror

		async init() {

			await mt.lib.import([
				'SimpleMDE', // Editor
				'sweetalert2', // Alert
			]);

			this.m_init = true;

			// Element
			this.e_content = document.getElementById('document-edit');

			// Init CodeMirror
			let textareaElm = document.getElementById('editor-md');
			this.c_editor = new SimpleMDE({
				element: textareaElm,
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
				// previewRender: (plainText, preview) => {
				// 	preview.innerHTML = marked.parse(plainText);
				// 	setTimeout(() => mermaid.run({ querySelector: '.mermaid' }), 0);
				// 	return preview.innerHTML;
				// },
			});
		},
		isShow() {
			return this.m_isShow;
		},
		async show(toggle) {
			if (!toggle) { // View
				mt.content.e_content.style.display = '';
				this.e_content.style.display = 'none';

				// mt.editor.c_editor.value()
			}
			else { // Edit

				if (!this.m_init)
					await this.init();

				mt.content.e_content.style.display = 'none';
				this.e_content.style.display = '';

				this.c_editor.value(mt.m_content);
			}
			this.m_isShow = !this.m_isShow;
		},
		val(content) {
			if (content)
				this.c_editor.value(content);
			else
				return this.c_editor.value();
		},
	},
	event: {

		register() {

			// Tự động bỏ hashstring khi click table of content
			window.addEventListener('hashchange', () => {
				setTimeout(() => { history.replaceState(null, null, ' '); }, 10);
			});
		},

		// Global
		async onDrop(e) {
			try {

				const blobs = e.dataTransfer.files;
				if (blobs.length == 0)
					return;

				const blob = blobs[0];
				mt.m_content = await blob.text();

				// Bỏ path vì drop ko nhận đc filepath
				mt.m_currentFile = '';

				// Render
				mt.content.load(mt.m_content);

				// Log
				mt.h_debug && console.log('[mt.document.event.onDrop]', { text });
			}
			catch (ex) {
				console.error('[mt.document.onDrop]', ex);
			}
		},
	},

	async init() {

		// Bind Global
		globalThis.mt = this;

		// Import library
		// mt.lib.component(['FabButton']); // Import Component
		await mt.lib.import(['mermaid']); // Import mermaid trước markdownIt
		await mt.lib.import([
			'markdownIt', // Markdown
			'highlightjs', // Highlight
			'jstree', // Tree
			'toastify', // Toast
			'dompdfjs', // Convert HTML to PDF
		]);

		// Read Config
		this.h_pathDoc = await mt.api.config('PATH_DOCUMENT');

		// Đăng ký static folder
		this.api.fileRegisterStatic('document', mt.h_pathDoc);

		// Init Module
		this.tree.init();
		this.content.init();

		// Event register
		this.event.register();

		// Process Params
		this.processParams();
	},
	async processParams() {

		let urlParams = new URLSearchParams(window.location.search);
		let filepath = urlParams.get('path');

		if (filepath != null && filepath.length > 0) {

			// Lưu path file hiện tại
			filepath = filepath.replaceAll('\\', '/');
			this.m_currentFile = filepath;

			// Call API - read file
			let content = await mt.api.fileRead(filepath, 'text');

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
}
document.addEventListener('DOMContentLoaded', () => mt.init());
