var mtCore = {

	async config(key) {
		
		// Call API - read Enviroment
		let response = await fetch(`/common/getConfig?key=${key}`, { method: 'GET' });
		if (!response.ok)
			throw { error: true, msg: await response.text() };

		return await response.text();
	},
};
export default mtCore;