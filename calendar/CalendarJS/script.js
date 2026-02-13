import mtAuthen from '/common/authen.js';

var mt = {
	h_debug: false,
	auth: mtAuthen,

	dev() {
		// this.calendar.addEvent();
		// this.calendar.addHolidate();
	},
	async init() {

		// Bind Global
		window.mt = this;

		// Authen
		await this.auth.init();

		this.calendar.init();
		this.dev();
	},
	event: {
		lstBirthday: [],
		lstDateEvent: [],
		lstTodo: [],
		lstPeronalLog: [],

		async refresh(type, date) {
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

				if (date == null)
					date = new Date();
				let month = date.getMonth() + 1;
				let year = date.getFullYear();

				// Call API
				let response = await fetch('/database/query', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + mt.auth.getToken(),
					},
					body: JSON.stringify({
						'database': 'calendar',
						'sql': `
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
		m_cld: null, // Instance

		init() {

			// Thiết lập
			let options = {
				showDayNumberOrdinals: false, // Ẩn chữ th trên số
				dragAndDropForEventsEnabled: false, // Ko cho kéo thả sự kiện
				manualEditingEnabled: true,
				autoRefreshTimerDelay: 0, // Ko refresh
				fullScreenModeEnabled: false, // Ẩn nút toàn màn hình
				tooltipDelay: 300,
				eventTooltipDelay: 300,
				defaultEventBackgroundColor: '#484848',
				defaultEventTextColor: '#F5F5F5',
				defaultEventBorderColor: '#282828',
				openInFullScreenMode: true, // Bật toàn màn hình
				workingDays: [0,1,2,3,4],
				minimumYear: 1990,
				maximumYear: 2050,
				startOfWeekDay: 0,
				workingHoursStart: '08:00',
				workingHoursEnd: '17:00',
				events: {
					onEventsFetch: () => mt.event.refresh(-2),
					onSetDate: (date) => mt.event.refresh(-2, date),
					onDatePickerDateChanged: (date) => mt.event.refresh(-2, date),
				},
			};

			// Sử dụng ngôn ngữ việt
			options = Object.assign(options, __TRANSLATION_OPTIONS);

			// Khởi tạo lịch
			this.m_cld = new calendarJs('calendar', options);
		},
		addEvent() {
			let event = {
				from: new Date(),
				to: new Date(),
				title: "A New Event",
				description: "A description of the event"
			};
			mt.calendar.m_cld.addEvent(event);
		},
		addHolidate() {
			/** Holidate struct {
			 *   day: number,
			 *   month: number,
			 *   year: number,
			 *   title: string,
			 *   onClick: function => Object,
			 *   onClickUrl: function => string,
			 *   backgroundColor: string,
			 *   textColor: string,
			 * }
			 */
			let today = new Date();
			let holiday = {
				day: today.getDate(),
				month: today.getMonth() + 1,
				title: "A New Holiday",
			};
			this.m_cld.addHolidays([holiday]);
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
		str2date(str) { // Format 
			return date;
		},
	},
};
mt.init();