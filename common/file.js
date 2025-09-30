var mtFile = {

	// Method
	async init() {
	},
	async read(type, url) {

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
};
export default mtFile;