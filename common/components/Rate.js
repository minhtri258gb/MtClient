/**
	<!-- Cơ bản -->
	<mt-rate></mt-rate>

	<!-- Có giá trị mặc định -->
	<mt-rate value="3"></mt-rate>

	<!-- Tùy chỉnh số sao và kích thước -->
	<mt-rate max="7" value="4" size="28px"></mt-rate>

	<!-- Disabled -->
	<mt-rate value="2" disabled></mt-rate>

	<!-- Lắng nghe sự kiện -->
	<script>
		document.querySelector('mt-rate').addEventListener('change', e => {
			console.log('Rating:', e.detail.value);
		});
	</script>
*/

class MtRate extends HTMLElement {
	static get observedAttributes() {
		return ['value', 'max', 'disabled', 'size'];
	}

	constructor() {
		super();
		this._value = 0;
		this._stars = [];
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.render();
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (oldVal === newVal) return;
		if (name === 'value') {
			this._value = parseInt(newVal) || 0;
			this.refreshStars();
		} else if (name === 'disabled') {
			this.applyDisabled();
		} else if (name === 'max' || name === 'size') {
			this.render(); // re-render khi thay đổi cấu trúc
		}
	}

	// --- JS property accessors ---
	get value() { return this._value; }
	set value(v) {
		const n = parseInt(v) || 0;
		if (n !== this._value) {
			this._value = n;
			this.setAttribute('value', n);
			this.refreshStars();
		}
	}

	get disabled() { return this.hasAttribute('disabled'); }
	set disabled(v) {
		if (v) this.setAttribute('disabled', '');
		else this.removeAttribute('disabled');
	}

	render() {
		const max  = parseInt(this.getAttribute('max'))  || 5;
		const size = this.getAttribute('size') || '22px';
		this._value = parseInt(this.getAttribute('value')) || 0;

		this.shadowRoot.innerHTML = `
			<style>
				:host { display: inline-flex; align-items: center; gap: 2px; user-select: none; }
				.star {
					font-size: ${size};
					line-height: 1;
					cursor: pointer;
					color: #ccc;
					transition: color 0.1s, transform 0.1s;
					display: inline-block;
				}
				.star.active { color: #f5a623; }
				.star.hover  { color: #f5c96a; }
				:host([disabled]) .star { cursor: not-allowed; opacity: 0.55; }
			</style>
		`;

		this._stars = [];
		for (let i = 1; i <= max; i++) {
			const star = document.createElement('span');
			star.className = 'star';
			star.textContent = '★';
			star.dataset.value = i;

			star.addEventListener('click', e => {
				if (this.disabled) return;
				const v = parseInt(e.currentTarget.dataset.value);
				const prev = this._value;
				this._value = v;
				this.setAttribute('value', v);
				this.refreshStars();
				if (prev !== v) {
					this.dispatchEvent(new CustomEvent('change', {
						detail: { value: v },
						bubbles: true,
						composed: true  // thoát ra khỏi shadow boundary
					}));
				}
			});

			star.addEventListener('mouseenter', e => {
				if (this.disabled) return;
				this.highlightStars(parseInt(e.currentTarget.dataset.value));
			});

			this._stars.push(star);
			this.shadowRoot.appendChild(star);
		}

		// mouseleave gắn trên từng star (không dùng container)
		this._stars.forEach(s => {
			s.addEventListener('mouseleave', () => {
				if (!this.disabled) this.refreshStars();
			});
		});

		this.refreshStars();
	}

	refreshStars() {
		this._stars.forEach((s, i) => {
			s.classList.remove('active', 'hover');
			if (i < this._value) s.classList.add('active');
		});
	}

	highlightStars(rating) {
		this._stars.forEach((s, i) => {
			s.classList.remove('active', 'hover');
			if (i < rating) s.classList.add('hover');
			else if (i < this._value) s.classList.add('active');
		});
	}

	applyDisabled() {
		this.refreshStars();
	}
}
customElements.define('mt-rate', MtRate);
