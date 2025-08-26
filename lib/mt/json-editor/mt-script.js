
class RateEditor extends JSONEditor.AbstractEditor {

	setValue(value, initial, from_template) {
		const changed = this.getValue() !== value;
		this.value = parseInt(value) || 0;
		this.refreshStars();

		if (changed && !initial) {
			this.onChange(true);
		}
	}

	getValue() {
		return parseInt(this.value) || 0;
	}

	build() {
		const self = this;

		// Tạo title/label
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
	JSONEditor.defaults.editors.rate = RateEditor;
	JSONEditor.defaults.resolvers.unshift(schema => {
		if (schema.type === 'integer' && schema.format === 'rate')
			return 'rate';
	});
}
export default { RateRegister };