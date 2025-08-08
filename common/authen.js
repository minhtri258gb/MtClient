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

	// Get / Set
	getToken() {
		return this.m_token;
	},
	checkAuthn() {
		return this.m_token != null && this.m_token.length > 0;
	},
};
export default mtAuthen;