
import mtAuthen from '/common/authen.js';

var mt = {
	// h_endpoint: 'https://api.jikan.moe/v4/top/anime',
	h_endpoint: '/database/tabulator',
	p_authen: mtAuthen,
	c_table: null,
	m_database: 'manager',

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
			hozAlign: 'center',
			formatter: (cell, formatterParams, onRendered) => {
				let value = cell.getValue(); // Lấy giá trị của ô (1-5)
				if (value >= 1 && value <= 5)
					return `<img src="/res/icons/rating${value}.png" />`;
				else
					return "N/A";
			},
			editor: 'number',
			editorParams: { min: 1, max: 5, step: 1 },
		};

		// Init Tabulator
		this.c_table = new Tabulator("#table", {
			layout: 'fitColumns',
			height: '100%',
			autoRowHeight: true, // Từ động wraptext
			progressiveLoad: 'scroll',
			progressiveLoadScrollMargin: 100,
			sortMode: 'remote', // Sort
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
						select: 'name,story,art,sound,fantasy,sad,joke,brand,review,end,character,updateTime',
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
			// ajaxResponse: function (url, params, response) {
			// 	let listData = response.data.map(item => ({
			// 		image_url: item.images.jpg.image_url,
			// 		title: item.title,
			// 		synopsis: item.synopsis ? item.synopsis.substring(0, 200) + "..." : "No synopsis available",
			// 		type: item.type,
			// 		episodes: item.episodes || "N/A"
			// 	}));
			// 	return {
			// 		data: listData,
			// 		last_page: response.pagination.last_visible_page
			// 	};
			// },
			columns: [
				{ title: "STT", formatter: 'rownum', width: 40, hozAlign: 'center', headerSort: false },
				// { title: "Image", field: 'image_url', formatter: 'image', width: 100, formatterParams: { height: '100px', width: '100px', class: 'anime-image' }},
				{ title: "Name", field: 'name', headerSort: false, editor: 'input' },
				{ title: "Story", field: 'story', width: 70, ...ratingProp},
				{ title: "Art", field: 'art', width: 70, ...ratingProp},
				{ title: "Sound", field: 'sound', width: 70, ...ratingProp},
				{ title: "Fantasy", field: 'fantasy', width: 70, ...ratingProp},
				{ title: "Sad", field: 'sad', width: 70, ...ratingProp},
				{ title: "Joke", field: 'joke', width: 70, ...ratingProp},
				{ title: "Brand", field: 'brand', width: 70, ...ratingProp},
				{ title: "Review", field: 'review', width: 70, ...ratingProp},
				{ title: "End", field: 'end', width: 80, headerSort: false, editor: 'input'},
				{ title: "Character", field: 'character', width: 100, headerSort: false, editor: 'input'},
				{ title: "Time", field: 'updateTime', width: 143},
			],
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
		this.c_table.on('cellEditCancelled', (cell) => this.cellEditCancelled(cell));

		// Init Modal
		MicroModal.init({
			// openTrigger: '',
			disableFocus: true,
			debugMode: true,
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

		// Action bảng
		actions.push(
			{
				label: '<img class="menuIcon" src="/res/icons/eye16.png" />Show',
				menu: [
					{
						label: '<img class="menuIcon" src="/res/icons/image16.png" />Image',
						action: (e, row) => {
							row.delete();
						}
					},
				]
			},
		);

		return actions;
	},
	cellEdited: function(cell) { // Sau khi sửa

		var row = cell.getRow(); // Cột đã chỉnh sửa
		let rowData = row.getData(); // Dữ liệu của hàng

		// Bỏ qua nếu là thêm mới
		if (rowData.id == -1)
			return;

		// Update row
		if (rowData._origin == null) {

			var oldValue = cell.getOldValue(); // Giá trị trước khi chỉnh sửa
			var field = cell.getField(); // Tên cột (field)

			// Backup data
			let origin = Object.assign({}, rowData);
			origin[field] = oldValue;
			rowData._origin = origin;

			// Hightlight row
			row.getElement().classList.add('highlight-row-edit');
		}
	},
	cellEditCancelled: function(cell) { // Hủy thay đổi
		console.log('cellEditCancelled', cell);
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
		let curdate = new Date();
		const year = curdate.getFullYear();
		const month = String(curdate.getMonth() + 1).padStart(2, '0');
		const day = String(curdate.getDate()).padStart(2, '0');
		const hours = String(curdate.getHours()).padStart(2, '0');
		const minutes = String(curdate.getMinutes()).padStart(2, '0');
		const seconds = String(curdate.getSeconds()).padStart(2, '0');
		rowData.updateTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;

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
			
		}

		// Replace SQL
		let htmlSQL = Prism.highlight(sql, Prism.languages.sql, 'sql');
		// let htmlSQL = sql.replace(/\n/g, '<br>');
		$('#modal-1-title').html(action+ ' SQL');
		$('#sqlcontent').html(htmlSQL);

		// Show Confirm SQL
		MicroModal.show('modal-1');
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

};
$(document).ready(() => mt.init());