
function openPage(params) {

	let row = params.row;
	let rowData = row.getData();
	let page = rowData.code;

	// Chuyển hướng đến trang này
	let paramURL = new URLSearchParams();
	paramURL.append('page', page);
	window.location.href = '/dynamic/?' + paramURL.toString();
}

export { openPage };
