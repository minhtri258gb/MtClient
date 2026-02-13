var mtLib = {

	async import(libs) {
		let promise = [];
		for (let name of libs) {
			let lib = this[name];

			if (lib.init)
				continue;
			lib.init = true;

			let p = lib.load();
			promise.push(p);
		}
		await Promise.all(promise); // Đơi load toàn bộ
	},
	async loadJS(url, format, lib) {
		let module = null;
		switch (format) {
			case 'es':
				module = await import(url);
				window[lib] = module.default != null ? module.default : { ...module };
				break;
			case 'cjs':
				module = await new Promise((resolve, reject) => {
					const script = document.createElement('script');
					script.src = url;
					script.onload = () => resolve(window[lib]);
					script.onerror = reject;
					document.head.appendChild(script);
				});
				window[lib] = module;
				break;
			default: // umd
				await import(url);
		}
	},
	async loadCSS(url, lib) {
		return new Promise((resolve, reject) => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = url;
			
			link.onload = () => resolve();
			link.onerror = () => reject(new Error(`Không thể tải CSS từ: ${url}`));
			
			document.head.appendChild(link);
		});
	},
	async loadHTML(url, name, target) {
		let res = await fetch(url)
		target[name] = await res.text();
	},
	
	'ABCJS': { init: false, async load() {
		let path = '/lib/abcjs/';
		await Promise.all([
			mtLib.loadCSS(path+'abcjs-audio.css'),
			mtLib.loadJS(path+'abcjs-basic-min.js'),
			// mtLib.loadJS('/res/soundfont/marimba-mp3.js'),
		]);
		await mtLib.loadJS(path+'abcjs-plugin-min.js');
	}},
	'CodeMirror': { init: false, async load() {
		let path = '/lib/codemirror5-5.65.18/';
		await Promise.all([
			mtLib.loadCSS(path+'lib/codemirror.css'),
			mtLib.loadCSS(path+'addon/fold/foldgutter.css'),
			mtLib.loadJS(path+'lib/codemirror.js'),
		]);
		await Promise.all([
			mtLib.loadJS(path+'addon/fold/foldcode.js'),
			mtLib.loadJS(path+'addon/fold/foldgutter.js'),
		]);
	}},
	'CodeMirror-md': { init: false, async load() {
		let path = '/lib/codemirror5-5.65.18/';
		await Promise.all([
			mtLib.loadJS(path+'mode/markdown/markdown.js'),
			mtLib.loadJS(path+'addon/fold/markdown-fold.js'),
		]);
	}},
	'fabricjs': { init: false, async load() {
		let path = '/lib/fabricjs-6.7.1/';
		await mtLib.loadJS(path+'index.min.js');
	}},
	'flatpickr': { init: false, async load() {
		let path = '/lib/flatpickr/';
		await Promise.all([
			mtLib.loadCSS(path+'flatpickr.min.css'),
			mtLib.loadJS(path+'flatpickr.min.js'),
		]);
		await mtLib.loadJS(path+'l10n/vn.js');
	}},
	'FullCalendar': { init: false, async load() {
		await mtLib.loadJS('/lib/fullcalendar-6.1.18/index.global.min.js');
	}},
	'highlightjs': { init: false, async load() {
		let path = '/lib/highlightjs/';
		await Promise.all([
			mtLib.loadCSS(path+'default.min.css'),
			mtLib.loadJS(path+'highlight.min.js'),
		]);
	}},
	'jsonEditor': { init: false, async load() {
		let path = '/lib/json-editor-2.15.2/';
		let pathex = '/lib/mt/json-editor/';
		await Promise.all([
			mtLib.loadJS(path+'jsoneditor.min.js'),
			mtLib.loadCSS(pathex+'mt-style.css'),
		]);
		await mtLib.loadJS(pathex+'mt-script.js');
	}},
	'leaflet': { init: false, async load() {
		let path = '/lib/leaflet/';
		let pathex = '/lib/leaflet-ex/';
		await Promise.all([
			mtLib.loadCSS(path+'leaflet.css'),
			mtLib.loadJS(path+'leaflet.js'),
		]);
		await Promise.all([
			mtLib.loadJS(pathex+'Leaflet.TileLayer.MBTiles.js'), // MBTiles
			mtLib.loadCSS(pathex+'leaflet-routing-machine-3.2.12/leaflet-routing-machine.css'), // routing-machine
			mtLib.loadJS(pathex+'leaflet-routing-machine-3.2.12/leaflet-routing-machine.min.js'),
			mtLib.loadCSS(pathex+'Leaflet.contextmenu/leaflet.contextmenu.min.css'), // contextmenu
			mtLib.loadJS(pathex+'Leaflet.contextmenu/leaflet.contextmenu.min.js'),
		]);
	}},
	'marked': { init: false, async load() {
		await mtLib.loadJS('/lib/marked-16.1.2/marked.umd.js');
	}},
	'markdownIt': { init: false, async load() {
		if (window.mermaid == null)
			throw new Error('Import mermaid trước markdownIt');
		let path = '/lib/markdown-it/';
		await Promise.all([
			mtLib.loadJS(path+'markdown-it.min.js'),
			mtLib.loadJS(path+'markdown-it-deflist.min.js'),
			mtLib.loadJS(path+'markdown-it-emoji-light.min.js',),
			mtLib.loadJS(path+'markdown-it-emoji.min.js'),
			mtLib.loadJS(path+'markdown-it-footnote.min.js'),
			mtLib.loadJS(path+'markdown-it-ins.min.js'),
			mtLib.loadJS(path+'markdown-it-mark.min.js'),
			mtLib.loadJS(path+'markdown-it-multimd-table.min.js'),
			mtLib.loadJS(path+'markdown-it-sub.min.js'),
			mtLib.loadJS(path+'markdown-it-sup.min.js'),
			mtLib.loadJS(path+'markdownItAnchor.umd.js'),
			mtLib.loadJS(path+'markdownItTocDoneRight.umd.js'),
		]);
	}},
	'mermaid': { init: false, async load() {
		await mtLib.loadJS('/lib/mermaid-11.12.2/mermaid.min.js');
	}},
	'nanogallery2': { init: false, async load() {
		let path = '/lib/nanogallery2-3.0.5/';
		await Promise.all([
			mtLib.loadCSS(path+'css/nanogallery2.min.css'),
			mtLib.loadJS(path+'jquery.nanogallery2.min.js'),
		]);
	}},
	'pdfjs': { init: false, async load() {
		let path = '/lib/pdfjs-5.4.624/build/';
		await Promise.all([
			mtLib.loadJS(path+'pdf.mjs'),
			// mtLib.loadJS(path+'pdf.sandbox.mjs'),
		]);
		// pdfjsLib.GlobalWorkerOptions.workerSrc = path+'pdf.worker.mjs';
	}},
	'pdfjs-viewer': { init: false, async load() {
		let path = '/lib/pdfjs-5.4.624/web/';
		let pathex = '/lib/mt/pdfjs/';
		await Promise.all([
			mtLib.loadCSS(path+'viewer.css'),
			mtLib.loadJS(path+'viewer.mjs'),
			mtLib.loadHTML(pathex+'mt-viewer.html', 'html', this),
		]);
	}},
	'SimpleMDE': { init: false, async load() {
		let path = '/lib/simplemde-1.11.2-0/';
		await Promise.all([
			mtLib.loadCSS(path+'simplemde.min.css'),
			mtLib.loadJS(path+'simplemde.min.js'),
		]);
	}},
	'solarLunar': { init: false, async load() {
		await mtLib.loadJS('/lib/solarlunar-1.0.0/solarLunar.js');
	}},
	'tingle': { init: false, async load() {
		let path = '/lib/tingle/';
		let pathex = '/lib/mt/tingle/';
		await Promise.all([
			mtLib.loadCSS(path+'tingle.min.css'),
			mtLib.loadJS(path+'tingle.min.js'),
			mtLib.loadCSS(pathex+'mt-style.css'),
		]);
	}},
	'toastify': { init: false, async load() {
		let path = '/lib/toastify-js-1.12.0/';
		await Promise.all([
			mtLib.loadCSS(path+'toastify.min.css'),
			mtLib.loadJS(path+'toastify.min.js'),
		]);
	}},

};
export default mtLib;