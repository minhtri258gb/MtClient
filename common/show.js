var mtShow = {

	// Toast
	async initToast() {
		await mt.lib.import(['toastify']);
	},
	toast(type, message) {
		let icon = '', color = '', duration = 5000;

		switch (type) {
			case 'success':
				icon = 'fa-solid fa-circle-check';
				color = '#51a351';
				break;
			case 'info':
				icon = 'fa-solid fa-circle-info';
				color = '#2f96b4';
				break;
			case 'warning':
				icon = 'fa-solid fa-triangle-exclamation';
				color = '#f89406';
				break;
			case 'error':
				icon = 'fa-solid fa-circle-exclamation';
				color = '#bd362f';
				duration = 8000;
				break;
		}

		Toastify({
			text: `<i class="${icon}" style="width:24px;text-align:center;color:${color}"></i> ${message}`,
			duration,
			newWindow: true,
			gravity: 'top', // top, bottom
			position: 'center', // left, center, right
			close: false,
			escapeMarkup: false,
			stopOnFocus: false,
			style: {
				'height': 'auto',
				'width': '240px',
				'padding': '8px 8px',
				'background': '#F9F9F9',
				'color': 'black',
				'border': '1px solid #DFDFDF',
				'border-left': `4px solid ${color}`,
			}
			// className: 'mt-toast',
			// avatar: null,
			// style: { background: color },
			// offset: { x: 50, y: 10 },
			// onClick: () => console.log('oke')
		}).showToast();
	},

	// Alert
	async initAlert() {
		await mt.lib.import(['sweetalert2']);
	},
	async alertConfirmPrimary(message, action) {
		let result = await Swal.fire({
			title: message,
			icon: 'info',
			showCancelButton: true,
			confirmButtonColor: '#0054e9',
			confirmButtonText: action,
			cancelButtonText: 'Đóng'
		});
		return result.isConfirmed;
	},
	async alertConfirmDanger(message, action) {
		let result = await Swal.fire({
			title: message,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#c5000f',
			confirmButtonText: action,
			cancelButtonText: 'Đóng'
		});
		return result.isConfirmed;
	},

	// Animation
	animCollapse(element, opts) {

		element.style.overflow = 'hidden';

		const sectionHeight = element.scrollHeight;

		const anim = element.animate([
			{ maxHeight: sectionHeight + 'px', opacity: 1, ...opts },
			{ maxHeight: '0px', opacity: 0 }
		], {
			duration: 10000,
			easing: 'ease-in-out',
			fill: 'forwards'
		});

		anim.onfinish = () => {
			element.style.display = 'none';
			anim.cancel();
		};
	},
	animExpand(element, opts) {

		element.style.display = '';

		const sectionHeight = element.scrollHeight;

		const anim = element.animate([
			{ maxHeight: '0px', opacity: 0 },
			{ maxHeight: sectionHeight + 'px', opacity: 1 }
		], {
			duration: 10000,
			easing: 'ease-in-out',
			fill: 'forwards'
		});

		anim.onfinish = () => {
			element.style.overflow = '';
			anim.cancel();
		};
	},
};
export default mtShow;
