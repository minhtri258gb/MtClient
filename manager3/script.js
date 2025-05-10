import { w2grid, w2field, w2tabs } from 'w2ui';

var mt = {

	// Const
	h_path: '/mgr/',

	// Component
	c_w2tabs: null,

	// Properties


	// Method
	init: async function() {

		// Call API Init App
		let resInit = await $.ajax({
			type: 'POST',
			url: '/init',
			data: JSON.stringify({ app: 'manager/manager' }),
			contentType: 'application/json',
		});

		// Init UI - Tab
		mt.c_w2tabs = new w2tabs({
			box: '#tabs',
			name: 'tabs',
			active: 'manager',
			tabs: [{ id: 'manager', text: 'Manager' }],
			onClick(event) {
				mt.openPage(event.target);
			}
		});

		// Quick Open Tab
		// mt.openTab('anime', 'Anime'); // #DEV
		mt.openTab('game', 'Game'); // #DEV
	},
	openTab: function(pageCode, pageName) {

		// Nếu chưa có tab thì thêm mới
		if (mt.c_w2tabs.get(pageCode) == null) {
			mt.c_w2tabs.add({ id: pageCode, text: pageName, closable: true });
			mt.c_w2tabs.refresh();
		}

		// Mở tab
		mt.c_w2tabs.click(pageCode); // Trigger mt.openPage
	},
	openPage: async function(pageCode) {

		// Nếu chưa có trang thì load lên
		if ($('#'+pageCode).length == 0) {
			let html = await mt.utils.load.html(mt.h_path+pageCode+'/index.html');
			$('#listContent').append(`
				<div id="${pageCode}" class="content">
					${html}
				</div>
			`);
			mt.utils.load.css(mt.h_path+pageCode+'/style.css');
			mt.utils.load.js(mt.h_path+pageCode+'/script.js');
		}

		// Ẩn toàn bộ trang và hiện trang đã chọn
		$('.content').hide();
		$('#'+pageCode).show();
	},
	loadContent: async function(pageCode) {
		let response = await fetch(mt.h_path+pageCode+"/index.html");
		let html = await response.text();
		query('#tabContent').html(html);
	},
	addTab: function(pageCode, pageName) {
	},
	utils: {
		load: {
			html: async function(path) {
				let response = await fetch(path);
				return await response.text();
			},
			js: function(path) {
				let head = $('head')[0];
				let script = document.createElement('script');
				script.src = path;
				script.type = 'module';
				// script.type = 'text/javascript';
				head.append(script);
			},
			css: function(path) {
				let head = $('head')[0];
				let style = document.createElement('link');
				style.href = path;
				style.type = 'text/css';
				style.rel = 'stylesheet';
				head.append(style);
			},
		},
	},
};
window.mt = mt;
mt.init();
