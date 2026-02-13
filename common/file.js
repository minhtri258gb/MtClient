var mtFile = {
	m_clientPath: '', // Đường dẫn của Folder Client

	// Method
	async readStatic(type, url) {

		// Call API
		let response = await fetch(url, { method: 'GET' });
		if (!response.ok) {
			if (response.status == 404)
				return null;
			else
				throw { error: true, message: await response.text() };
		}
		switch (type) {
			case 'text': return await response.text();
			case 'json': return await response.json();
			case 'blob': return await response.blob();
			default: throw { error: true, message: 'type không hợp lệ!' };
		}
	},
	async readFile(type, filepath) {
		try {

			// Check auth
			if (!mt.auth.checkAuthn())
				await mt.auth.init();

			// ParamsURL
			let params = new URLSearchParams();
			params.set('file', filepath);

			// Call API
			let response = await fetch('/file/read?' + params.toString(), {
				method: 'GET',
				headers: { 'Authorization': 'Bearer ' + mt.auth.getToken() },
			});

			if (!response.ok) {
				if (response.status == 404)
					return null;
				else
					throw { error: true, message: await response.text() };
			}
			switch (type) {
				case 'text': return await response.text();
				case 'json': return await response.json();
				case 'blob': return await response.blob();
				default: throw { error: true, message: 'type không hợp lệ!' };
			}
		}
		catch (ex) {
			console.error('[mt.file.readFile] Exception', ex);
			throw ex;
		}
	},

	// Json
	async loadJson(url) {
		try {

			// Call API
			let response = await fetch(url, { method: 'GET' });
			if (!response.ok) {
				if (response.status == 404)
					{ } // skip
				else
					throw { error: true, message: await response.text() };
			}
			else
				return await response.json() || [];

			return [];
		}
		catch (ex) {
			console.error('[mtFile.loadJson] Exception', ex);
			throw ex;
		}
	},
	async saveJson(filepath, data) {
		try {

			// Authen
			if (mt.auth.checkAuthn() == false)
				await mt.auth.init();

			// Kiểm tra và lấy client path
			if (this.m_clientPath.length == 0) {
				let response = await fetch('/file/getClientPath', {
					method: 'GET',
					headers: { 'Authorization': 'Bearer ' + mt.auth.getToken() },
				});
				if (!response.ok)
					throw { error: true, message: await response.text() };

				this.m_clientPath = await response.text();
			}

			// Call API - Lưu dữ liệu
			let paramURL = new URLSearchParams();
			paramURL.set('file', this.m_clientPath + filepath);
			paramURL.set('force', true);
			let responseSave = await fetch('/file/writeText?' + paramURL.toString(), {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain',
					'Authorization': 'Bearer ' + mt.auth.getToken(),
				},
				body: JSON.stringify(data),
			});
			if (!responseSave.ok) {
				let errorMessage = await responseSave.text();
				// this.toast('error', errorMessage);
				console.error(errorMessage);
				return;
			}
		}
		catch (ex) {
			console.error('[mtFile.saveJson] Exception', ex);
			throw ex;
		}
	},

	// Convert
	async blobToBase64(blob) { // Blob -> Base64
		return await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				resolve(reader.result.split(",")[1]); // lấy phần Base64
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob); // đọc blob thành DataURL (base64)
		});
	},
	async blobToArrayBuffer(blob) { // Blob -> ArrayBuffer
		return await blob.arrayBuffer();
	},
	async blobToText(blob) { // Blob -> String
		return await blob.text();
	},
	encodeBase64(base64) {
		return btoa(base64);
	},
	decodeBase64(base64) {
		return atob(base64);
	},
};
export default mtFile;