var game = {

	postfix: '_game',

	rowID: -1, // -1: edit, 0: row mới, >= 1: rowId
	rowSel: -1, // row đã chọn từ trước

	// Forward
	init: function() {
		this.c_datagrid.init();
	},

	// Component
	c_datagrid: {
		component: null,
		init: function() {
			this.component = $('#datagrid'+game.postfix);
			this.initDataGrid();
		},
		initDataGrid: function() {
			
			formatterRate = function(v,r,i) {
				return '<span class="rating l-btn-icon icon-rating'+v+'" style="position:initial;margin-top:6px"></span>';
			}
			this.component.datagrid({
				url: '/manager/search/game',
				toolbar: '#toolbar'+game.postfix,
				rownumbers: true,
				singleSelect: true,
				pagination: true,
				pageSize: 10,
				columns: [[
					{field:'name', title:'Name', editor:{type:'textbox'}},
					{field:'graphic', title:'Graphic', width:60, align:'center', sortable:true, editor: {type:'numberspinner', options:{min:1, max:5}}, formatter:formatterRate},
					{field:'audio', title:'Audio', width:60, align:'center', sortable:true, editor: {type:'numberspinner', options:{min:1, max:5}}, formatter:formatterRate},
					{field:'gameplay', title:'Gameplay', width:60, align:'center', sortable:true, editor: {type:'numberspinner', options:{min:1, max:5}}, formatter:formatterRate},
					{field:'story', title:'Story', width:60, align:'center', sortable:true, editor: {type:'numberspinner', options:{min:1, max:5}}, formatter:formatterRate},
					{field:'review', title:'Review', width:60, align:'center', sortable:true, editor: {type:'numberspinner', options:{min:1, max:5}}, formatter:formatterRate},
					{field:'muliplayer', title:'Multiplayer', editor:{type:'textbox'}},
					{field:'end', title:'End', editor:{type:'textbox'}},
					{field:'updateTime', title:'Update'},
					{field:'action', title:'', width:70, hidden:true, formatter:function(v, r, i) { return '<div id="action'+r.id+game.postfix+'"></div>'; }}
				]],
				onAfterEdit: function(i,r,c) { // Fix sau numberspinner edittor bị đổi thành string
					keys = ['graphic','audio', 'gameplay', 'story', 'review']
					for (let i in keys) {
						k = keys[i];
						v = c[k];
						if (v && typeof(v) != 'number')
							r[k] = parseInt(v);
					}
				},
				onDblClickRow: function(index,row) {
					game.toolbar.edit();
				},
				onClickRow: function(index,row) {
					if (game.rowID != -1) {
						// Neu dang edit, ko cho chon row khac
						$(this).datagrid('unselectRow',index).datagrid('selectRow', game.rowSel);
						return;
					}
					game.rowSel = index;
				}
			});
		},
		search: function(text) {
			this.component.datagrid('reload', {text:text});
		}
	},

	toolbar: {
		add: function() {
			if (game.rowID > -1)
				return;

				game.rowID = 0;
				game.rowSel = 0;
			let dg = game.c_datagrid.component;
			dg.datagrid('insertRow', {index: 0, row: {id:0}} );
			dg.datagrid('selectRow', 0).datagrid('beginEdit', 0);
			game.rowAction.init();
		},
		edit: function() {
			if (game.rowID > -1)
				return;
			if (game.rowSel == -1)
				return;

			let dg = game.c_datagrid.component;
			game.rowID = dg.datagrid('getSelected').id;
			dg.datagrid('beginEdit', game.rowSel);
			game.rowAction.init();
		},
		search: function(text) {
			game.c_datagrid.search(text);
		}
	},

	rowAction: {

		init: function() {
			game.c_datagrid.component.datagrid('showColumn', 'action');

			let idPrt = 'action' + game.rowID + game.postfix;
			let idSave = 'actionY' + game.rowID + game.postfix;
			let idUndo = 'actionN' + game.rowID + game.postfix;

			$('#'+idPrt).html('<a href="#" id="'+idSave+'"></a><a href="#" id="'+idUndo+'"></a>');
			$('#'+idSave).linkbutton({iconCls:'icon-save', plain:true});
			$('#'+idSave).click(game.rowAction.save);
			$('#'+idUndo).linkbutton({iconCls:'icon-undo', plain:true});
			$('#'+idUndo).click(game.rowAction.undo);
		},

		del: function() {
			
			if (game.rowID == -1)
				return;
			
			$('#action'+game.rowID+game.postfix).html('');
			game.c_datagrid.component.datagrid('hideColumn', 'action');
		},

		save: function() {
			if (game.rowID == -1)
				return;

			// Datagrid component
			let dg = game.c_datagrid.component;

			// End edit
			dg.datagrid('endEdit', game.rowSel);

			// Prepare data
			let data = dg.datagrid('getSelected');

			// Update date
			data.updateTime = moment().format("YYYY/MM/DD HH:mm:ss");
			if (data.id == 0) delete data.id; // Nếu id = 0 thì thêm mới

			// Save API
			$.ajax({
				type: 'POST',
				url: '/manager/save/game',
				data: JSON.stringify(data),
				contentType: 'application/json',
				success: function(res) {
					game.c_datagrid.component.datagrid('reload');
				},
				error: function(e) {
					// game.c_datagrid.component.datagrid('deleteRow', 0); // #TODO #FIX nếu chỉnh sửa lỗi sẽ xóa dòng 1
					console.error('Fail: '+e);
				}
			});

			// Reset value
			game.rowID = -1;
			game.rowSel = -1;
		},

		undo: function() {
			if (game.rowID == -1)
				return;

			// Del button row
			game.rowAction.del();

			// Cancel edit
			game.c_datagrid.component.datagrid('cancelEdit', game.rowSel);

			// Handler
			if (game.rowID == 0)
				game.c_datagrid.component.datagrid('deleteRow', 0);

			// Reset value
			if (game.rowID == 0)
				game.rowSel = -1;
			game.rowID = -1;
		}

	},

};