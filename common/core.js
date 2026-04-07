var mtCore = {

	async config(key) {
		
		// Call API - read Enviroment
		let response = await fetch(`/common/getConfig?key=${key}`, { method: 'GET' });
		if (!response.ok)
			throw { error: true, msg: await response.text() };

		return await response.text();
	},
	async buildComponent(path) {

		// Load HTML
		let [
			resHtml,
			resCss,
			resJs
		] = await Promise.all([
			fetch(path + '/index.html', { method: 'GET' }),
			fetch(path + '/style.css', { method: 'GET' }),
			fetch(path + '/script.js', { method: 'GET' }),
		]);

		let [
			htmlText,
			cssText,
			jsText,
		] = await Promise.all([
			resHtml.text(),
			resCss.text(),
			resJs.text(),
		]);

		// Process JS
		let moduleObj = window.eval(jsText);

		// Define component
		customElements.define(moduleObj.h_tagName, class extends HTMLElement {
			constructor() {
				super();

				// Init JS
				Object.assign(this, moduleObj);
			}
			connectedCallback() {

				// Prepare CSS
				const sheet = new CSSStyleSheet();
				sheet.replaceSync(cssText);

				// Init HTML, CSS
				if (this.h_isShadow) {
					this.shadow = this.attachShadow({ mode: 'open' });
					this.shadow.adoptedStyleSheets = [sheet]; // CSS Shadow
					this.shadow.innerHTML = htmlText; // HTML
				}
				else {
					document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]; // CSS Global
					this.innerHTML = htmlText; // HTML
				}

				if (this.init)
					this.init();
			}
		});

		// Log
		mt.h_debug && console.log('[mtCore.buildComponent]', { path });

		// Return
		return moduleObj.h_tagName;
	},
};
export default mtCore;