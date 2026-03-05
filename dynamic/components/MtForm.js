class MtForm extends HTMLElement {

	h_debug = true;
	m_name = ''; // Tên trang
	m_struct = null; // Cấu trúc
	d_form = {}; // Danh sách dữ liệu
	c_form = null; // jsoneditor

	// Forward
	constructor(name, struct) {
		super(struct);

		// Properties
		this.m_name = name;
		this.m_struct = struct;

		// Init Style
		this.style.display = 'block';
		if (struct.width)
			this.style.width = struct.width;

		// this.initUI();
	}
	connectedCallback() {
		this.initUI();
	}

	// Method
	async initUI() {

		// Build form
		let properties = this.buildField();

		// Init form - JsonEditor
		this.c_form = new JSONEditor(this, {
			use_name_attributes: false,
			theme: 'barebones',
			iconlib: 'fontawesome5',
			disable_edit_json: true,
			disable_properties: true,
			disable_collapse: true,
			schema: {
				title: this.m_struct.title,
				type: 'object',
				// required: ['name'],
				properties,
			},
		});
	}

	// Build
	buildField() {
		let properties = {};

		// Field
		for (let config of this.m_struct.fields) {
			let propertie = {};

			// Title
			if (config.name != null) propertie.title = config.name;

			// Format
			if (config.format != null) {
				switch (config.format) {
					case 'hidden':
						propertie.type = 'string';
						propertie.format = 'hidden';
						propertie.options = { titleHidden: true };
						break;
					case 'text':
						propertie.type = 'string';
						propertie.format = 'text';
						break;
					case 'num':
						propertie.type = 'number';
						break;
					case 'check':
						propertie.type = 'boolean';
						propertie.format = 'checkbox';
						break;
					case 'rate':
						propertie.type = 'integer';
						propertie.format = 'rate';
						break;
					case 'tags':
						propertie.type = 'array';
						propertie.format = 'tagbox';
						propertie.items = { type: 'string' };
						break;
				}
			}

			// Type
			if (config.datatype != null) {
				switch (config.datatype) {
					case 'str': propertie.type = 'string'; break;
					case 'int': propertie.type = 'integer'; break;
				}
			}

			// Option
			if (config.default != null) propertie.default = config.default;
			if (config.minimum != null) propertie.minimum = config.minimum;
			if (config.maximum != null) propertie.maximum = config.maximum;

			properties[config.code] = propertie;
		}

		// Button
		for (let config of this.m_struct.buttons) {
			let opts = {};

			if (config.icon != null)
				opts.icon = config.icon;

			switch (config.func) {
				case 'saveForm': opts.action = () => this.saveForm(); break;
				case 'closeModal': opts.action = () => this.funcCloseModal(); break;
			}

			properties[config.code] = {
				title: config.name,
				type: 'string',
				format: 'button',
				options: { button: opts }
			};
		}

		return properties;
	}

	// Handler
	saveForm() {
		// #TODO
	}
	funcCloseModal() {
		if (this.c_modal)
			this.c_modal.close();
		else
			console.warn(`[MtForm.funcCloseModal] Form ${this.m_name} không có modal!`);
	}

	// Get / Set
	setForm(form) {

		// Clone data
		this.d_form = JSON.parse(JSON.stringify(form));

		// Process

		// Set form data
		this.c_form.setValue(this.d_form);
	}
}
customElements.define('mt-form', MtForm);
export default MtForm;