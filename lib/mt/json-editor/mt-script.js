
class RateEditor extends JSONEditor.AbstractEditor {

	build() {
		const self = this;

		// Tạo title / label
		this.title = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
		if (this.title)
			this.container.appendChild(this.title);

		// Container cho stars
		this.stars_container = document.createElement('span');
		this.stars_container.className = 'rate-stars';

		// Tạo 5 sao
		this.stars = [];
		for (let i = 1; i <= 5; i++) {
			const star = document.createElement('span');
			star.innerHTML = '★';
			star.className = 'rate-star';
			star.setAttribute('data-value', i);

			// Click event
			star.addEventListener('click', function(e) {
				const rating = parseInt(e.target.getAttribute('data-value'));
				self.setValue(rating);
				self.onChange(true);
			});

			// Hover events
			star.addEventListener('mouseenter', function(e) {
				const rating = parseInt(e.target.getAttribute('data-value'));
				self.highlightStars(rating);
			});

			this.stars.push(star);
			this.stars_container.appendChild(star);
		}

		// Reset khi rời chuột
		this.stars_container.addEventListener('mouseleave', function() {
			self.refreshStars();
		});

		this.container.appendChild(this.stars_container);
		this.refreshStars();
	}

	getValue() {
		return parseInt(this.value) || 0;
	}
	setValue(value, initial, from_template) {
		const changed = this.getValue() !== value;
		this.value = parseInt(value) || 0;
		this.refreshStars();

		if (changed && !initial) {
			this.onChange(true);
		}
	}

	refreshStars() {
		this.stars.forEach((star, index) => {
			star.classList.remove('active', 'hover');
			if (index < this.value) {
				star.classList.add('active');
			}
		});
	}
	highlightStars(rating) {
		this.stars.forEach((star, index) => {
			star.classList.remove('active', 'hover');
			if (index < rating) {
				star.classList.add('hover');
			} else if (index < this.value) {
				star.classList.add('active');
			}
		});
	}

	enable() {
		if (!this.always_disabled) {
			this.stars_container.style.pointerEvents = 'auto';
			this.stars.forEach(star => {
				star.style.cursor = 'pointer';
			});
		}
		super.enable();
	}
	disable(always_disabled) {
		if (always_disabled) this.always_disabled = true;
		this.stars_container.style.pointerEvents = 'none';
		this.stars.forEach(star => {
			star.style.cursor = 'not-allowed';
		});
		super.disable(always_disabled);
	}

	destroy() {
		if (this.stars_container && this.stars_container.parentNode) {
			this.stars_container.parentNode.removeChild(this.stars_container);
		}
		super.destroy();
	}
}
function RateRegister() {
	if (JSONEditor.defaults.editors.rate == null) {
		JSONEditor.defaults.editors.rate = RateEditor;
		JSONEditor.defaults.resolvers.unshift(schema => {
			if (schema.type === 'integer' && schema.format === 'rate')
				return 'rate';
		});
	}
}

class TagBoxEditor extends JSONEditor.AbstractEditor {

	constructor(options, delegate) {
		super(options, delegate);
		this.tags = [];
	}

	build() {

		// Tạo title
		this.title = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
		if (this.title)
			this.container.appendChild(this.title);

		// this.title = this.header = this.label = '';
		// this.title = this.header = this.label = this.delegate.create;
		this.input = document.createElement('input');
		this.input.type = 'text';
		this.input.placeholder = 'Nhập và Enter';
		this.input.style.width = 'initial';
		this.input.style.width = '94px';
		// this.input.style.height = '21px';
		// this.input.style.float = 'left';

		this.tagContainer = document.createElement('div');
		this.tagContainer.className = 'tag-container';
		
		// Thêm các phần tử vào DOM
		this.control = document.createElement('div');
		this.control.appendChild(this.input);
		this.control.appendChild(this.tagContainer);
		this.container.appendChild(this.title);
		this.container.appendChild(this.control);

		// Xử lý sự kiện khi nhấn Enter
		this.input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && this.input.value.trim() !== '') {
				e.preventDefault();
				this.addTag(this.input.value.trim());
				this.input.value = '';
			}
		});

		// Lắng nghe sự kiện click trên container để xóa tag
		this.tagContainer.addEventListener('click', (e) => {
			if (e.target.classList.contains('tag-close')) {
				const tagElement = e.target.closest('.tag');
				if (tagElement) {
					const tagName = tagElement.dataset.tag;
					this.removeTag(tagName);
				}
			}
		});
	}

	getValue() {
		return this.tags;
	}
	setValue(value, initial) {
		if (Array.isArray(value)) {
			this.tags = [...value]; // Tạo shallow copy
			this.renderTags();
		}
		else if (typeof value === 'string') {
			let pathValue = value.split(',').map(v => v.trim()).filter(v => v !== '');
			this.tags = pathValue;
			this.renderTags();
		}
		else {
			this.tags = [];
			this.renderTags();
		}

		if (!initial) {
			this.onChange(true);
		}
	}

	addTag(tag) {

		// In Hoa
		tag = tag.toUpperCase();

		// Nếu đã có tag thì bỏ qua
		if (this.tags.includes(tag))
			return;

		this.tags.push(tag);
		this.renderTags();
		this.onChange(true);
	}
	removeTag(tag) {
		this.tags = this.tags.filter(t => t !== tag);
		this.renderTags();
		this.onChange(true);
	}
	renderTags() {
		this.tagContainer.innerHTML = '';
		this.tags.forEach(tag => {
			const tagElement = document.createElement('div');
			tagElement.className = 'tag';
			tagElement.dataset.tag = tag;
			tagElement.innerHTML = `<span>${tag}</span><button class="tag-close">x</button>`;
			this.tagContainer.appendChild(tagElement);
		});
	}

};
function TagBoxRegister() {
	if (JSONEditor.defaults.editors.tagbox == null) {
		JSONEditor.defaults.editors.tagbox = TagBoxEditor;
		JSONEditor.defaults.resolvers.unshift(schema => {
			if (schema.type === 'array' && schema.format === 'tagbox')
				return 'tagbox';
		});
	}
}

globalThis.mt.lib.jsonEditor.ex = { RateRegister, TagBoxRegister };
