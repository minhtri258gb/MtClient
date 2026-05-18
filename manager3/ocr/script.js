/**
 * 
 */

let mtOCR = {
	h_isShadow: false,
	e_contain: null,
	e_image: null,
	e_lang: null,
	e_text: null,
	p_worker: null, // Tesseract
	m_init: false,
	m_blob: null,

	event: {

		// Global
		onPaste() {
			const auth = navigator.permissions.query({ name: 'clipboard-read' });
			if (auth.state !== 'denied') {
				navigator.clipboard.read().then(item_list => {
					let image_type;
					const item = item_list.find(item =>
						item.types.some( type => {
							if (type.startsWith('image/')) {
								image_type = type;
								return true;
							}
						})
					);
					if (item) {
						item.getType(image_type).then(file => {
							mtOCR.scan(file);
						});
					}
				});
			}
		},
		async onBeforeUnload() {
			await this.p_worker.terminate();
		},

		// UI
		async onChangeLang() {

			let lang = mtOCR.e_lang.value; // Lấy ngôn ngữ hiện tại
			await mtOCR.p_worker.reinitialize(lang); // Đổi ngôn ngữ

			// Nếu đang có ảnh thì scan lại
			if (mtOCR.m_blob != null) {
				const result = await mtOCR.p_worker.recognize(mtOCR.m_blob); // Call Lib - Scan
				mtOCR.e_text.value  = result.data.text; // Print to Text
				mt.h_debug && console.log('[mt.ocr.onChangeLang]', { result }); // Log
			}
		},
	},

	async init() {

		// Import Library
		await mt.lib.import(['tesseract']);

		// Add container
		this.e_contain.id = 'ocr-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Prepare element
		this.e_image = document.getElementById('ocr-image');
		this.e_lang = document.getElementById('ocr-lang');
		this.e_text = document.getElementById('ocr-text');

		let defaultLang = this.e_lang.value;

		// Init
		this.p_worker = await Tesseract.createWorker(defaultLang, 1, { // vie, eng
			workerPath: mt.lib.tesseract.getPathWorker(),
			langPath: mt.lib.tesseract.getPathRes(),
			// corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0',
			logger: (m) => { mt.h_debug && console.log('[mt.ocr.init.createWorker]', m); },
		});
	},
	async scan(blob) {
		try {

			this.m_blob = blob;

			// Hủy link giải phóng bộ nhớ
			if (this.e_image.src > 0)
				URL.revokeObjectURL(this.e_image.src);

			// Draw Image
			this.e_image.src = URL.createObjectURL(blob);

			// Call Lib - Scan
			const result = await this.p_worker.recognize(blob);
			
			// Print to Text
			this.e_text.value  = result.data.text;

			// Log
			mt.h_debug && console.log('[mt.ocr.scan]', { result });
		}
		catch (ex) {
			mt.show.toast('error', ex);
			console.error('[mt.ocr.scan] Error', ex);
		}
	},
}
export default mtOCR;