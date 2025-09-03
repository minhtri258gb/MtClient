import mtAuthen from '/common/authen.js';
import JsonEditorEX from '/lib/mt/json-editor/mt-script.js';

/**
 * https://nanogallery2.nanostudio.org/api.html
 * https://split.js.org
 * https://fontawesome.com/v6/search?o=r
 */

var mt = {
	h_debug: false,

	// Module
	layout: {
		init() {
			Split(['.layoutLeft', '.layoutCenter'], {
				sizes: ['240px', '100%'],
				gutterSize: 4,
			});
		},
	},
	mgr: {
		h_pathWallpaper: '', // Link folder on Server
		h_pathDB: 'res/DB/image.json', // Link Data Client
		p_authen: mtAuthen,
		m_clientPath: '', // Đường dẫn client
		d_wallpaper: [], // List Image

		async readConfig() {

			// Call API - read Enviroment
			let response = await fetch('/common/getConfig?key=PATH_WALLPAPER', { method: 'GET' });
			if (!response.ok)
				throw { error: true, msg: await response.text() };

			this.h_pathWallpaper = await response.text();
		},
		// async registerFolder() {
		// 	try {

		// 		// Authen
		// 		if (this.p_authen.checkAuthn() == false)
		// 			return;

		// 		// Call API
		// 		let response = await fetch('/file/register', {
		// 			method: 'POST',
		// 			headers: {
		// 				'Content-Type': 'application/json',
		// 				'Authorization': 'Bearer '+this.p_authen.getToken(),
		// 			},
		// 			body: JSON.stringify({ 'folder': this.h_pathWallpaper })
		// 		});
		// 		if (!response.ok)
		// 			throw { error: true, msg: await response.text() };
		// 	}
		// 	catch (ex) {
		// 		console.error('[mt.mgr.registerFolder] Exception', ex);
		// 	}
		// },
		async loadFromJson() {
			try {

				// Call API
				let response = await fetch('/'+this.h_pathDB, { method: 'GET' });
				if (!response.ok)
					throw { error: true, msg: await response.text() };

				this.d_wallpaper = await response.json();

				// Log
				mt.h_debug && console.log('[mt.mgr.loadFromJson] d_wallpaper', {
					d_wallpaper: this.d_wallpaper,
				});
			}
			catch (ex) {
				console.error('[mt.mgr.loadFromJson] Exception', ex);
			}
		},
		async loadFromDisk() {
			try {

				// Authen
				if (this.p_authen.checkAuthn() == false)
					await this.p_authen.init();

				// Call API
				let paramURL = new URLSearchParams();
				paramURL.set('folder', this.h_pathWallpaper);
				let url = '/file/list?' + paramURL.toString();
				let response = await fetch(url, {
					method: 'GET',
					headers: { 'Authorization': 'Bearer '+this.p_authen.getToken() },
				});
				if (!response.ok)
					throw { error: true, msg: await response.text() };

				let lstRawItem = await response.json();

				let lstFile = [];
				for (let item of lstRawItem) {

					// Bỏ qua Folder
					if (item.isFolder)
						continue;

					lstFile.push({ name: item.name });
				}

				// Log
				mt.h_debug && console.log('[mt.mgr.loadFromDisk] listFile', { lstFile });
			}
			catch (ex) {
				console.error('[mt.mgr.loadFromDisk] Exception', ex);
			}
		},
		async saveToJson() {

			// Authen
			if (this.p_authen.checkAuthn() == false)
				await this.p_authen.init();

			// Kiểm tra và lấy client path
			if (this.m_clientPath.length == 0) {
				let response = await fetch('/file/getClientPath', {
					method: 'GET',
					headers: { 'Authorization': 'Bearer '+this.p_authen.getToken() },
				});
				if (!response.ok)
					throw { error: true, msg: await response.text() };

				this.m_clientPath = await response.text();
			}

			// Call API - Lưu dữ liệu
			let paramURL = new URLSearchParams();
			paramURL.set('file', this.m_clientPath + '/' + this.h_pathDB);
			paramURL.set('force', true);
			let responseSave = await fetch('/file/writeText?' + paramURL.toString(), {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain',
					'Authorization': 'Bearer '+this.p_authen.getToken(),
				},
				body: JSON.stringify(this.d_wallpaper),
			});
			if (!responseSave.ok) {
				let errorMessage = await responseSave.text();
				console.error(errorMessage);
				mt.utils.toast('error', errorMessage);
				return;
			}

			mt.utils.toast('success', "Lưu dữ liệu ảnh thành công.");
		},
	},
	gallery: {
		init() {

			// Tạo list ảnh cho nanogallery2
			let listItem = [];
			for (let i=0; i<mt.mgr.d_wallpaper.length; i++) {
				let img = mt.mgr.d_wallpaper[i];
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

			// Nano Gallery 2 (Gallery Image)
			$('#nanogallery2').nanogallery2({

				// Data
				itemsBaseURL: `/file/static?folder=${mt.mgr.h_pathWallpaper}&file=`,
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
							mt.form.open(item);
							break;
					}
					mt.h_debug && console.log('[mt.gallery.init.fnThumbnailToolCustAction]', { toolCode, item });
				},
				fnImgToolbarCustClick: (toolCode, element, item) => {
					switch (toolCode) {
						case 'custom1':
							mt.form.open(item);
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
		},
	},
	form: {
		p_editor: null, // JsonEditor

		init() {
			JsonEditorEX.TagBoxRegister();
			JsonEditorEX.RateRegister();
		},
		async open(item) {
			let resForm = await Swal.fire({
				title: 'Image Editor',
				html: '<div id="formImage" class="json-editor"></div>',
				showCloseButton: false,
				showCancelButton: true,
				focusConfirm: false,
				confirmButtonText: 'Lưu',
				cancelButtonText: 'Đóng',
				didOpen: () => this.createForm(item),
				didClose: () => this.p_editor.destroy(),
				preConfirm: () => {
					try {
						return this.p_editor.getValue();
					}
					catch (ex) {
						Swal.showValidationMessage(ex.message);
						console.error('[mt.form.open.preConfirm] Exception:', ex);
					}
				},
			});
			mt.h_debug && console.log('[mt.form.open]', { resForm });

			if (resForm.isConfirmed) {

				// Lấy Index
				let arrayIndex = Number.parseInt(item.GetID()) - 1;

				// Cập nhật data gallery
				item.customData = resForm.value; // Update Data

				// Cập nhật data RAM
				mt.mgr.d_wallpaper[arrayIndex] = resForm.value;

				// Lưu form
				this.saveToJson();
			}
		},
		createForm(item) {
			const element = document.getElementById('formImage');
			this.p_editor = new JSONEditor(element, {
				use_name_attributes: false,
				theme: 'barebones',
				iconlib: 'fontawesome5',
				disable_edit_json: true,
				disable_properties: true,
				disable_collapse: true,
				schema: {
					title: 'Image',
					type: 'object',
					required: [],
					properties: {
						'name': { title: 'Name', type: 'string', format: 'text', minLength: 0 },
						'tags': { title: 'Tags', type: 'array', format: 'tagbox', items: { type: 'string' } },
						'rate': { title: 'Rate', type: 'integer', format: 'rate', default: 3 },
					},
				},
				startval: item.customData,
			});
		},
	},
	utils: {
		p_toast: null, // Sweetalert2 - Toast

		init() {
			this.p_toast = Swal.mixin({
				toast: true,
				position: 'bottom-end',
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
				didOpen: (toast) => {
					toast.onmouseenter = Swal.stopTimer;
					toast.onmouseleave = Swal.resumeTimer;
				},
			});
		},
		toast(type, msg) {

			// Show Toast
			this.p_toast.fire({ icon: type, title: msg });
		},
	},

	// Method
	async init() {

		// Bind Global
		window.mt = this;

		// Authen
		// await this.mgr.p_authen.init();

		// Read Config
		await this.mgr.readConfig();

		// Init
		this.layout.init();

		// First Load
		// await this.mgr.registerFolder();
		await this.mgr.loadFromJson();

		this.gallery.init();
		this.form.init();
		this.utils.init();
	},
};
$(document).ready(() => mt.init());