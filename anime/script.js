
import mtAuthen from '/common/authen.js';
import mtUtil from '/common/util.js';

var mt = {
	// h_endpoint: 'https://api.jikan.moe/v4/top/anime',
	h_endpoint: '/database/tabulator',
	p_authen: mtAuthen,
	c_table: null,
	m_database: 'manager',
	d_row: '', // Row đang lưu
	d_sql: '', // SQL

	// Method
	init: async function() {

		// Bind Global
		window.mt = mt;

		// Authen auto
		await this.p_authen.login('-1393153393');

		// Init
		this.initUI();

	},
	initUI: function() {

		// Rating Prop
		let ratingProp = {
			width: 80, // Old 70
			hozAlign: 'center',
			vertAlign: 'middle',
			formatter: (cell, formatterParams, onRendered) => {
				let value = cell.getValue(); // Lấy giá trị của ô (1-5)
				if (value >= 1 && value <= 5)
					return `<img src="/res/icons/rating${value}.png" />`;
				else
					return "N/A";
			},
			editor: 'star',
			// editor: 'number',
			// editorParams: { min: 1, max: 5, step: 1 },
			editable: false,
		};

		// Init Tabulator
		this.c_table = new Tabulator("#table", {
			layout: 'fitColumns',
			height: '100%',
			autoRowHeight: true, // Từ động wraptext
			progressiveLoad: 'scroll',
			progressiveLoadScrollMargin: 100,
			filterMode: 'remote', // Filter
			headerFilterLiveFilterDelay: 600,
			sortMode: 'remote', // Sort
			initialSort: [{column: 'time', dir: 'desc'}],
			ajaxURL: this.h_endpoint, // Ajax
			ajaxConfig: {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this.p_authen.getToken(),
				}
			},
			ajaxContentType: {
				body: (url, config, params) => {
					return JSON.stringify({
						database: this.m_database,
						select: 'id,name,img,story,art,sound,fantasy,sad,joke,brand,review,end,character,time',
						from: 'anime',
						where: '',
						sort: 'time DESC',
						...params,
					});
				}
			},
			// ajaxParams: function(params) {
			// 	return {
			// 		page: params?.page || 1,
			// 		limit: params?.size || 10,
			// 		type: "tv",
			// 		order_by: "popularity",
			// 		sort: "desc",
			// 	};
			// },
			ajaxResponse: function (url, params, response) {
				for (let row of response.data) {
					if (row.img == null || row.img == '') {
						row.img = '/res/images/image_holder.jpg';
					}
				}
				// let listData = response.data.map(item => ({
				// 	image_url: item.images.jpg.image_url,
				// 	title: item.title,
				// 	synopsis: item.synopsis ? item.synopsis.substring(0, 200) + "..." : "No synopsis available",
				// 	type: item.type,
				// 	episodes: item.episodes || "N/A"
				// }));
				// return {
				// 	data: listData,
				// 	last_page: response.pagination.last_visible_page
				// };
				return response;
			},
			columns: [
				{ title: "STT", formatter: 'rownum', width: 40, hozAlign: 'center', vertAlign: 'middle', headerSort: false },
				{ title: "Image", field: 'img', formatter: 'image', width: 80//, visible: false
					, headerSort: false, formatterParams: { height: '100px', width: '70px', class: 'anime-image' }
					, editor: 'input', editable: false
				},
				{ title: "Name", field: 'name', vertAlign: 'middle', headerSort: false, editor: 'input', editable: false },
				{ title: "Story", field: 'story', ...ratingProp},
				{ title: "Art", field: 'art', ...ratingProp},
				{ title: "Sound", field: 'sound', ...ratingProp},
				{ title: "Fantasy", field: 'fantasy', ...ratingProp},
				{ title: "Sad", field: 'sad', ...ratingProp},
				{ title: "Joke", field: 'joke', ...ratingProp},
				{ title: "Brand", field: 'brand', ...ratingProp},
				{ title: "Review", field: 'review', ...ratingProp},
				{ title: "End", field: 'end', width: 80, vertAlign: 'middle', headerSort: false, editor: 'input', editable: false},
				{ title: "Character", field: 'character', width: 100, vertAlign: 'middle', headerSort: false, editor: 'input', editable: false},
				{ title: "Time", field: 'time', width: 69, vertAlign: 'middle', formatter: (cell) => {
					let timestamp = cell.getValue();
					if (timestamp == null)
						return ''
					return mtUtil.date.date_to_str(new Date(timestamp * 1000), 'dd/MM/yy');
				} },
			],
			editorEmptyValue: null,
			rowContextMenu: (event, row) => this.rowContextMenu(event, row),
			headerSortElement: function(column, dir) {
				switch (dir) {
					case 'asc': return '<img src="/res/icons/sort_up_9x16.png" />';
					case 'desc': return '<img src="/res/icons/sort_down_9x16.png" />';
				}
				return '<img src="/res/icons/sort_9x16.png" />';
			},
		});

		// Register Event
		this.c_table.on('cellEdited', (cell) => this.cellEdited(cell));
		this.c_table.on('cellDblClick', (event, cell) => this.cellDblClick(event, cell));

		// Init Modal
		MicroModal.init({
			// openTrigger: '',
			disableFocus: true,
			debugMode: false,
		});
	},
	rowContextMenu: function(event, row) {
		let actions = [];

		let rowData = row.getData();

		// Lưu
		if (rowData.id == -1 || rowData._origin != null) {
			actions.push({
				label: '<img class="menuIcon" src="/res/icons/save16.png" />Save',
				action: (e, row) => this.actionSave(row),
			});
		}

		// Đặt lại như cũ
		if (rowData._origin != null) {
			actions.push({
				label: '<img class="menuIcon" src="/res/icons/revert16.png" />Revert',
				action: (e, row) => this.actionRevert(row),
			});
		}

		// Bỏ thêm mới
		if (rowData.id == -1) {
			actions.push({
				label: '<img class="menuIcon" src="/res/icons/remove16.png" />Remove',
				action: (e, row) => this.actionRemove(row),
			});
		}

		// Tạo mới
		actions.push({
			label: '<img class="menuIcon" src="/res/icons/add.png" />New',
			action: (e, row) => this.actionAdd(row),
		});

		// Tìm kiếm
		actions.push({
			label: '<img class="menuIcon" src="/res/icons/search16.png" />Search',
			action: (e, row) => {
				let column = this.c_table.getColumn('name');
				if (column && column.getDefinition().headerFilter) {
					this.c_table.updateColumnDefinition('name', { headerFilter: false });
					this.c_table.clearFilter(true);
				}
				else {
					this.c_table.updateColumnDefinition('name', { headerFilter: "input" });
				}
			},
		});

		// Action bảng
		actions.push(
			{
				label: '<img class="menuIcon" src="/res/icons/eye16.png" />Columns',
				menu: [
					{
						label: '<img class="menuIcon" src="/res/icons/image16.png" />Image',
						action: (e, row) => { 
							this.c_table.toggleColumn('img');
							this.c_table.redraw(true);
						}
					},
				]
			},
		);

		return actions;
	},
	cellEdited: function(cell) { // Sau khi sửa

		let row = cell.getRow(); // Cột đã chỉnh sửa
		let rowData = row.getData(); // Dữ liệu của hàng


		// // Move next Field
		// setTimeout(() => {
		// 	let lstCell = row.getCells();
		// 	let nextCell = null;
		// 	for (let i in lstCell) {
		// 		let cell = lstCell[i];
		// 		if (cell.getField() == field && i < lstCell.length) {
		// 			nextCell = lstCell[+i + 1];
		// 			break;
		// 		}
		// 	}
		// 	console.log(nextCell.getField());
		// 	nextCell.edit();
		// 	// const table = cell.getTable();
		// 	// table.navigateNext(); // Chuyển focus sang ô kế tiếp
		// 	// const nextCell = table.getActiveCell(); // Lấy ô hiện tại đang được focus
		// 	// if (nextCell)
		// 	// 	nextCell.edit(); // Kích hoạt chế độ chỉnh sửa cho ô kế tiếp
		// }, 500);


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
	cellDblClick: function(event, cell) { // Open Editor
		cell.edit(true);
	},
	actionAdd: function(row) {
		this.c_table.addData([{ id: -1}], true)
			.then((row) => {

				// Hightlight row sau khi thêm mới
				row[0].getElement().classList.add('highlight-row-add');
			});
	},
	actionSave: function(row) {

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
	actionRevert: function(row) {
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
	actionRemove: function(row) {
		row.delete();
	},
	actionExeccute: async function() {

		let isInsert = this.d_sql.startsWith('INSERT');

		// Đóng modal
		MicroModal.close('modal-1');

		// Call API - Exec Database
		let response = await fetch('/database/query', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.p_authen.getToken(),
			},
			body: JSON.stringify({
				database: this.m_database,
				sql: this.d_sql,
			})
		});
		let jsonData = await response.json();

		if (!response.ok) {
			alert('[ERROR] ' + jsonData.message);
			return;
		}

		// Xóa bỏ origin
		let rowData = this.d_row.getData();
		if (isInsert)
			rowData.id = jsonData;
		rowData._origin = null;
		this.d_row.update(rowData);

		// Tắt highlight sau khi lưu
		let highlightClass = 'highlight-row-' + (isInsert ? 'add' : 'edit');
		this.d_row.getElement().classList.remove(highlightClass);
	},
	eventCbkTime: function() { // Modal SQL - Checkbox Update Time

		// Kiểm tra giá trị checkbox
		if ($('#cbxUpdateTime').is(':checked')) {
			let time = Math.floor(Date.now() / 1000);
			this.d_sql = this.d_sql.replace(/\nWHERE/, `,\n\ttime = ${time}\nWHERE`);
		}
		else {
			this.d_sql = this.d_sql.replace(/,\n\ttime = \d+/, "");
		}

		// Highlight Code
		let $codeBlock = $('#codeBlock');
		$codeBlock.text(this.d_sql);
		Prism.highlightElement($codeBlock[0]);
	},

};
$(document).ready(() => mt.init());