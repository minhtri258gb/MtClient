var mtCmd = {

	async exec(cmd, path) {
		// cmd: string
		// path: array<string>
		let response = await fetch('/common/cmd', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + mt.auth.getToken(),
			},
			body: JSON.stringify({ path, cmd }),
		});

		if (!response.ok) {
			if (response.status == 404) { } // skip
			else
				throw { error: true, message: await response.text() };
		}
		
		return await response.json();
	},
};
export default mtCmd;