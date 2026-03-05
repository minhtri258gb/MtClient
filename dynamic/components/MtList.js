class MtList extends HTMLElement {

	/**
	 * https://tabulator.info
	 */

	h_debug = true;
	m_name = ''; // Tên trang
	m_struct = null; // Cấu trúc
	d_list = []; // Danh sách dữ liệu

	// Forward
	constructor(name, struct) {
		super(struct);

		// Properties
		this.m_name = name;
		this.m_struct = struct;
	}
	connectedCallback() {
		this.initUI();
		this.load();
	}

	// Method
	initUI() {

		// Create container
		let divContainer = this.buildContainer();

		// Prepare tabulator
		let columns = this.buildColumns();

		// Init Tabulator
		this.c_table = new Tabulator(divContainer, {
			layout: 'fitColumns',
			height: '100%',
			autoRowHeight: true, // Từ động wraptext
			progressiveLoad: 'scroll',
			progressiveLoadScrollMargin: 100,
			filterMode: 'remote', // Filter
			headerFilterLiveFilterDelay: 600,
			sortMode: 'remote', // Sort
			initialSort: [{column: 'time', dir: 'desc'}],
			columns,
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

		// Log
		this.h_debug && console.log(`[MtList.initUI] ${this.m_name}`, { columns });
	}
	async load() {

		// Reset
		this.d_list = [];

		// Load
		switch (this.m_struct.data.type) {
			case 'json':
				this.d_list = await mt.file.loadJson(this.m_struct.data.value);
				break;
		}

		// Show
		this.c_table.setData(this.d_list)
			.then(() => {
				// run code after table has been successfully updated
			})
			.catch((err) => {
				// handle error loading data
			});

		// Log
		this.h_debug && console.log('[MtList.load]', { list: this.d_list });
	}

	// Build
	buildContainer() {
		let divContainer = document.createElement('div');
		divContainer.style.height = '100%';
		this.appendChild(divContainer);

		return divContainer;
	}
	buildColumns() {
		
		let mapHAlign = { 'l': 'left', 'c': 'center', 'r': 'right' };
		let mapVAlign = { 't': 'top', 'm': 'middle', 'b': 'bottom' };

		let columns = [];
		for (let config of this.m_struct.columns) {

			// Default prop
			let column = { title: config.name };

			// Option prop
			if (config.code) column.field = config.code; // trường dữ liệu
			if (config.width) column.width = config.width; // Độ rộng
			if (config.sort != null) column.headerSort = config.sort; // Bật / tắt sắp xếp

			// Mapping Prop
			if (config.hAlign) {
				let val = mapHAlign[config.hAlign];
				if (val) column.hozAlign = val;
				else console.warn(`[MtList.buildColumns] ${this.m_name}: giá trị hAlign=${config.hAlign} không hợp lệ!`);
			}
			if (config.vAlign) {
				let val = mapVAlign[config.vAlign];
				if (val) column.vertAlign = val;
				else console.warn(`[MtList.buildColumns] ${this.m_name}: giá trị vAlign=${config.vAlign} không hợp lệ!`);
			}

			// Special Prop
			if (config.type == 'stt') column.formatter = 'rownum';

			// Thêm vào danh sách
			columns.push(column);
		}
		return columns;
	}
	rowContextMenu(event, row) {
		let actions = [];
		// let rowData = row.getData();

		// Build from struct
		if (this.m_struct.buttons?.row) {

			let buildMenu = (config) => {
				let menu = { label: config.name }; // Label
				
				if (config.icon != null) { // Icon
					menu.label = `<i class="${config.icon}"></i> ${config.name}`;
				}

				if (config.func != null) { // Action
					switch (config.func) {
						case 'openPageForm': menu.action = (event, row) => this.funcOpenPageForm(config.params?.page, row); break;
						case 'newRow': menu.action = (event, row) => this.funcNewRow(); break;
						case 'removeRow': menu.action = (event, row) => this.funcRemoveRow(row); break;
						case 'toggleColumn': menu.action = (event, row) => this.funcToggleColumn(config.params?.column); break;
						case 'toggleFilter': menu.action = (event, row) => this.funcToggleFilter(config.params?.column); break;
					}
				}
				return menu;
			};

			for (let config of this.m_struct.buttons.row) {

				let action = buildMenu(config);

				// SubMenu
				if (config.menus != null) {
					action.menu = [];
					for (let subConf of config.menus) {
						let subAction = buildMenu(subConf);
						action.menu.push(subAction);
					}
				}

				// Thêm vào danh sách action
				actions.push(action);
			}
		}

		return actions;
	}
	
	// Handler
	async funcOpenPageForm(page, row) {

		let rowData = row.getData();

		// Kiểm tra page đã load chưa
		let elPage = mt.d_page[page];
		if (elPage == null)
			elPage = await mt.loadPage(page);

		// Kiểm tra page có modal chưa
		let modal = elPage.c_modal;
		if (modal == null)
			modal = mt.createModal(elPage);

		// Open Modal
		modal.open();

		// Set form delay
		setTimeout(() => elPage.setForm(rowData), 300);

		// Log
		this.h_debug && console.log('[MtList.funcOpenPageForm]', { page, rowData, elPage });
	}
	async funcNewRow() {
		try {
			let row = await this.c_table.addData([{ id: -1}], true)

			// Hightlight row sau khi thêm mới
			row[0].getElement().classList.add('highlight-row-add');
		}
		catch (ex) {
			console.error('[MtList.funcNewRow]', ex);
			showService.toast('error', ex.message);
		}
	}
	async funcRemoveRow(row) {
		try {
			row.delete();
		}
		catch (ex) {
			console.error('[MtList.funcRemoveRow]', ex);
			showService.toast('error', ex.message);
		}
	}
	funcToggleColumn(column) {
		try {
			this.c_table.toggleColumn(column);
			this.c_table.redraw(true);
		}
		catch (ex) {
			console.error('[MtList.funcToggleColumn]', ex);
			showService.toast('error', ex.message);
		}
	}
	funcToggleFilter(columnName) {
		try {
			let column = this.c_table.getColumn(columnName);
			if (column && column.getDefinition().headerFilter) {
				this.c_table.updateColumnDefinition(columnName, { headerFilter: false });
				this.c_table.clearFilter(true);
			}
			else {
				this.c_table.updateColumnDefinition(columnName, { headerFilter: 'input' });
			}
		}
		catch (ex) {
			console.error('[MtList.funcToggleFilter]', ex);
			showService.toast('error', ex.message);
		}
	}
}
customElements.define('mt-list', MtList);
export default MtList;
