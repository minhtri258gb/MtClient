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
	m_urlStaticImage: '', // URL tải ảnh

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

			// Convert Markdown to HTML
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
			this.processCodeBlock(elmMdDoc);
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
			mt.m_urlStaticImage = window.location.origin + '/static/document' + folder + '/images/' + filenameNExt + '/';

			elmMdDoc.querySelectorAll('img').forEach(img => {
				let fileImageName = img.src.replace(window.location.origin + '/', '');
				img.src = mt.m_urlStaticImage + fileImageName;
				mt.lightbox.bind(img);
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
		processCodeBlock(elmMdDoc) { // Copy clipboard
			elmMdDoc.querySelectorAll('blockquote').forEach((blockquote, index) => {

				// Kiểm tra nếu blockquote đã có nút copy thì bỏ qua
				if (blockquote.querySelector('.copy-btn'))
					return;

				// Tạo container cho blockquote và nút copy
				const wrapper = document.createElement('div');
				wrapper.className = 'blockquote-wrapper';
				wrapper.style.position = 'relative';
				wrapper.style.margin = '1em 0';

				// Tạo nút copy
				const copyBtn = document.createElement('button');
				copyBtn.className = 'copy-btn';
				copyBtn.innerHTML = '📋';
				copyBtn.style.position = 'absolute';
				copyBtn.style.top = '6px';
				copyBtn.style.right = '6px';
				copyBtn.style.padding = '0px 2px';
				copyBtn.style.backgroundColor = '#4a5568';
				copyBtn.style.borderStyle = 'none';
				copyBtn.style.borderRadius = '4px';
				copyBtn.style.cursor = 'pointer';
				copyBtn.style.fontSize = '18px';
				copyBtn.style.zIndex = '10';
				copyBtn.style.opacity = '0.7';
				copyBtn.style.transition = 'opacity 0.2s';

				// Thêm hiệu ứng hover
				copyBtn.addEventListener('mouseenter', () => { copyBtn.style.opacity = '1'; });
				copyBtn.addEventListener('mouseleave', () => { copyBtn.style.opacity = '0.7'; });

				// Xử lý sự kiện copy
				copyBtn.addEventListener('click', async function(e) {
					e.stopPropagation();

					try {
						// Lấy nội dung text từ blockquote
						const textContent = blockquote.textContent;
						await navigator.clipboard.writeText(textContent);
						this.innerHTML = '✅';
					} catch (err) {
						console.error('Copy failed:', err);
						this.innerHTML = '❌';
					}

					// Reset lại nút sau 2 giây
					setTimeout(() => { this.innerHTML = '📋'; }, 2000);
				});

				// Thay thế blockquote bằng wrapper và di chuyển blockquote vào wrapper
				blockquote.parentNode.insertBefore(wrapper, blockquote);
				wrapper.appendChild(blockquote);
				wrapper.appendChild(copyBtn);

				// Điều chỉnh style cho blockquote
				blockquote.style.margin = '0';
				blockquote.style.paddingRight = '80px'; // Tạo khoảng trống cho nút
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
				// 'SimpleMDE', // Editor
				'EasyMDE', // Editor
				'sweetalert2', // Alert
			]);

			this.m_init = true;

			// Element
			this.e_content = document.getElementById('document-edit');

			// Init CodeMirror
			let textareaElm = document.getElementById('editor-md');
			this.c_editor = new EasyMDE({
				element: textareaElm,
				autoDownloadFontAwesome: false, // If set to true, force downloads Font Awesome (used for icons). If set to false, prevents downloading. Defaults to undefined, which will intelligently check whether Font Awesome has already been included, then download accordingly.
				autofocus: true, // If set to true, focuses the editor automatically. Defaults to false.
				// autosave: Saves the text that's being written and will load it back in the future. It will forget the text when the form it's contained in is submitted.
					// enabled: If set to true, saves the text automatically. Defaults to false.
					// delay: Delay between saves, in milliseconds. Defaults to 10000 (10 seconds).
					// submit_delay: Delay before assuming that submit of the form failed and saving the text, in milliseconds. Defaults to autosave.delay or 10000 (10 seconds).
					// uniqueId: You must set a unique string identifier so that EasyMDE can autosave. Something that separates this from other instances of EasyMDE elsewhere on your website.
					// timeFormat: Set DateTimeFormat. More information see DateTimeFormat instances. Default locale: en-US, format: hour:minute.
					// text: Set text for autosave.
				// autoRefresh: Useful, when initializing the editor in a hidden DOM node. If set to { delay: 300 }, it will check every 300 ms if the editor is visible and if positive, call CodeMirror's refresh().
				blockStyles: { // Customize how certain buttons that style blocks of text behave.
					bold: '**', // Can be set to ** or __. Defaults to **.
					code: '```', // Can be set to ``` or ~~~. Defaults to ```.
					italic: '_', // Can be set to * or _. Defaults to *.
				},
				unorderedListStyle: '-', // can be *, - or +. Defaults to *.
				// scrollbarStyle: Chooses a scrollbar implementation. The default is "native", showing native scrollbars. The core library also provides the "null" style, which completely hides the scrollbars. Addons can implement additional scrollbar models.
				// forceSync: If set to true, force text changes made in EasyMDE to be immediately stored in original text area. Defaults to false.
				// hideIcons: An array of icon names to hide. Can be used to hide specific icons shown by default without completely customizing the toolbar.
				indentWithTabs: true, // If set to false, indent using spaces instead of tabs. Defaults to true.
				// initialValue: If set, will customize the initial value of the editor.
				previewImagesInEditor: true, // EasyMDE will show preview of images, false by default, preview for images will appear only for images on separate lines.
				// imagesPreviewHandler: - A custom function for handling the preview of images. Takes the parsed string between the parantheses of the image markdown ![]( ) as argument and returns a string that serves as the src attribute of the <img> tag in the preview. Enables dynamic previewing of images in the frontend without having to upload them to a server, allows copy-pasting of images to the editor with preview.
				imagesPreviewHandler: (imgSrc) => mt.m_urlStaticImage + imgSrc,
				// insertTexts: Customize how certain buttons that insert text behave. Takes an array with two elements. The first element will be the text inserted before the cursor or highlight, and the second element will be inserted after. For example, this is the default link value: ["[", "](http://)"].
				// horizontalRule
				// image
				// link
				// table
				lineNumbers: true, // If set to true, enables line numbers in the editor.
				lineWrapping: false, // If set to false, disable line wrapping. Defaults to true.
				// minHeight: Sets the minimum height for the composition area, before it starts auto-growing. Should be a string containing a valid CSS value like "500px". Defaults to "300px".
				// maxHeight: 'calc(100% - 500px)', // Sets fixed height for the composition area. minHeight option will be ignored. Should be a string containing a valid CSS value like "500px". Defaults to undefined.
				// onToggleFullScreen: A function that gets called when the editor's full screen mode is toggled. The function will be passed a boolean as parameter, true when the editor is currently going into full screen mode, or false.
				// parsingConfig: Adjust settings for parsing the Markdown during editing (not previewing).
					// allowAtxHeaderWithoutSpace: If set to true, will render headers without a space after the #. Defaults to false.
					// strikethrough: If set to false, will not process GFM strikethrough syntax. Defaults to true.
					// underscoresBreakWords: If set to true, let underscores be a delimiter for separating words. Defaults to false.
				// overlayMode: Pass a custom codemirror overlay mode to parse and style the Markdown during editing.
					// mode: A codemirror mode object.
					// combine: If set to false, will replace CSS classes returned by the default Markdown mode. Otherwise the classes returned by the custom mode will be combined with the classes returned by the default mode. Defaults to true.
				// placeholder: If set, displays a custom placeholder message.
				// previewClass: A string or array of strings that will be applied to the preview screen when activated. Defaults to "editor-preview".
				// previewRender: Custom function for parsing the plaintext Markdown and returning HTML. Used when user previews.
				previewRender: (plainText, preview) => {
					preview.innerHTML = mt.content.c_markdown.render(plainText);
					return preview.innerHTML;
				},
				// promptURLs: If set to true, a JS alert window appears asking for the link or image URL. Defaults to false.
				// promptTexts: Customize the text used to prompt for URLs.
					// image: The text to use when prompting for an image's URL. Defaults to URL of the image:.
					// link: The text to use when prompting for a link's URL. Defaults to URL for the link:.
				// iconClassMap: Used to specify the icon class names for the various toolbar buttons.
				// uploadImage: If set to true, enables the image upload functionality, which can be triggered by drag and drop, copy-paste and through the browse-file window (opened when the user click on the upload-image icon). Defaults to false.
				// imageMaxSize: Maximum image size in bytes, checked before upload (note: never trust client, always check the image size at server-side). Defaults to 1024 * 1024 * 2 (2 MB).
				// imageAccept: A comma-separated list of mime-types used to check image type before upload (note: never trust client, always check file types at server-side). Defaults to image/png, image/jpeg.
				// imageUploadFunction: A custom function for handling the image upload. Using this function will render the options imageMaxSize, imageAccept, imageUploadEndpoint and imageCSRFToken ineffective.
				// The function gets a file and onSuccess and onError callback functions as parameters. onSuccess(imageUrl: string) and onError(errorMessage: string)
				// imageUploadEndpoint: The endpoint where the images data will be sent, via an asynchronous POST request. The server is supposed to save this image, and return a JSON response.
				// if the request was successfully processed (HTTP 200 OK): {"data": {"filePath": "<filePath>"}} where filePath is the path of the image (absolute if imagePathAbsolute is set to true, relative if otherwise);
				// otherwise: {"error": "<errorCode>"}, where errorCode can be noFileGiven (HTTP 400 Bad Request), typeNotAllowed (HTTP 415 Unsupported Media Type), fileTooLarge (HTTP 413 Payload Too Large) or importError (see errorMessages below). If errorCode is not one of the errorMessages, it is alerted unchanged to the user. This allows for server-side error messages. No default value.
				// imagePathAbsolute: If set to true, will treat imageUrl from imageUploadFunction and filePath returned from imageUploadEndpoint as an absolute rather than relative path, i.e. not prepend window.location.origin to it.
				// imageCSRFToken: CSRF token to include with AJAX call to upload image. For various instances like Django, Spring and Laravel.
				// imageCSRFName: CSRF token filed name to include with AJAX call to upload image, applied when imageCSRFToken has value, defaults to csrfmiddlewaretoken.
				// imageCSRFHeader: If set to true, passing CSRF token via header. Defaults to false, which pass CSRF through request body.
				// imageTexts: Texts displayed to the user (mainly on the status bar) for the import image feature, where #image_name#, #image_size# and #image_max_size# will replaced by their respective values, that can be used for customization or internationalization:
					// sbInit: Status message displayed initially if uploadImage is set to true. Defaults to Attach files by drag and dropping or pasting from clipboard..
					// sbOnDragEnter: Status message displayed when the user drags a file to the text area. Defaults to Drop image to upload it..
					// sbOnDrop: Status message displayed when the user drops a file in the text area. Defaults to Uploading images #images_names#.
					// sbProgress: Status message displayed to show uploading progress. Defaults to Uploading #file_name#: #progress#%.
					// sbOnUploaded: Status message displayed when the image has been uploaded. Defaults to Uploaded #image_name#.
					// sizeUnits: A comma-separated list of units used to display messages with human-readable file sizes. Defaults to B, KB, MB (example: 218 KB). You can use B,KB,MB instead if you prefer without whitespaces (218KB).
				// errorMessages: Errors displayed to the user, using the errorCallback option, where #image_name#, #image_size# and #image_max_size# will replaced by their respective values, that can be used for customization or internationalization:
					// noFileGiven: The server did not receive any file from the user. Defaults to You must select a file..
					// typeNotAllowed: The user send a file type which doesn't match the imageAccept list, or the server returned this error code. Defaults to This image type is not allowed..
					// fileTooLarge: The size of the image being imported is bigger than the imageMaxSize, or if the server returned this error code. Defaults to Image #image_name# is too big (#image_size#).\nMaximum file size is #image_max_size#..
					// importError: An unexpected error occurred when uploading the image. Defaults to Something went wrong when uploading the image #image_name#..
				// errorCallback: A callback function used to define how to display an error message. Defaults to (errorMessage) => alert(errorMessage).
				renderingConfig: { // Adjust settings for parsing the Markdown during previewing (not editing).
					codeSyntaxHighlighting: true, // If set to true, will highlight using highlight.js. Defaults to false. To use this feature you must include highlight.js on your page or pass in using the hljs option. For example, include the script and the CSS files like:
					// <script src="https://cdn.jsdelivr.net/highlight.js/latest/highlight.min.js"></script>
					// <link rel="stylesheet" href="https://cdn.jsdelivr.net/highlight.js/latest/styles/github.min.css">
					hljs: globalThis.hljs, // An injectible instance of highlight.js. If you don't want to rely on the global namespace (window.hljs), you can provide an instance here. Defaults to undefined.
					// markedOptions: Set the internal Markdown renderer's options. Other renderingConfig options will take precedence.
					// singleLineBreaks: If set to false, disable parsing GitHub Flavored Markdown (GFM) single line breaks. Defaults to true.
					// sanitizerFunction: Custom function for sanitizing the HTML output of Markdown renderer.
				},
				// shortcuts: Keyboard shortcuts associated with this instance. Defaults to the array of shortcuts.
				// showIcons: An array of icon names to show. Can be used to show specific icons hidden by default without completely customizing the toolbar.
				spellChecker: false, // If set to false, disable the spell checker. Defaults to true. Optionally pass a CodeMirrorSpellChecker-compliant function.
				// inputStyle: textarea or contenteditable. Defaults to textarea for desktop and contenteditable for mobile. contenteditable option is necessary to enable nativeSpellcheck.
				nativeSpellcheck: true, // If set to false, disable native spell checker. Defaults to true.
				sideBySideFullscreen: true, // If set to false, allows side-by-side editing without going into fullscreen. Defaults to true.
				status: true, // If set to false, hide the status bar. Defaults to the array of built-in status bar items.
				// Optionally, you can set an array of status bar items to include, and in what order. You can even define your own custom status bar items.
				styleSelectedText: false, // If set to false, remove the CodeMirror-selectedtext class from selected lines. Defaults to true.
				syncSideBySidePreviewScroll: true, // If set to false, disable syncing scroll in side by side mode. Defaults to true.
				tabSize: 4, // If set, customize the tab size. Defaults to 2.
				// theme: Override the theme. Defaults to easymde.
				toolbar: [ // If set to false, hide the toolbar. Defaults to the array of icons.
					'undo','redo','|',
					'bold','italic','strikethrough','|',
					'heading','heading-smaller','heading-bigger','heading-1','heading-2','heading-3','|',
					'code','quote','unordered-list','ordered-list','check-list','clean-block','|',
					'link','image','upload-image','table','horizontal-rule','|',
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
					'guide','|',
					{
						name: "others",
						className: "fa fa-blind",
						title: "others buttons",
						children: [
							{
								name: "image",
								action: EasyMDE.drawImage,
								className: "fa fa-picture-o",
								title: "Image",
							},
							{
								name: "quote",
								action: EasyMDE.toggleBlockquote,
								className: "fa fa-percent",
								title: "Quote",
							},
							{
								name: "link",
								action: EasyMDE.drawLink,
								className: "fa fa-link",
								title: "Link",
							}
						]
					},
				],
				toolbarTips: true, // If set to false, disable toolbar button tips. Defaults to true.
				// toolbarButtonClassPrefix: Adds a prefix to the toolbar button classes when set. For example, a value of "mde" results in "mde-bold" for the Bold button.
				direction: 'ltr', // rtl or ltr. Changes text direction to support right-to-left languages. Defaults to ltr.
			});
			// this.c_editor = new SimpleMDE({
			// 	element: textareaElm,
			// 	spellChecker: false,
			// 	status: false,
			// 	tabSize: 4,
			// 	toolbar: [
			// 		'bold','italic','strikethrough','|',
			// 		'heading-1','heading-2','heading-3','|',
			// 		'code','quote','unordered-list','ordered-list','clean-block','|',
			// 		'link','image','table','horizontal-rule','|',
			// 		{ name: "mermaid", title: "Insert Mermaid Diagram", className: "fa fa-area-chart", action: (editor) => {

			// 			toggleState = !toggleState; // Đảo trạng thái

			// 			// // Ví dụ: thay đổi nội dung hoặc style theo trạng thái
			// 			// if (toggleState) {
			// 			// 		editor.codemirror.setOption("theme", "monokai"); // bật theme tối
			// 			// 		alert("Toggle ON");
			// 			// } else {
			// 			// 		editor.codemirror.setOption("theme", "default"); // tắt
			// 			// 		alert("Toggle OFF");
			// 			// }

			// 			// // Cập nhật icon / style của nút trên toolbar
			// 			// let toolbarButton = editor.toolbarElements.mermaid;
			// 			// if (!toolbarButton)
			// 			// 	return;

			// 			// if (toggleState)
			// 			// 	toolbarButton.classList.add("active");
			// 			// else
			// 			// 	toolbarButton.classList.remove("active");

			// 			editor.codemirror.replaceSelection('```mermaid\ngraph TD;\n    A-->B;\n```\n');
			// 		}},'|',
			// 		'preview','side-by-side','fullscreen','|',
			// 		'guide',
			// 	],
			// 	// previewRender: (plainText, preview) => {
			// 	// 	preview.innerHTML = marked.parse(plainText);
			// 	// 	setTimeout(() => mermaid.run({ querySelector: '.mermaid' }), 0);
			// 	// 	return preview.innerHTML;
			// 	// },
			// });
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
	lightbox: {
		e_overlay: null,
		e_imgElement: null,
		e_closeBtn: null,
		c_panzoom: null, // Lib panzoom
		m_init: false,

		async init() {

			this.m_init = true;

			// Import library
			await mt.lib.import(['panzoom']);

			// Tạo overlay
			this.e_overlay = document.createElement('div');
			this.e_overlay.style.cssText = `
				display: none;
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: #535353e6;
				z-index: 9999;
				justify-content: center;
				align-items: center;
				cursor: pointer;
			`;

			// Tạo ảnh trong lightbox
			this.e_imgElement = document.createElement('img');
			this.e_imgElement.style.cssText = `
				max-width: 90%;
				max-height: 90%;
				object-fit: contain;
				cursor: default;
			`;
			this.e_imgElement.addEventListener('click', (e) => e.stopPropagation());

			// Tạo nút đóng
			this.e_closeBtn = document.createElement('button');
			this.e_closeBtn.innerHTML = '&times;';
			this.e_closeBtn.style.cssText = `
				position: absolute;
				top: 20px;
				right: 30px;
				font-size: 40px;
				color: white;
				background: none;
				border: none;
				cursor: pointer;
				z-index: 10000;
			`;

			this.e_overlay.appendChild(this.e_imgElement);
			this.e_overlay.appendChild(this.e_closeBtn);
			document.body.appendChild(this.e_overlay);

			// Sự kiện đóng lightbox
			this.e_overlay.addEventListener('click', () => this.close());
			this.e_closeBtn.addEventListener('click', () => this.close());

			// Đóng bằng phím ESC
			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape')
					this.close();
			});
		},
		open(src) {
			this.e_imgElement.src = src;
			this.e_overlay.style.display = 'flex';
			document.body.style.overflow = 'hidden';

			// Init panzom
			this.c_panzoom = panzoom(this.e_imgElement);
		},
		close() {
			this.e_overlay.style.display = 'none';
			this.e_imgElement.src = '';
			document.body.style.overflow = '';

			// Destroy panzom
			this.c_panzoom.dispose();
		},
		bind(elmImg) {

			if (!this.m_init)
				this.init(); // no await

			elmImg.style.cursor = 'pointer';
			elmImg.addEventListener('click', () => {
				const src = elmImg.dataset.full || elmImg.src;
				this.open(src);
			});
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
			mt.m_content = content;

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
