/**
 * 
 */

let mtHtml = {
	h_isShadow: false,
	e_contain: null,
	c_editor: null, // CodeMirror
	m_init: false,
	// m_offsetNote: 0, // Offset note

	async init() {

		// Import Library
		await mt.lib.import(['CodeMirror']);

		// await mt.common.getClientPath();

		// Add container
		this.e_contain.id = 'html-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Init Code
		let textarea = null;
		if (this.h_isShadow)
			textarea = this.shadow.getElementById('html-input');
		else
			textarea = document.getElementById('html-input');

		this.c_editor = CodeMirror.fromTextArea(textarea, {
			mode: 'abc',
			lineNumbers: true,
			lineWrapping: true,
			// extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
			foldGutter: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
		});

		// Init component
		// this.jzz.init();
		// this.key.init();
		// this.tree.init();
		// this.code.init();
		// this.toolbar.init();
	},
}
export default mtHtml;