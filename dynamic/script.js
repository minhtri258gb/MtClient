import mtApi from '/common/api.js';
import mtLib from '/common/lib.js';
import mtFile from '/common/file.js';
import mtCmd from '/common/cmd.js';
import mtShow from '/common/show.js';
import mtUtils from '/common/utils.js';

import MtList from '/dynamic/components/MtList.js';
import MtForm from '/dynamic/components/MtForm.js';

let mt = {
	api: mtApi,
	lib: mtLib,
	file: mtFile,
	cmd: mtCmd,
	show: mtShow,
	utils: mtUtils,

	h_debug: true,
	h_pathDB: '/dynamic/pages/',
	m_page: '', // page name
	d_page: {}, // Map name - element

	// Method
	async init() {
		try {

			// Bind Global
			globalThis.mt = this;

			// Import library
			await mt.lib.import(['tabulator','tingle','jsonEditor','flatpickr']);
			
			// Extra Library
			this.lib.jsonEditor.ex.RateRegister();
			this.lib.jsonEditor.ex.TagBoxRegister();

			// Init
			await this.api.init();
			await this.show.initToast();

			// processParams
			this.processParams();
			
			let elPage = await this.loadPage(this.m_page);

			// Add Body
			document.body.appendChild(elPage);
		}
		catch (ex) {
			this.show.toast('error', ex.message);
			console.error('[mt.init]', ex);
		}
	},
	processParams() {
		let urlParams = new URLSearchParams(window.location.search);

		this.m_page = urlParams.get('page') || 'main';
	},
	async loadPage(page) {

		// Load config
		let struct = await this.file.loadJson(this.h_pathDB + page + '.json');

		let elPage = null;
		switch (struct.type) {
			case 'list': elPage = new MtList(page, struct); break;
			case 'form': elPage = new MtForm(page, struct); break;
		}
		if (elPage == null)
			throw { message: `[${page}] Type "${struct.type}" không hợp lệ!`, detail: struct };

		// Add map
		this.d_page[page] = elPage;

		// Log
		this.h_debug && console.log('[mt.loadPage]', { elPage });

		// Return
		return elPage;
	},
	createModal(elPage) {

		// Tingle Modal
		let modal = new tingle.modal({
			footer: false,
			stickyFooter: false,
			closeMethods: ['button', 'escape'], // 'overlay'
			closeLabel: "Đóng",
			onOpen: () => {
				// console.log('modal opened');
			},
			onClose: () => {
				// console.log('modal closed');
			},
			beforeClose: () => {
				// Return true to close the modal, false to prevent closing
				return true;
			},
		});

		// Contain Form
		modal.modalBox.style.width = 'unset';
		modal.modalBoxContent.appendChild(elPage); // Đặt contain form vào modal

		// Add model to pkg
		elPage.c_modal = modal;

		// Return
		return modal;
	}
};
document.addEventListener('DOMContentLoaded', () => mt.init());