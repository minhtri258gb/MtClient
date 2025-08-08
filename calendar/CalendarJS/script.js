var mt = {
	dev: function() {
		// this.calendar.addEvent();
		// this.calendar.addHolidate();
	},
	init: function() {
		this.calendar.init();
		// this.event.refresh(-2);
		this.dev();
	},
	event: {
		lstBirthday: [],
		lstDateEvent: [],
		lstTodo: [],
		lstPeronalLog: [],
		refresh: function(type) {
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
				$.ajax({
					type: 'GET',
					url: '/api/calendar/get',
					// data: JSON.stringify(data),
					contentType: 'application/json',
					success: function(res) {
						mt.event.lstDateEvent = res;
					},
					error: function(e) {
						// anime.c_datagrid.component.datagrid('deleteRow', 0); // #TODO #FIX nếu chỉnh sửa lỗi sẽ xóa dòng 1
						console.error('Fail: '+e);
					}
				});
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

		init: function() {

			// Thiết lập
			let options = {
				manualEditingEnabled: true,
				showDayNumberOrdinals: false, // Ẩn chữ th trên số
				autoRefreshTimerDelay: 0, // Ko refresh
				fullScreenModeEnabled: false, // Ẩn nút toàn màn hình
				openInFullScreenMode: true, // Bật toàn màn hình
				minimumYear: 1990,
				maximumYear: 2050,
				tooltipDelay: 300,
				eventTooltipDelay: 300,
			};

			// Sử dụng ngôn ngữ việt
			options = Object.assign(options, __TRANSLATION_OPTIONS);

			// Khởi tạo lịch
			this.m_cld = new calendarJs('calendar', options);
		},
		addEvent: function() {
			let event = {
				from: new Date(),
				to: new Date(),
				title: "A New Event",
				description: "A description of the event"
			};
			mt.calendar.m_cld.addEvent(event);
		},
		addHolidate: function() {
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
		to: function(date) {

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