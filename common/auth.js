if (typeof mt === 'undefined')
	mt = {};

mt.auth = {
	_isInit: false,
	_token: '',
	_cbk_func_result: null, // Hàm callback khi có kết quả authorize

	init: function() {
		this._isInit = true;

		// Insert HTML vào
		if ($('#pu_login').length == 0) {
			$('body').append(`
				<div id="pu_login_div" style="display:none">
					<div id="pu_login">
						<input id="pu_login_password" type="text" style="width:300px">
					</div>
				</div>
			`);
		}

		if (!$('#pu_login').data('dialog')) {
			
			// Init dialog login
			$('#pu_login').dialog({
				title: "Login",
				closed: true,
				modal: true,
				width: 315,
				height: 70,
				onOpen: function() {
					$(this).dialog('center');
					$('#pu_login_password').textbox('textbox').focus();
				}
			});

			// Define Function Authorize
			let func_authorize = function() {

				// Xử lý password: gen hash
				let hashtring = function(str) {
					var hash = 0, i, chr;
					if (str.length === 0)
						return hash;
					for (i = 0; i < str.length; i++) {
						chr = str.charCodeAt(i);
						hash = ((hash << 5) - hash) + chr;
						hash |= 0; // Convert to 32bit integer
					}
					return hash;
				}
				let password = hashtring($('#pu_login_password').val());

				// Call API - Authen
				fetch('/authorize', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						password: new String(password)
					})
				}).then((response) => {
					response.json().then((res) => {

						let title = '', msg = '';
						if (res.result) {
							mt.auth._token = res.token;
							$('#pu_login').dialog('close');
							title = 'Notice';
							msg = "Đăng nhập thành công";
						} else {
							title = 'Warning';
							msg = "Mật khẩu không hợp lệ";
						}

						$.messager.show({
							title: title,
							msg: msg,
							timeout: 1000,
							showType: 'slide'
						});

						if (mt.auth._cbk_func_result != null)
							mt.auth._cbk_func_result(res.result);
					});
				});
				// $.ajax({
				// 	type: 'POST',
				// 	url: '/authorize',
				// 	contentType: 'application/json',
				// 	data: { password: password },
				// 	success: function(res) {
						
				// 	}
				// }); // End call API
			}

			// Init textbox
			$('#pu_login_password').textbox({
				type: 'password',
				buttonText: 'Authorize',
				iconCls: 'icon-key',
				iconAlign: 'left',
				onClickButton: func_authorize
			}); // End textbox Init

			$('#pu_login_password').textbox('textbox').bind('keydown', function(e) {
				if (e.keyCode == 13)
					func_authorize();
			});

		} // End If not has Dialog
	},
	show: function(cbk_func) {
		this._cbk_func_result = cbk_func;
		if (!this._isInit)
			this.init();
		$('#pu_login').dialog('open');
	},
	get: function() {
		return this._token;
	},
};