import mtAuthen from '/common/authen.js';

var mt = {
	h_debug: false,
	p_authen: mtAuthen,

	dev() {
		this.calendar.createEvent();
	},
	async init() {

		// Bind Global
		window.mt = this;

		// Authen
		await this.p_authen.init();

		this.calendar.init();
		this.event.refresh(-2);
		this.dev();
	},

	event: {
		lstBirthday: [],
		lstDateEvent: [],
		lstTodo: [],
		lstPeronalLog: [],

		async refresh(type) {
			// Làm mới danh sách
			if (type == 1 || type == -2) { // Birthday
				// $.ajax({
				// 	type: 'POST',
				// 	url: '/manager/save/anime',
				// 	data: JSON.stringify(data),
				// 	contentType: 'application/json',
				// 	success: function(res) {
				// 		anime.c_datagrid.component.datagrid('reload');
				// 	},
				// 	error: function(e) {
				// 		// anime.c_datagrid.component.datagrid('deleteRow', 0); // #TODO #FIX nếu chỉnh sửa lỗi sẽ xóa dòng 1
				// 		console.error('Fail: '+e);
				// 	}
				// });
			}
			if (type == 2 || type == -2) { // Date event

				let sysdate = new Date();
				let month = sysdate.getMonth() + 1;
				let year = sysdate.getFullYear();

				// Call API
				let response = await fetch('/database/query', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + mt.p_authen.getToken(),
					},
					body: JSON.stringify({
						"database": "calendar",
						"sql": `
							SELECT id, name, day, month, year
							FROM calendar
							WHERE month = ${month} AND year = ${year}
						`
					}),
				});
				const listCalendar = await response.json();
				mt.h_debug && console.log('listCalendar', listCalendar);

				this.lstDateEvent = listCalendar;
			}
			if (type == 3 || type == -2) { // Todo list
				// $.ajax({
				// 	type: 'POST',
				// 	url: '/manager/save/anime',
				// 	data: JSON.stringify(data),
				// 	contentType: 'application/json',
				// 	success: function(res) {
				// 		anime.c_datagrid.component.datagrid('reload');
				// 	},
				// 	error: function(e) {
				// 		// anime.c_datagrid.component.datagrid('deleteRow', 0); // #TODO #FIX nếu chỉnh sửa lỗi sẽ xóa dòng 1
				// 		console.error('Fail: '+e);
				// 	}
				// });
			}
			if (type == 4 || type == -2) { // Personal log
				// $.ajax({
				// 	type: 'POST',
				// 	url: '/manager/save/anime',
				// 	data: JSON.stringify(data),
				// 	contentType: 'application/json',
				// 	success: function(res) {
				// 		anime.c_datagrid.component.datagrid('reload');
				// 	},
				// 	error: function(e) {
				// 		// anime.c_datagrid.component.datagrid('deleteRow', 0); // #TODO #FIX nếu chỉnh sửa lỗi sẽ xóa dòng 1
				// 		console.error('Fail: '+e);
				// 	}
				// });
			}
		},
	},
	calendar: {
		m_cld: null,

		init() {
			this.m_cld = new tui.Calendar('#calendar', {
				defaultView: 'month', // week
				// template: {
				// 	time(event) {
				// 		const { start, end, title } = event;
				// 		return `<span style="color: white;">${formatTime(start)}~${formatTime(end)} ${title}</span>`;
				// 	},
				// 	allday(event) {
				// 		return `<span style="color: gray;">${event.title}</span>`;
				// 	},
				// },
				// calendars: [{
				// 	id: 'cal1',
				// 	name: 'Personal',
				// 	backgroundColor: '#03bd9e',
				// }, {
				// 	id: 'cal2',
				// 	name: 'Work',
				// 	backgroundColor: '#00a9ff',
				// }],
			});

		},
		changeView(type) {
			// type: day, week, month
			this.m_cld.changeView(type);
		},
		cleanEvent() {
			this.m_cld.clear();
		},
		createEvent() { // #TODO
			this.m_cld.createEvents([
				{
					id: '1',
					calendarId: '1',
					title: 'my event',
					category: 'time',
					dueDateClass: '',
					start: '2023-07-18T22:30:00+09:00',
					end: '2023-07-19T02:30:00+09:00',
				},
				{
					id: '2',
					calendarId: '1',
					title: 'second event',
					category: 'time',
					dueDateClass: '',
					start: '2023-07-18T17:30:00+09:00',
					end: '2023-07-19T17:31:00+09:00',
				},
			]);
		},
	},
	solar: {
		to(date) {

			// Phân tích ngày
			let dd = dateObj.getUTCDate();
			let mm = dateObj.getUTCMonth() + 1;
			let yy = dateObj.getUTCFullYear();

			// Đổi ngày dd/mm/yyyy ra số ngày Julius jd
			let a = (14 - mm) / 12;
			let y = yy + 4800 - a;
			let m = mm + 12 * a - 3;

			// Lịch Gregory:
			// let jd = dd + (153*m+2)/5 + 365*y + y/4 - y/100 + y/400 - 32045;

			// Lịch Julius:
			let jd = dd + (153*m+2)/5 + 365*y + y/4 - 32083;

			return jd;
		},
	},
	utils: {
		str2date: function(str) { // Format 
			return date;
		},
	},
};
mt.init();