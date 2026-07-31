/**
 * https://fullcalendar.io/
 */

let mtCalendar = {
	h_isShadow: false,
	m_init: false,
	e_contain: null,
	d_events: {}, // Map year -> list event
	c_calendar: null, // fullcalendar
	c_modal: null, // tingle
	c_form: null, // jsoneditor
	t_tmp: {}, // Quản lý sự kiện tạm

	async init() {

		// Import Library
		await mt.lib.import(['FullCalendar','solarLunar','tingle','jsonEditor','flatpickr']); // 'vanilla-context-menu','ctxmenu'

		// Add container
		this.e_contain.id = 'calendar-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Init Calendar
		this.c_calendar = new FullCalendar.Calendar(this.e_contain, {
			initialView: 'dayGridMonth',
			// initialDate: '2024-12-08', // #DEBUG
			locale: 'vi',
			timeZone: 'Asia/Ho_Chi_Minh',
			height: 'parent',
			// Toolbar
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'addEvent dayGridMonth,timeGridWeek,timeGridDay,listWeek'
			},
			// UI Setting
			firstDay: 1, // Thứ 2 đầu tuần
			weekNumbers: true, // Hiện số tuần của năm
			businessHours: false, // Sẫm màu 2 ngày cuối tuần
			showNonCurrentDates: false, // Sẫm màu các ngày ko thuộc tháng
			buttonText: { // Phiên dịch
				today: 'Hôm nay',
				month: 'Tháng',
				week: 'Tuần',
				day: 'Ngày',
				list: 'Sự kiện'
			},
			// Other
			editable: false,
			selectable: true,
			dayMaxEvents: true, // allow "more" link when too many events
			// Data
			events: [],
			// Custom Button
			customButtons: {
				addEvent: { text: 'Thêm', click: () => {
					let curDate = new Date();
					this.openForm({ id: -1, year: curDate.getFullYear(), name: '', date: mt.utils.convert_DateToStr(curDate), type: 'event' });
				}},
			},
			// Register Event
			datesSet: async (info) => { // khi đổi tháng, kiểu view, ngày, ...
				let year = info.view.currentStart.getFullYear();
				await this.load(year);
			},
			eventClick: (info) => this.openForm(info.event.extendedProps),
			dateClick: (info) => {
				if (this.t_tmp.clickDate == info.dateStr) {
					delete this.t_tmp.clickDate;
					this.openForm({ id: -1, year: info.view.currentStart.getFullYear(), name: '', date: info.dateStr, type: 'event' }); // Dupclick thì thêm sự kiện
				}
				else this.t_tmp.clickDate = info.dateStr; // Đánh dấu là nhấn vào ngày này
			},
		});
		this.c_calendar.render();

		// Init popup - tingle
		this.c_modal = new tingle.modal({
			footer: false,
			stickyFooter: false,
			closeMethods: ['button', 'escape'], // 'overlay'
			closeLabel: "Đóng",
			onOpen: function() {
				// console.log('modal opened');
			},
			onClose: function() {
				// console.log('modal closed');
			},
			beforeClose: function() {
				// Return true to close the modal, false to prevent closing
				return true;
			},
		});

		// Contain Form
		const elementForm = document.createElement('div');
		elementForm.style.width = '500px';
		this.c_modal.modalBox.style.width = 'unset'; // Bỏ width gốc
		this.c_modal.modalBoxContent.appendChild(elementForm); // Đặt contain form vào modal

		// Init form - JsonEditor
		// mt.lib.jsonEditor.ex.RateRegister();
		// mt.lib.jsonEditor.ex.TagBoxRegister();
		this.c_form = new JSONEditor(elementForm, {
			use_name_attributes: false,
			theme: 'barebones',
			iconlib: 'fontawesome5',
			disable_edit_json: true,
			disable_properties: true,
			disable_collapse: true,
			schema: {
				title: 'Lịch sự kiện',
				type: 'object',
				required: ['name', 'date'],
				properties: {
					'id': { type: 'integer', format: 'hidden', options: { titleHidden: true } },
					'year': { type: 'integer', format: 'hidden', options: { titleHidden: true } },
					'date': { title: 'Date', type: 'string', format: 'date', readonly: true, options: { flatpickr: { locale: 'vn', altInput: true, altFormat: 'd.m.Y', dateFormat: 'Y-m-d' }}},
					'name': { title: 'Name', type: 'string', format: 'text', minLength: 0, options: { autocomplete: 'off' } },
					'type': { title: 'Type', type: 'string', enum: ['normal','meet','birthday','holiday','note'] },
					'time': { title: 'Time', type: 'string', format: 'time', options: { flatpickr: { locale: 'vn', enableTime: true, noCalendar: true, dateFormat: 'H:i', time_24hr: true }}},
					'location': { title: 'Location', type: 'string', format: 'text', options: { autocomplete: 'off' } },
					'btn_map': { title: 'Open Map', type: 'string', format: 'button', options: { button: { icon: 'location-dot', action: () => this.btnOpenMap() }}},
					'btn_save': { title: 'Save', type: 'string', format: 'button', options: { button: { icon: 'save', action: () => this.saveForm() }}},
					'btn_cancel': { title: 'Cancel', type: 'string', format: 'button', options: { button: { icon: 'close', action: () => this.c_modal.close() }}},
				}
			},
		});
	},
	async load(year) {
		try {

			// Nếu đã có data thì bỏ qua
			if (this.d_events[year] != null)
				return;

			// Call API
			let listEvent = await mt.api.fileRead(mt.m_pathServer+'/database', `calendar/${year}.json`, 'json');

			// Auto gen
			if (listEvent.length == 0)
				listEvent = await this.generate(year);

			// Process
			for (let i=0; i<listEvent.length; i++) {
				let event = listEvent[i];
				
				// Bổ sung Id
				event.id = i+1;

				// Bổ sung year
				event.year = Number.parseInt(event.date.substring(0, 4));
			}

			// Bind Data
			this.d_events[year] = listEvent;

			// Set into calendar
			this.setEvents(listEvent);

			// Log
			mt.h_debug && console.log('[mt.calendar.load]', { year, listEvent });
		}
		catch (ex) {
			mt.show.toast('error', ex.message);
			console.error('[mt.calendar.load]', ex);
		}
	},
	async openForm(event) {

		// Clone
		let formData = JSON.parse(JSON.stringify(event));

		// Bổ sung field để hiển thị
		if (formData.time == null)
			formData.time = '00:00';
		if (formData.type == null)
			formData.type = 'normal';
		formData.location = (formData.location == null) ? '' : (formData.location.lat + ', ' + formData.location.lng);
		
		// Set form data
		this.c_form.setValue(formData);
		
		// Open Modal
		this.c_modal.open();

		// Log
		mt.h_debug && console.log('[mt.calendar.openForm]', { event, formData });
	},
	async saveForm() {
		try {

			// Lấy data form
			let formData = this.c_form.getValue();
			let year = formData.year;
			let id = formData.id;

			// Process form data
			if (formData.time == '00:00')
				delete formData.time;

			if (formData.type == 'normal')
				delete formData.type;

			let locationInput = formData.location;
			delete formData.location;
			if (locationInput != null && locationInput.length > 0) { // location từ 'lat, lng' thành { lat: ... , lng: ... }
				let locPath = locationInput.split(', ');
				if (locPath.length == 2) {
					try {
						let location = {
							lat: Number.parseFloat(locPath[0]),
							lng: Number.parseFloat(locPath[1])
						};
						formData.location = location;
					}
					catch (ex) {} // skip nếu lỗi
				}
			}
			
			// Lưu và cập nhật UI
			if (id == -1) { // Add event
				let newid = this.d_events[year].length;
				formData.id = newid;

				this.d_events[year].push(formData);

				let style = this.getTypeColor(formData.type);
				this.c_calendar.addEvent({
					id: id,
					title: formData.name,
					start: formData.date,
					backgroundColor: style.bgColor,
					textColor: style.color,
					borderColor: style.bdColor,
					extendedProps: formData,
				});
			}
			else { // Update event
				let oldData = this.d_events[year][id-1];
				this.d_events[year][id-1] = formData;
				let event = this.c_calendar.getEventById(id);

				if (formData.name != oldData.name)
					event.setProp('title', formData.name);

				if (formData.type != oldData.type) {
					let style = this.getTypeColor(formData.type);
					event.setProp('backgroundColor', style.bgColor);
					event.setProp('textColor', style.color);
					event.setProp('borderColor', style.bdColor);
				}

				for (let prop in formData) {
					if (prop == 'id' || prop == 'date')
						continue;
					event.setExtendedProp(prop, formData[prop]);
				}
			}

			// Save data
			let cloneData = JSON.parse(JSON.stringify(this.d_events[year]));
			for (let event of cloneData) {
				delete event.id;
				delete event.year;
			}
			let content = JSON.stringify(cloneData);

			// Call API - write file
			await mt.api.fileWriteText(`${mt.m_pathDB}/calendar/${year}.json`, content, true);

			// Toast
			mt.show.toast('success', 'Đã lưu lịch.');

			// Close modal
			this.c_modal.close();

			// Log
			mt.h_debug && console.log('[mt.calendar.saveForm]', { formData });
		}
		catch (ex) {
			mt.show.toast('error', 'Dữ liệu nhập chưa hợp lệ!');
			console.error('[mt.calendar.saveForm] Exception:', ex);
		}
	},
	btnOpenMap() {
	
		// Lấy data form
		let formData = this.c_form.getValue();
		let year = formData.year;
		let id = formData.id;

		let event = this.d_events[year][id-1];

		if (!event.location) {
			mt.show.toast('warning', 'Chưa nhập Location');
			return;
		}

		let url = `/manager3/?app=map&lat=${event.location.lat}&lng=${event.location.lng}`;
		window.open(url);
	},
	async generate(year) { // Tạo data của năm

		// Call API load
		let listGen = await mt.api.fileRead(mt.m_pathServer+'/database', 'calendar/gen.json', 'json');

		// Gen
		let listEvent = [];
		for (let gen of listGen) {
			let event = null;
			switch (gen.gen) {
				case 'yearly':
					event = { date: year + gen.date.slice(4), name: gen.name };
					break;
				case 'yearly-lunar':
					event = { date: this.convert_Lunar2Solar(year + gen.date.slice(4)), name: gen.name };
					break;
				default:
					continue;
			}
			if (gen.type) // Bổ sung type
				event.type = gen.type;
			listEvent.push(event); // Thêm vào danh sách
		}

		// Lưu lại
		mt.api.fileWriteText(`${mt.m_pathDB}/calendar/${year}.json`, listEvent, true);

		// Thông báo
		// w2alert(`Đã tạo dữ liệu năm ${year}.`);
		w2utils.notify(`Đã tạo dữ liệu năm ${year}.`, { class: 'custom-class', where: '#preview-box' });
		
		// Log
		mt.h_debug && console.log('[mt.calendar.generate]', { listGen, listEvent });

		// Return
		return listEvent;
	},
	setEvents(listEvent) {
		let lstData = [];
		for (let i=0, sz=listEvent.length; i<sz; i++) {
			let event = listEvent[i];
			let style = this.getTypeColor(event.type);
			lstData.push({
				id: event.id,
				title: event.name,
				start: event.date,
				backgroundColor: style.bgColor,
				textColor: style.color,
				borderColor: style.bdColor,
				extendedProps: event,
			});
		}
		this.c_calendar.addEventSource(lstData);
	},
	getTypeColor(type) {
		let bgColor = '#ffffff', color = '#000000', bdColor = '#ffffff';
		switch (type) {
			case 'meet': bgColor ='#3788d8'; color = '#fff'; break;
			case 'birthday': bgColor ='#9dfca5'; break;
			case 'holiday': bgColor ='#f19dfc'; break;
			case 'note': bgColor ='#fcfa9d'; break;
		}
		return { bgColor, color, bdColor };
	},
	convert_Lunar2Solar(lunarDateStr) {
		let year = Number.parseInt(lunarDateStr.substring(0, 4));
		let month = Number.parseInt(lunarDateStr.substring(5, 7));
		let day = Number.parseInt(lunarDateStr.substring(8, 10));
		let sonarDate = solarLunar.lunar2solar(year, month, day, false);
		let funcPad = (num) => (num < 10) ? '0'+num : ''+num;
		return `${sonarDate.cYear}-${funcPad(sonarDate.cMonth)}-${funcPad(sonarDate.cDay)}`;
	},
}
export default mtCalendar;