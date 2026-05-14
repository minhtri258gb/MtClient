/**
 * QrCode: gen và scan chỉ QR (cũ)
 * bwip: Thư viện generate
 * zxing: Thư viện scan
 */

let mtQrCode = {
	h_isShadow: false,
	e_contain: null,
	e_image: null,
	m_init: false,

	event: {
		onPaste() {
			const auth = navigator.permissions.query({ name: "clipboard-read" });
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
							mtQrCode.scan(file);
						});
					}
				});
			}
		},
	},

	async init() {

		// Import Library
		await mt.lib.import(['QrCode','zxing','bwip']);

		// Add container
		this.e_contain.id = 'qrcode-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';

		// Prepare element
		this.e_image = document.getElementById('qrcode-image');
		this.e_text = document.getElementById('qrcode-text');
		this.e_radius = document.getElementById('qrcode-radius');
		this.e_ecLevel = document.getElementById('qrcode-ecLevel');
		this.e_fill = document.getElementById('qrcode-fill');
		this.e_background = document.getElementById('qrcode-background');
		this.e_size = document.getElementById('qrcode-size');
		this.e_result = document.getElementById('qrcode-result');
	},
	generate() {

		this.e_result.innerHTML = '';

		let opts = {
			text: this.e_text.value,
			radius: +this.e_radius.value,
			ecLevel: this.e_ecLevel.value,
			fill: this.e_fill.value,
			background: this.e_background.value,
			size: +this.e_size.value
		};

		this.e_image.style.display = 'none';
		this.e_result.style.display = '';

		// Call Lib - Render
		QrCreator.render(opts, this.e_result);

		// Log
		mt.h_debug && console.log('[mt.qrcode.generate]', { opts });
	},
	async scan(file) {
		try {

			this.e_result.style.display = 'none';
			this.e_image.style.display = '';

			// Draw Image
			$('#qrcode-image')[0].src = URL.createObjectURL(file);

			// Call Lib - Scan
			let result = await QrScanner.scanImage(file, { returnDetailedScanResult: false });
			
			// Print to Text
			this.e_text.value  = result.data;

			// Log
			mt.h_debug && console.log('[mt.qrcode.scan]', { result });
		}
		catch (ex) {
			mt.show.toast('error', ex);
			console.error('[mt.qrcode.scan] Error', ex);
		}
	},
}
export default mtQrCode;