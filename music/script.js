var mt = {
	init: function() { // Khởi tạo
		this.skip = true; // Skip for before interact
		this.core.init();
		this.gui.init();
		this.player.init();
		this.next.init();
		this.mgr.init();
		this.event.init();
		this.effect.init();
		this.handler.prepare(); // Process URL Param OR Auto play
	},
	initOnInteract: function() {
		// API get music will call: mt.handler.changeMusicPost
		if (this.skip) {
			delete this.skip;
			this.visual.init();
		}
	},
	config: {
		defaultVolume: 0.3, // Âm lượng mặc định của loa
	},
	core: {
		interactName: '',
		init: function() {

			// Set Authenticate
			$.ajax({
				type: 'POST',
				url: '/authorize',
				data: {},
				success: function(res) {
					if (typeof(res) == 'boolean')
						mt.authorize = res
					else
						mt.authorize = (res == 'true');
				}
			});
		},
		isLocal: function() {
			return window.location.href.startsWith('http://localhost/');
		},
		isSafe: function() {
			return window.isSecureContext;
		},
	},
	gui: { // Giao diện
		layout: null,
		init: function() {
			// Init layout easyUI
			let c = $('#layout');
			this.layout = c;
			c.layout({ fit: true });
			c.layout('panel', 'center').panel('options').onResize = mt.gui.onCenterResize;
			c.layout('collapse', 'east');
		},
		notice: function(message, durationSecond = 3) {
			$.messager.show({
				title: 'Notice',
				msg: message,
				timeout: durationSecond * 1000,
				showType: 'slide'
			});
		},
		changeMusicTitle: function(music) {

			// Tên nhạc
			let musicName = music.name;
			if (music.artists) // Tên nghệ sĩ
				musicName = music.artists + " - " + musicName;

			// Đổi tiêu đề web
			document.title = musicName;

			// Đổi tên hiển thị
			$('#music_title').html(musicName);
		},
		onCenterResize: function(width, height) { // #TODO position
			let ops = mt.gui.layout.layout('panel', 'center').panel('options');
			if (mt.mgr.c_list.component)
				mt.mgr.c_list.component.datagrid({ width:ops.width - 12, height:ops.height - 48 });
		},
		onCollapseRight: function() { // #TODO position
			if (mt.edit.isOpen)
				mt.edit.close();
			else if (mt.new.isOpen)
				mt.new.close();
			else if (mt.cut.isOpen)
				mt.cut.close();
		},
		onResizeRight: function() { // #TODO position
			if (mt.new.isOpen)
				mt.new.c_list.resize();
		},
	},
	mgr: { // Quản lý
		musics: [], // List music from server
		history: [], // List histtory music played
		lstRandSeed: [],
		init: function() {
			this.c_tabInclude.init();
			this.c_tabExclude.init();
			this.c_list.init();
		},
		getListMusic: function(filter) {

			// Call API /music/getListMusic
			this.musics = $.ajax({
				type: 'POST',
				url: '/music/getListMusic',
				data: filter,
				async: false
			}).responseJSON;

			// Brower lst Music
			this.lstRandSeed = [];
			for (let i=0; i<this.musics.length; i++) {
				let music = this.musics[i];

				// Add property reference id array
				music.idArr = i;

				// Compile lstRandSeed
				for (let j=0; j<music.rate; j++)
					this.lstRandSeed.push(i);
			}
		},
		fillDuration: function(duration) {
			let music = this.musics[mt.player.musicIdPlay];
			if (duration != music.duration) {
				
				// Điền vào datagrid dữ liệu
				let durationStr = mt.util.cov_time(duration);
				$('#duration'+music.id).html(durationStr);

				// Điền vào form nếu mở
				if (mt.edit.isOpen)
					$('#form_duration').textbox('setValue', duration);
			}
		},
		removeMusic: function() {

			// Kiểm tra quyền
			if (!mt.authorize) {
				alert("Access denied");
				return;
			}

			// Bỏ qua nếu chưa chọn bài
			let music = this.c_list.getSelected();
			if (!music) {
				alert("Chưa chọn bài");
				return;
			}

			// Tạm ngưng nhạc nếu đang phát
			if (mt.player.isPlay)
				mt.player.c_pause.onClick();

			// Xác nhận xóa
			$.messager.confirm('Confirm','Are you sure you want to remove music?', function(r) {
				if (r) {
					$.ajax({
						type: 'DELETE',
						url: '/music/remove',
						data: { id: music.id },
						success: function(res) { mt.mgr.c_list.reload(); }, // callback
						error: function(e) { alert('Fail: '+e); } // callback
					});
				}
			});
		},
		c_tabInclude: {
			component: null,
			init: function() {
				let c = $('#tagInclude');
				mt.mgr.c_tabInclude.component = c;
				c.tagbox({
					label: 'Include: ',
					onChange: mt.mgr.c_tabInclude.onChange
				});
			},
			onChange: function(newValue, oldValue) {
				mt.mgr.c_list.reload();
			},
			get: function() {
				return mt.mgr.c_tabInclude.component.tagbox('getValues');
			}
		},
		c_tabExclude: {
			component: null,
			init: function() {
				let c = $('#tagExclude');
				mt.mgr.c_tabExclude.component = c;
				c.tagbox({
					label: 'Exclude: ',
					value: 'less',
					onChange: mt.mgr.c_tabExclude.onChange
				});
			},
			onChange: function(newValue, oldValue) {
				mt.mgr.c_list.reload();
			},
			get: function() {
				return mt.mgr.c_tabExclude.component.tagbox('getValues');
			}
		},
		c_list: {
			component: null,
			init: function() {
				
				// Component
				this.component = $("#list");
				
				this.initDatagrid();
			},
			initDatagrid: function() {
				
				// Thêm editor loại tagbox
				if ($.fn.datagrid.defaults.editors.tagbox == undefined) {
					$.extend($.fn.datagrid.defaults.editors, {
						tagbox: {
							init: function(container,options){
								let input = $('<input>').appendTo(container);
								input.tagbox(options);
								return input;
							},
							destroy: function(target){
								$(target).tagbox('destroy');
							},
							getValue: function(target){
								return $(target).tagbox('getValues').join(',');
							},
							setValue: function(target, value){
								if (value){
									$(target).tagbox('setValues', value.split(','));
								} else {
									$(target).tagbox('clear');
								}
							},
							resize: function(target, width){
								$(target).tagbox('resize', width);
							}
						}
					});
				}
				
				this.component.datagrid({
					data: this.getData(),
					toolbar: '#toolbar',
					fitColumns: true,
					rownumbers: true,
					singleSelect: true,
					autoRowHeight: false,
					columns:[[
						{field:'artists', title:'Artists', sortable:false, resizable:true, align:'left', editor:'textbox'},
						{field:'name', title:'Name', sortable:false, resizable:true, align:'left', editor:'textbox'},
						{field:'duration', title:'Duration', width:'64px', sortable:false, resizable:false, align:'center',
							formatter:function(v,r,i) {
								let durationStr = (v == null ? '' : mt.util.cov_time(v));
								return '<span id="duration'+r.id+'">'+durationStr+'</span>';
							}},
						{field:'tags', title:'Tags', sortable:false, resizable:true, align:'left', editor:'tagbox'},
						{field:'rate', title:'Rate', width:60, align:'center', sortable:true, editor:{type:'numberspinner', options:{min:1, max:5}}, formatter: function(v,r,i) {
							return '<span class="rating l-btn-icon icon-rating'+v+'" style="position:initial;margin-top:0px"></span>';
						}},
						{field:'action', title:'', width:70, hidden:true, formatter:function(v, r, i) {
							return '<div id="action'+r.id+'"></div>';
						}}
					]],
					onSelect: function(i,r) {
						mt.edit.fillData(r);
					},
					onDblClickRow: function(index,row) { // interact
						mt.handler.changeMusic(index, "mt.mgr.c_list.dupClickRow");
					},
				});
			},
			getData: function() {
	
				// Lấy filter
				let inc = mt.mgr.c_tabInclude.get();
				let exc = mt.mgr.c_tabExclude.get();
	
				// Tải dữ liệu về từ filter 
				mt.mgr.getListMusic({
					include: inc,
					exclude: exc
				});
	
				// Trả kết quả
				return {
					rows: mt.mgr.musics,
					total: mt.mgr.musics.length
				};
			},
			reload: function() {
				let newData = this.getData();
				this.component.datagrid('loadData', newData);
	
				// Remove list next
				while (mt.next._listnext.datalist('getRowIndex') == 0) {
					mt.next._listnext.datalist('deleteRow', 0);
				}
			},
			scrollToCur: function() {
				let curMusicId = mt.player.musicIdPlay;
				if (curMusicId) {
					let dg = mt.mgr.c_list.component;
					let music = dg.datagrid('getSelected');
					if (music == null || music.idArr != curMusicId)
						dg.datagrid('selectRow', curMusicId);
					dg.datagrid('scrollTo', curMusicId);
				}
			},
			getSelected: function() {
				return this.component.datagrid('getSelected');
			},
		},
	},
	handler: { // #TODO chuyển đi hết
		_target: null,
		begin: function(target) {
			if (target != undefined) {
				if (this._target != null)
					return true;
				this._target = target;
			}
			return false;
		},
		end: function(target) {
			if (target != undefined) {
				this._target = null;
			}
		},
		prepare: function() {

			// Get param
			let urlParams = new URLSearchParams(window.location.search);
			let param = {
				stt: urlParams.get('stt')
			};

			// Add next list
			if (param.stt != null && !isNaN(param.stt)) {
				let name = mt.mgr.musics.length == 0 ? 'Next Music' : mt.mgr.musics[param.stt].name; // Thêm tên cho next list nếu ko tự play ngay
				mt.next.push({idArr: param.stt, name:name});
			}

			// Reset URL
			window.history.pushState('', '', '/music');

			// Lỗi đối với bản Chrome mới
			// // Auto play
			// if (mt.core.isLocal()) { // Lỗi tương tác nhạc đối với truy cập IP / hostname
			// 	setTimeout(() => mt.handler.next("auto"), 1000);
			// }
		},
		pause: function(target) {
			
			// mt.event.keydown.space
			// mt.player.c_pause.click

			if (this.begin(target))
				return;
			
			if (mt.player.musicIdPlay == -1) {
				this.next();
				return;
			}

			mt.player.pause();
			mt.player.c_pause.switchIcon();

			this.end(target);
		},
		next: function(target) {
			if (this.begin(target))
				return;

			// mt.event.keydown.enter
			// mt.player.c_next.click
			// mt.player.onEnd

			// If list next have data, get it
			let row = mt.next.pop();
			if (row != null) {

				// change loop
				mt.player.c_loop.set(row.loop);

				// change music
				this.changeMusic(row.stt);
				return;
			}

			// #TODO randomlist
			// let i = Math.floor(Math.random() * mt.mgr.musics.length);
			let len = mt.mgr.lstRandSeed.length;
			let seed = Math.floor(Math.random() * len);
			let musicIdArr = mt.mgr.lstRandSeed[seed];

			this.changeMusic(musicIdArr);
		},
		changeMusic: function(musicId, target) {
			
			if (this.begin(target))
				return;

			// Add history (exception BACK)
			if (mt.player.musicIdPlay != -1 && this._target != "mt.player.c_back.click")
				mt.mgr.history.push(mt.player.musicIdPlay);

			// Select Row (just UI) and scroll to [exception mt.mgr.c_list.selectRow]
			if (this._target != "mt.mgr.c_list.clickRow") {
				setTimeout(() => { mt.mgr.c_list.scrollToCur() }, 500); // Scroll to music
				mt.mgr.c_list.component.datagrid('selectRow', musicId); // Show select row on datagrid
			}

			// Handler
			mt.player.musicIdPlay = musicId;
			let music = mt.mgr.musics[musicId];

			// Chage name on UI
			mt.gui.changeMusicTitle(music);

			// Set volume
			mt.player.c_volumeBar.setOffset(music.decibel)
			mt.player.c_volumeBar.setVolume();

			// Clean Wave
			mt.visual.clear();

			// Load music
			$.ajax({
				type: 'GET',
				url: '/music/getMusic?filename='+music.filename,
				xhrFields: { responseType: 'arraybuffer'},
				success: this.changeMusicPost,
				error: (xhr, ajaxOptions, thrownError) => {
					if (xhr.status == 404) { // Lỗi xảy ra do server nodejs
						mt.gui.notice('Server not running\nSite auto reload on 10 seccond'); // Thông báo khởi động máy chủ
						setTimeout(() => { location.reload(); }, 10000);
					} else if (xhr.status == 303) {
						mt.gui.notice('File not found'); // Thông báo không tìm thấy bài trong ổ đĩa
						mt.handler.end("force");
						setTimeout(() => {
							mt.handler.next("auto");
						}, 4000); // Tự động next
					}
				},
			});

			// Call event
			mt.event.changeMusic();
		},
		changeMusicPost: function(res) {

			// Init after interact
			mt.initOnInteract();

			// Free and Create BlogUrl
			if (mt.player._blogUrl.length > 0)
				URL.revokeObjectURL(mt.player._blogUrl);
			
			mt.player._blogUrl = URL.createObjectURL(new Blob([res]));

			// Load to player
			let c = mt.player.component[0];
			c.src = mt.player._blogUrl;
			c.pause();
			c.load();
			c.oncanplaythrough = c.play();

			// Generate Wave
			mt.visual.generate(res);

			// Value
			mt.player.isPlay = true;
			mt.player.c_pause.switchIcon();

			mt.handler.end("force");
		},
		share: function() {
			$.get('/common/getIPLocal', function(res, status) {
				if (status == 'success') {
					let url = "http://" + res + "/music?stt=" + mt.player.musicIdPlay;
					if (mt.core.isSafe()) // Tự động copy
						navigator.clipboard.writeText(url).then(() => mt.gui.notice("Copied link to share"));
					else
						mt.gui.notice("Link for share: " + url);
				}
			});
		},
	},
	event: { // #TODO chuyển đi hết
		_focus: true,
		init: function() {
			this.resize();
			this.keypress();
			this.onfocus();
			// this.media();
		},
		resize: function() {
			window.addEventListener('resize', function (event) {

			});
		},
		keypress: function() {
			window.addEventListener('keyup', function(event) {
			});
			window.addEventListener('keydown', function(event) {
				let isAction = false;
				if (event.code === 'Space') {
					isAction = true;
					mt.handler.pause("mt.event.keydown.space");
				}
				
				if (isAction)
					event.preventDefault();
				return !isAction;
			});
		},
		onfocus: function() {
			window.onfocus = function() {
				// mt.mgr.c_list.scrollToCur(); // pause lại
				mt.event._focus = true;
			};
		},
		onblur: function() {
			window.onblur = function() {
				mt.event._focus = false;
			}
		},
		media: function() {
			navigator.mediaSession.setActionHandler('play', () => { mt.handler.pause("mt.event.media.play") });
			navigator.mediaSession.setActionHandler('pause', () => { mt.handler.pause("mt.event.media.pause") });
			// navigator.mediaSession.setActionHandler('seekbackward', function() { alert('seekbackward') });
			// navigator.mediaSession.setActionHandler('seekforward', function() { alert('seekforward') });
			navigator.mediaSession.setActionHandler('previoustrack', () => { mt.player.c_back.onClick() });
			navigator.mediaSession.setActionHandler('nexttrack', () => { mt.player.c_next.onClick() });
		},
		changeMusic: function() {

		},
		loadedMusic: function() {

			// Wave
			mt.visual._durationTimeLbl.html(mt.util.cov_time(mt.player.duration));

		},
		playMusic: function() {
			mt.visual.update(this.currentTime);
			mt.cut.onUpdate(this.currentTime);
			mt.track.onUpdate(this.currentTime);

			// Wave
			mt.visual._currentTimeLbl.html(mt.util.cov_time(this.currentTime));
		},
		endMusic: function() {

		},
	},
	player: {
		component: null,
		musicIdPlay: -1,
		isPlay: false,
		duration: 0,
		_blogUrl: '',
		init: function() {

			// Load default
			this.c_volumeBar.base = mt.config.defaultVolume;

			// Init Component
			let audio = new Audio();
			let c = $(audio);
			this.component = c;
			c.on("ended", mt.player.onEnd);
			c.on("loadeddata", mt.player.onLoadedData);
			c.on("timeupdate", mt.event.playMusic);
			c.prop("volume", this.c_volumeBar.base); // Set giá trị mặc định loa
			
			// gui
			this.c_pause.init();
			this.c_next.init();
			this.c_back.init();
			this.c_volumeBar.init();
			this.c_btnVolume.init();
			this.c_autoNext.init();
			this.c_loop.init();
		},
		changeMusic: function(index) {
			// #TODO
		},
		onEnd: function(event) { // callback
			let self = mt.player;

			let nextFlag1 = self.c_autoNext.value();
			let nextFlag2 = mt.cut.onPlayerEnd();
			let nextFlag3 = mt.track.onPlayerEnd();

			if (nextFlag1 && nextFlag2 && nextFlag3) {
				if (self.c_loop.pop()) self.replay(); // If have loop then replay
				else mt.handler.next("mt.player.onEnd"); // Auto next
			}
			else {

				// State end music
				self.isPlay = false;
				self.musicIdPlay = -1;
				self.duration = 0;
				self.c_pause.switchIcon();
			}
		},
		onLoadedData: function() {
			let self = mt.player;

			// value
			self.duration = this.duration;

			// List duration
			mt.mgr.fillDuration(this.duration); // Thêm duration nếu data thiếu

			// register event
			mt.event.media();
			
			// Tool cut
			mt.cut.onChangeMusic();

			// Tool Track
			mt.track.onChangeMusic();

			// Call Event
			mt.event.loadedMusic();
		},
		setVolume: function(n) {
			if (!isNaN(n)) {
				if (n > 1.0)
					n = 1.0;
				else if (n < 0.0)
					n = 0.0;
				mt.player.component.prop("volume", n);
			}
		},
		replay: function() {
			let c = mt.player.component;
			c[0].currentTime = 0;
			c[0].play();
		},
		pause: function(flag) {
			let c = this.component;
			if (flag === undefined)
				flag = c[0].paused == false;
			flag ? c[0].pause() : c[0].play();
			mt.player.isPlay = !flag;
		},
		changeTime: function(value) {
			this.component[0].currentTime = value;
		},
		playForce: function() { // interact
			mt.core.interactName = 'mt.player.playForce';
			let music = mt.mgr.c_list.getSelected();
			if (music)
				mt.handler.changeMusic(music.idArr, mt.core.interactName);
		},
		c_pause: {
			component: null,
			init: function() {
				let c = $("#btnPause");
				this.component = c;
			},
			onClick: function() {
				mt.handler.pause("mt.player.c_pause.click");
			},
			switchIcon: function() {
				if (mt.player.isPlay)
					this.component.linkbutton({ iconCls: 'icon-pause' });
				else
					this.component.linkbutton({ iconCls: 'icon-play' });
			}
		},
		c_next: {
			component: null,
			init: function() {
				this.component = $("#btnNext");
			},
			onClick: function() {
				mt.handler.next("mt.player.c_next.click");
			}
		},
		c_back: {
			component: null,
			init: function() {
				this.component = $("#btnBack");
			},
			onClick: function() {
				if (mt.mgr.history.length > 0)
					mt.handler.changeMusic(mt.mgr.history.pop(), "mt.player.c_back.click");
			}
		},
		c_volumeBar: {

			component: null,
			base: 1.0,
			offset: 100.0,

			init: function() {
				let c = $('#volumeBar');
				this.component = c;
				c.slider({
					mode: 'v',
					height: '120px',
					value: this.base,
					min: 0.0,
					max: 1.0,
					step: 0.02,
					onChange: this.onChange
				});
			},
			onChange: function(newValue, oldValue) {
				let self = mt.player.c_volumeBar;
				self.base = newValue / (self.offset / 100.0);
				mt.player.setVolume(newValue);
				mt.player.c_btnVolume.update(newValue);
			},
			getVolume: function() {
				return this.component.slider('getValue');
			},
			setVolume: function(volume) {
				if (volume == undefined)
					volume = this.base * (this.offset / 100.0);
				mt.player.c_volumeBar.component.slider('setValue', volume);
			},
			setOffset: function(offset) {
				this.offset = offset;
			}
		},
		c_btnVolume: {
			component: null,
			status: 0,
			oldValue: 0,
	
			init: function() {
				this.component = $('#btnVolume');
				this.update(mt.player.c_volumeBar.base);
			},
	
			update: function(volume) {
				if (volume == undefined)
					volume = mt.player.c_volumeBar.getVolume();
	
				let tmpStatus = 0;
				if (volume > 0.5) tmpStatus = 2;
				else if (volume > 0) tmpStatus = 1;
	
				if (tmpStatus != this.status) {
					let iconName = 'icon-volume-';
					switch (tmpStatus) {
						case 0: iconName = iconName + 'off'; break;
						case 1: iconName = iconName + 'min'; break;
						case 2: iconName = iconName + 'max'; break;
					}
					this.component.linkbutton({ iconCls: iconName });
					this.status = tmpStatus;
				}
			},
	
			onClick: function() {
				let curVolume = mt.player.c_volumeBar.getVolume();
	
				if (curVolume == 0) {
					mt.player.c_volumeBar.setVolume(this.oldValue);
				} else {
					this.oldValue = curVolume;
					mt.player.c_volumeBar.setVolume(0.0);
				}
			}
		},
		c_autoNext: {
			component: null,
			init: function() {
				let c = $("#autoNext");
				this.component = c;
			},
			value: function() {
				return mt.player.c_autoNext.component.switchbutton('options').checked;
			}
		},
		c_loop: {
			component: null,
			init: function() {
				this.component = $("#loop");
			},
			pop: function() {
				let c = this.component;
				let n = c.numberbox('getValue');
				if (n.length > 0 && n > 0) {
					c.numberbox('setValue', n-1);
					return true;
				}
				return false;
			},
			get: function() {
				return parseInt(this.component.numberbox('getValue'));
			},
			set: function(n) {
				this.component.numberbox('setValue', n);
			}
		},
	},
	visual: { // Sóng nhạc tĩnh toàn bài và sóng nhạc đang phát
		
		_staticWave: null,
		_curStaticWave: null,
		_currentTimeLbl: null,
		_durationTimeLbl: null,
		_dynamicWave: null,
		_context: null, // Để bên player
		_source: null, // Để bên player
		_ctx: null,
		_currentTime: 0,
		staticGenSizeW: 0, // Fix lỗi resize để static ko bị scale
		// type visual
		c_btnSwitch: null,
		type: true, // true: wave, false: shake

		init: function() {

			this._staticWave = $('#staticWave');
			this._curStaticWave = $('#curStaticWave');
			this._currentTimeLbl = $('#currentTime');
			this._durationTimeLbl = $('#durationTime');

			this._dynamicWave = $('#dynamicWave');

			this._staticWave[0].addEventListener('click', this.clickStatic, false);
			this._dynamicWave[0].addEventListener('click', this.clickDynamic, false);
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
			this._context = new AudioContext();

			let canvas = this._staticWave[0];
			this._ctx = canvas.getContext('2d');

			this.dynamicWave();
			// this.dynamicWave2();

			// Button switch
			this.c_btnSwitch = $('#visual');
		},
		clear: function() {
			if (mt.skip)
				return;

			this._ctx.fillStyle = "rgba(0,0,0,1)";
			this._ctx.globalCompositeOperation = "destination-out";
			this._ctx.clearRect(0, 0, this._staticWave[0].width, this._staticWave[0].height);
		},
		generate: function(res) {
			this._context.decodeAudioData(res, (buffer) => {

				// buffer: AudioBuffer

				let w = this._staticWave[0].clientWidth;
				let h = this._staticWave[0].clientHeight;
				this.staticGenSizeW = w;
				
				this._staticWave[0].width = w;
				this._staticWave[0].height = h;

				this._ctx.fillStyle = '#f0f0f0'; // Màu xám nhạt
				this._ctx.globalCompositeOperation = 'source-over';

				let data = buffer.getChannelData(0);
				let step = Math.ceil(data.length / w);
				let amp = h / 2;
				for (let i=0; i < w; i++) {
					let min = 1.0;
					let max = -1.0;
					for (let j=0; j<step; j++) {
						let datum = data[(i*step)+j];
						if (datum < min) min = datum;
						if (datum > max) max = datum;
					}
					this._ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
				}
				
				this._ctx.globalCompositeOperation='source-atop';
				this._currentTime = 0;
			});
		},
		update: function(currentTime) {
			if (!mt.event._focus)
				return;

			let w = this._staticWave[0].clientWidth;
			let h = this._staticWave[0].clientHeight;
			let pos = currentTime / mt.player.duration * w;


			// Cập nhật vị trí thanh current
			this._curStaticWave.css('left', pos);
			
			// Vẽ current cho static
			pos = pos * this.staticGenSizeW / w; // Fix lỗi scale khi resize window
			if (currentTime > this._currentTime) {
				this._ctx.fillStyle = '#ffe48d'; // màu cam
				this._ctx.fillRect(0, 0, pos, h);
			} else {
				this._ctx.fillStyle = '#f0f0f0'; // Màu xám nhạt
				this._ctx.fillRect(pos, 0, w, h);
			}

			this._currentTime = currentTime;
		},
		clickStatic: function(e) {
			let curTime = e.offsetX / e.target.offsetWidth * mt.player.duration;
			mt.player.changeTime(curTime);
		},
		clickDynamic: function() {
			mt.mgr.c_list.scrollToCur();
		},
		dynamicWave: function() {

			var analyser = this._context.createAnalyser();
			analyser.fftSize = 128;

			var source = this._context.createMediaElementSource(mt.player.component[0]); // Gây lỗi ko phát nhạc được
			source.connect(analyser);
			analyser.connect(this._context.destination);
		
			var bufferLength = analyser.frequencyBinCount;
			var dataArray = new Uint8Array(bufferLength);

			var canvas = this._dynamicWave[0];
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
		
			var ctx = canvas.getContext("2d");
			var WIDTH = canvas.width;
			var HEIGHT = canvas.height;
		
			var heightWave;

			// For type 1
			var sizeloop = Math.ceil(bufferLength * 2 / 3);
			var barWidth = WIDTH / bufferLength * 1.5 - 2;
			var gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
			gradient.addColorStop(1.0, '#fff8af');
			gradient.addColorStop(0.5, '#ffe48d');
			gradient.addColorStop(0.0, '#bba040');
			// gradient.addColorStop(1.0, '#fff7bf');
			// gradient.addColorStop(0.5, '#ffe48d');
			// gradient.addColorStop(0.0, '#ccb15a');
			var capYPositionArray = new Array(sizeloop); // Lưu lịch sử vị trí Cap

			// For type 2
			var HEIGHTHALF = HEIGHT / 2;
			ctx.lineWidth = 2; // line width
			ctx.strokeStyle = "#000"; // line color
			const sliceWidth = WIDTH / bufferLength;
			const scaleFactor = 5/2;

			function renderFrame() {
				requestAnimationFrame(renderFrame);
				ctx.clearRect(0, 0, WIDTH, HEIGHT); // reset canvas

				if (mt.visual.type) {
					analyser.getByteFrequencyData(dataArray); // 0 - 255
					for (var i = 0, x = 0; i < sizeloop; i++) {
						heightWave = dataArray[i] / 256 * HEIGHT;
						
						// Render Bar
						ctx.fillStyle = gradient;
						ctx.fillRect(x, HEIGHT - heightWave, barWidth, heightWave);

						// Render Cap
						if (heightWave < capYPositionArray[i]) {
							heightWave = --capYPositionArray[i];
						} else {
							capYPositionArray[i] = heightWave;
						}
						ctx.fillStyle = '#000';
						ctx.fillRect(x, HEIGHT - heightWave - 2, barWidth, 2);

						x += barWidth + 2;
					}
				} else {
					analyser.getByteTimeDomainData(dataArray);
					ctx.beginPath();
					ctx.moveTo(0, HEIGHTHALF);
					for (var i=0, x = sliceWidth/2; i < bufferLength; i++) {
						// 0 > 255 | 0 > 2 | -1 > 1 | scale 5/2 | to height
						heightWave = (dataArray[i] / 128.0 - 1) * scaleFactor * HEIGHTHALF + HEIGHTHALF;
						ctx.lineTo(x, heightWave);
						x += sliceWidth;
					}
					ctx.lineTo(WIDTH, HEIGHTHALF);
					ctx.stroke();
				}
			}
			renderFrame();
		},
		onChangeType: function(toogle) {
			let self = mt.visual;
			self.type = toogle;
		},
	},
	next: {
		// Danh sách phát đang chờ
		_listnext: null,
		init: function() {
			this._listnext = $('#listNext');
			this._listnext.datalist({
				width: '100%',
				height: 100,
				rownumbers: true,
				valueField: 'stt',
				textField: 'name',
				textFormatter: function(v,r,i) {
					if (r.loop > 0)
						return v+' ('+r.loop+')';
					return v;
				},
				onDblClickRow: function(index,row) {
					if (row.loop > 0) { // Nếu có loop thì giảm loop
						row.loop--;
						let pos = row.name.lastIndexOf("(");
						row.name = row.name.substring(0, pos + 1) + row.loop + ")";
						mt.next._listnext.datalist('refreshRow', index);
					} else { // Xóa dòng khi click dup
						mt.next._listnext.datalist('deleteRow', index);
					}
				}
			});
		},
		add: function() {

			// Get current music selected
			let dg = mt.mgr.c_list.component;
			let music = dg.datagrid('getSelected');

			// Push to next list
			mt.next.push(music);

			// Effect
			mt.effect.soundClick.play();
		},
		push: function(music) {

			// Case current music, increase loop
			if (music.idArr == mt.player.musicIdPlay) {
				mt.player.c_loop.set(mt.player.c_loop.get() + 1);
				return;
			}

			// Case in list
			let rows = this._listnext.datalist('getRows');
			let found = false;

			for (let i in rows) {
				let row = rows[i];
				if (music.idArr != row.stt)
					continue;
				
				row.loop++; // Tăng số lần loop
				mt.next._listnext.datalist('refreshRow', +i); // Cập nhật danh sách phát

				found = true;
				break;
			}

			if (!found)
				this._listnext.datalist('appendRow', { stt: music.idArr, name: music.name, loop: 0 });
		},
		pop: function() {
			let row = this._listnext.datalist('getSelected');
			if (row != null)
			{
				let stt = this._listnext.datalist('getRowIndex', row);
				this._listnext.datalist('deleteRow', stt);
				return stt;
			}
			else
			{
				let stt = this._listnext.datalist('getRowIndex');
				if (stt == -1)
					return null;

				this._listnext.datalist('selectRow', 0);
				let row = this._listnext.datalist('getSelected');
				this._listnext.datalist('deleteRow', 0);
				return row;
			}
		},
		removeDupClick: function() {
			let size = this._listnext.datalist('getRows').length;
			this._listnext.datalist('deleteRow', size - 1);
		},
	},
	edit: { // Chỉnh sửa thông tin bài hát
		c_content: null,
		form: null,
		isOpen: false,
		init: function() {
			this.c_content = $('#right_edit');
			this.form = $('#form_music');
			this.form.form({
				url: '/music/edit',
				success: function(res) {
					mt.gui.layout.layout('collapse', 'east'); // Đóng phần chỉnh sửa
					mt.mgr.c_list.reload(); // Reload lại datagrid
				},
				error: function(e) { alert('Fail: '+e); }
			});
		},
		open: function() {

			// Khởi tạo nếu chưa
			if (this.c_content == null)
				this.init();

			// Flag
			this.isOpen = true;
			this.c_content.show();
			mt.gui.layout.layout('panel', 'east').panel({title: 'Edit'});

			// Mở bên phải
			mt.gui.layout.layout('expand','east');

			// Fill info if have selected music
			let music = mt.mgr.c_list.component.datagrid('getSelected');
			this.fillData(music);

		},
		close: function() {
			this.isOpen = false;
			this.c_content.hide();
		},
		fillData: function(music) {
			if (this.isOpen && music) {

				// Fill duration
				if (music.duration == null &&
					mt.player.musicIdPlay >= 0 &&
					music.id == mt.mgr.musics[mt.player.musicIdPlay].id
				)
					music.duration = mt.player.duration;
				
				// Fill data
				this.form.form('load',{
					id: music.id,
					filename: music.filename,
					name: music.name,
					artists: music.artists,
					duration: music.duration,
					tags: music.tags,
					decibel: music.decibel,
					rate: music.rate,
					trackbegin: music.trackbegin,
					trackend: music.trackend,
					miss: music.miss,
				});
			}
		},
		onSubmitClick: function() {
			let self = this;
			$.messager.confirm('Confirm','Are you sure you want to save data?', function(r) {
				if (r)
					self.form.form('submit');
			});
		},
	},
	new: { // Thêm nhạc
		// Danh sách thêm bài hát
		c_content: null,
		isOpen: false,
		lstMusicNew: [],
		init: function() {
			this.c_content = $("#right_new");
			this.c_list.init();
		},
		open: function() {

			// Check Access
			if (!mt.authorize) {
				alert("Access denied");
				return;
			}

			// Khởi tạo nếu chưa
			if (this.c_content == null)
				this.init();

			// Flag
			this.isOpen = true;
			this.c_content.show();
			mt.gui.layout.layout('panel', 'east').panel({title: 'New Music'});

			// Mở bên phải
			mt.gui.layout.layout('expand','east');

			// Auto refresh on open
			this.c_list.resize();
			this.refresh();
			
		},
		close: function() {
			this.isOpen = false;
			this.c_content.hide();
		},
		refresh: function() {
			let self = this;
			this.c_list.component.datagrid('loading');
			$.ajax({
				type: 'POST',
				url: '/music/refresh',
				data: {},
				dataType: 'json',
				success: function(res) {
					self.lstMusicNew = res;
					self.c_list.component.datagrid('loadData', self.lstMusicNew);
				}
			});
		},
		addAll: function() {
			let lstFileName = [];
			for (let i in mt.new.lstMusicNew)
				lstFileName.push(mt.new.lstMusicNew[i].filename);
			$.ajax({
				type: 'POST',
				url: '/music/addAll',
				data: {lstFileName: lstFileName},
				success: function(res) {
					mt.mgr.c_list.reload(); // Reload lại datagrid
					mt.gui.layout.layout('collapse', 'east'); // Đóng phần chỉnh sửa
					// mt.new.c_list.component.datagrid('loadData', []);
					// mt.mgr.c_list.component.datagrid('reload');
				}
			});
		},
		c_list: {
			component: null,
			init: function() {
				let c = $('#new_list');
				this.component = c;
				c.datagrid({
					data: [{filename:'empty'}],
					toolbar: '#new_toolbar',
					columns:[[
						{field:'action', title:'', width:70, formatter: function(v,r,i) {
							if (r.filename == "empty")
								return '';
							return `<a href="#" class="newNO" onclick="mt.new.c_list.newNO(`+i+`)"></a>
									<a href="#" class="newOK" onclick="mt.new.c_list.newOK(`+i+`)"></a>`;
						}},
						{field:'filename', title:'File Name'},
					]],
					onLoadSuccess: function() {
						$('.newOK').linkbutton({ iconCls:'icon-ok', plain:true });
						$('.newNO').linkbutton({ iconCls:'icon-no', plain:true });

						$(this).datagrid('loaded');
					}
				});
			},
			newOK: function(index) {
				$.ajax({
					type: 'POST',
					url: '/music/add',
					data: mt.new.lstMusicNew[index],
					success: function(res) {
						let lst = mt.new.lstMusicNew;
						lst.splice(index, 1);
						mt.new.c_list.component.datagrid('loadData', lst);
						mt.mgr.c_list.component.datagrid('reload');

					}
				});
			},
			newNO: function(index) {
				let lst = mt.new.lstMusicNew;
				lst.splice(index, 1);
				this.component.datagrid('loadData', lst);
			},
			resize: function() {
				this.component.datagrid('resize');
			},
		},
	},
	cut: { // Cắt soundtrack
		c_content: null,
		isOpen: false, // Mở chức năng
		isTest: false, // Đánh dấu đang phát thử
		init: function() {
			this.c_slider.init();
			this.c_start.init();
			this.c_end.init();
			this.c_content = $('#right_cut');
		},
		open: function() {
			
			// Khởi tạo nếu chưa
			if (this.c_content == null)
				this.init();

			// Flag
			this.isOpen = true;
			this.c_content.show();
			mt.gui.layout.layout('panel', 'east').panel({title: 'Cut'});

			// Mở bên phải
			mt.gui.layout.layout('expand','east');

			// Fill info if have selected music
			let music = mt.mgr.musics[mt.player.musicIdPlay];
			this.fill(music);

		},
		close: function() {
			this.isOpen = false;
			this.c_content.hide();
		},
		fill: function(music) {
			if (!this.isOpen)
				return;

			if (music.trackbegin != null && music.trackend != null) {
				this.c_slider.setRange(music.duration);
				this.c_start.set(music.trackbegin);
				this.c_end.set(music.trackend);
			}
			else {
				let duration = 0;
				if (music.duration != null)
					duration = music.duration;
				else if (mt.player.duration != null)
					duration = mt.player.duration;

				this.c_slider.setRange(duration);
				this.c_end.set(duration);
			}
		},
		c_slider: {
			component: null,

			init: function() {
				let c = $('#cutSlider');
				this.component = c;
				c.slider({
					width: '100%',
					range: true,
					value: [0,100],
					onChange: mt.cut.c_slider.onChange
				});
			},

			onChange: function(newValue, oldValue) {
				mt.cut.c_start.set(newValue[0]);
				mt.cut.c_end.set(newValue[1]);
			},

			setRange: function(maxValue) {
				this.component.slider({max:maxValue, value: [0, maxValue]});
				mt.cut.c_start.set(0);
				mt.cut.c_end.set(maxValue);
			}

		},
		c_start: {

			component: null,
			
			init: function() {
				this.component = $('#cutStart');
			},

			get: function() {
				return this.component.numberbox('getValue');
			},
			set: function(value) {
				this.component.numberbox('setValue',value);
			}
		},
		c_end: {
			component: null,
			
			init: function() {
				this.component = $('#cutEnd');
			},

			get: function() {
				return this.component.numberbox('getValue');
			},
			set: function(value) {
				this.component.numberbox('setValue',value);
			}
		},
		onChangeMusic: function() {
			if (!this.isOpen)
				return;
			
			this.fill(mt.mgr.musics[mt.player.musicIdPlay])
		},
		onUpdate: function(time) {
			if (!this.isOpen || !this.isTest)
				return;
			
			if (time > this.c_end.get()) {
				mt.player.pause(true);
				this.isTest = false;
			}
		},
		onPlayerEnd: function() {
			if (this.isOpen && this.isTest) {
				this.isTest = false;
				return false;
			}

			return true;
		},
		play: function() {
			this.isTest = true;
			mt.player.changeTime(this.c_start.get());
			mt.player.pause(false);
		},
		save: function() {
		
			// Xác nhận lưu
			$.messager.confirm('Confirm','Are you want to cut this music to track?', function(r) {
				if (r) {
					$.ajax({
						type: 'POST',
						url: '/music/cut',
						data: {
							id: mt.mgr.musics[mt.player.musicIdPlay].id,
							trackbegin: mt.cut.c_start.get(),
							trackend: mt.cut.c_end.get()
						},
						xhrFields: {
							responseType: 'blob'
						},
						success: function(blob, textStatus, request) {

							filename = 'track.mp3'
							disposition = request.getResponseHeader('Content-Disposition');
							if (disposition && disposition.indexOf('attachment') !== -1) {
								var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
								var matches = filenameRegex.exec(disposition);
								if (matches != null && matches[1]) { 
									filename = matches[1].replace(/['"]/g, '');
								}
							}

							var a = document.createElement('a');
							var url = window.URL.createObjectURL(blob);
							a.href = url;
							a.download = filename;
							document.body.append(a);
							a.click();
							a.remove();
							window.URL.revokeObjectURL(url);
						},
					});
				}
			});
		},
	},
	track: {
		// Phát đoạn trích hay
		isActive: false, // Đang chạy track hay ko
		timeStart: 0, // Thời gian bắt đầu track
		timeEnd: 0, // Thời gian ngưng track
		play: function() {

			// Lấy bài hiện tại
			let music = mt.mgr.c_list.component.datagrid('getSelected');

			// Bỏ qua nếu chưa chọn bài
			if (music == null) {
				alert("Chưa chọn bài");
				return;
			}

			// Kiểm tra lưu track info chưa
			if ( music.trackbegin == null
				|| music.trackbegin == ''
				|| music.trackend == null
				|| music.trackend == ''
			) {
				alert("Chưa có thông tin track");
				return;
			}

			// Lưu thông số lại
			this.timeStart = music.trackbegin;
			this.timeEnd = music.trackend

			// Thực hiện chạy track
			this.isActive = true;

			if (mt.player.musicIdPlay != music.idArr) {
				mt.handler.changeMusic(music.idArr);
			}
			else {
				mt.player.changeTime(this.timeStart);
				mt.player.pause(false);
				mt.player.c_pause.switchIcon();
			}
		},
		onChangeMusic: function() {
			if (!this.isActive)
				return;
			
			mt.player.changeTime(this.timeStart);
		},
		onUpdate: function(time) {
			if (!this.isActive)
				return;
			
			if (time > this.timeEnd) {
				mt.handler.pause("[mt.track.onUpdate] track done")
				this.isActive = false;
			}
		},
		onPlayerEnd: function() {
			if (this.isActive) {
				this.isActive = false;
				return false;
			}

			return true;
		},
	},
	util: {
		cov_time: function(value) {
			let valueR = Math.floor(value);
			let minute = Math.floor(valueR/60);
			let second = valueR%60;
			if (second < 10) second = '0'+second;
			return minute+':'+second;
		},
		cov_time_decimal: function(value) {
			let backV = value * 100 % 100 / 100;
			return this.cov_time(value)+backV;
		},
	},
	effect: {
		init: function() {
			this.soundClick.init();
		},
		soundClick: {
			// Hiệu ứng âm thanh
			_sndClick: null,
			init: function() {
				this._sndClick = new Audio('/res/effect/sound/mixkit-video-game-mystery-alert-234.wav');
				this._sndClick.volume = 0.5;
			},
			play: function() {
				this._sndClick.play();
			}
		},
	},
	mediaSession: {
		init: function() {

		},
	},
}