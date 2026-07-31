/*!
 * <code-notebook> — nhúng được vào bất kỳ trang HTML nào.
 * Vanilla JS, không phụ thuộc thư viện ngoài. Dùng Shadow DOM nên CSS không đụng độ với trang chủ.
 *
 * Cách dùng nhanh:
 *   <script src="code-notebook.js"></script>
 *   <code-notebook id="nb"></code-notebook>
 *   <script>
 *     document.getElementById('nb').configure({
 *       apiUrl: '/api/execute',           // hoặc dùng hàm execute() tự custom (xem README)
 *       languages: [...],                 // tùy chọn, có default sẵn: js, python, cmd, duckdb
 *       tools: [ { id, label, icon, onClick(cell, api) } ],   // tool áp cho mọi cell
 *       cellTools: (cell) => [ ... ],     // tool riêng theo từng cell (vd theo language)
 *       initialCells: [ { language: 'javascript', code: '...' } ]
 *     });
 *   </script>
 *
 * Hợp đồng API (khi dùng apiUrl mặc định):
 *   POST apiUrl  body: { language, code, cellId }
 *   Response JSON kỳ vọng MỘT trong các dạng:
 *     { success: true, output: "text thuần" }
 *     { success: true, table: { columns: ["a","b"], rows: [[1,2],[3,4]] } }   // dùng cho duckdb/sql
 *     { success: false, error: "thông báo lỗi" }
 */
(function () {
  'use strict';

  const DEFAULT_LANGUAGES = [
    { id: 'javascript', label: 'JavaScript', color: '#f0c419', ext: 'js', defaultCode: "console.log('hello')" },
    { id: 'python', label: 'Python', color: '#3fa7d6', ext: 'py', defaultCode: "print('hello')" },
    { id: 'cmd', label: 'Shell', color: '#9096a8', ext: 'sh', defaultCode: 'echo hello' },
    { id: 'duckdb', label: 'DuckDB', color: '#2ec4b6', ext: 'sql', defaultCode: 'select 42 as answer' }
  ];

  const ICONS = {
    run: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M4 2.5v11l10-5.5z" fill="currentColor"/></svg>',
    del: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
    up: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M3 10l5-5 5 5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    add: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 2.5v11l10-5.5z" fill="currentColor"/></svg>'
  };

  let uidCounter = 0;
  const uid = (p) => `${p}_${Date.now().toString(36)}_${(uidCounter++).toString(36)}`;

  const STYLE = `
  :host {
    --nb-bg: #1b1c22;
    --nb-panel: #24262f;
    --nb-panel-alt: #2b2d38;
    --nb-border: #383b48;
    --nb-text: #e6e7ec;
    --nb-muted: #9096a8;
    --nb-accent: #f2b134;
    --nb-success: #4fd1a5;
    --nb-error: #ef6461;
    --nb-radius: 10px;
    --nb-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --nb-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
    display: block;
    color: var(--nb-text);
    font-family: var(--nb-sans);
    background: var(--nb-bg);
    border-radius: var(--nb-radius);
    border: 1px solid var(--nb-border);
    overflow: hidden;
  }
  * { box-sizing: border-box; }
  .nb-root { display: flex; flex-direction: column; }
  .nb-toolbar {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; border-bottom: 1px solid var(--nb-border);
    background: linear-gradient(180deg, var(--nb-panel-alt), var(--nb-panel));
  }
  .nb-title { font-weight: 600; font-size: 13px; letter-spacing: .2px; margin-right: auto; color: var(--nb-text); display:flex; align-items:center; gap:8px;}
  .nb-title .dot { width:8px; height:8px; border-radius:50%; background: var(--nb-accent); box-shadow: 0 0 0 3px rgba(242,177,52,.15);}
  .nb-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--nb-panel-alt); color: var(--nb-text);
    border: 1px solid var(--nb-border); border-radius: 7px;
    font-family: var(--nb-sans); font-size: 12px; font-weight: 500;
    padding: 6px 10px; cursor: pointer; line-height: 1;
    transition: background .12s ease, border-color .12s ease, transform .05s ease;
  }
  .nb-btn:hover { background: #33364280; border-color: #4a4e60; }
  .nb-btn:active { transform: translateY(1px); }
  .nb-btn.primary { background: var(--nb-accent); color: #1b1c22; border-color: var(--nb-accent); font-weight: 700; }
  .nb-btn.primary:hover { filter: brightness(1.06); }
  .nb-btn.icon-only { padding: 6px 7px; }
  .nb-btn:disabled { opacity: .45; cursor: not-allowed; }

  .nb-cells { display: flex; flex-direction: column; gap: 10px; padding: 14px; }
  .nb-empty {
    border: 1px dashed var(--nb-border); border-radius: var(--nb-radius);
    padding: 28px; text-align: center; color: var(--nb-muted); font-size: 13px;
  }

  .nb-cell {
    display: flex; background: var(--nb-panel); border: 1px solid var(--nb-border);
    border-radius: var(--nb-radius); overflow: hidden;
  }
  .nb-spine { width: 4px; flex: none; background: var(--lang-color, var(--nb-muted)); transition: box-shadow .2s ease; }
  .nb-cell.running .nb-spine { animation: nb-pulse 1s ease-in-out infinite; }
  @keyframes nb-pulse { 0%,100% { box-shadow: 0 0 0 0 var(--lang-color, transparent); } 50% { box-shadow: 0 0 12px 1px var(--lang-color, transparent); } }

  .nb-cell-body { flex: 1; min-width: 0; }
  .nb-cell-header {
    display: flex; align-items: center; gap: 8px; padding: 7px 10px;
    border-bottom: 1px solid var(--nb-border); background: var(--nb-panel-alt);
  }
  .nb-index { font-family: var(--nb-mono); font-size: 11px; color: var(--nb-muted); min-width: 22px; }
  .nb-lang-select {
    background: transparent; color: var(--lang-color, var(--nb-text)); border: 1px solid var(--nb-border);
    border-radius: 6px; font-size: 12px; font-weight: 600; padding: 4px 6px; cursor: pointer; font-family: var(--nb-sans);
  }
  .nb-lang-select:focus-visible, .nb-btn:focus-visible, textarea:focus-visible { outline: 2px solid var(--nb-accent); outline-offset: 1px; }
  .nb-status { font-size: 11px; color: var(--nb-muted); font-family: var(--nb-mono); margin-right: auto; }
  .nb-status.ok { color: var(--nb-success); }
  .nb-status.err { color: var(--nb-error); }
  .nb-tools { display: flex; gap: 4px; align-items: center; }

  .nb-editor-wrap { display: flex; position: relative; background: #16171c; }
  .nb-gutter {
    user-select: none; text-align: right; color: #565a6b; font-family: var(--nb-mono);
    font-size: 12.5px; line-height: 20px; padding: 10px 8px 10px 0; border-right: 1px solid var(--nb-border);
    overflow: hidden; flex: none; min-width: 28px;
  }
  textarea.nb-code {
    flex: 1; resize: none; border: none; background: transparent; color: var(--nb-text);
    font-family: var(--nb-mono); font-size: 12.5px; line-height: 20px; padding: 10px 12px;
    min-height: 46px; white-space: pre; overflow-wrap: normal; overflow-x: auto;
  }
  textarea.nb-code::placeholder { color: #565a6b; }

  .nb-output { border-top: 1px solid var(--nb-border); }
  .nb-output-inner {
    font-family: var(--nb-mono); font-size: 12.5px; padding: 9px 12px; white-space: pre-wrap;
    word-break: break-word; max-height: 300px; overflow: auto; background: #14151a;
  }
  .nb-output-inner.err { color: var(--nb-error); }
  .nb-output-inner.empty { color: var(--nb-muted); font-style: italic; }
  table.nb-table { border-collapse: collapse; font-family: var(--nb-mono); font-size: 12px; width: 100%; }
  table.nb-table th, table.nb-table td { border: 1px solid var(--nb-border); padding: 4px 8px; text-align: left; }
  table.nb-table th { background: var(--nb-panel-alt); color: var(--nb-accent); position: sticky; top: 0; }
  table.nb-table tr:nth-child(even) td { background: rgba(255,255,255,.02); }
  `;

  class CodeNotebook extends HTMLElement {
    static get observedAttributes() { return ['api-url', 'title']; }

    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this.config = {
        apiUrl: null,
        execute: null,
        languages: DEFAULT_LANGUAGES.slice(),
        tools: [],
        cellTools: null,
        title: 'Notebook',
        initialCells: null,
        storage: null // optional { load(): Promise<state>, save(state): Promise<void> }
      };
      this.cells = [];
    }

    connectedCallback() {
      if (this.getAttribute('api-url')) this.config.apiUrl = this.getAttribute('api-url');
      if (this.getAttribute('title')) this.config.title = this.getAttribute('title');
      this._render();
      if (this.config.initialCells && this.config.initialCells.length) {
        this.config.initialCells.forEach((c) => this._pushCell(c, { silent: true }));
      } else if (!this.cells.length) {
        this._pushCell({ language: this.config.languages[0].id }, { silent: true });
      }
      this._renderCells();
    }

    attributeChangedCallback(name, _old, val) {
      if (name === 'api-url') this.config.apiUrl = val;
      if (name === 'title') { this.config.title = val; this._syncTitle(); }
    }

    /* ---------- Public API ---------- */

    configure(options = {}) {
      Object.assign(this.config, options);
      if (options.languages) this.config.languages = options.languages;
      this._syncTitle();
      if (this.isConnected) {
        if (options.initialCells && !this._configured) {
          this.cells = [];
          options.initialCells.forEach((c) => this._pushCell(c, { silent: true }));
        }
        this._renderCells();
      }
      this._configured = true;
      return this;
    }

    addCell(opts = {}, index = null) {
      const cell = this._pushCell(opts);
      if (index !== null && index >= 0 && index < this.cells.length - 1) {
        const [moved] = this.cells.splice(this.cells.length - 1, 1);
        this.cells.splice(index, 0, moved);
      }
      this._renderCells();
      this._emitChange();
      return cell.id;
    }

    removeCell(id) {
      this.cells = this.cells.filter((c) => c.id !== id);
      this._renderCells();
      this._emitChange();
    }

    getNotebook() {
      return {
        title: this.config.title,
        cells: this.cells.map((c) => ({ language: c.language, code: c.code }))
      };
    }

    loadNotebook(data) {
      this.cells = [];
      (data.cells || []).forEach((c) => this._pushCell(c, { silent: true }));
      if (data.title) { this.config.title = data.title; this._syncTitle(); }
      this._renderCells();
      this._emitChange();
    }

    exportJSON(filename = 'notebook.json') {
      const blob = new Blob([JSON.stringify(this.getNotebook(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }

    async runCell(id) {
      const cell = this.cells.find((c) => c.id === id);
      if (!cell || cell.running) return;
      cell.running = true; cell.status = 'running'; cell.error = null;
      this._renderCells();
      this.dispatchEvent(new CustomEvent('nb:run', { detail: { cell: { ...cell } }, bubbles: true, composed: true }));

      try {
        const result = await this._execute(cell);
        cell.output = result;
        cell.status = result && result.success === false ? 'error' : 'done';
      } catch (err) {
        cell.output = { success: false, error: (err && err.message) || String(err) };
        cell.status = 'error';
      }
      cell.running = false;
      this._renderCells();
      this.dispatchEvent(new CustomEvent('nb:output', { detail: { cell: { ...cell } }, bubbles: true, composed: true }));
      this._emitChange();
    }

    async runAll() {
      for (const cell of this.cells.slice()) {
        await this.runCell(cell.id);
      }
    }

    /* ---------- Internals ---------- */

    async _execute(cell) {
      if (typeof this.config.execute === 'function') {
        return await this.config.execute({ id: cell.id, language: cell.language, code: cell.code });
      }
      if (this.config.apiUrl) {
        const res = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: cell.language, code: cell.code, cellId: cell.id })
        });
        if (!res.ok) throw new Error(`API trả về lỗi HTTP ${res.status}`);
        return await res.json();
      }
      return {
        success: false,
        error: 'Chưa cấu hình apiUrl hoặc hàm execute(). Gọi el.configure({ apiUrl: ... }) hoặc { execute: async (cell) => ({...}) }.'
      };
    }

    _pushCell(opts, { silent } = {}) {
      const lang = opts.language || this.config.languages[0].id;
      const langDef = this._langDef(lang);
      const cell = {
        id: opts.id || uid('cell'),
        language: lang,
        code: opts.code !== undefined ? opts.code : (langDef ? langDef.defaultCode : ''),
        output: null,
        status: 'idle',
        running: false,
        tools: opts.tools || null
      };
      this.cells.push(cell);
      if (!silent) this._emitChange();
      return cell;
    }

    _langDef(id) {
      return this.config.languages.find((l) => l.id === id) || this.config.languages[0];
    }

    _emitChange() {
      this.dispatchEvent(new CustomEvent('nb:change', { detail: this.getNotebook(), bubbles: true, composed: true }));
    }

    _syncTitle() {
      const t = this._shadow.querySelector('.nb-title-text');
      if (t) t.textContent = this.config.title;
    }

    _render() {
      this._shadow.innerHTML = `
        <style>${STYLE}</style>
        <div class="nb-root">
          <div class="nb-toolbar">
            <div class="nb-title"><span class="dot"></span><span class="nb-title-text">${this._esc(this.config.title)}</span></div>
            <button class="nb-btn" data-act="add">${ICONS.add}<span>Thêm cell</span></button>
            <button class="nb-btn primary" data-act="run-all">${ICONS.play}<span>Chạy tất cả</span></button>
            <button class="nb-btn" data-act="export">Xuất JSON</button>
          </div>
          <div class="nb-cells"></div>
        </div>
      `;
      this._shadow.querySelector('[data-act="add"]').addEventListener('click', () => this.addCell());
      this._shadow.querySelector('[data-act="run-all"]').addEventListener('click', () => this.runAll());
      this._shadow.querySelector('[data-act="export"]').addEventListener('click', () => this.exportJSON());
      this._cellsRoot = this._shadow.querySelector('.nb-cells');
    }

    _renderCells() {
      if (!this._cellsRoot) return;
      if (!this.cells.length) {
        this._cellsRoot.innerHTML = `<div class="nb-empty">Chưa có cell nào. Bấm "Thêm cell" để bắt đầu.</div>`;
        return;
      }
      this._cellsRoot.innerHTML = '';
      this.cells.forEach((cell, idx) => this._cellsRoot.appendChild(this._buildCellEl(cell, idx)));
    }

    _buildCellEl(cell, idx) {
      const langDef = this._langDef(cell.language);
      const wrap = document.createElement('div');
      wrap.className = 'nb-cell' + (cell.running ? ' running' : '');
      wrap.style.setProperty('--lang-color', langDef.color || '#9096a8');

      const spine = document.createElement('div');
      spine.className = 'nb-spine';
      wrap.appendChild(spine);

      const body = document.createElement('div');
      body.className = 'nb-cell-body';
      wrap.appendChild(body);

      // header
      const header = document.createElement('div');
      header.className = 'nb-cell-header';
      body.appendChild(header);

      const indexEl = document.createElement('span');
      indexEl.className = 'nb-index';
      indexEl.textContent = `[${idx + 1}]`;
      header.appendChild(indexEl);

      const select = document.createElement('select');
      select.className = 'nb-lang-select';
      this.config.languages.forEach((l) => {
        const opt = document.createElement('option');
        opt.value = l.id; opt.textContent = l.label;
        if (l.id === cell.language) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', () => {
        cell.language = select.value;
        this._renderCells();
        this._emitChange();
      });
      header.appendChild(select);

      const status = document.createElement('span');
      status.className = 'nb-status' + (cell.status === 'done' ? ' ok' : cell.status === 'error' ? ' err' : '');
      status.textContent = cell.running ? 'đang chạy…' : cell.status === 'done' ? 'hoàn tất' : cell.status === 'error' ? 'lỗi' : '';
      header.appendChild(status);

      const tools = document.createElement('div');
      tools.className = 'nb-tools';
      header.appendChild(tools);

      tools.appendChild(this._toolBtn(ICONS.run, 'Chạy cell (Shift+Enter)', () => this.runCell(cell.id), cell.running));
      // custom global tools
      (this.config.tools || []).forEach((t) => {
        tools.appendChild(this._toolBtn(t.icon || t.label, t.title || t.label, () => t.onClick(cell, this)));
      });
      // per-cell dynamic tools
      const dyn = (typeof this.config.cellTools === 'function') ? (this.config.cellTools(cell) || []) : (cell.tools || []);
      dyn.forEach((t) => {
        tools.appendChild(this._toolBtn(t.icon || t.label, t.title || t.label, () => t.onClick(cell, this)));
      });
      tools.appendChild(this._toolBtn(ICONS.up, 'Di chuyển lên', () => this._move(cell.id, -1)));
      tools.appendChild(this._toolBtn(ICONS.down, 'Di chuyển xuống', () => this._move(cell.id, 1)));
      tools.appendChild(this._toolBtn(ICONS.del, 'Xóa cell', () => this.removeCell(cell.id)));

      // editor
      const editorWrap = document.createElement('div');
      editorWrap.className = 'nb-editor-wrap';
      body.appendChild(editorWrap);

      const gutter = document.createElement('div');
      gutter.className = 'nb-gutter';
      editorWrap.appendChild(gutter);

      const textarea = document.createElement('textarea');
      textarea.className = 'nb-code';
      textarea.spellcheck = false;
      textarea.placeholder = `Nhập mã ${langDef.label}…`;
      textarea.value = cell.code;
      textarea.rows = Math.max(2, Math.min(20, cell.code.split('\n').length));
      editorWrap.appendChild(textarea);

      const syncGutter = () => {
        const lines = textarea.value.split('\n').length;
        gutter.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br/>');
        gutter.scrollTop = textarea.scrollTop;
      };
      syncGutter();
      textarea.addEventListener('scroll', () => { gutter.scrollTop = textarea.scrollTop; });
      textarea.addEventListener('input', () => {
        cell.code = textarea.value;
        textarea.style.height = 'auto';
        syncGutter();
      });
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const s = textarea.selectionStart, en = textarea.selectionEnd;
          textarea.value = textarea.value.slice(0, s) + '  ' + textarea.value.slice(en);
          textarea.selectionStart = textarea.selectionEnd = s + 2;
          cell.code = textarea.value;
          syncGutter();
        } else if (e.key === 'Enter' && (e.shiftKey || (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          cell.code = textarea.value;
          this.runCell(cell.id);
        }
      });

      // output
      const outputWrap = document.createElement('div');
      outputWrap.className = 'nb-output';
      body.appendChild(outputWrap);
      outputWrap.appendChild(this._renderOutput(cell));

      return wrap;
    }

    _renderOutput(cell) {
      const el = document.createElement('div');
      if (!cell.output) {
        el.className = 'nb-output-inner empty';
        el.textContent = 'Chưa có output. Bấm nút chạy để thực thi.';
        return el;
      }
      el.className = 'nb-output-inner' + (cell.output.success === false ? ' err' : '');
      if (cell.output.success === false) {
        el.textContent = cell.output.error || 'Đã xảy ra lỗi không xác định.';
      } else if (cell.output.table && cell.output.table.columns) {
        const { columns, rows } = cell.output.table;
        const table = document.createElement('table');
        table.className = 'nb-table';
        const thead = document.createElement('thead');
        thead.innerHTML = `<tr>${columns.map((c) => `<th>${this._esc(c)}</th>`).join('')}</tr>`;
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        tbody.innerHTML = rows.map((r) => `<tr>${r.map((v) => `<td>${this._esc(v === null || v === undefined ? '' : String(v))}</td>`).join('')}</tr>`).join('');
        table.appendChild(tbody);
        el.appendChild(table);
      } else {
        el.textContent = cell.output.output !== undefined ? cell.output.output : JSON.stringify(cell.output, null, 2);
      }
      return el;
    }

    _toolBtn(iconOrLabel, title, onClick, disabled) {
      const btn = document.createElement('button');
      btn.className = 'nb-btn icon-only';
      btn.title = title;
      btn.innerHTML = /^<svg/.test(iconOrLabel) ? iconOrLabel : this._esc(iconOrLabel);
      btn.disabled = !!disabled;
      btn.addEventListener('click', onClick);
      return btn;
    }

    _move(id, dir) {
      const i = this.cells.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= this.cells.length) return;
      const [c] = this.cells.splice(i, 1);
      this.cells.splice(j, 0, c);
      this._renderCells();
      this._emitChange();
    }

    _esc(s) {
      return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }
  }

  if (!customElements.get('code-notebook')) {
    customElements.define('code-notebook', CodeNotebook);
  }
})();
