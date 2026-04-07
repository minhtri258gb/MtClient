({

	/**
	 * https://www.abcjs.net/
	 */

	h_tagName: 'mt-page-midi',
	h_isShadow: false,

	async init() {

		// Bind mt
		mt.midi = this;

		// Import Library
		await mt.lib.import(['ABCJS', 'CodeMirror', 'jzz', 'svg']); // , 'tone'

		// Add container
		this.id = 'midi-contain';
		this.style.height = '100%';

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
	open() {
		this.style.display = '';
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
})