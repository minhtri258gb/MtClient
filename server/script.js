import mtApi from '/common/api.js';
import mtLib from '/common/lib.js';
import mtShow from '/common/show.js';

var mt = {
	api: mtApi,
	lib: mtLib,
	show: mtShow,

	h_debug: true,
	h_isShadow: false,
	e_tags: null, // Element filter Tags
	d_list: [], // Danh sách Server
	m_pathServer: '', // Đường dẫn Server
	m_filterTags: [],

	list: {
		c_table: null, // Tabulator

		async init() {

			let renderStatus = (cell) => {
				let status = cell.getValue() || '';
				if (status === -2)
					return `...`;
				else if (status === -1)
					return `<i class="fa-solid fa-spinner fa-lg anim-rotate"></i>`;
				return `<i class="fa-solid fa-circle-${status === 1 ? 'check' : 'xmark'} fa-lg"
					style="color:#${status === 1 ? '4ade80' : 'f87171'}"></i>`;
			}
			let renderTag = (cell) => {
				let tags = cell.getValue() || '';
				let htmlBtn = '<div style="display:flex;gap:4px;">';
				for (let tag of tags) {
					htmlBtn += `<span onclick="mt.event.btnRowTag('${tag}')" class="row-tag">${tag}</span>`;
					// htmlBtn += `<button onclick="mt.event.btnRowTag('${tag}')">${tag}</button>`;
				}
				return htmlBtn + '</div>';
			}

			this.c_table = new Tabulator('#table', {
				layout: 'fitData',
				height: '100%',
				renderVertical: 'basic', // Tắt virtual DOM
				movableRows: true, // Drag drop sort
				data: [],
				columns: [
					{ title:'STT', formatter:'rownum', width:40, hozAlign:'center', headerSort:false },
					{ title:'Actions', field:'actions', width:120, headerSort:false, formatter: (cell) => this.buildRowAction(cell) },
					{ title:'Status', field:'status', width:52, hozAlign:'center', vertAlign:'middle', headerSort:false, formatter: (cell) => renderStatus(cell) },
					{ title:'Name', field:'name', vertAlign:'middle', headerSort:true, editor:'input', editable:false },
					{ title:'URL', field:'url', vertAlign:'middle', headerSort:true, editor:'input', editable:false },
					{ title:'Tags', field:'tags', headerSort:false, formatter: (cell) => renderTag(cell) },
				],
				rowContextMenu: (event, row) => this.contextMenu(event, row),
			});
		},
		async load() {

			// Call API - read file
			mt.d_list = await mt.api.fileRead(mt.m_pathServer+'/database/server.json', 'json');

			let id = 1;
			for (let server of mt.d_list) {

				// Thêm Id
				server.id = id++;

				// Trạng thái chưa check
				server.status = -2;

				// Lấy host và port
				let splitURL = mt.utils.splitURL(server.url);
				server.host = splitURL.host;
				server.port = splitURL.port;
			}

			// Load into list
			this.c_table.setData(mt.d_list);
		},
		async save() {

			// Authen
			// if (mt.api.checkAuthn() == false)
			// 	await mt.api.init();

			// Confirm
			let isConfirm = await mt.show.alertConfirmPrimary('Lưu lại thay đổi server?', 'Lưu');
			if (!isConfirm)
				return;

			// Chuẩn hóa dữ liệu
			let listData = [];
			let dataInGrid = this.c_table.getData(); // Lấy thứ tự nếu có sort
			for (let row of dataInGrid) {
				let item = mt.d_list[row.id - 1]; // Lấy data gốc
				let clone = Object.assign({}, item); // Clone

				// Clean
				delete clone.id;
				delete clone.host;
				delete clone.port;
				delete clone.status;
				if (!clone.actions || clone.actions.length == 0)
					delete clone.actions;
				if (!clone.tags || clone.tags.length == 0)
					delete clone.tags;
				if (!clone.log || clone.log.length == 0)
					delete clone.log;

				listData.push(clone);
			}

			// Call API - Lưu dữ liệu
			let filepath = `${mt.m_pathServer}/database/server.json`;
			let content = JSON.stringify(listData);
			await mt.api.fileWriteText(filepath, content, true);

			// Tắt highlight
			let rows = this.c_table.getRows();
			for (let row of rows)
				row.getElement().classList.remove('highlight-row-add', 'highlight-row-edit');

			// Log
			mt.h_debug && console.log('[mt.list.save]', { listData });
		},
		buildRowAction(cell) {
			let row = cell.getRow().getData();
			let act = ',' + (cell.getValue() || '') + ',';

			let htmlBtn = '<div style="display:flex;gap:4px;">';

			// Refresh
			htmlBtn += `<button onclick="mt.event.btnRowRefresh(${row.id})" style="padding:0;"><i class="fa-solid fa-arrows-rotate"></i></button>`;

			// Link
			if (row.status === 1 && act.includes(',link,'))
				htmlBtn += `<button onclick="mt.event.btnRowLink(${row.id})" style="padding:0;"><i class="fa-solid fa-link"></i></button>`;

			// Log
			if (row.log && row.log.length > 0)
				htmlBtn += `<button onclick="mt.event.btnRowLog(${row.id})" style="padding:0;"><i class="fa-solid fa-hourglass-half"></i></button>`;

			return htmlBtn + '</div>';
		},
		contextMenu(event, row) {
			let actions = [];

			let rowData = row.getData();

			// Sửa
			actions.push({
				label: '<i class="fa-solid fa-pen-to-square menuIcon"></i>Edit',
				action: (e, row) => mt.event.ctxMenuEdit(row),
			});

			// Lưu
			// if (rowData.id == -1 || rowData._origin != null) {
			// 	actions.push({
			// 		label: '<img class="menuIcon" src="/res/icons/save16.png" />Save',
			// 		action: (e, row) => mt.event.actionSave(row),
			// 	});
			// }

			// Đặt lại như cũ
			if (rowData._origin != null) {
				actions.push({
					label: '<img class="menuIcon" src="/res/icons/revert16.png" />Revert',
					action: (e, row) => mt.event.ctxMenuRevert(row),
				});
			}

			// Bỏ thêm mới
			if (rowData.id == -1) {
				actions.push({
					label: '<img class="menuIcon" src="/res/icons/remove16.png" />Remove',
					action: (e, row) => mt.event.btnRemove(row),
				});
			}

			// Sao chép
			actions.push({
				label: '<i class="fa-solid fa-copy menuIcon"></i>Clone',
				action: (e, row) => mt.event.ctxMenuClone(row),
			});

			// Tạo mới
			// actions.push({
			// 	label: '<img class="menuIcon" src="/res/icons/add.png" />New',
			// 	action: (e, row) => this.actionAdd(row),
			// });

			// { label: '<i class="fa-solid fa-square-plus"></i> Add Playlist', action: (event, row) => mt.event.menuAddPlaylist(row) },
			// { label: '<i class="fa-solid fa-play"></i> Play', action: (event, row) => mt.event.menuPlay(row) },
			// { label: '<i class="fa-solid fa-circle-play"></i> Play Track', action: (event, row) => mt.event.menuPlayTrack(row) },
			// { separator: true, },
			// { label: '<i class="fa-solid fa-pen-to-square"></i> Edit', action: (event, row) => mt.event.menuEdit(row) },
			// { label: '<i class="fa-regular fa-trash-can"></i> Delete', action: (event, row) => mt.event.menuDelete(row) },
			// { separator: true, },
			// { label: '<i class="fa-solid fa-print"></i> Print', action: (event, row) => mt.event.menuPrint(row) },

			return actions;
		},
	},
	form: {
		c_modal: null, // tingle
		c_form: null, // jsoneditor

		// Method
		init() {

			// Init Modal - tingle
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
			this.c_modal.modalBoxContent.appendChild(elementForm); // Đặt contain form vào modal
			this.c_modal.modalBox.style.width = 'unset'; // Bỏ width gốc

			// Init Form - jsoneditor
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
					title: 'Server',
					type: 'object',
					required: [],
					properties: {
						'id': { type: 'string', format: 'hidden', options: { titleHidden: true } },
						'name': { title: 'Name', type: 'string', format: 'text' },
						'url': { title: 'URL', type: 'string', format: 'text' },
						'actions': { title: 'Actions', type: 'string', format: 'text' },
						'tags': { title: 'Tags', type: 'array', format: 'tagbox', items: { type: 'string' } },
						'log': { title: 'Log', type: 'string', format: 'text' },
						'actions': { title: 'Actions', type: 'string', format: 'text' },
						'done': { title: 'Done', type: 'string', format: 'button', options: { button: { icon: 'check', action: () => this.done() }}},
						'cancel': { title: 'Cancel', type: 'string', format: 'button', options: { button: { icon: 'close', action: () => this.c_modal.close() }}},
					},
				},
			});
		},
		async open(serverId) {

			let item = null;
			if (serverId)
				item = mt.d_list[serverId-1];

			let formData = {
				id: item?.id || -1,
				name: item?.name || '',
				url: item?.url || '',
				actions: item?.actions || '',
				tags: item?.tags || [],
				log: item?.log || '',
			};

			// Set form data
			this.c_form.setValue(formData);

			// Open Modal
			this.c_modal.open();

			// Log
			mt.h_debug && console.log('[mt.form.open]', { serverId, item, formData });
		},
		async done() {
			try {

				// Get data
				let formdata = this.c_form.getValue(); // mt.form.c_form.getValue()

				// Validate
				if (formdata.name.length == 0)
					throw Error('Chưa nhập tên Server!');
				if (formdata.url.length == 0)
					throw Error('Chưa nhập URL Server!');

				// Lấy host và port từ URL
				let splitURL = mt.utils.splitURL(formdata.url);

				// Process data
				let item = {
					id: +formdata.id,
					name: formdata.name,
					url: formdata.url,
					actions: formdata.actions,
					tags: formdata.tags,
					log: formdata.log.replaceAll('\\', '/'),
					status: -2,
					host: splitURL.host,
					port: splitURL.port,
				};

				if (item.id === -1) { // Add

					// Add Index
					item.id = mt.d_list.length + 1;

					// Save to RAM
					mt.d_list.push(item);

					// Bỏ Filter
					mt.e_tags.clean();

					// Thêm vào tabulator
					mt.list.c_table.addData([item], true)
						.then((rows) => {
							rows[0].getElement().classList.add('highlight-row-add'); // Hightlight
						});
					// await mt.list.p_table.addRow(item);

					// // Sắp xếp lại tabulator
					// mt.list.p_table.setSort('name', 'asc');
				}
				else { // Update

					// Save to RAM
					mt.d_list[item.id - 1] = item;

					// Change Tabulator
					mt.list.c_table.updateRow(item.id, item)
						.then((row) => {
							row.getElement().classList.add('highlight-row-edit'); // Hightlight
						});
				}

				// // Save item
				// await mt.mgr.saveToJson();

				// Close modal
				this.c_modal.close();

				// Toast
				// mt.show.toast('success', 'Lưu nhạc thành công.');

				// Log
				mt.h_debug && console.log('[mt.form.done]', { formdata, item });
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.form.done] Exception:', ex);
			}
		},
		async delete(music) {

			// Confirm Popup
			let isConfirm = await mt.utils.confirmDanger(`Xác nhận xóa bài ${music.name}?`, 'Xóa');
			if (!isConfirm)
				return;

			// Save to RAM
			mt.mgr.d_musics.splice(music.id-1, 1);

			// Build lại seed để auto play random ko lệch
			mt.mgr.buildRandomSeed();

			// Xóa khỏi tabulator
			mt.list.p_table.deleteRow(music.id);

			// Save data
			await mt.mgr.saveToJson();

			// Notify
			mt.show.toast('success', `Đã xóa dữ liệu bài ${music.name}`);

			// Log
			console.log('[mt.form.delete]', { music });
		},
		cv_inForm(data) {
			return {
				id: data?.id || 0,
				name: data?.name || '',
				rate: data?.rate || 3,
				duration: data?.duration || 0,
				tags: data?.tags || ['NEW'],
				decibel: data?.decibel || 100,
				trackbegin: data?.trackbegin || 0,
				trackend: data?.trackend || 0,
				miss: data?.miss || false,
			};
		},
		cv_outForm(data) {
			return {
				id: Number.parseInt(data.id), // Convert Int
				name: data.name,
				rate: data.rate,
				duration: data.duration == 0 ? null : data.duration, // Bằng 0 thì null
				tags: data.tags,
				decibel: data.decibel,
				trackbegin: data.trackbegin == 0 ? null : data.trackbegin, // Bằng 0 thì null
				trackend: data.trackend == 0 ? null : data.trackend, // Bằng 0 thì null
				miss: data.miss == 'true', // Convert Boolean
			};
		},
	},
	func: {
		async check(host, port) {
			let cmd = 'nmap';
			let args = [];
			if (port != null)
				args = ['-p', port, host];
			else
				args = [host];
			let result = await mt.api.cmd(cmd, args, mt.pathServer);
			let output = result?.output || '';
			// let error = result?.error || '';

			mt.h_debug && console.log('[mt.func.check]', { result });

			return output.includes('open') ? 1 : 0;
		},
	},
	event: {
		async btnTopRefreshAll() {
			try {
				
				// Confirm
				let isConfirm = await mt.show.alertConfirmPrimary('Kiểm tra toàn bộ server?', 'Quét');
				if (!isConfirm)
					return;

				mt.m_action = 'RefreshAll';

				var visibleRows = mt.list.c_table.getRows('visible');
				for (let objRow of visibleRows)
					this.btnRowRefresh(objRow.getData().id); // No Await
			}
			catch (ex) {
				mt.show.toast(ex.message);
				console.error('[mt.server.btnRefreshAll]', ex);
			}
			finally {
				mt.m_action = '';
			}
		},
		btnTopNew() {

			// Mở Form tạo mới
			mt.form.open();

			// Bỏ Filter
			// mt.e_tags.clean();

			// Thêm row mới
			// mt.list.c_table.addData([{ id:-1, status:-2, tags: [] }], true)
			// 	.then((row) => {

			// 		// Hightlight row sau khi thêm mới
			// 		row[0].getElement().classList.add('highlight-row-add');
			// 	});
		},
		btnTopSave() {
			try {
				mt.list.save();
			}
			catch (ex) {
				console.error('[mt.event.btnTopSave]', ex);
				mt.show.toast('error', ex.message);
			}
		},
		tagsChange(e) {
			let lstTags = e.detail.value;

			// Filter List
			mt.list.c_table.setFilter((data) => {
				const includeOk = lstTags.length === 0 || lstTags.some(tag => data.tags.includes(tag));
				// const includeOk = lstTags.length === 0 || lstTags.some(tag => data.tags.some(dataTag => dataTag.toUpperCase() === tag));
				// const excludeOk = mt.player.m_filterExc.every(tag => !data.tags.includes(tag));
				return includeOk; // && excludeOk;
			});
		},
		btnRemove(row) {
			row.delete();
		},
		async btnRowRefresh(serverId) {

			// Loading statuc
			mt.list.c_table.updateData([{ id: serverId, status: -1 }]);

			let server = mt.d_list[serverId-1];

			// Update Status
			mt.list.c_table.updateData([{ id: serverId, status: await mt.func.check(server.host, server.port) }]);

			// Render lại cột Action
			const row = mt.list.c_table.getRow(serverId);
			if (row) {
				const actionCell = row.getCell("actions");
				if (actionCell)
					actionCell.setValue(actionCell.getValue());
			}
		},
		async btnShare() {

			// // Lấy Port hiện tại
			// let URL = location.origin + location.pathname;
			// if (URL.indexOf('localhost') > -1) {

			// 	// Call API - Get IP
			// 	let IP = await mt.api.infoIP();
			// 	URL = URL.replace('localhost', IP);
			// }

			// // Thêm params query
			// let paramURL = new URLSearchParams();
			// let appName = w2ui.layout_main_tabs.active;
			// paramURL.set('app', appName);
			// let tags = mt.server.c_w2grid.getSearchData('tags');
			// if (tags != null)
			// 	paramURL.set('tag', tags.value);
			// URL += '?' + paramURL.toString();
			// if (window.location.hash)
			// 	URL += decodeURIComponent(window.location.hash);

			// // Tự động copy
			// if (window.isSecureContext) {
			// 	await navigator.clipboard.writeText(URL);
			// 	mt.show.toast('success', 'Đã copy link chia sẻ');
			// }
			// else {
			// 	console.log(URL);
			// 	mt.show.toast('warning', 'Chưa cấp quyền truy cập bộ nhớ đệm! Lấy link trong console.');
			// }
		},
		btnRowLink(serverId) {
			let server = mt.d_list[serverId-1];
			window.open(server.url, '_blank');
		},
		btnRowLog(serverId) {
			let server = mt.d_list[serverId-1];
			let urlParam = new URLSearchParams();
			urlParam.set('path', server.log);
			window.open(`/logs?${urlParam.toString()}`, '_blank');
		},
		btnRowTag(tag) {

			// Update Filter Tags
			mt.e_tags.addTag(tag);
			let lstTags = mt.e_tags.value;
		},
		ctxMenuEdit(row) {
			let serverId = row.getIndex();
			mt.form.open(serverId);
		},
		ctxMenuRevert(row) {
			let rowData = row.getData();
			let origin = rowData._origin;
			if (origin != null) {

				// Cập nhật lại data cũ
				origin._origin = null;
				row.update(origin);

				// Bỏ Hightlight row
				row.getElement().classList.remove('highlight-row-edit');
			}
		},
		ctxMenuClone(row) {
			try {

				let rowData = row.getData(); // Lấy data
				let item = mt.d_list[rowData.id-1];

				let cloneItem = JSON.parse(JSON.stringify(item));
				cloneItem.id = mt.d_list.length + 1; // New Id
				mt.d_list.push(cloneItem); // Add list

				// Render List
				mt.list.c_table.addData([item], true)
					.then((rows) => {
						rows[0].getElement().classList.add('highlight-row-add'); // Hightlight
					});

				// Log
				mt.h_debug && console.log('[mt.event.ctxMenuClone]', { rowData, item });
			}
			catch (ex) {
				mt.show.toast('error', ex.message);
				console.error('[mt.event.ctxMenuClone]', ex);
			}
		},
	},
	utils: {
		splitURL(url) {

			if (url.startsWith('http://'))
				url = url.replace('http://', '');
			else if (url.startsWith('https://'))
				url = url.replace('https://', '');

			if (url.includes(':')) {
				let pathUrl = url.split(':');
				return { host: pathUrl[0], port: +pathUrl[1] };
			}
			else
				return { host: url, port: null };
		},
	},

	async init() {

		// Bind Global
		window.mt = this;

		// Call API get Config
		this.m_pathServer = await this.api.config('PATH_SERVER');

		// Import Library
		this.lib.component(['TagBox']); // Ko cần đợi | 'Rate'
		await mt.lib.import([
			'tabulator', // Datagrid
			'tingle', // Popup
			'jsonEditor', // Form
			'toastify', // Toast
			'sweetalert2', // Alert
		]);

		// Reference Element
		this.e_tags = document.getElementById('tagInclude');
		this.e_tags.addEventListener('change', e => this.event.tagsChange(e));

		// Init Module
		await this.list.init();
		this.form.init();

		// Load data
		await this.list.load();

		// Load CSS
		mt.lib.loadCSS('/server/style.css');

		// Process Params
		this.processParams();
	},
	processParams() {
		let urlParams = new URLSearchParams(window.location.search);
		let tag = urlParams.get('tag');
		if (tag != null) {
			// this.c_w2grid.search([{ field: 'tags', value: tag, operator: 'contains' }], 'AND');
			this.btnRefreshAll(); // Tự động check khi có sẵn tag
		}
	},
}
document.addEventListener('DOMContentLoaded', () => mt.init());
