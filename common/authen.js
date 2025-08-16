var mtAuthen = {
	m_token: '',

	// Method
	init() {
		let token = sessionStorage.getItem('token');
		if (token != null && token.length > 0)
			this.m_token = token;
	},
	async login(password) {

		// Call API - Authen
		const response = await fetch('/authorize', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password })
		});

		// Validate
		const resultAuth = await response.json();
		if (resultAuth.result == true) {
			this.m_token = resultAuth.token;
			sessionStorage.setItem('token', this.m_token);
		}
		else
			throw { error: true, msg: "Lỗi đăng nhập" };
	},
	async promt(force) {

		if (force !== false) {

			// Load Session
			this.init();

			if (this.checkAuthn())
				return;
		}

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

	// Get / Set
	getToken() {
		return this.m_token;
	},
	checkAuthn() {
		return this.m_token != null && this.m_token.length > 0;
	},
};
export default mtAuthen;