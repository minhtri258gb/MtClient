var mt = {
	init: function() {
		this.calendar.init();
	},
	calendar: {
		_cld: null,
		init: function() {
			const calendar = new tui.Calendar('#calendar', {
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
				// calendars: MOCK_CALENDARS,
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
		changeView: function(type) {
			// type: day, week, month
			this._cld.changeView(type);
		},
		cleanEvent: function() {
			this._cld.clear();
		},
		createEvent: function() { // #TODO
			this._cld.createEvents([
				{
					id: '1',
					calendarId: '1',
					title: 'my event',
					category: 'time',
					dueDateClass: '',
					start: '2018-01-18T22:30:00+09:00',
					end: '2018-01-19T02:30:00+09:00',
				},
				{
					id: '2',
					calendarId: '1',
					title: 'second event',
					category: 'time',
					dueDateClass: '',
					start: '2018-01-18T17:30:00+09:00',
					end: '2018-01-19T17:31:00+09:00',
				},
			]);
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