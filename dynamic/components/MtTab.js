// import envService from '/src/services/env.service';
// import apiService from '/src/services/api.service';
// import pwaService from '/src/services/pwa.service';
// import capService from '/src/services/capacitor.service';
// import showService from '/src/services/show.service';
// import libService from '/src/services/lib.service';

class MtTab extends HTMLElement {

	h_debug = true;
	e_menu = null; // Menu
	e_menuInfoHost = null; // Menu info - Host
	e_menuInfoUser = null; // Menu info - User
	e_qrImage = null; // Img QR

	// Forward
	connectedCallback() {
		this.innerHTML = this.buildHTML();
		this.initUI();
	}

	// Method
	buildHTML() {
		return `
			<ion-menu content-id="main-content">
				<ion-header>
					<ion-toolbar>
						<ion-title>Menu</ion-title>
					</ion-toolbar>
				</ion-header>
				<ion-content>
					<ion-list>
						<ion-item id="menu-host" button detail lines="full">
							<ion-icon name="globe-outline" slot="start"></ion-icon>
							Host: <span id="menu-info-host">http://localhost</span>
						</ion-item>
						<ion-item id="menu-login" button detail lines="full">
							<ion-icon name="log-in-outline" slot="start"></ion-icon>
							Login: <span id="menu-info-user">None</span>
						</ion-item>
						<ion-item href="/dev" button detail lines="full">
							<ion-icon name="code-slash-outline" slot="start"></ion-icon>
							Dev
						</ion-item>
						<ion-item href="/map" button detail lines="full">
							<ion-icon name="map-outline" slot="start"></ion-icon>
							Map
						</ion-item>
						<ion-item href="/hin" button detail lines="full">
							<ion-icon name="business-outline" slot="start"></ion-icon>
							Hin
						</ion-item>
						<ion-item id="menu-exit" button detail lines="full">
							<ion-icon name="exit-outline" slot="start"></ion-icon>
							Thoát app
						</ion-item>
					</ion-list>
				</ion-content>
			</ion-menu>

			<div class="ion-page" id="main-content">
				<ion-header>
					<ion-toolbar color="primary">
						<ion-buttons slot="start">
							<ion-menu-button></ion-menu-button>
						</ion-buttons>
						<ion-title>Home</ion-title>
					</ion-toolbar>
				</ion-header>

				<ion-content class="ion-padding">
					<div id="container">

						<ion-button id="btn-test">Test</ion-button>
						<ion-button id="btn-install">Install PWA</ion-button>
						<ion-button id="btn-qr">Gen QR</ion-button>
						<img id="img-qr" />

						<ion-router-link href="/new">
							<ion-button>Navigate</ion-button>
						</ion-router-link>
						<ion-router-link href="/map">
							<ion-button>Map</ion-button>
						</ion-router-link>
						<ion-router-link href="/dev">
							<ion-button>Dev</ion-button>
						</ion-router-link>
						<strong>Ready to create an app?</strong>
						<p>
							Start with Ionic
							<a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a>
						</p>
					</div>
				</ion-content>
			</div>
		`;
	}
	async initUI() {

		// Menu
		this.e_menu = document.querySelector('ion-menu');
		this.e_menuInfoHost = this.querySelector('#menu-info-host');
		this.e_menuInfoHost.innerHTML = envService.host;
		this.e_menuInfoUser = this.querySelector('#menu-info-user');
		this.e_menuInfoUser.innerHTML = envService.user;

		let e_menuLogin = this.querySelector('#menu-login');
		e_menuLogin.addEventListener('click', (elm) => this.btnMenuLogin());

		let e_menuHost = this.querySelector('#menu-host');
		e_menuHost.addEventListener('click', (elm) => this.btnMenuHost());

		let e_menuExit = this.querySelector('#menu-exit');
		e_menuExit.addEventListener('click', (elm) => this.btnMenuExit());

		// Content
		let e_btnTest = this.querySelector('#btn-test');
		e_btnTest.addEventListener('click', (elm) => this.btnTest());

		let e_btnInstall = this.querySelector('#btn-install');
		e_btnInstall.addEventListener('click', (elm) => this.btnInstall());

		let e_btnQR = this.querySelector('#btn-qr');
		e_btnQR.addEventListener('click', (elm) => this.btnQR());

		this.e_qrImage = this.querySelector('#img-qr');

		// Install PWA
	}

	// Handler
	async btnMenuHost() {
		try {

			// Đóng menu
			this.e_menu.close();

			// Show alert nhập mật khẩu
			let host = await new Promise((resolve, reject) => {
				showService.alert({
					header: 'Host',
					message: 'Nhập IP',
					inputs: [{ name: 'host', placeholder: 'Địa chỉ IP', value: envService.host }],
					buttons: [
						{ text: 'Đóng', role: 'cancel', handler: () => resolve('') },
						{ text: 'Đổi', role: 'confirm', handler: (result) => resolve(result.host)},
					]
				});
			});

			// Kiểm tra
			if (host.length == 0)
				return;

			// Lưu lại
			pwaService.setLocalStorage('host', host);

			// Thông báo
			showService.toast('success', 'Đã thay đổi Host IP');

			// Log
			this.h_debug && console.log('[HomePage.btnMenuLogin]', { host });
		}
		catch (ex) {
			console.error('[HomePage.btnMenuLogin]', ex);
			showService.toast('error', ex.message);
		}
	}
	async btnMenuLogin() {
		try {

			// Đóng menu
			this.e_menu.close();

			// Show alert nhập mật khẩu
			let password = await new Promise(async (resolve, reject) => {
				await showService.alert({
					header: 'Đăng nhập',
					message: 'Nhập mật khẩu',
					inputs: [{ name: 'password', placeholder: 'Mật khẩu', type: 'password' }],
					buttons: [
						{ text: 'Đóng', role: 'cancel', handler: () => resolve('') },
						{ text: 'Đăng nhập', role: 'confirm', handler: (result) => resolve(result.password)},
					]
				});
			});

			// Kiểm tra
			if (password.length == 0)
				return;

			// Call API - Login
			let result = await apiService.login(password);
			let user = result.user;

			// Lưu lại
			pwaService.setLocalStorage('user', user);
			pwaService.setLocalStorage('token', result.token);

			// Cập nhật env
			envService.user = user;

			// Cập nhật UI
			this.e_menuInfoUser.innerHTML = user;

			// Thông báo
			showService.toast('success', `${user} đăng nhập thành công`);

			// Log
			this.h_debug && console.log('[HomePage.btnMenuLogin]', { password, result });
		}
		catch (ex) {
			console.error('[HomePage.btnMenuLogin]', ex);
			showService.toast('error', ex.message);
		}
	}
	async btnMenuExit() {
		await capService.appExit();
	}
	async btnTest() {
		try {

			showService.toast('info', 'Test');
		}
		catch (ex) {
			console.error('[HomePage.btnTest]', ex);
			showService.toast('error', ex.message);
		}
	}
	async btnInstall() {
		try {

			// Kiểm tra
			let isInstall = pwaService.pwaIsInstalled();
			showService.toast('info', isInstall ? 'Đã cài đặt' : 'Chưa cài đặt');

			if (!isInstall)
				pwaService.pwaShowInstallPrompt();
		}
		catch (ex) {
			console.error('[HomePage.btnInstall]', ex);
			showService.toast('error', ex.message);
		}
	}
	async btnQR() {
		try {

			let host = envService.host;
			let pos = host.lastIndexOf(':');
			host = host.substring(0, pos+1) + location.port;

			// Create QR
			let url = await libService.qrCreate(host);
			
			// Load Image QR
			this.e_qrImage.src = url;

			// Log
			this.h_debug && console.log('[HomePage.btnQR]', { url });
		}
		catch (ex) {
			console.error('[HomePage.btnQR]', ex);
			showService.toast('error', ex.message);
		}
	}
}

customElements.define('home-page', HomePage);