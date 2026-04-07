class MtList extends HTMLElement {

	/**
	 * https://tabulator.info
	 */

	h_debug = true;
	m_name = ''; // Tên trang
	m_struct = null; // Cấu trúc
	m_haveEditor = false; // Dánh dấu có editor ko
	d_list = []; // Danh sách dữ liệu
	d_func = {}; // Danh sách chức năng

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
			// progressiveLoad: 'scroll',
			// progressiveLoadScrollMargin: 100,
			// filterMode: 'remote', // Filter
			// headerFilterLiveFilterDelay: 600,
			// sortMode: 'remote', // Sort
			// initialSort: [{column: 'time', dir: 'desc'}],
			columns,
			editorEmptyValue: null,
			rowContextMenu: (event, row) => this.rowContextMenu(event, row),
			// headerSortElement:(column, dir) => {
			// 	switch (dir) {
			// 		case 'asc': return '<img src="/res/icons/sort_up_9x16.png" />';
			// 		case 'desc': return '<img src="/res/icons/sort_down_9x16.png" />';
			// 	}
			// 	return '<img src="/res/icons/sort_9x16.png" />';
			// },
		});

		// Register Event
		if (this.m_haveEditor) // Có khai báo editor mới bật
			this.c_table.on('cellDblClick', (event, cell) => cell.edit(true)); // Dup click để edit

		// Log
		this.h_debug && console.log(`[MtList.initUI] ${this.m_name}`, { columns });
	}
	async load() {

		// Reset
		this.d_list = [];

		// Load data
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

		// Load function
		if (this.m_struct.functions && this.m_struct.functions.length > 0) {
			for (let file of this.m_struct.functions) {
				try {
					let module = await import(`/dynamic/functions/${file}.js`);
					for (let func in module)
						this.d_func[func] = module[func];
				}
				catch (ex) {
					console.warn('[MtList.load] Load function faild:', func);
				}
			}
		}

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

			// Render
			if (config.render) {
				if (config.render == 'dateFromMiliSecond')
					column.formatter = (cell) => this.renderDateFromMiliSecond(cell);
				else if (config.render == 'image')
					column.formatter = (cell) => this.renderImage(cell, config.renderOpts);
				else if (config.render == 'rate')
					column.formatter = (cell) => this.renderRate(cell);
			}

			// Editor
			if (config.editor) {

				this.m_haveEditor = true;

				// let opts = config.editorOpts;

				if (config.editor == 'text') {
					column.editor = 'input';
					column.editable = false;
				}
				else if (config.editor == 'rate') {
					column.editor = 'star';
					column.editable = false;
				}
			}

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
						case 'openModalForm': menu.action = (event, row) => this.funcOpenModalForm(config.params?.page, row); break;
						case 'newRow': menu.action = (event, row) => this.funcNewRow(); break;
						case 'removeRow': menu.action = (event, row) => this.funcRemoveRow(row); break;
						case 'toggleColumn': menu.action = (event, row) => this.funcToggleColumn(config.params?.column); break;
						case 'toggleFilter': menu.action = (event, row) => this.funcToggleFilter(); break;
						default:
							let foo = this.d_func[config.func]; // Lấy từ ext function
							if (foo)
								menu.action = (event, row) => foo({ event, row, config });
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

	// Format Render
	renderDateFromMiliSecond(cell) {
		let timestamp = cell.getValue();
		if (timestamp == null)
			return '';
		return mt.utils.date.date_to_str(new Date(timestamp * 1000), 'dd/MM/yyyy');
	}
	renderImage(cell, opts) {
		let value = cell.getValue();
		if (!value)
			return '';
		let path = opts?.path;
		if (path)
			value = path + '/' + value;
		return `<img src="${value}" />`;
	}
	renderRate(cell) {
		let value = cell.getValue(); // Lấy giá trị của ô (1-5)
		if (value >= 1 && value <= 5)
			return `<img src="/res/icons/rating${value}.png" />`;
		else
			return 'N/A';
	}

	// Handler Button
	async funcOpenModalForm(page, row) {

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
			mt.show.toast('error', ex.message);
		}
	}
	async funcRemoveRow(row) {
		try {
			row.delete();
		}
		catch (ex) {
			console.error('[MtList.funcRemoveRow]', ex);
			mt.show.toast('error', ex.message);
		}
	}
	funcToggleColumn(column) {
		try {
			this.c_table.toggleColumn(column);
			this.c_table.redraw(true);
		}
		catch (ex) {
			console.error('[MtList.funcToggleColumn]', ex);
			mt.show.toast('error', ex.message);
		}
	}
	funcToggleFilter() {
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
			mt.show.toast('error', ex.message);
		}
	}
}
customElements.define('mt-list', MtList);
export default MtList;
