/**
	<!-- Cơ bản -->
	<mt-tagbox></mt-tagbox>

	<!-- Preset value (string CSV hoặc Array) -->
	<mt-tagbox value="VUEJS,REACT,SVELTE"></mt-tagbox>

	<!-- Tắt uppercase -->
	<mt-tagbox uppercase="false" placeholder="case giữ nguyên"></mt-tagbox>

	<!-- Disabled -->
	<mt-tagbox value="TAG1,TAG2" disabled></mt-tagbox>

	<!-- Lắng nghe thay đổi -->
	<script>
		document.querySelector('mt-tagbox').addEventListener('change', e => {
			console.log(e.detail.value); // ['TAG1', 'TAG2', ...]
		});

		// Hoặc qua JS property
		const box = document.querySelector('mt-tagbox');
		box.value = ['A', 'B', 'C'];
		console.log(box.value); // ['A', 'B', 'C']
	</script>
*/

export class MtTagbox extends HTMLElement {
	static get observedAttributes() {
		return ['value', 'disabled', 'placeholder', 'uppercase'];
	}

	constructor() {
		super();
		this._tags = [];
		this._elmTags = [];
		this._focusIndex = -1;
		this.e_wrap = null;
		this.e_input = null;
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.render();
		const val = this.getAttribute('value');
		if (val)
			this.parseAndSet(val);
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (oldVal === newVal || !this.shadowRoot.innerHTML) return;
		if (name === 'value') {
			this.parseAndSet(newVal);
		} else if (name === 'disabled') {
			this.applyDisabled();
		} else if (name === 'placeholder') {
			const inp = this.shadowRoot.querySelector('input');
			if (inp) inp.placeholder = newVal || '';
		}
	}

	// --- JS property accessors ---
	get value() { return [...this._tags]; }
	set value(v) { this.parseAndSet(v); }

	get disabled() { return this.hasAttribute('disabled'); }
	set disabled(v) {
		if (v) this.setAttribute('disabled', '');
		else this.removeAttribute('disabled');
	}

	render() {
		const ph = this.getAttribute('placeholder') || 'Nhập và Enter';

		this.shadowRoot.innerHTML = `
			<style>
				:host { display: block; }
				.wrap {
					display: flex;
					flex-wrap: wrap;
					align-items: center;
					gap: 2px;
					padding: 0 2px;
					border: 1px solid #d1d5db;
					border-radius: 6px;
					min-height: 21px;
					background: #fff;
					transition: border-color 0.15s;
					box-sizing: border-box;
				}
				:host(:focus-within) .wrap { border-color: #6b7280; }
				:host([disabled]) .wrap { background: #f3f4f6; cursor: not-allowed; }

				input {
					border: none;
					outline: none;
					background: transparent;
					font-size: 13px;
					width: 100px;
					min-width: 60px;
					color: inherit;
					padding: 0;
				}
				input::placeholder { color: #9ca3af; }
				:host([disabled]) input { pointer-events: none; }

				.tag {
					display: inline-flex;
					align-items: center;
					gap: 0px;
					padding: 0 2px;
					background: #e5e7eb;
					border-radius: 4px;
					font-size: 12px;
					font-weight: 600;
					color: #374151;
					white-space: nowrap;
				}
				.tag-focus { background: #4a7ecc; color: #ffffff; }
			</style>
			<div class="wrap" part="wrap">
				<input type="text" placeholder="${ph}" part="input" />
			</div>
		`;

		this.e_wrap = this.shadowRoot.querySelector('.wrap');
		this.e_input = this.shadowRoot.querySelector('input');

		this.e_input.addEventListener('keydown', e => {
			if (e.key === 'Enter') {
				e.preventDefault();
				const v = this.e_input.value.trim();
				if (v) {
					this.addTag(v);
					this.e_input.value = '';
				}
			}
			else if (e.key === 'ArrowLeft' && this.e_input.value === '') {
				if (this._focusIndex >= 0)
					this.focusTag(this._focusIndex - 1);
				else if (this._focusIndex === -1 && this._tags.length)
					this.focusTag(this._tags.length - 1);
			}
			else if (e.key === 'ArrowRight' && this.e_input.value === '') {
				if (this._focusIndex < this._tags.length - 1)
					this.focusTag(this._focusIndex + 1);
				else
					this.focusTag(-1);
			}
			else if ((e.key === 'Backspace' || e.key === 'Delete') && this.e_input.value === '' && this._focusIndex >= 0) {

				let nextIndexFocus = this._focusIndex;
				if (this._focusIndex > 0)
					nextIndexFocus--;
				else
					nextIndexFocus = Math.min(nextIndexFocus, this._tags.length - 2);

				// Xóa tag
				this.removeTag(this._focusIndex);

				// Focus tag trước
				this.focusTag(nextIndexFocus);
			}
			// Backspace xóa tag cuối khi input rỗng
			else if ((e.key === 'Backspace' || e.key === 'Delete') && this.e_input.value === '' && this._tags.length) {
				this.removeTag(this._tags.length - 1);
			}
		});

		this.e_wrap.addEventListener('click', e => {
			const tagEl = e.target.closest('.tag');
			if (tagEl) {
				let index = this._tags.indexOf(tagEl.textContent);
				if (this._focusIndex == index) // Nếu click lần 2 thì close tag
					this.removeTag(index);
				else
					this.focusTag(index); // Focus tag
			}

			this.e_input.focus();
		});

		this.renderAllTags();
	}

	parseAndSet(val) {
		if (Array.isArray(val))
			this._tags = [...val];
		else if (typeof val === 'string' && val.trim() !== '')
			this._tags = val.split(',').map(v => v.trim()).filter(Boolean);
		else
			this._tags = [];

		this.renderAllTags();
	}

	addTag(tag) {

		// Process data
		const upper = this.getAttribute('uppercase') !== 'false';
		if (upper)
			tag = tag.toUpperCase();
		if (this._tags.includes(tag))
			return;
		this._tags.push(tag);

		// Create Element
		const el = document.createElement('div');
		el.className = 'tag';
		el.textContent = tag;

		this._elmTags.push(el);
		this.e_wrap.insertBefore(el, this.e_input);

		this.dispatch();
	}

	removeTag(index) {
		this._tags.splice(index, 1); // remove tag
		let elms = this._elmTags.splice(index, 1); // Get and remove elmTag
		elms[0].remove(); // Remove element
		this._focusIndex = -1; // Unfocus
		this.dispatch(); // Gửi callback
	}

	renderAllTags() {
		this.e_wrap.querySelectorAll('.tag').forEach(el => el.remove());
		this._elmTags = [];
		const frag = document.createDocumentFragment();
		this._tags.forEach(tag => {
			const el = document.createElement('div');
			el.className = 'tag';
			el.textContent = tag;
			frag.appendChild(el);
			this._elmTags.push(el);
		});
		this.e_wrap.insertBefore(frag, this.e_input);
	}

	applyDisabled() {
		this.e_input.disabled = this.disabled;
	}

	dispatch() {
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: [...this._tags] },
			bubbles: true,
			composed: true
		}));
	}

	// Handler
	focusTag(index) {

		// Focus trùng cái cũ thì bỏ qua
		if (this._focusIndex == index)
			return;

		// Unfocus cũ
		if (this._focusIndex != -1) {
			let elm = this._elmTags[this._focusIndex];
			elm.classList.remove('tag-focus');
		}

		// Focus mới
		if (index != -1) {
			let elm = this._elmTags[index];
			elm.classList.add('tag-focus');
		}

		this._focusIndex = index;
	}

}
customElements.define('mt-tagbox', MtTagbox);
