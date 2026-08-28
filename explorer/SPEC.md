# Prompt đặc tả — Web File Explorer (Mock API)

> Bản tổng hợp & tối ưu từ toàn bộ yêu cầu đã trao đổi. Dùng tài liệu này làm **prompt gốc**
> để giao cho AI/dev khác dựng lại hoặc mở rộng `index.html`, không cần đọc lại lịch sử chat.

## 1. Mục tiêu

Viết **một file `index.html` độc lập** (HTML/CSS/JS thuần, không build step, không framework)
triển khai giao diện **File Explorer** chạy hoàn toàn ở frontend, gọi qua một **lớp Mock API**
mô phỏng backend thật (độ trễ mạng, cấu trúc request/response rõ ràng). Mục đích: phát triển và
duyệt UI trước, sau này chỉ thay nội dung các hàm mock bằng `fetch()` thật mà không phải sửa UI.

## 2. Ràng buộc kỹ thuật

- 1 file HTML duy nhất, JS thuần (vanilla), không phụ thuộc thư viện ngoài.
- Toàn bộ "hệ thống tệp" là dữ liệu giả lập trong bộ nhớ (`Map` path → node), có sẵn dữ liệu
  mẫu đa dạng loại file + **1 thư mục stress-test ~10.000 tệp** để kiểm tra hiệu năng.
- **Chỉ theme sáng**, không cần responsive mobile (chỉ tối ưu desktop).
- **Virtualized rendering bắt buộc** cho list/detail/grid (không render toàn bộ DOM khi thư mục
  có hàng nghìn mục).

## 3. Kiến trúc lớp Mock API (API CONTRACT — điểm thay thế duy nhất khi nối backend thật)

Tất cả thao tác dữ liệu đi qua một object `MockAPI`, mỗi hàm trả về `Promise`:

| Hàm | Vai trò | Tương ứng REST thật |
|---|---|---|
| `listDir(path)` | Liệt kê folder/file trong 1 thư mục | `GET /api/dir?path=` |
| `getFileContent(path)` | Lấy nội dung xem nhanh (text/ảnh/audio/video) | `GET /api/file/content` |
| `getThumbnail(path,size)` | Lấy ảnh thumbnail theo kích thước | `GET /api/thumbnail` |
| `createFolder(parent,name)` | Tạo thư mục | `POST /api/folder` |
| `rename(path,newName)` | Đổi tên | `PATCH /api/rename` |
| `deleteEntries(paths)` | Xoá vĩnh viễn (không thùng rác) | `DELETE /api/entries` |
| `copyEntries(paths,dest)` | Sao chép | `POST /api/copy` |
| `moveEntries(paths,dest)` | Di chuyển | `POST /api/move` |
| `uploadFiles(dest,files,onProgress)` | Tải lên (chỉ file rời, không folder) | `POST /api/upload` |
| `downloadEntries(paths,onProgress)` | Tải xuống; ≥2 mục hoặc có folder ⇒ mô phỏng **nén 7z phía server** rồi trả `Blob` | `POST /api/download` |
| `runTool(toolId,paths,options,onProgress)` | Chạy công cụ nền (xem mục 6) | `POST /api/tools/run` |

Quy ước: mọi hàm mô phỏng độ trễ ngẫu nhiên (150–600ms), các thao tác dài (nén, upload, tool)
báo tiến trình qua callback `onProgress(percent)` để UI hiển thị real-time trong khay Jobs.

## 4. Bố cục giao diện

```
┌───────────────────────────────── Toolbar (actions + More tools + layout) ─────────────────────────────────┐
├──────────────┬──────────────────────────────────────────────────────┬──────────────────────────────────────┤
│  Tree pane   │  Panel 1 (tabs, breadcrumb, view-switch, nội dung)    │  Preview pane (ẩn/hiện)               │
│  (dùng chung │  ──────────────────────────────────────────────────  │  (chỉ hiện khi 1 panel focus, dùng    │
│  cho mọi     │  Panel 2 — chỉ khi bật Dual Panel, cùng cây thư mục   │  chung cho panel đang active)         │
│  panel)      │  nhưng tab/lịch sử/view độc lập với Panel 1           │                                        │
├──────────────┴──────────────────────────────────────────────────────┴──────────────────────────────────────┤
│  Status bar: đường dẫn hiện tại · số mục · số mục đã chọn + tổng dung lượng                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
Khay "Jobs" nổi góc dưới-phải: tiến trình các tác vụ nền (upload/nén/tool).
```

## 5. Danh sách tính năng bắt buộc

**Điều hướng**
- Cây thư mục dùng chung cho cả 2 panel; click = điều hướng panel đang active, click mũi tên = mở/đóng nhánh.
- Mỗi panel có nhiều tab độc lập (thêm/đóng tab), mỗi tab có path/view/sort/cột riêng.
- Breadcrumb clickable; ô tìm kiếm lọc theo tên trong thư mục hiện tại.

**4 chế độ xem** (chuyển qua nút trên path-bar của từng tab)
- List: chỉ tên + icon, hàng gọn.
- Detail: bảng có cột **tuỳ chỉnh được** (thêm/bớt/sắp xếp thứ tự qua modal "Tuỳ chỉnh cột"), click
  header để sort tăng/giảm.
- Thumbnail: lưới ảnh thật (ảnh sinh bằng canvas mock, video có overlay play), chọn size **64/128/256/512**.
- Icon: lưới icon loại file theo màu, không tải ảnh thật.

**Chọn nhiều & clipboard**
- Click / Ctrl+click / Shift+click để chọn nhiều.
- Copy / Cut / Paste qua toolbar, phím tắt (Ctrl+C/X/V), chuột phải — **bắt buộc hoạt động được
  giữa 2 panel** (cut ở panel A, paste ở panel B).
- Kéo-thả nội bộ để move (mặc định) / copy (giữ Ctrl khi thả) giữa: 2 panel, panel ↔ tree,
  panel ↔ breadcrumb.

**Xoá / đổi tên / tạo mới**
- Xoá: **vĩnh viễn, không thùng rác, không undo** — nhưng vẫn có hộp thoại xác nhận trước khi xoá.
- Đổi tên inline qua modal, F2.
- Tạo thư mục mới qua toolbar hoặc chuột phải vùng trống.

**Upload / Download**
- Kéo-thả từ ngoài OS để upload — **chỉ nhận file rời, tự động bỏ qua & thông báo nếu người
  dùng kéo cả thư mục**.
- Chọn nhiều file để tải cùng lúc: 1 file → tải trực tiếp; ≥2 file hoặc có folder → gọi API
  nén 7z (mock), hiển thị tiến trình nén trong khay Jobs, rồi trigger download `Blob` trả về.

**Xem nhanh (Preview pane)**
- Text: hiển thị nội dung trong khối `<pre>` monospace.
- Ảnh: hiển thị ảnh (mock sinh bằng canvas, cache theo path+size).
- Audio: `<audio controls>` phát được thật (mock bằng WAV sinh động, không phải im lặng tuyệt đối).
- Video: poster ảnh + nút play giả lập thanh tiến trình/thời gian (không giải mã video thật —
  đây là điểm cần thay bằng `<video>` thật khi có backend).

**Toolbar mở rộng được (plugin-style)**
- Core tools (luôn hoạt động thật trên mock FS): Thư mục mới, Tải lên, Copy/Cut/Paste, Đổi tên,
  Xoá, Tải xuống, Chọn tất cả, Làm mới.
- Dropdown "Công cụ khác" chứa các tool **tương lai**, đã có khung chạy qua `MockAPI.runTool`
  và khay Jobs, chỉ cần nối logic thật sau này:
  - Tính checksum (MD5/SHA-256)
  - Split / Merge file
  - Convert định dạng (chọn engine theo loại: ffmpeg / ImageMagick / Pandoc)
  - Nén / Giải nén 7-Zip
- Kiến trúc: mỗi tool là 1 entry trong registry `{id, icon, label, isEnabled(ctx), run(ctx)}` —
  thêm tool mới = thêm 1 entry, không sửa UI toolbar.

**Khác**
- Khay Jobs: danh sách tác vụ nền với thanh tiến trình, trạng thái running/done/error.
- Toast thông báo ngắn cho mỗi hành động.
- Virtualized scroll cho mọi chế độ xem.
- Context menu chuột phải (trên mục và trên vùng trống).
- Phím tắt: Ctrl+C/X/V/A, F2 (rename), F5 (refresh), Delete (xoá), Esc (đóng modal/menu).

## 6. Các quyết định đã chốt (không thay đổi trừ khi có yêu cầu mới)

| Vấn đề | Quyết định |
|---|---|
| Copy/Move giữa panel | Bắt buộc phải hoạt động |
| Xoá file | Xoá thẳng, không thùng rác/undo (vẫn confirm trước khi xoá) |
| Preview PDF | Không cần |
| Kéo-thả upload | Chỉ file rời, không hỗ trợ kéo nguyên folder |
| Hiệu năng thư mục lớn | Bắt buộc virtualized rendering |
| Responsive | Không cần, chỉ tối ưu desktop |
| Theme | Chỉ sáng (light), không có dark mode |

## 7. Định hướng thiết kế UI

- Không dùng 3 mô-típ AI-generated mặc định (nền kem/serif/cam đất; nền đen-neon; broadsheet).
- Thẩm mỹ: công cụ năng suất kiểu desktop app thật (tham chiếu Windows Explorer / Total
  Commander / VS Code Explorer) — sạch, mật độ thông tin cao, không trang trí thừa.
- Bảng màu: nền xám lạnh nhạt (`#F3F4F7`), panel trắng, accent xanh chàm (`#3454D1`), viền mảnh
  `#E1E4EA`.
- Font: `Inter` cho giao diện, `JetBrains Mono` cho dữ liệu số/đường dẫn/kích thước (phân biệt
  rõ "nhãn" và "dữ liệu").
- Icon: SVG inline tự vẽ (không phụ thuộc icon-font/CDN ngoài) để đảm bảo hoạt động offline.

## 8. Ghi chú khi mở rộng thêm

- Muốn thêm cột Detail mới → thêm entry vào `ALL_COLUMNS`.
- Muốn thêm loại preview mới (vd PDF sau này) → thêm nhánh `kind` trong
  `MockAPI.getFileContent` + `renderPreviewContent`.
- Muốn thêm tool thật vào "Công cụ khác" → viết logic thật thay cho nhánh tương ứng trong
  `MockAPI.runTool`, giữ nguyên chữ ký `(toolId, paths, options, onProgress)`.
- Khi nối backend thật: thay từng hàm trong `MockAPI` bằng `fetch()`, **không đổi tên hàm /
  hình dạng Promise trả về** để phần UI không cần sửa.
