// import { w2ui, w2layout, w2toolbar, w2sidebar, w2grid, w2popup, w2alert, w2utils } from 'w2ui';
// import { w2grid } from 'w2ui';
import mtApi from '/common/api.js';
import mtLib from '/common/lib.js';
import mtShow from '/common/show.js';

var mt = {
	api: mtApi,
	lib: mtLib,
	show: mtShow,

	h_isShadow: false,
	h_pathNmap: 'D:/Apps/Nmap',
	e_tags: null, // Element filter Tags
	c_table: null, // Tabulator
	d_list: [], // Danh sách Server
	d_map: {}, // Lấy nhanh server theo Id
	m_pathServer: '', // Đường dẫn Server
	m_filterTags: [],

	mgr: {
		async init() {

			// Call API get Config
			mt.m_pathServer = await mt.api.config('PATH_SERVER');

			// Reference Element
			mt.e_tags = document.getElementById('tagInclude');
			mt.e_tags.addEventListener('change', e => mt.event.tagsChange(e));
		},
		async load() {

			// Call API - read file
			mt.d_list = await mt.api.fileRead(mt.m_pathServer+'/database/server.json', 'json');

			let processNode = (server, id) => {

				// Bổ sung id
				server.id = id;
				server.status = -2;

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
				mt.d_map[id] = server;
			}

			let id = 1;
			for (let server of mt.d_list) {
				processNode(server, id++);

				// Cấu trúc cây w2ui
				if (server.list == null)
					continue;

				for (let subserver of server.list) // Bổ sung id
					processNode(subserver, id++);

				server.w2ui = { children: server.list };
				delete server.list;
			}

			// Load into list
			mt.c_table.setData(mt.d_list);
		},
	},
	list: {
		async init() {

			// Import Library
			await mt.lib.import(['tabulator']);

			let renderAction = (cell) => {
				let row = cell.getRow().getData();
				let actions = cell.getValue() || '';
				let htmlBtn = '<div style="display:flex;gap:4px;">';
				htmlBtn += `<button onclick="mt.event.btnRowRefresh(${row.id})" style="padding:0;"><i class="fa-solid fa-arrows-rotate"></i></button>`;
				let act = ',' + actions + ',';
				if (row.status === 1 && act.includes(',link,'))
					htmlBtn += `<button onclick="mt.event.btnRowLink(${row.id})"><i class="fa-solid fa-link"></i></button>`;
				return htmlBtn + '</div>';
			}
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
					htmlBtn += `<span onclick="mt.event.btnRowTag('${tag}')">${tag}</span>`;
					// htmlBtn += `<button onclick="mt.event.btnRowTag('${tag}')">${tag}</button>`;
				}
				return htmlBtn + '</div>';
			}

			mt.c_table = new Tabulator('#table', {
				layout: 'fitData',
				height: '100%',
				renderVertical: 'basic', // Tắt virtual DOM
				data: [],
				columns: [
					{ title:'STT', formatter:'rownum', width:40, hozAlign:'center', headerSort:false },
					{ title:'Actions', field:'actions', width:120, headerSort:false, editable:false
						, formatter: (cell) => renderAction(cell)
					},
					{ title:'Status', field:'status', width:52, hozAlign:'center', vertAlign:'middle', headerSort:false, editable:false
						, formatter: (cell) => renderStatus(cell)
					},
					{ title:'Name', field:'name', vertAlign:'middle', headerSort:true, editor:'input', editable:false },
					{ title:'URL', field:'url', vertAlign:'middle', headerSort:true, editor:'input', editable:false },
					{ title:'Tags', field:'tags', headerSort:false, editor:'input'
						, editable:false, editorParams: { elementAttributes: { 'placeholder': 'tag1,tag2,tag3' } }
						, mutator: function(value, data, type, params, component) { // Convert từ string sang array khi edit xong
							if (typeof value === 'string') { // Nếu là string, convert sang array
								if (value.length == 0)
									return [];
								return value.split(',').map(item => item.trim());
							}
							return value;
						}
						, accessor: function(value, data, type, params, component) { // Convert từ array sang string để edit
							if (Array.isArray(value))
								return value.join(', ');
							return value;
            }
						, formatter: (cell) => renderTag(cell)
					},
				],
				rowContextMenu: (event, row) => this.rowContextMenu(event, row),
			});

			// Register Event
			mt.c_table.on('cellEdited', (cell) => mt.event.cellEdited(cell));
			mt.c_table.on('cellDblClick', (event, cell) => mt.event.cellDblClick(event, cell));
		},
		rowContextMenu(event, row) {
			let actions = [];

			let rowData = row.getData();

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
					action: (e, row) => mt.event.btnRevert(row),
				});
			}

			// Bỏ thêm mới
			if (rowData.id == -1) {
				actions.push({
					label: '<img class="menuIcon" src="/res/icons/remove16.png" />Remove',
					action: (e, row) => mt.event.btnRemove(row),
				});
			}

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
	event: {
		btnTopRefreshAll() {
			try {
				mt.m_action = 'RefreshAll';

				var visibleRows = mt.c_table.getRows('visible');
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

			// Bỏ Filter
			mt.e_tags.clean();

			// Thêm row mới
			mt.c_table.addData([{ id:-1, status:-2, tags: [] }], true)
				.then((row) => {

					// Hightlight row sau khi thêm mới
					row[0].getElement().classList.add('highlight-row-add');
				});
			// let id = this.c_w2grid.records.length + 1;
			// let date = mt.utils.convert_DateToStr(new Date());
			// this.c_w2grid.add({ id, tags: [] });
			// this.c_w2grid.scrollIntoView(1); // Scroll top
		},
		btnTopSave() {

			// Lấy dữ liệu của hàng
			let rowData = row.getData();

			// Cập nhật thời gian
			if ($('#cbxUpdateTime').is(':checked')) // Nếu có check
				rowData.time = Math.floor(Date.now() / 1000);

			let sql = '';
			let action = '';
			if (rowData.id == -1) {
				action = 'INSERT';

				let lstKey = [];
				let lstValue = [];
				for (let key in rowData) {

					// Bỏ qua qua các trường không cần lưu
					if (key == 'id' || key == '_origin')
						continue;

					let value = rowData[key];

					// Nếu kiểu chuỗi và có giá trị thì bọc trong nháy đơn
					if (typeof value == 'string' && value.length > 0)
						value = `'${value}'`;

					// Check NULL
					if (value == null || value == '')
						value = 'NULL';

					lstKey.push(key);
					lstValue.push(value);
				}
				sql += `INSERT INTO anime (${lstKey.join(', ')})\n`;
				sql += `VALUES (${lstValue.join(', ')});`;
			}
			else if (rowData._origin != null) {
				action = 'UPDATE';

				let origin = rowData._origin;
				for (let key in rowData) {

					// Bỏ qua qua các trường không cần lưu
					if (key == 'id' || key == '_origin')
						continue;

					let value = rowData[key];

					// Nếu không thay đổi thì bỏ qua
					if (value === origin[key])
						continue

					// Nếu kiểu chuỗi và có giá trị thì bọc trong nháy đơn
					if (typeof value == 'string' && value.length > 0)
						value = `'${value}'`;

					// Check NULL
					if (value == null || value == '')
						value = 'NULL';

					sql += `,\n\t${key} = ${value}`;
				}
				sql = 'UPDATE anime\nSET ' + sql.substring(3) + '\nWHERE id = ' + rowData.id + ';';
			}

			// Replace SQL
			// let htmlSQL = Prism.highlight(sql, Prism.languages.sql, 'sql');
			// let htmlSQL = sql.replace(/\n/g, '<br>');
			$('#modal-1-title').html(action+ ' SQL');

			let $codeBlock = $('#codeBlock');
			// $codeBlock.html(htmlSQL);
			$codeBlock.text(sql);

			// Highlight Code
			Prism.highlightElement($codeBlock[0]);

			// Show Confirm SQL
			MicroModal.show('modal-1');

			// Save data var
			this.d_row = row;
			this.d_sql = sql;
		},
		tagsChange(e) {
			let lstTags = e.detail.value;

			// Filter List
			mt.c_table.setFilter((data) => {
				const includeOk = lstTags.length === 0 || lstTags.some(tag => data.tags.includes(tag));
				// const includeOk = lstTags.length === 0 || lstTags.some(tag => data.tags.some(dataTag => dataTag.toUpperCase() === tag));
				// const excludeOk = mt.player.m_filterExc.every(tag => !data.tags.includes(tag));
				return includeOk; // && excludeOk;
			});
		},
		btnRevert(row) {
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
		btnRemove(row) {
			row.delete();
		},
		async btnRowRefresh(serverId) {
			mt.c_table.updateData([{ id: serverId, status: -1 }]);
			let server = mt.d_map[serverId];
			mt.c_table.updateData([{ id: serverId, status: await mt.check(server.host, server.port) }]);
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
			let server = this.d_map[serverId];
			window.open('http://' + server.url, '_blank');
		},
		btnRowTag(tag) {

			// Update Filter Tags
			mt.e_tags.addTag(tag);
			let lstTags = mt.e_tags.value;
		},
		menuEdit(row) {
			let cells = row.getCells();
			let fieldEdits = ['name','url','tags'];
			cells.forEach((cell) => {

				// if (fieldEdits.includes(cell.getField()))
				// 	cell.edit();

				let field = cell.getField();
				if (fieldEdits.includes(field)) {
					// Kiểm tra column có editor không
					let columnDef = cell.getColumn().getDefinition();
					if (columnDef.editor !== undefined && columnDef.editor !== false) {
						try {
							cell.edit(true);
						} catch(e) {
							console.warn('Cannot edit cell:', cell.getField(), e);
						}
					}
				}
			});
		},
		cellEdited(cell) { // Sau khi sửa

			let row = cell.getRow(); // Cột đã chỉnh sửa
			let rowData = row.getData(); // Dữ liệu của hàng

			// Bỏ qua nếu là thêm mới
			if (rowData.id == -1)
				return;

			let oldValue = cell.getOldValue(); // Giá trị trước khi chỉnh sửa
			let field = cell.getField(); // Tên cột (field)
			let value = rowData[field];

			// Normalize data
			if (oldValue == '') oldValue = null;
			if (value == '') value = null;
			if (oldValue == value)
				return; // Xem như chưa thay đổi

			// Update row
			if (rowData._origin == null) {

				// Backup data
				let origin = Object.assign({}, rowData);
				origin[field] = oldValue;
				rowData._origin = origin;

				// Hightlight row
				row.getElement().classList.add('highlight-row-edit');
			}
		},
		cellDblClick(event, cell) { // Open Editor
			cell.edit(true);
		},
	},

	async init() {

		// Bind Global
		window.mt = this;

		// Import Library
		await mt.mgr.init();
		this.lib.component(['Rate','TagBox']); // Ko cần đợi
		await mt.lib.import(['toastify']);

		// Init Module
		await this.list.init();

		// Load data
		await this.mgr.load();

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
	async check(host, port) {
		let cmd = 'nmap';
		let args = [];
		if (port != null)
			args = ['-p', port, host];
		else
			args = [host];
		let result = await mt.api.cmd(cmd, args, mt.pathServer, [this.h_pathNmap]);
		let output = result?.output || '';
		// let error = result?.error || '';

		mt.h_debug && console.log('[mt.server.check]', { result });

		return output.includes('open') ? 1 : 0;
	},
}
document.addEventListener('DOMContentLoaded', () => mt.init());
