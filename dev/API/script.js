var mt = {
	init: function() {

	},
	mgr: {
		_c_dg_api: null,
		init: function() {
			let c = $('#dg_api');
			this._c_dg_api = c;
			c.datagrid({
				url: '/api/search',
				method: 'GET',
				columns:[[
					{field:'code', title:'Code', width:100},
					{field:'name', title:'Name', width:100},
					{field:'price', title:'Price', width:100, align:'right'}
				]]
			});



		},
	},
}