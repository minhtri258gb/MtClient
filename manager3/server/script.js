// import { w2ui, w2layout, w2toolbar, w2sidebar, w2grid, w2popup, w2alert, w2utils } from 'w2ui';
import { w2grid } from 'w2ui';

let mtServer = {
	h_isShadow: false,
	h_pathNmap: 'D:/Apps/Nmap',
	d_list: [],
	d_map: {},
	c_w2grid: null,
	m_init: false,
	e_contain: null,

	async init() {

		// Add container
		this.e_contain.id = 'server-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		let renderAction = (row, actions) => {
			let htmlBtn = '<div style="display:flex;gap:4px;">';
			htmlBtn += `<button onclick="mt.server.btnRefresh(${row.id})"><i class="fa-solid fa-arrows-rotate"></i></button>`;
			let act = ',' + actions + ',';
			// if (act.includes(',build,'))
			// 	htmlBtn += `<button onclick="mt.server.btnSSH(${row.id},true)"><i class="fa-solid fa-hammer"></i></button>`;
			// if (row.status === false && act.includes(',start,'))
			// 	htmlBtn += `<button onclick="mt.server.btnSSH(${row.id},false)"><i class="fa-solid fa-play"></i></button>`;
			if (row.status === true && act.includes(',link,'))
				htmlBtn += `<button onclick="mt.server.btnLink(${row.id})"><i class="fa-solid fa-link"></i></button>`;
			return htmlBtn + '</div>';
		}
		let renderStatus = (status) => {
			if (status === undefined)
				return `...`;
			else if (status === null)
				return `<i class="fa-solid fa-spinner fa-lg anim-rotate"></i>`;
			return `<i class="fa-solid fa-circle-${status === true ? 'check' : 'xmark'} fa-lg"
				style="color:#${status === true ? '4ade80' : 'f87171'}"></i>`;
		}
		let renderTag = (tags) => {
			let htmlBtn = '<div style="display:flex;gap:4px;">';
			for (let tag of tags) {
				htmlBtn += `<button onclick="mt.server.btnTag('${tag}')">${tag}</button>`;
			}
			return htmlBtn + '</div>';
		}

		// Grid
		this.c_w2grid = new w2grid({
			name: 'grid-server',
			recid: 'id',
			group: 'group',
			show: {
				toolbar: true,
				footer: true,
				lineNumbers: true,
				// toolbarAdd: true,
				// toolbarSave: true,
			},
			toolbar: {
				items: [
					{ type: 'button', id: 'add', text: 'Add', icon: 'w2ui-icon-plus' },
					{ type: 'break' },
					// { type: 'button', id: 'showChanges', text: 'Show Changes' },
					{ type: 'button', id: 'refresh_all', text: 'Refresh All', icon: 'fa-solid fa-arrows-rotate' },
					{ type: 'button', id: 'share', text: 'Share', icon: 'fa-solid fa-share-from-square' },
				],
				onClick: (event) => {
					switch (event.target) {
						case 'add': this.btnAdd(); break;
						case 'refresh_all': this.btnRefreshAll(); break;
						case 'share': this.btnShare(); break;
					}
				}
			},
			columns: [
				{ field: 'actions', text: 'Actions', size: '120px', render: (row, target) => renderAction(row, target.value) },
				{ field: 'status', text: 'Status', size: '52px', attr: 'align=center', render: (row, target) => renderStatus(target.value)},
				{ field: 'name', text: 'Name', size: '300px', resizable: true, sortable: true, searchable: { operator: 'contains' }, editable: { type: 'text' } },
				{ field: 'url', text: 'URL', size: '128px', sortable: true, resizable: true, editable: { type: 'text' } },
				{ field: 'tags', text: 'Tags', size: '300px', render: (row, target) => renderTag(target.value) },
			],
			liveSearch: true,
			multiSearch: true,
			textSearch: 'contains',
			searches: [
				{ field: 'name', label: 'Name', type: 'text', operator: 'contains' },
				{ field: 'tags', label: 'Tags', type: 'text', operator: 'contains' },
			],
		});
		this.c_w2grid.render(this.e_contain);

		// Load data
		await this.load();
		
		// this.c_w2grid.total = this.d_list.length + 100;
		this.c_w2grid.records = this.d_list;
		// this.c_w2grid.sort('time', 'desc');
		this.c_w2grid.refresh();

		// Process Params
		this.processParams();
	},
	async load() {

		// Call API - read file
		this.d_list = await mt.api.fileRead(mt.m_pathDB, 'server.json', 'json');

		let processNode = (server, id) => {

			// Bổ sung id
			server.id = id;

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
			this.d_map[id] = server;
		}

		let id = 1;
		for (let server of this.d_list) {
			processNode(server, id++);

			// Cấu trúc cây w2ui
			if (server.list == null)
				continue;

			for (let subserver of server.list) // Bổ sung id
				processNode(subserver, id++);

			server.w2ui = { children: server.list };
			delete server.list;
		}
	},
	processParams() {
		let urlParams = new URLSearchParams(window.location.search);
		let tag = urlParams.get('tag');
		if (tag != null) {
			this.c_w2grid.search([{ field: 'tags', value: tag, operator: 'contains' }], 'AND');
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

		return output.includes('open');
	},
	btnAdd() {
		let id = this.c_w2grid.records.length + 1;
		// let date = mt.utils.convert_DateToStr(new Date());
		this.c_w2grid.add({ id, tags: [] });
		this.c_w2grid.scrollIntoView(1); // Scroll top
	},
	btnRefreshAll() {
		try {
			mt.m_action = 'RefreshAll';

			this.c_w2grid.selectAll();
			let ids = this.c_w2grid.getSelection();
			this.c_w2grid.selectNone();

			for (let id of ids) {
				this.btnRefresh(id); // No Await
			}
		}
		catch (ex) {
			mt.show.toast(ex.message);
			console.error('[mt.server.btnRefreshAll]', ex);
		}
		finally {
			mt.m_action = '';
		}
	},
	async btnRefresh(serverId) {
		this.c_w2grid.set(serverId, { status: null });
		let server = this.d_map[serverId];
		this.c_w2grid.set(serverId, { status: await this.check(server.host, server.port) });
	},
	async btnShare() {

		// Lấy Port hiện tại
		let URL = location.origin + location.pathname;
		if (URL.indexOf('localhost') > -1) {

			// Call API - Get IP
			let IP = await mt.api.infoIP();
			URL = URL.replace('localhost', IP);
		}

		// Thêm params query
		let paramURL = new URLSearchParams();
		let appName = w2ui.layout_main_tabs.active;
		paramURL.set('app', appName);
		let tags = mt.server.c_w2grid.getSearchData('tags');
		if (tags != null)
			paramURL.set('tag', tags.value);
		URL += '?' + paramURL.toString();
		if (window.location.hash)
			URL += decodeURIComponent(window.location.hash);

		// Tự động copy
		if (window.isSecureContext) {
			await navigator.clipboard.writeText(URL);
			mt.show.toast('success', 'Đã copy link chia sẻ');
		}
		else {
			console.log(URL);
			mt.show.toast('warning', 'Chưa cấp quyền truy cập bộ nhớ đệm! Lấy link trong console.');
		}
	},
	btnLink(serverId) {
		let server = this.d_map[serverId];
		window.open('http://' + server.url, '_blank');
	},
	btnTag(tag) {
		this.c_w2grid.search([{ field: 'tags', value: tag, operator: 'contains' }], 'AND');
	},
}
export default mtServer;
