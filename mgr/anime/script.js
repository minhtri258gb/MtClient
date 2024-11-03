import { w2grid, w2field, w2tabs } from 'w2ui';
import { DateTime } from "luxon";

var anime = {

	// Const
	h_debug: true,

	// Categories
	l_tags: [
		'classic', 'fantasy', 'mecha',
		'romcom', 'harem',
		'detective', 'time', 'power', 'zombie',
	],

	// Component
	c_w2grid: null,


	// Method
	init: async function() {

		// Call API Init App
		await $.ajax({
			type: 'POST',
			url: '/manager/init',
			data: JSON.stringify({ app: 'anime' }),
			contentType: 'application/json',
			dataType: 'json'
		});

		// Prepare renderRating
		let ratingProp = {
			render: (row, ex) => ex.value == null ? '' : `<img src="/res/icons/rating${ex.value}.png"/>`,
			editable: { type: 'int', arrow: true, min: 1, max: 5 },
			size: '60px',
			attr: 'align=center',
			sortable: true,
			resizable: false,
		};
		let renderDateTime = (col, ex) => (ex.value == null) ? '' : DateTime.fromSeconds(ex.value).toFormat('yyyy/MM/dd');
		let editorText = { type: 'text' };

		// Init UI - Grid
		anime.c_w2grid = new w2grid({
			name: 'anime_grid', box: '#anime #grid',
			url: '/manager/anime/grid',
			limit: 30,
			liveSearch: true, fixedBody: true,
			recid: 'id',
			columns: [
				{ field: 'name', text: 'Name', size: '320px', editable: editorText },
				{ field: 'review', text: 'Overall', ...ratingProp },
				{ field: 'story', text: 'Story', ...ratingProp },
				{ field: 'art', text: 'Art', ...ratingProp },
				{ field: 'sound', text: 'Sound', ...ratingProp },
				{ field: 'fantasy', text: 'Fantasy', ...ratingProp },
				{ field: 'sad', text: 'Emote', ...ratingProp },
				{ field: 'joke', text: 'Fun', ...ratingProp },
				{ field: 'brand', text: 'Plot', ...ratingProp },
				{ field: 'end', text: 'Progress', size: '120px', editable: editorText },
				{ field: 'character', text: 'Character', size: '120px', editable: editorText },
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
			// 	console.log(event.detail)
			// },
			onAdd: async function() {
				let recid = -1;
				anime.c_w2grid.add({ recid: recid }, true);

				let content = await navigator.clipboard.readText();
				anime.c_w2grid.editField(recid, 0, content);
			},
		});

		// Log
		// if (anime.h_debug)
		// 	console.log('[mgr|mt.anime] init', {
		// 		listData: listData,
		// 	});
	},
};
window.mt.anime = anime;
anime.init();
