/**
 * 
 */

let mtConvert = {
	h_isShadow: false,
	e_contain: null,
	m_init: false,

	func: {
		fixUnicode(text) {
			try {
				return text.replace(/\\u\{([0-9A-Fa-f]+)\}|\\u([0-9A-Fa-f]{4})/g, (_, codePoint, hex) =>
					String.fromCodePoint(parseInt(codePoint || hex, 16))
				);
			}
			catch (e) {
				console.error("Decode error:", e);
				return text;
			}
		}
	},

	async init() {

		// Add container
		this.e_contain.id = 'convert-contain';
		this.e_contain.style.height = '100%';
		this.e_contain.style.display = '';
	},
	async exec(type) {
		switch (type) {
			case 'URL':
				let directURL = $('#convert-directURL').val() == '1';
				let typeConvertURL = $('#convert-typeConvertURL').val();
				let valueURL = $('#convert-inputURL').val();
				let resURL = '';
				if (directURL) { // Kiểm tra chiều encode / decode
					if (typeConvertURL == 'all')
						resURL = encodeURIComponent(valueURL);
					else if (typeConvertURL == 'keep')
						resURL = encodeURI(valueURL)
				}
				else {
					if (typeConvertURL == 'all')
						resURL = decodeURIComponent(valueURL);
					else if (typeConvertURL == 'keep')
						resURL = decodeURI(valueURL)
				}
				$('#convert-outputURL').html(resURL);
				break;
			case 'Base64':
				let directBase64 = $('#convert-directBase64').val() == '1';
				let valueBase64 = $('#convert-inputBase64').val();
				let resBase64 = '';
				if (directBase64) // Kiểm tra chiều encode / decode
					resBase64 = btoa(valueBase64);
				else
					resBase64 = atob(valueBase64);
				$('#convert-outputBase64').html(resBase64);
				break;
			case 'HashString':
				let valueHashString = $('#convert-inputHashString').val();
				let typeHashString = $('#convert-typeHashString').val();
				if (typeHashString == 'MD5') {
					await mt.lib.import(['md5']);
					// let md5 = await mtImport.script('/lib/blueimp-md5/js/md5.min.js', 'md5');
					let resHashString = md5(valueHashString);
					$('#convert-outputHashString').html(resHashString);
				}
				else if (typeHashString == 'SHA-1') {
					// #TODO
				}
				break;
			case 'FixUnicode':
				let valueFixUnicode = $('#convert-inputFixUnicode').val();
				let resFixUnicode = this.func.fixUnicode(valueFixUnicode);
				$('#convert-outputFixUnicode').html(resFixUnicode);
				break;
			case 'Base64ToFile':
				let valueBase64ToFile = $('#convert-inputFixUnicode').val();
				// ...
				break;
			default:
				console.error('type:', type);
				alert('Lỗi convert! Ko có type tương ứng!');
		}
	},
	switch(type) {
		switch(type) {
			case 'URL':
				let directURL = $('#convert-directURL').val() == '1';
				directURL = !directURL; // Toggle
				$('#convert-directURL').val(directURL ? '1' : '0');
				$('#convert-labelURL').html(directURL ? 'URL -> ParamURL' : 'ParamURL -> URL');
				break;
			case 'Base64':
				let directBase64 = $('#convert-directBase64').val() == '1';
				directBase64 = !directBase64; // Toggle
				$('#convert-directBase64').val(directBase64 ? '1' : '0');
				$('#convert-labelBase64').html(directBase64 ? 'Text -> Base64' : 'Base64 -> Text');
				break;
			default:
				console.error('type:', type);
				alert('Lỗi swtich! Ko có type tương ứng!');
		}
	},
	search() {
		// #TODO
	},
}
export default mtConvert;
