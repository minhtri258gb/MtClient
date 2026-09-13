let mtGame = {
	e_contain: null, // Element chứa app
	m_init: false, // Khởi tạo app
	d_list: [],
	c_w2grid: null,

	list: {
		c_table: null, // Tabulator

		async init() {

			// Preppare table
			let renderImg = (cell) => {
				let value = cell.getValue() || '';
				return value ? `<img src="/res/images/game/${value}" />` : '';
			}
			let ratingProp = {
				width: 96,
				headerSort: true,
				hozAlign: 'center', vertAlign: 'middle',
				// editable: { type: 'int', min: 1, max: 5 },
				editor: 'star', editable: false,
				formatter: (cell) => {
					let value = cell.getValue() || '';
					if (value >= 1 && value <= 5)
						return `<img src="/res/icons/rating${value}.png" />`;
					return 'N/A';
				},
			};
			let renderTag = (cell) => {
				let value = cell.getValue() || '';
				let tags = value.split(',');
				let htmlBtn = '<div style="display:flex;gap:4px;">';
				for (let tag of tags) {
					htmlBtn += `<span onclick="mt.game.event.btnRowTag('${tag}')" class="row-tag">${tag}</span>`;
					// htmlBtn += `<button onclick="mt.event.btnRowTag('${tag}')">${tag}</button>`;
				}
				return htmlBtn + '</div>';
			}

			// Init table
			this.c_table = new Tabulator('#game-table', {
				layout: 'fitColumns',
				// layout: 'fitData',
				height: '100%',
				renderVertical: 'basic', // Tắt virtual DOM
				movableRows: true, // Drag drop sort
				data: [],
				columns: [
					{ title:'STT', formatter:'rownum', width:40, hozAlign:'center', headerSort:false },
					{ title:'Image', field:'img', width:51, hozAlign:'center', vertAlign:'middle', headerSort:false
						, editor:'input', editable:false, formatter: (cell) => renderImg(cell) },
					{ title:'Name', field:'name', vertAlign:'middle', headerSort:true, editor:'input', editable:false },

					{ title: 'Graphic', field: 'graphic', ...ratingProp },
					{ title: 'Audio', field: 'audio', ...ratingProp },
					{ title: 'Gameplay', field: 'gameplay', ...ratingProp },
					{ title: 'Story', field: 'story', ...ratingProp },
					{ title: 'Review', field: 'review', ...ratingProp },

					{ title:'Status', field:'status', width:180, editor:'input', editable:false },
					{ title:'Tags', field:'tags', headerSort:false, editor:'input', editable:false, formatter: (cell) => renderTag(cell) },
					{ title:'Date', field:'date', width:75, headerSort:true, editor:'input', editable:false },
					{ title:'Size', field:'size', width:59, headerSort:true, editor:'input', editable:false },
				],
				rowContextMenu: (event, row) => this.contextMenu(event, row),
			});

			// Register Event
			this.c_table.on('cellEdited', (cell) => mt.game.event.tableCellEdited(cell));
			this.c_table.on('cellDblClick', (event, cell) => mt.game.event.tableCellDblClick(event, cell));
		},
		async load() {

			// Call API - read file
			mt.game.d_list = await mt.api.fileRead(mt.m_pathServer + '/database/game.json', 'json');

			let id = 1;
			for (let game of mt.game.d_list) {

				// Thêm Id
				game.id = id++;
			}

			// Load into list
			this.c_table.setData(mt.game.d_list);
		},
		async save() {

			// Confirm
			if (!confirm('Lưu lại thay đổi game?'))
				return;

			// Chuẩn hóa dữ liệu
			let listData = [];
			for (let item of mt.game.d_list) {
				let clone = Object.assign({}, item); // Clone

				// Clean
				delete clone.id;

				listData.push(clone);
			}

			// // Call API - Lưu dữ liệu
			// let filepath = `${mt.m_pathServer}/database/server.json`;
			// let content = JSON.stringify(listData);
			// await mt.api.fileWriteText(filepath, content, true);

			// Tắt highlight
			for (let row of rows)
				row.getElement().classList.remove('highlight-row-add', 'highlight-row-edit');

			// Log
			mt.h_debug && console.log('[mt.game.list.save]', { listData });
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
	event: {
		btnTopNew() {

			// Mở Form tạo mới
			// mt.game.form.open();

			// Bỏ Filter
			// mt.e_tags.clean();

			// Prepare data
			

			// Thêm row mới
			mt.game.list.c_table.addData([{
				id: -1,
				date: mt.utils.convert_DateToStr(new Date()),
			}], true)
				.then((row) => {

					// Hightlight row sau khi thêm mới
					row[0].getElement().classList.add('highlight-row-add');
				});
		},
		btnTopSave() {
			try {
				mt.game.list.save();
			}
			catch (ex) {
				console.error(ex);
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
		tableCellEdited(cell) {

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
		tableCellDblClick(event, cell) { // Open Editor

			// Bỏ edit cột STT
			let field = cell.getColumn().getField();
			if (field)
				cell.edit(true);
		},
	},

	async init() {

		// Add container
		this.e_contain.id = 'game-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Import Library
		mt.lib.component(['TagBox']); // Ko cần đợi | 'Rate'
		await mt.lib.import(['tabulator']);

		// Init module
		this.list.init();

		// Load data
		await this.list.load();

	},
}
export default mtGame;
