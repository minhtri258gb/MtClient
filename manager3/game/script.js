import { w2grid, w2field, w2tabs } from 'w2ui';
import { DateTime } from "luxon";

var game = {

	// Categories
	l_view: ['FPS', 'TPS', 'Top down', 'Ngang', 'Board'],

	// Component
	c_w2grid: null,


	// Method
	init: async function() {

		// Call API Init App
		await $.ajax({
			type: 'POST',
			url: '/manager/init',
			data: JSON.stringify({ app: 'game' }),
			contentType: 'application/json',
			dataType: 'json'
		});

		// Prepare renderRating
		let ratingProp = {
			render: (row, ex) => ex.value == null ? '' : `<img src="/res/icons/rating${ex.value}.png"/>`,
			editable: { type: 'int', arrow: true, min: 1, max: 5 },
			attr: 'align=center',
			sortable: true,
			resizable: false,
		};
		let editorText = { type: 'text' };
		let colBoolean = {
			render: (row, ex) => ex.value == 1 ? `<img src="/res/icons/check.png" width="16" height="16"/>` : '',
			editable: { type: 'checkbox', style: 'text-align: center' },
		};

		let renderDateTime = (row, ex) => (ex.value == null) ? '' : DateTime.fromSeconds(ex.value).toFormat('yyyy/MM/dd');
		let editorListView = { type: 'combo', items: game.l_view };

		// Init UI - Grid
		game.c_w2grid = new w2grid({
			name: 'game_grid', box: '#game #grid',
			url: '/manager/game/grid',
			limit: 30,
			liveSearch: true, fixedBody: true,
			recid: 'id',
			columns: [
				{ field: 'name', text: 'Name', size: '320px', editable: editorText },
				{ field: 'review', text: 'Overall', size: '57px', ...ratingProp },
				{ field: 'graphic', text: 'Graphic', size: '61px', ...ratingProp },
				{ field: 'audio', text: 'Audio', size: '50px', ...ratingProp },
				{ field: 'gameplay', text: 'Gameplay', size: '74px', ...ratingProp },
				{ field: 'story', text: 'Story', size: '46px', ...ratingProp },
				{ field: 'three', text: '3D', size: '51px', ...colBoolean },
				{ field: 'view', text: 'View', size: '120px', editable: editorListView },
				{ field: 'coop', text: 'Co-op', size: '51px', ...colBoolean },
				{ field: 'storage', text: 'Storage', size: '120px', editable: editorText },
				{ field: 'end', text: 'Progress', size: '120px', editable: editorText },
				{ field: 'img', text: 'Image', size: '52px'},
				{ field: 'tag', text: 'Tags', editable: editorText },
				{ field: 'time', text: 'Time', size: '75px', render: renderDateTime},
			],
			show: {
				toolbar: true,
				toolbarAdd: true,
				toolbarSave: true,
				lineNumbers: true,
				footer: true,
			},
			searches: [
				{ field: 'name', label: 'Name', type: 'text' }
			],
			toolbar: {
				items: [
					{ id: 'unsort', type: 'button', text: 'UnSort', icon: 'w2ui-icon-plus' },
					{ type: 'break' },
					{ type: 'button', id: 'showChanges', text: 'Show Changes' }
				],
				onClick(event) {
					if (event.target == 'add') {
						let recid = grid.records.length + 1
						app.owner.add({ recid });
						app.owner.scrollIntoView(recid);
						app.owner.editField(recid, 1)
					}
					if (event.target == 'showChanges') {
						showChanged()
					}
				}
			},
			// onContextMenu(event) {
			// 	let { recid, column, index } = event.detail;
			// 	// you can completely change contextMenu array to show differen menu
			// 	if (recid == null) {
			// 		app.contextMenu[0].text = 'Column'
			// 	} else if (column == null) {
			// 		app.contextMenu[0].text = 'Row'
			// 	} else {
			// 		app.contextMenu[0].text = 'Record'
			// 	}
			// 	query('#grid-log2').html(`
			// 		Rec ID:
			// 		<span style="color: red; padding-right: 10px">${recid}</span>
			// 		Rec Index:
			// 		<span style="color: red; padding-right: 10px">${index}</span>
			// 		Column Index:
			// 		<span style="color: red; padding-right: 10px">${column}</span>
			// 	`)
			// },
			onAdd: async function() {
				let recid = -1;
				game.c_w2grid.add({ recid: recid }, true);

				let content = await navigator.clipboard.readText();
				game.c_w2grid.editField(recid, 0, content);
			},
		});
	},
};
window.mt.game = game;
game.init();
