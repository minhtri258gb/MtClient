var mtShow = {
	m_initToast: false, // toastify
	m_initAlert: false, // sweetalert2

	// Toast
	async toast(type, message) {

		if (!this.m_initToast) {
			this.m_initToast = true;
			await mt.lib.import(['toastify']);
		}

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
	async alertConfirmPrimary(message, action) {

		if (!this.m_initAlert) {
			this.m_initAlert = true;
			await mt.lib.import(['sweetalert2']);
		}

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

		if (!this.m_initAlert) {
			this.m_initAlert = true;
			await mt.lib.import(['sweetalert2']);
		}

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
	animRemove(elm, opts) {
		if (!elm || !elm.parentNode)
			return;

		let duration = opts?.duration || 300;

		const currentHeight = elm.scrollHeight;
		const computedStyle = getComputedStyle(elm);

		const marginTop = computedStyle.marginTop;
		const marginBottom = computedStyle.marginBottom;

		const animation = elm.animate([
			{
				height: currentHeight + 'px',
				opacity: 1,
				marginTop: marginTop,
				marginBottom: marginBottom
			},
			{
				height: '0px',
				opacity: 0,
				marginTop: '0px',
				marginBottom: '0px'
			}
		], {
			duration: duration,
			easing: 'ease-out',
			fill: 'forwards'
		});

		animation.onfinish = () => elm.parentNode.removeChild(elm);
	},
	animFold(elm, isFolded, options = {}) {

		let duration = options.duration || 300;
		let easing = options.easing || 'ease-out';
		let marginTop = '0px', marginBottom = '0px';
		if (options.margin && options.margin.length > 0) {
			marginTop = options.margin[0];
			marginBottom = options.margin.length >= 2 ? options.margin[1] : options.margin[0];
		}

		if (isFolded) {
			// Đang unfold → fold lại
			const currentHeight = elm.scrollHeight;
			elm.style.overflow = 'hidden';

			const animation = elm.animate([
				{
					maxHeight: currentHeight + 'px',
					opacity: 1,
					marginTop: marginTop,
					marginBottom: marginBottom
				},
				{
					maxHeight: '0px',
					opacity: 0,
					marginTop: '0px',
					marginBottom: '0px'
				}
			], {
				duration: duration,
				easing: easing,
				fill: 'forwards'
			});

			return new Promise(resolve => animation.onfinish = () => resolve());
		}
		else {

			// Đang fold → unfold ra
			elm.style.overflow = 'hidden';
			elm.style.maxHeight = '0px';
			elm.style.opacity = '0';
			elm.style.marginTop = '0px';
			elm.style.marginBottom = '0px';

			void elm.offsetHeight; // Force reflow

			const fullHeight = elm.scrollHeight + 'px';

			const animation = elm.animate([
				{
					maxHeight: '0px',
					opacity: 0,
					marginTop: '0px',
					marginBottom: '0px'
				},
				{
					maxHeight: fullHeight,
					opacity: 1,
					marginTop: marginTop,
					marginBottom: marginBottom
				}
			], {
				duration: duration,
				easing: easing,
				fill: 'forwards'
			});

			return new Promise(resolve => {
				animation.onfinish = () => {
					// Reset styles sau khi animation hoàn tất
					elm.style.maxHeight = 'none';
					elm.style.overflow = '';
					elm.style.transition = '';
					resolve();
				};
			});
		}
	}
};
export default mtShow;
