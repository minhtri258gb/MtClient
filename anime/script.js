
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
				{ title: "Story", field: 'story', width: 69, ...ratingProp},
				{ title: "Art", field: 'art', width: 56, ...ratingProp},
				{ title: "Sound", field: 'sound', width: 82, ...ratingProp},
				{ title: "Fantasy", field: 'fantasy', width: 84, ...ratingProp},
				{ title: "Sad", field: 'sad', width: 57, ...ratingProp},
				{ title: "Joke", field: 'joke', width: 63, ...ratingProp},
				{ title: "Brand", field: 'brand', width: 72, ...ratingProp},
				{ title: "Review", field: 'review', width: 81, ...ratingProp},
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
	},
	rowContextMenu: function(event, row) {
		let actions = [];

		let rowData = row.getData();

		// Lưu
		if (rowData.isEdit) {
			actions.push({
				label: '<img class="menuIcon" src="/res/icons/save16.png" />Save',
				action: (e, row) => {
					row.delete();
				}
			});
		}

		// Tạo mới
		actions.push({
			label: '<img class="menuIcon" src="/res/icons/add.png" />New',
			action: (e, row) => {
				row.delete();
			}
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
		// var oldValue = cell.getOldValue(); // Giá trị trước khi chỉnh sửa
		// var newValue = cell.getValue(); // Giá trị sau khi chỉnh sửa
		// var field = cell.getField(); // Tên cột (field)
		var row = cell.getRow(); // Cột đã chỉnh sửa
		let rowData = row.getData(); // Dữ liệu của hàng

		// console.log("Ô đã thay đổi:");
		// console.log("Cột: ", field);
		// console.log("Giá trị cũ: ", oldValue);
		// console.log("Giá trị mới: ", newValue);
		// console.log("Dữ liệu hàng: ", rowData);

		// Update row
		rowData.isEdit = true;

		// Hightlight row
		row.getElement().classList.add('highlight-row');
	},
	cellEditCancelled: function(cell) { // Hủy thay đổi
		console.log('cellEditCancelled', cell);
	},
};
$(document).ready(() => mt.init());