

CodeMirror 6
SortableJS
marked
KaTeX
highlight.js


# `<code-notebook>` — component notebook nhúng được

Component giao diện dạng notebook (kiểu Jupyter) viết bằng **vanilla JS**, đóng gói thành
một **Custom Element** (`<code-notebook>`) chạy trong Shadow DOM — nên có thể nhúng vào
bất kỳ file `index.html` nào mà không đụng CSS/JS của trang chủ.

## 1. Nhúng vào trang của bạn

```html
<script src="code-notebook.js"></script>
<code-notebook id="nb" title="My notebook" api-url="/api/execute"></code-notebook>

<script>
  document.getElementById('nb').configure({
    apiUrl: '/api/execute'
  });
</script>
```

Chỉ cần 1 file `code-notebook.js`, không phụ thuộc thư viện ngoài.

## 2. Hợp đồng API thực thi

Khi dùng `apiUrl`, component sẽ POST tới endpoint đó với body:

```json
{ "language": "duckdb", "code": "select 1 as x", "cellId": "cell_xxx" }
```

Backend của bạn tự định tuyến theo `language` (cmd / js / python / duckdb / …) và trả JSON
theo một trong các dạng sau:

```json
{ "success": true, "output": "text thuần, vd stdout" }
{ "success": true, "table": { "columns": ["a","b"], "rows": [[1,2],[3,4]] } }
{ "success": false, "error": "thông báo lỗi" }
```

`table` dùng để render kết quả dạng bảng (hợp với DuckDB/SQL), `output` dùng cho text
thuần (JS/Python/cmd).

Nếu muốn tự kiểm soát hoàn toàn (nhiều endpoint khác nhau theo ngôn ngữ, chạy sandbox
riêng, gọi WebSocket, v.v.) thay vì dùng `apiUrl`, truyền hàm `execute` của riêng bạn:

```js
nb.configure({
  execute: async ({ id, language, code }) => {
    // tự xử lý, trả về cùng format { success, output } hoặc { success, table }
    return { success: true, output: 'ok' };
  }
});
```

## 3. Tùy chỉnh ngôn ngữ

Mặc định có 4 ngôn ngữ: `javascript`, `python`, `cmd`, `duckdb`. Có thể ghi đè:

```js
nb.configure({
  languages: [
    { id: 'javascript', label: 'JavaScript', color: '#f0c419', defaultCode: '' },
    { id: 'sql', label: 'SQL', color: '#2ec4b6', defaultCode: 'select 1' }
  ]
});
```

Mỗi ngôn ngữ có màu riêng, hiển thị thành dải màu bên trái mỗi cell để dễ nhận diện.

## 4. Thêm tool tùy chỉnh

**Tool áp dụng cho mọi cell:**

```js
nb.configure({
  tools: [
    { id: 'copy', label: '⧉', title: 'Sao chép mã', onClick: (cell) => navigator.clipboard.writeText(cell.code) }
  ]
});
```

**Tool riêng theo từng cell** (ví dụ chỉ hiện khi cell là DuckDB):

```js
nb.configure({
  cellTools: (cell) => cell.language === 'duckdb'
    ? [{ id: 'explain', label: 'EXPLAIN', title: 'Xem query plan', onClick: (c, api) => { /* ... */ } }]
    : []
});
```

`onClick(cell, notebookEl)` nhận cell hiện tại và chính element `<code-notebook>` để bạn
gọi lại các API công khai (`runCell`, `addCell`, …).

## 5. API công khai (JS)

| Method | Mô tả |
|---|---|
| `configure(options)` | Thiết lập cấu hình (có thể gọi nhiều lần để cập nhật) |
| `addCell({ language, code })` | Thêm cell mới, trả về `id` |
| `removeCell(id)` | Xóa cell |
| `runCell(id)` | Chạy 1 cell |
| `runAll()` | Chạy tuần tự tất cả cell |
| `getNotebook()` | Lấy state hiện tại `{ title, cells }` |
| `loadNotebook(data)` | Nạp lại notebook từ JSON |
| `exportJSON(filename?)` | Tải notebook hiện tại thành file `.json` |

## 6. Sự kiện

Component bắn ra `CustomEvent` (bubbles, composed) để tích hợp với phần còn lại của trang:

- `nb:run` — khi bắt đầu chạy 1 cell (`detail.cell`)
- `nb:output` — khi có kết quả (`detail.cell`, bao gồm `output`)
- `nb:change` — khi notebook thay đổi (thêm/xóa/sửa cell) — `detail` là kết quả của `getNotebook()`

```js
nb.addEventListener('nb:change', (e) => saveToServer(e.detail));
```

## 7. Phím tắt

- `Shift + Enter` hoặc `Ctrl/Cmd + Enter` trong ô code: chạy cell đó
- `Tab`: chèn 2 khoảng trắng (không nhảy focus)

## 8. File trong bộ này

- `code-notebook.js` — component chính, nhúng file này là đủ
- `demo.html` — ví dụ nhúng đầy đủ, có bộ thực thi giả lập chạy ngay trên trình duyệt
  (đổi `execute` thành `apiUrl` trỏ tới backend thật của bạn khi dùng thật)
