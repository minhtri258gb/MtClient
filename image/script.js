import mtAuthen from '/common/authen.js';

/**
 * https://nanogallery2.nanostudio.org/api.html
 * https://split.js.org
 * https://fontawesome.com/v6/search?o=r
 */

var mt = {
	h_debug: true,
	h_path_wallpaper: 'C:/Massan/Walpapers',
	h_url_wallpaper: '/image/data_wallpaper.json',
	p_authen: mtAuthen,
	d_wallpaper: [],
	image: null,

	// Method
	async init() {

		// Bind Global
		window.mt = this;

		// Split (Layout)
		Split(['.layoutLeft', '.layoutCenter'], {
			sizes: ['240px', '100%'],
			gutterSize: 4,
		});

		// $("#nanogallery2").nanogallery2({

		// 	kind: 'nano_photos_provider2',
		// 	dataProvider: 'https://nano.gallery/ngy2/demo4/nano_photos_provider2/nano_photos_provider2.php',

		// 	// GALLERY AND THUMBNAIL LAYOUT
		// 	thumbnailHeight: '250', thumbnailWidth: '250',
		// 	thumbnailAlignment: 'fillWidth',
		// 	galleryDisplayMode: 'fullContent',
		// 	gallerySorting: 'random',

		// 	thumbnailGutterWidth: 10, thumbnailGutterHeight: 10,
		// 	thumbnailBorderHorizontal: 2, thumbnailBorderVertical: 2,

		// 	// DISPLAY ANIMATION
		// 	galleryDisplayTransitionDuration: 1000,
		// 	thumbnailDisplayTransition: 'slideRight',
		// 	thumbnailDisplayTransitionDuration: 300,
		// 	thumbnailDisplayInterval: 150,
		// 	thumbnailDisplayOrder: 'colFromRight',

		// 	// THUMBNAIL TOOLS & LABEL
		// 	thumbnailLabel: { display: true, position:'onBottomOverImage', hideIcons: true, titleFontSize: '1em', align: 'left', titleMultiLine:true, displayDescription: false},
		// 	thumbnailToolbarImage: null,
		// 	thumbnailToolbarAlbum: null,

		// 	// THUMBNAIL HOVER ANIMATION
		// 	thumbnailHoverEffect2: 'label_font-size_1em_1.5em|title_backgroundColor_rgba(255,255,255,0.34)_rgba(((35,203,153,0.8)|title_color_#000_#fff|image_scale_1.00_1.10_5000|image_rotateZ_0deg_4deg_5000',
		// 	touchAnimation: true,
		// 	touchAutoOpenDelay: 800,
			
		// 	// GALLERY THEME
		// 	galleryTheme : { 
		// 		thumbnail: { titleShadow : 'none', titleColor: '#fff', borderColor: '#fff' },
		// 		navigationBreadcrumb: { background : '#3C4B5B' },
		// 		navigationFilter: { background : '#003C3F', backgroundSelected: '#2E7C7F', color: '#fff' }
		// 	},
			
		// 	// DEEP LINKING
		// 	locationHash: false
		// });

		this.content.init();
		this.file.init();
		this.event.init();

		// Authen
		await this.p_authen.init();

		// First Load
		await this.registerFolder();
		await this.loadFromJson();

		// Tạo list ảnh cho nanogallery2
		let listItem = [];
		for (let i=0; i<this.d_wallpaper.length; i++) {
			let img = this.d_wallpaper[i];
			listItem.push({
				ID: i+1+'',
				src: img.name,
				srct: img.name,
				title: img.name,
				kind: 'image'
			});
		}
		
		// Nano Gallery 2 (Gallery Image)
		$('#nanogallery2').nanogallery2({

			// Data
			itemsBaseURL: `/file/static?folder=${this.h_path_wallpaper}&file=`,
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

			// Filter
			galleryFilterTags: true,
			galleryFilterTagsMode: 'multiple',

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
				viewerCustomTool1: '<i class="fa-regular fa-pen-to-square"></i>',
			},

			// Event
			fnImgToolbarCustInit: (toolCode) => {
				// this.h_debug && console.log('[mt.init.nanogallery2.fnImgToolbarCustInit]', { toolCode });
			},
			fnImgToolbarCustClick: (toolCode, element, item) => {
				switch (toolCode) {
					case 'custom1':

						if (!this.form.m_init)
							this.form.init(element[0]);

						this.form.open();
						break;
				}
				this.h_debug && console.log('[mt.init.nanogallery2.fnImgToolbarCustClick]', { toolCode, element, item });
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

		// $('#nanogallery2').nanogallery2('option', 'items', newItems);
		// // $('#nanogallery2').nanogallery2('data');
		// // $('#nanogallery2').nanogallery2('data', 'setItems', newItems);
		// // $('#nanogallery2').nanogallery2('resize');
		// $('#nanogallery2').nanogallery2('refresh');

	},
	async registerFolder() {
		try {

			// Authen
			if (this.p_authen.checkAuthn() == false)
				return;

			// Call API
			let response = await fetch('/file/register', {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer '+this.p_authen.getToken(),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 'folder': this.h_path_wallpaper })
			});
			if (!response.ok)
				throw { error: true, msg: await response.text() };
		}
		catch (ex) {
			console.error('[mt.registerFolder] Exception', ex);
		}
	},
	async loadFromJson() {
		try {

			// Authen
			if (this.p_authen.checkAuthn() == false)
				return;

			// Call API
			let response = await fetch(this.h_url_wallpaper, { method: 'GET' });
			if (!response.ok)
				throw { error: true, msg: await response.text() };

			this.d_wallpaper = await response.json();

			// Log
			this.h_debug && console.log('[mt.load] d_wallpaper', {
				d_wallpaper: this.d_wallpaper,
			});
		}
		catch (ex) {
			console.error('[mt.load] Exception', ex);
		}
	},
	async loadFromDisk() {
		try {

			// Call API
			let paramURL = new URLSearchParams();
			paramURL.set('folder', this.h_path_wallpaper);
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
			this.h_debug && console.log('[mt.loadFromDisk] listFile', { lstFile });
		}
		catch (ex) {
			console.error('[mt.loadFromDisk] Exception', ex);
		}
	},
	form: {
		m_init: false,
		p_modal: null,

		init(element) {

			this.m_init = true;

			// const virtualReference = {
			// 	getBoundingClientRect: () => ({
			// 		width: 0,
			// 		height: 0,
			// 		top: window.innerHeight / 2,
			// 		left: window.innerWidth / 2,
			// 		right: window.innerWidth / 2,
			// 		bottom: window.innerHeight / 2,
			// 	}),
			// 	contextElement: document.body,
			// };

			// this.p_modal = tippy(virtualReference, {
			// 	content: '<div id="formImage">ABCBCB</div>',
			// 	allowHTML: true,
			// 	interactive: false,
			// 	trigger: 'manual',
			// 	// placement: 'bottom',
			// 	// theme: 'custom-modal',
			// 	maxWidth: 400,
			// 	// offset: [0, 10],
			// 	onShow(instance) {
			// 		// currentTippy = instance;
			// 	},
			// 	onHidden(instance) {
			// 		// currentTippy = null;
			// 	},
			// });

			const virtualReference = {
				getBoundingClientRect: () => ({
					width: 0,
					height: 0,
					top: window.innerHeight / 2,
					left: window.innerWidth / 2,
					right: window.innerWidth / 2,
					bottom: window.innerHeight / 2,
				}),
				contextElement: document.body, // bắt buộc
			};

			// Tạo instance Tippy (KHÁC với selector string)
			// const instance = tippy('body', {
			// 	getReferenceClientRect: virtualReference.getBoundingClientRect,
			// 	content: '<div id="formImage">ABCBCB</div>',
			// 	allowHTML: true,
			// 	interactive: true,
			// 	trigger: 'manual',
			// 	placement: 'top',
			// 	theme: 'light-border',
			// });

			// instance.show();
		},
		open() {
			// this.p_modal.show();

			let funcBuildForm = () => {
				const element = document.getElementById('formImage');
				this.m_editor = new JSONEditor(element, {
					use_name_attributes: false,
					theme: 'barebones',
					iconlib: 'fontawesome5',
					disable_edit_json: false,
					disable_properties: false,
					disable_collapse: false,
					schema: {
						title: 'Form Json',
						type: 'object',
						required: [
							'propString',
							'propNumber',
							'propSelectBox',
							'propDate',
							'propColor',
							'propArray',
							'propObject',
						],
						properties: {
							'propHidden': {
								title: 'Field Hidden',
								type: 'string',
								format: 'hidden',
							},
							'propString': {
								title: 'Field String',
								type: 'string',
								format: 'text',
								minLength: 0,
								default: 'someText',
								// description: 'Property String',
							},
							'propEmail': {
								title: 'Field Email',
								type: 'string',
								format: 'email',
								default: 'trinm@gmail.com',
							},
							'propPassword': {
								title: 'Field Password',
								type: 'string',
								format: 'password',
								default: 'password',
							},
							'propTelephone': {
								title: 'Field Telephone',
								type: 'string',
								format: 'tel',
							},
							'propURL': {
								title: 'Field URL',
								type: 'string',
								format: 'url',
								default: 'http://www.google.com',
							},
							'propSearch': {
								title: 'Field Search',
								type: 'string',
								format: 'search',
							},
							'propNumber': {
								title: 'Field Number',
								type: 'string',
								format: 'number',
								default: 123,
								minimum: 0,
								maximum: 9999,
							},
							'propInteger': {
								title: 'Field Integer',
								type: 'integer',
								default: 123,
								minimum: 0,
								maximum: 9999,
							},
							'propDecimal': {
								title: 'Field Decimal',
								type: 'number',
								default: 123.555,
								minimum: 0,
								maximum: 9999,
							},
							'propRange': {
								title: 'Field Range',
								type: 'integer',
								format: 'range',
								default: 8,
								minimum: 0,
								maximum: 10,
								multipleOf: 2,
								// description: 'Property Number',
							},
							'propCheckbox': {
								title: 'Field Checkbox',
								type: 'string',
								format: 'checkbox',
							},
							'propButton': {
								title: 'Field Button',
								type: 'string',
								format: 'button',
							},
							'propReset': {
								title: 'Field Reset',
								type: 'string',
								format: 'reset',
							},
							'propSubmit': {
								title: 'Field Submit',
								type: 'string',
								format: 'submit',
							},
							// 'propAutoComplete': {
							// 	title: 'Field AutoComplete',
							// 	type: 'string',
							// 	format: 'autocomplete',
							// 	enum: ["Việt Nam", "Hoa Kỳ", "Nhật Bản", "Hàn Quốc", "Singapore"],
							// 	options: {
							// 		// enum_titles: ["Việt Nam", "Hoa Kỳ", "Nhật Bản", "Hàn Quốc", "Singapore"],
							// 		autocomplete: {
							// 			search: (text) => {
							// 				console.log('search:', text);
							// 			},
							// 			onSubmit: () => {
							// 				console.log('onSubmit');
							// 			},
							// 		},
							// 	},
							// 	// description: 'Property String',
							// },
							// 'propColor2': { // LIB: vanilla-picker
							// 	title: 'Field Color 2',
							// 	type: 'string',
							// 	format: 'color',
							// 	default: '#ffa500',
							// 	options: {
							// 		colorpicker: {
							// 			alpha: true,
							// 			// editorFormat: 'rgb', // rgb, hls
							// 			// popup: false, // top, right, left, false
							// 		}
							// 	}
							// },
							'propSelectBox': {
								title: 'Field SelectBox',
								type: 'string',
								enum: ['male','female','other'],
								// description: 'Property SelectBox',
							},
							'propRadio': {
								title: 'Field Radio',
								type: 'string',
								format: 'radio',
								enum: ['male','female','other'],
							},
							// 'propChoice': {
							// 	title: 'Field Choice',
							// 	type: 'string',
							// 	format: 'choices',
							// 	enum: ['male','female','other'],
							// 	// description: 'Property SelectBox',
							// },
							'propDate': {
								title: 'Field Date',
								type: 'string',
								format: 'date',
								default: '2025-08-20',
								options: {
									inputAttributes: {
										lang: 'vi'
									},
									// 	flatpickr: {}
								},
							},
							'propDateTime': {
								title: 'Field DateTime',
								type: 'string',
								format: 'datetime-local',
								default: '2025-08-07T16:59',
								// options: {
								// 	flatpickr: {}
								// },
								// description: 'Property Date',
							},
							'propTime': {
								title: 'Field Time',
								type: 'string',
								format: 'time',
								default: '2025-08-20',
								// options: {
								// 	flatpickr: {}
								// },
								// description: 'Property Time',
							},
							'propMonth': {
								title: 'Field Month',
								type: 'string',
								format: 'month',
							},
							'propWeek': {
								title: 'Field Week',
								type: 'string',
								format: 'week',
							},
							// 'propDate2': { // LIB: flatpickr
							// 	title: 'Field Date 2',
							// 	type: 'string',
							// 	format: 'date',
							// 	default: '2025-08-20',
							// 	options: {
							// 		flatpickr: {}
							// 	},
							// 	// description: 'Property Date',
							// },
							'propColor': {
								title: 'Field Color',
								type: 'string',
								format: 'color',
								default: '#ffa500',
								// description: 'Property Color',
							},
							'propImage': {
								title: 'Field Image',
								type: 'string',
								format: 'image',
							},
							'propFile': {
								title: 'Field File',
								type: 'string',
								format: 'file',
							},
							'propTextarea': {
								title: 'Field Textarea',
								type: 'string',
								format: 'textarea',
								minLength: 0,
								default: 'someText',
								// description: 'Property String',
							},
							// 'propMarkdown': {
							// 	type: 'string',
							// 	format: 'markdown'
							// },
							'propArray': {
								title: 'Field Array',
								type: 'array',
								format: 'table',
								uniqueItems: true,
								items: {
									title: 'Pet',
									type: 'object',
									properties: {
										'type': {
											type: 'string',
											enum: ['cat', 'dog', 'bird', 'reptile', 'other'],
											default: 'dog'
										},
										'name': {
											type: 'string'
										}
									}
								},
								default: [
									{
										'type': 'dog',
										'name': 'Walter'
									}
								]
							},
							'propObject': {
								title: 'Field Object',
								type: 'object',
								properties: {
									'city': {
										type: 'string',
										default: 'San Francisco'
									},
									'state': {
										type: 'string',
										default: 'CA'
									},
									'citystate': {
										type: 'string',
										// description: 'This is generated automatically from the previous two fields',
										template: '{{city}}, {{state}}',
										watch: {
											'city': 'location.city',
											'state': 'location.state'
										}
									}
								}
							},
							'propRate': {
								title: 'Field Rate',
								type: 'integer',
								format: 'rate',
								default: 3,
							},
						}
					},
				});
			}

			let funcOpenModal = () => {
				Swal.fire({
					title: 'Image Editor',
					html: '<div id="formImage"></div>',
					showCloseButton: true,
					showCancelButton: true,
					focusConfirm: false,
					confirmButtonText: '<i class="fa fa-thumbs-up"></i> Lưu',
					confirmButtonAriaLabel: "Thumbs up, great!",
					cancelButtonText: '<i class="fa fa-thumbs-down"></i> Đóng',
					cancelButtonAriaLabel: "Thumbs down",
					didOpen: (toast) => funcBuildForm(),
				});
			}

			funcOpenModal();
		},
		close() {
			this.p_modal.hide();
		},
	},
	detail: {
		c_content: null,
		form: null,
		isOpen: false,

		init() {
			this.c_content = $('#right_edit');
			this.form = $('#form_music');
			this.form.form({
				url: '/music/edit',
				onSubmit: function(param) {
					param.token = mt.auth._token; // Add token
				},
				success: function(res) {
					if (res == "Access denied") {
						mt.core.lostAccess();
					} else {
						mt.gui.layout.layout('collapse', 'east'); // Đóng phần chỉnh sửa
						mt.mgr.c_list.reload(); // Reload lại datagrid
					}
				},
				error: function() {
					alert('Fail: ' + e);
				}
			});
		},
		open() {

			// Khởi tạo nếu chưa
			if (this.c_content == null)
				this.init();

			// Flag
			this.isOpen = true;
			this.c_content.show();
			mt.gui.layout.layout('panel', 'east').panel({title: 'Edit'});

			// Mở bên phải
			mt.gui.layout.layout('expand','east');

			// Fill info if have selected music
			let music = mt.mgr.c_list.component.datagrid('getSelected');
			if (music)
				this.fillData(music);

		},
		close() {
			this.isOpen = false;
			this.c_content.hide();
		},
		fillData(music) {
			if (this.isOpen && music) {

				// Fill duration
				if (music.duration == null &&
					mt.player.musicIdPlay >= 0 &&
					music.id == mt.mgr.musics[mt.player.musicIdPlay].id
				)
					music.duration = mt.player.duration;
				
				// Fill data
				this.form.form('load',{
					id: music.id,
					name: music.name,
					duration: music.duration,
					tags: music.tags,
					decibel: music.decibel,
					rate: music.rate,
					trackbegin: music.trackbegin,
					trackend: music.trackend,
					miss: music.miss,
				});
			}
		}
	},
	content: {
		width: 0,
		height: 0,
		minWidth: 0,
		minHeight: 0,

		init() {
			this.minWidth = document.documentElement.clientWidth - 256 - 5; // subtract left, border
			this.minHeight = document.documentElement.clientHeight - 32 - 5; // subtract title, border

			this.width = this.minWidth;
			this.height = this.minHeight;

			// this.svg = SVG().addTo('#content').size(this.width, this.height);

		},
		load(src) {
			if (!src.type.match(/image.*/)) {
				alert("The dropped file is not an image: " + src.type);
				return;
			}
			let reader = new FileReader();
			reader.onload = (e) => {
				this.render(e.target.result);
			};
			reader.readAsDataURL(src);
		},
		render(src) {

			// // Render image
			// this.svg.image(src)
			// 	.id('img')
			// 	.stroke({ color: '#f06', opacity: 1, width: 5 });
			// this.interact('img');
			
			// // Save
			// Jimp.read({
			// 	url: src,
			// }).then((image) => {
			// 	mt.image = image;
			// 	mt.content.resize();
			// }).catch((error) => {
			// 	console.log(`Error loading image -> ${error}`);
			// });
		},
		getData() {
			return document.getElementById(this.id).toDataURL();
			// return encodeURIComponent(document.getElementById(this.id).toDataURL("image/png"));
		},
		resize() {
			let self = mt.content;

			self.minWidth = document.documentElement.clientWidth - 256 - 5; // subtract left, border
			self.minHeight = document.documentElement.clientHeight - 32 - 5; // subtract title, border

			let width = 0, height = 0;
			if (mt.image != null) {
				width = mt.image.bitmap.width;
				height = mt.image.bitmap.height;
			}
			width = Math.max(self.minWidth, width);
			height = Math.max(self.minHeight, height);
			
			if (width != self.width || height != self.height) {
				self.width = width;
				self.height = height;
				// self.svg.size(width, height);
			}
		},
		interact(idElement) {
			interact('#'+idElement)

			.resizable({
				edges: { left: true, right: true, bottom: true, top: true },
				listeners: {
					move (event) {
						var target = event.target
						var x = (parseFloat(target.getAttribute('data-x')) || 0)
						var y = (parseFloat(target.getAttribute('data-y')) || 0)

						// update the element's style
						target.style.width = event.rect.width + 'px'
						target.style.height = event.rect.height + 'px'

						// translate when resizing from top or left edges
						x += event.deltaRect.left
						y += event.deltaRect.top

						target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

						target.setAttribute('data-x', x)
						target.setAttribute('data-y', y)
						target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
					}
				},
				modifiers: [
					// keep the edges inside the parent
					interact.modifiers.restrictEdges({
						outer: 'parent'
					}),

					// minimum size
					interact.modifiers.restrictSize({
						min: { width: 100, height: 50 }
					})
				],

				inertia: true
			})

			.draggable({
				listeners: { move: window.dragMoveListener },
				inertia: true,
				modifiers: [
					interact.modifiers.restrictRect({
						restriction: 'parent',
						endOnly: true
					})
				]
			});

			function dragMoveListener (event) {
				var target = event.target
				// keep the dragged position in the data-x/data-y attributes
				var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
				var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
			
				// translate the element
				target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
			
				// update the posiion attributes
				target.setAttribute('data-x', x)
				target.setAttribute('data-y', y)
			}
			
			// this function is used later in the resizing and gesture demos
			 window.dragMoveListener = dragMoveListener
		}
	},
	file: {
		component: null,

		init() {
			let c = $('#file');
			this.component = c;
			// c.on('dragover', function(e) {
			// 	e.preventDefault();
			// 	// this.off('dragover');
			// });
			// c.on('drop', function(e) {
			// 	e.preventDefault();
			// 	mt.content.load(e.originalEvent.dataTransfer.files[0]);
			// });
		}
	},
	event: {
		init() {
			document.addEventListener('copy', this.copy);
			window.addEventListener('resize', this.resize);

			document.onpaste = (event) => {
				const items = (event.clipboardData || event.originalEvent.clipboardData).items;
				console.log(JSON.stringify(items));
				let blob = null;
				for (let i = 0; i < items.length; i++) {
					if (items[i].type.indexOf("image") === 0) {
						blob = items[i].getAsFile();
					}
				}
				
				if (blob !== null) {
					const reader = new FileReader();
					reader.onload = (event) =>{
						console.log(event.target.result); 
					};
					reader.readAsDataURL(blob);
				}
			};

			// Drop file into body
			$('body').on('dragover', function(e) {
				e.preventDefault();
			})
			$('body').on('drop', function(e) {
				// #TODO
				console.log(e.originalEvent.dataTransfer.files)
				e.preventDefault();
			});
		},
		copy(e) {
			let data = mt.image.getBase64(Jimp.MIME_PNG, (err) => { console.log(err) });
			e.clipboardData.setData(Jimp.MIME_PNG, data);
			e.preventDefault();
		},
		paste(e) {
			
		},
		resize() {
			mt.content.resize();
		},
		drop(e) {
			debugger
		}
	},
	test() {
		Jimp.read(mt.c_canvas.getData())
			.then(image => {
				debugger
			})
			.catch(err => {
				debugger
			});
		return;

		//draw the image on first load
		cropImage(imagePath, 0, 0, 200, 200);


		//crop the image and draw it to the canvas
		function cropImage(imagePath, newX, newY, newWidth, newHeight) {
			//create an image object from the path
			const originalImage = new Image();
			originalImage.src = imagePath;
		
			//initialize the canvas object
			const canvas = document.getElementById('canvas'); 
			const ctx = canvas.getContext('2d');
		
			//wait for the image to finish loading
			originalImage.addEventListener('load', function() {
		
				//set the canvas size to the new width and height
				canvas.width = newWidth;
				canvas.height = newHeight;
				
				//draw the image
				ctx.drawImage(originalImage, newX, newY, newWidth, newHeight, 0, 0, newWidth, newHeight); 
			});
		}

		//find the input elements in the html
		const downloadBtn = document.querySelector("button.download");

		//bind a click listener to the download button
		downloadBtn.addEventListener('click', function() {
			//create a temporary link for the download item
			let tempLink = document.createElement('a');
		
			//generate a new filename
			let fileName = `image-cropped.jpg`;
			
			//configure the link to download the resized image
			tempLink.download = fileName;
			tempLink.href = document.getElementById('canvas').toDataURL("image/jpeg", 0.9);
		
			//trigger a click on the link to start the download
			tempLink.click();
		});

	},
	upload() {
		let files = $('#file').filebox('files');

		function ajaxHandler() {
			if (this.readyState == 4 && this.status == 200) {
				var response = JSON.parse(this.response);
				console.log(response.filename + ' uploaded');
				appendThumbnail( files[response.index] );
			} else {
				// Uncomment if you want to display the states other than above.
				// console.log('State: ' + this.readyState + ', ' + this.statusText); 
			}
		}

		for (var i=0, f; f=files[i]; i++) {

			// Only process image files.
			if ( !f.type.match('image.*') ) continue;
			
			// Create form data containing a file to be uploaded.
			var formData = new FormData();
			formData.append("index", i);
			formData.append("image", f);
	
			// Ajax event: Upload files to the server.
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = ajaxHandler;
			// xhr.onprogress = progressHandler;
			xhr.open('PUT', '/imageHandler/upload', true);
			xhr.send(formData);
	
		} // END for

	},
};
$(document).ready(() => mt.init());