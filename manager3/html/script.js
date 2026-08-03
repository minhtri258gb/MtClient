/**
 * 
 */

let mtHtml = {
	h_isShadow: false,
	e_contain: null,
	e_render: null, // Element Render
	c_editor: null, // CodeMirror
	m_init: false,
	// m_offsetNote: 0, // Offset note

	async init() {

		// Import Library
		await mt.lib.import(['CodeMirror']);

		// Add container
		this.e_contain.id = 'html-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Init Component
		this.e_render = this.e_contain.querySelector('#html-render');

		// Init CodeMirror
		let textarea = this.e_contain.querySelector('#html-input');
		this.c_editor = CodeMirror.fromTextArea(textarea, {
			mode: 'abc',
			lineNumbers: true,
			lineWrapping: true,
			// extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
			foldGutter: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
		});

	},
	btnRender() {
		try {
			let htmlStr = this.c_editor.getValue();
			this.e_render.innerHTML = htmlStr;
		}
		catch (ex) {
			mt.show.toast('error', ex.Message);
			console.error('[mt.html.btnRender] Exception', ex);
		}
		finally {
		}
	},
	btnFixStr() {
		try {
			let str = this.c_editor.getValue();
			str = str.replace(/\\\\/g, '\\');
			str = str.replace(/\\"/g, '\"');
			str = str.replace(/\\n/g, '\n');
			this.c_editor.setValue(str);
		}
		catch (ex) {
			mt.show.toast('error', ex.Message);
			console.error('[mt.html.btnFixStr] Exception', ex);
		}
	},
}
export default mtHtml;
