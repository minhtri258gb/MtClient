let mtMidi = {

	/**
	 * https://www.abcjs.net/
	 */

	h_isShadow: false,
	e_contain: null,
	m_init: false,
	m_offsetNote: 0, // Offset note

	key: {
		c_keyName: null, // Component hiện tên note
		m_width: 0, // width layout
		m_height: 0, // height layout
		m_isHookKeyBoard: true,
		map: {}, // Key Bind

		init() {

			// Note Name
			this.c_keyName = document.getElementById('midi-note-name');

			// Key Bind, Load keybind
			this.loadKeyBind();

			// Layout Piano
			this.m_width = document.documentElement.clientWidth - 256;
			this.m_height = this.m_width / 10.5;

			$('#midi-key').css({ 'width': this.m_width, 'height': this.m_height, 'margin': 'auto' });
			this.svg = SVG().addTo('#midi-key').size('100%', '100%');

			// Style
			let stroke = { color: '#000000', width: 1 };
			let white = { fill:'#ffffff' };

			let scale = this.m_width / (420 * 5);
			let transW = 420 * scale;

			let ev = ['mousedown', 'mouseup', 'mouseout'];
			let fp = this.press;

			for (let i=0; i<5; i++) {
				let gKey = this.svg.group();

				let n = 36 + (i * 12);

				gKey.rect(60,200).move(0  ,0).on(ev,fp).id('k'+(n+ 0)).data('note',n+ 0).data('b',false).attr(white).stroke(stroke);
				gKey.rect(60,200).move(60 ,0).on(ev,fp).id('k'+(n+ 2)).data('note',n+ 2).data('b',false).attr(white).stroke(stroke);
				gKey.rect(60,200).move(120,0).on(ev,fp).id('k'+(n+ 4)).data('note',n+ 4).data('b',false).attr(white).stroke(stroke);
				gKey.rect(60,200).move(180,0).on(ev,fp).id('k'+(n+ 5)).data('note',n+ 5).data('b',false).attr(white).stroke(stroke);
				gKey.rect(60,200).move(240,0).on(ev,fp).id('k'+(n+ 7)).data('note',n+ 7).data('b',false).attr(white).stroke(stroke);
				gKey.rect(60,200).move(300,0).on(ev,fp).id('k'+(n+ 9)).data('note',n+ 9).data('b',false).attr(white).stroke(stroke);
				gKey.rect(60,200).move(360,0).on(ev,fp).id('k'+(n+11)).data('note',n+11).data('b',false).attr(white).stroke(stroke);
				
				gKey.rect(35,130).move(35 ,0).on(ev,fp).id('k'+(n+ 1)).data('note',n+ 1).data('b',true);
				gKey.rect(35,130).move(105,0).on(ev,fp).id('k'+(n+ 3)).data('note',n+ 3).data('b',true);
				gKey.rect(35,130).move(210,0).on(ev,fp).id('k'+(n+ 6)).data('note',n+ 6).data('b',true);
				gKey.rect(35,130).move(280,0).on(ev,fp).id('k'+(n+ 8)).data('note',n+ 8).data('b',true);
				gKey.rect(35,130).move(350,0).on(ev,fp).id('k'+(n+10)).data('note',n+10).data('b',true);

				// Group transform
				gKey.translate(transW * i, 0, 0, 0);
				gKey.scale(scale, scale, 0, 0);
			}
		},
		loadKeyBind() {

			// Init keybind
			let maps = [
				// 123
				['`', 'D#5'], ['2', 'F#5'], ['3', 'G#5'], ['4', 'Bb5'], ['6', 'C#6'], ['7', 'D#6'], ['9', 'F#6'], ['0', 'G#6'], ['-', 'Bb6'],
				// QWE
				['\t', 'E5'], ['Q',  'F5'], ['W',  'G5'], ['E', 'A5'], ['R', 'B5'], ['T', 'C6'], ['Y', 'D6'],
				['U',  'E6'], ['I',  'F6'], ['O',  'G6'], ['P', 'A6'], ['[', 'B6'], [']', 'C7'],
				['DL', 'E7'], ['ED', 'F7'], ['PD', 'G7'],
				// enter và \
				['\n', 'F3'], ['\\', 'D7'],
				// ASD
				['CL', 'D5'], ['A', 'C5'], ['S', 'B4'], ['D', 'A4'], ['F',  'G4'], ['G', 'F4'], ['H', 'E4'],
				['J',  'D4'], ['K', 'C4'], ['L', 'B3'], [';', 'A3'], ['\'', 'G3'],
				// ZXC
				['SH', 'C#5'], ['X', 'Bb4'], ['C', 'G#4'], ['V', 'F#4'], ['N', 'D#4'], ['M', 'C#4'], ['.', 'Bb3'], ['/', 'G#3'],
			];

			for (let map of maps) {
				let keyCode = mtMidi.util.covKeyCharKeyCode(map[0]);
				let noteNum = mtMidi.util.covCodeNumJzzMidi(map[1]);
				if (keyCode && noteNum)
					mtMidi.key.map[keyCode] = { note: noteNum };
			}
		},
		press(event) {
			let active = event.type[5] == "d"; // mousedown
			mtMidi.key.keyEffect(this, active);
			mtMidi.jzz.send(this.data('note'), active); // Phát midi
		},
		keyEffect(svgObj, active) {
			svgObj.attr({fill:(active ? '#ccc' : (svgObj.data('b')?'#000':'#fff'))});
		},
		bind(toogle) {
			this.m_isHookKeyBoard = toogle;
			if (toogle) {
				document.onkeydown = (e) => mtMidi.key.keyDown(e);
				document.onkeyup = (e) => mtMidi.key.keyUp(e);
				// this.component.linkbutton({ iconCls:'icon-bind' });
			}
			else {
				document.onkeydown = undefined;
				document.onkeyup = undefined;
				// this.component.linkbutton({ iconCls:'icon-power' });
			}
		},
		reset() {
			for (keyCode in this.map) {
				keyPress = this.map[keyCode];
				if (keyPress.press) {
					keyPress.press = false;
					mt.jzz.send(keyPress.note, false);
				}
			}
		},
		keyDown(e) { // Nhấn vào
			var e = window.event || e;
			let keyCode = e.keyCode;
			let keyPress = mtMidi.key.map[keyCode];
			if (keyPress && !keyPress.press) {
				keyPress.press = true;
				this.keyEffect(SVG('#k'+keyPress.note), true);
				mtMidi.jzz.send(keyPress.note, true);
				// mtMidi.tone.trigger(keyPress.note, true);
			}
			if (e.keyCode == 123 || e.keyCode == 116)
				return true;
			return false;
		},
		keyUp(e) { // Thả ra
			var e = window.event || e;
			let keyCode = e.keyCode;
			let keyPress = mtMidi.key.map[keyCode];
			if (keyPress) {
				keyPress.press = false;
				this.keyEffect(SVG('#k'+keyPress.note), false);
				mtMidi.jzz.send(keyPress.note, false);
				// mtMidi.tone.trigger(keyPress.note, false);
			}
			
			if (e.keyCode == 123)
				return true;

			return false;
		},
	},
	jzz: {
		h_cov: ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
		out: null, // jzz output

		init() {

			// Register
			// JZZ.synth.Tiny.register('Synth');
			JZZ.synth.Tiny.register();

			this.out = JZZ().openMidiOut().or(()=>{ alert('Cannot open MIDI port!'); });

			this.setVolume(0.6);
		},
		send(note, toggle) {
			let finalNote = note + mtMidi.m_offsetNote;
			finalNote = Math.max(finalNote, 0);
			finalNote = Math.min(finalNote, 127);

			if (toggle) {
				const velocity = this.calculateVelocity(finalNote); // Chuẩn hóa velocity
				this.out.send([0x90, finalNote, velocity]);
				// this.out.send([0x90, finalNote, 0x7f]); // Max velocity

				// Show keyname
				mtMidi.key.c_keyName.innerHTML = "Key: " + finalNote + " - " + mtMidi.jzz.num2name(finalNote);
			}
			else
				this.out.send([0x80, finalNote, 0]);
		},
		setInstrument(num) { // 0 - 127
			this.out.program(0, num);
		},
		setVolume(val) { // 0.0 - 1.0
			this.out.volumeF(0, val);
		},
		name2num(name) {
			if (!name.length || name.length < 2)
				throw('[mt.midi.jzz.num2name] input not midi name');
			let level = parseInt(name.substring(name.length-1)) + 1;
			if (isNaN(level) || level < 0 || level > 9)
				throw('[mt.midi.jzz.num2name] input not midi name');
			let baseCode = name.substring(0, name.length-1);
			let baseNum = undefined;
			for (let i=0; i<12; i++) {
				if (this.h_cov[i] == baseCode) {
					baseNum = i;
					break;
				}
			}
			if (baseNum == undefined)
				throw('[mt.midi.jzz.num2name] input not midi name');
			return level * 12 + baseNum;
		},
		num2name(num) {
			if (typeof num != 'number' || num < 21 || num > 108)
				throw('[mt.midi.jzz.num2name] input not number');
			return this.h_cov[num % 12] + (Math.floor(num / 12) - 1);
		},
		calculateVelocity(note, baseVelocity = 80) {
			const middleC = 60; // C4
			const adjustment = (middleC - note);// * 1.5; // Factor 1.5
			return Math.max(20, Math.min(127, baseVelocity + adjustment));
		},
	},
	util: {
		covKeyCharKeyCode(value, direct = true) {
			if (!value) return undefined;
			if (!mt._covKeyCharKeyCode)
			{
				mt._covKeyCharKeyCode = {};
				let m = mt._covKeyCharKeyCode;
				// Fx
				m['F1'] = 112; m['F2'] = 113; m['F3'] = 114; m['F4'] = 115;
				m['F5'] = 116; m['F6'] = 117; m['F7'] = 118; m['F8'] = 119;
				m['F9'] = 120; m['F10'] = 121; m['F11'] = 122; m['F12'] = 123;
				// 123
				m['`'] = 192; m['1'] = 49; m['2'] = 50; m['3'] = 51; m['4'] = 52;
				m['5'] = 53; m['6'] = 54; m['7'] = 55; m['8'] = 56; m['9'] = 57;
				m['0'] = 48; m['-'] = 189; m['='] = 187; m['\b'] = 8;
				// QWE
				m['\t'] = 9; m['Q'] = 81; m['W'] = 87; m['E'] = 69; m['R'] = 82;
				m['T'] = 84; m['Y'] = 89; m['U'] = 85; m['I'] = 73; m['O'] = 79;
				m['P'] = 80; m['['] = 219; m[']'] = 221; m['\\'] = 220; m['DL'] = 46;
				m['ED'] = 35; m['PD'] = 34;
	
				// ASD
				m['CL'] = 20; m['A'] = 65; m['S'] = 83; m['D'] = 68; m['F'] = 70;
				m['G'] = 71; m['H'] = 72; m['J'] = 74; m['K'] = 75; m['L'] = 76;
				m[';'] = 186; m['\''] = 222; m['\n'] = 13;
				// ZXC
				m['Z'] = 90; m['X'] = 88; m['C'] = 67; m['V'] = 86; m['B'] = 66;
				m['N'] = 78; m['M'] = 77; m[','] = 188; m['.'] = 190; m['/'] = 191;
				m['SH'] = 16;
			}
	
			if (direct) {
				return mt._covKeyCharKeyCode[value];
			} else {
				for (key in mt._covKeyCharKeyCode)
					if (mt._covKeyCharKeyCode[key] == value)
						return value;
				return undefined;
			}
		},
		covCodeNumJzzMidi(value, direct = true) {
			if (!value) return undefined;
			if (!mt._covCodeNumJzzMidi) {
				mt._covCodeNumJzzMidi = ['C','C#','D','D#','E','F','F#','G','G#','A','Bb','B'];
			}
	
			if (direct) {
				if (value.length < 2)
					return undefined;
				
				let level = parseInt(value.substring(value.length-1));
				if (isNaN(level) || level < 0 || level > 9)
					return undefined;
				
				let baseCode = value.substring(0, value.length-1);
				let baseNum = undefined;
				for (let i=0; i<mt._covCodeNumJzzMidi.length; i++) {
					if (mt._covCodeNumJzzMidi[i] == baseCode)
						baseNum = i;
				}
				if (baseNum == undefined)
					return undefined;
				
				return level * 12 + baseNum;
			} else {
				if (isNaN(value) || value < 0 || value > 119)
					return undefined;
				
				let level = Math.floor(value / 12);
				let baseNum = value % 12;
				let baseCode = mt._covCodeNumJzzMidi[baseNum];
	
				return baseCode + level;
			}
		},
		checkSharp(note) {
			let v = note % 12;
			return (v==1 || v==3 || v==6 || v==8 || v==10);
		},
	},

	async init() {

		// Import Library
		await mt.lib.import(['ABCJS', 'CodeMirror', 'jzz', 'svg']); // , 'tone'

		// Add container
		this.e_contain.id = 'midi-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Init component
		this.key.init();
		this.jzz.init();

		this.key.bind(true);

		// Init Editor
		CodeMirror.defineMode('abc', (config) => {
			return {
				token: function(stream) {
					if (stream.match(/[A-Ga-g]/)) return 'abc-note';
					if (stream.match(/\d+\/?\d*/)) return 'abc-duration';
					if (stream.match(/K:[A-G]/)) return 'abc-key';
					if (stream.match(/M:\d+\/\d+/)) return 'abc-meter';
					if (stream.match(/w:.*/)) return 'abc-lyric';
					stream.next();
					return null;
				}
			};
		});

		let textarea = null;
		if (this.h_isShadow)
			textarea = this.shadow.getElementById('midi-input');
		else
			textarea = document.getElementById('midi-input');

		this.m_editor = CodeMirror.fromTextArea(textarea, {
			mode: 'abc',
			lineNumbers: true,
			lineWrapping: true,
			// extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
			foldGutter: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
		});
		this.setCode(`
			X: 1
			T: Level Two - DJ Striden
			M: 4/4
			L: 1/8
			Q: 1/4=144
			K: Emin
			%%MIDI program 32
			G/2F/2E G/2F/2E|G E B d|d3/2B3/2 e2 z2
			e/2f/2 g/2f/2e g/2f/2e|g a/2 b d'|d'3/2b3/2 e'2 z2
		`.trim().split('\n').map(v=>v.trim()).join('\n'));

		/*
			G/2 F/2 E|G/2 F/2 E|G E|B d|d3/2 B3/2 e2 z2
			e/2 f/2|g/2 f/2 e|g/2 f/2 e|g a/2 b d' d'3/2 b3/2 e'2 z2
		*/

		/*
			|:D2|"Em"EBBA B2 EB|\
					~B2 AB dBAG|\
					"D"FDAD BDAD|\
					FDAD dAFD|
			"Em"EBBA B2 EB|\
					B2 AB defg|\
					"D"afe^c dBAF|\
					"Em"DEFD E2:|
			|:gf|"Em"eB B2 efge|\
					eB B2 gedB|\
					"D"A2 FA DAFA|\
					A2 FA defg|
			"Em"eB B2 eBgB|\
					eB B2 defg|\
					"D"afe^c dBAF|\
					"Em"DEFD E2:|
		*/

		// abcjsEditor = new ABCJS.Editor("midi-input", {
		//   canvas_id: "paper",
		//   warnings_id: "warnings",
		//   synth: {
		//     el: "#audio",
		//     options: { displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true }
		//   },
		//   abcjsParams: {
		//     add_classes: true,
		//     clickListener: clickListener
		//   },
		//   selectionChangeCallback: selectionChangeCallback
		// });

		// Init CSS
		this.initCSS();
	},
	async initCSS() {
		const style = document.createElement('style');
		style.textContent = `
			.abc-note { color: blue; font-weight: bold; }
			.abc-duration { color: green; }
			.abc-key { color: purple; }
			.abc-meter { color: orange; }
			.abc-lyric { color: brown; font-style: italic; }
		`.trim().split('\n').map(v=>v.trim()).join('\n');
		document.head.appendChild(style);
	},
	initKey() {

	},
	setCode(code) {
		this.m_editor.setValue(code);
	},
	getCode() {
		return this.m_editor.getValue();
	},
	async renderABC() {
		const abcString = this.getCode();

		// Hiển thị bản nhạc
		ABCJS.renderAbc('midi-notation', abcString, {
			responsive: 'resize',
			add_classes: true,
			jazzchords: true,
			drum: 'dddd 76 77 77 77 60 30 30 30',
		});

		// Phát nhạc (MIDI/WebAudio)
		if (ABCJS.synth.supportsAudio()) {
			const synthControl = new ABCJS.synth.SynthController();
			synthControl.load('#midi-audio', null, {
				// soundFontUrl: "/res/soundfont/marimba-mp3.js",
				displayLoop: true,
				displayRestart: true,
				displayPlay: true,
				displayProgress: true,
				displayWarp: true,
				displayClock: true,
			});
			const visualObj = ABCJS.renderAbc('midi-notation', abcString)[0];
			const synth = new ABCJS.synth.CreateSynth();
			synth.init({
				visualObj: visualObj,
				options: {
					// soundFontUrl: "/res/soundfont/marimba-mp3.js",
					soundFontUrl: '/res/soundfont/FluidR3_Salamander_GM/',
					// instruments: ['marimba'],
					// program: 12, // marimba-mp3
					format: 'mp3',
					soundFontVolume: 1.0,
				}
			}).then(() => {
				synthControl.setTune(visualObj, true);
			});
		}
	}
}
export default mtMidi;