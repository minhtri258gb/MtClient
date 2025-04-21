var mtAuthen = {
	m_token: '',

	login: async function(key) {

		// Call API - Authen
		const response = await fetch('/authorize', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password: key })
		});

		// Validate
		const resultAuth = await response.json();
		if (resultAuth.result == true)
			this.m_token = resultAuth.token;
		else
			throw { error: true, msg: "Lỗi phân quyền" };
	},

	// Get / Set
	getToken: function() {
		return this.m_token;
	},
};
export default mtAuthen;