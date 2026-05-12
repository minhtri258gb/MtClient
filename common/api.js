var mtApi = {
	m_token: '', // Access Token
	m_username: '', // UserName

	// Auth
	async init() {

		// Lấy từ LocalStorage
		let token = localStorage.getItem('token');
		if (token == null || token.length == 0)
			await this.promt();
		else {
			let res = await fetch('/checkToken', {
				method: 'GET',
				headers: { 'Authorization': 'Bearer '+token },
			});
			if (res.status == 403) {
				this.m_token = '';
				await this.promt();
			}
			else {
				let result = await res.json();
				this.m_token = token;
				this.m_username = result.username;
			}
		}
	},
	async login(password) {

		// Call API - Authen
		const response = await fetch('/authorize', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ password })
		});

		// Validate
		const resultAuth = await response.json();
		if (resultAuth.result == true) {
			this.m_token = resultAuth.token;
			this.m_username = resultAuth.username;
			localStorage.setItem('token', this.m_token);
		}
		else
			throw { error: true, msg: "Lỗi đăng nhập" };
	},
	async promt() {

		// Input
		const password = prompt('Nhập mật khẩu:', '');
		if (password == null || password.length == 0)
			return;

		// Login
		try {
			await this.login(password);
		}
		catch (e) {
			alert("Lỗi đăng nhập");
			console.error(e);
		}
	},

	// Info
	async config(key) {

		// Call API - read Enviroment
		let response = await fetch(`/common/getConfig?key=${key}`, { method: 'GET' });
		if (!response.ok)
			throw { error: true, msg: await response.text() };

		return await response.text();
	},

	// File
	async fileList(folderpath) {

		let params = new URLSearchParams();
		params.append('folder', folderpath);

		let response = await fetch('/file/list?' + params.toString(), {
			method: 'GET',
			headers: { 'Authorization': 'Bearer ' + this.m_token }
		});

		return await response.json();
	},
	async fileRead(filepath) {

		let params = new URLSearchParams();
		params.append('file', filepath);

		let response = await fetch('/file/read?' + params.toString(), {
			method: 'GET',
			headers: { 'Authorization': 'Bearer ' + this.m_token }
		});

		return await response.text();
	},
	async fileGetClientPath() {
		let response = await fetch('/file/getClientPath', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + this.m_token,
			},
		});
		return await response.text();
	},

	// Get / Set
	getToken() {
		return this.m_token;
	},
	checkAuthn() {
		return this.m_token != null && this.m_token.length > 0;
	},
};
export default mtApi;