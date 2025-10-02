var mtImport = {

	script(src, globalName) {
		return new Promise((resolve, reject) => {

			// Kiểm tra đã load
			if (window[globalName]) {
				resolve(window[globalName]);
				return;
			}

			const script = document.createElement('script');
			script.src = src;

			script.onload = () => {
				const lib = window[globalName];
				if (lib)
					resolve(lib);
				else
					reject(new Error(`Global ${globalName} not found`));
			};

			script.onerror = () => reject(new Error(`Failed to load ${src}`));

			document.head.appendChild(script);
		});
	},
};
export default mtImport;