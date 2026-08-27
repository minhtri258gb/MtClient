# Ứng dụng Task Manager — 1 file HTML, JS thuần (vanilla)

## Công nghệ
- 1 file HTML duy nhất, JS vanilla (không framework)
- Thư viện ngoài duy nhất được phép: SortableJS (kéo thả). Icon dùng FontAwesome (class do user tự nhập, không có picker/thư viện chọn icon)
- Không dùng Service Worker
- Chỉ chạy trên web desktop, không tối ưu mobile

## Cấu trúc dữ liệu
```js
{
  id: "...",              // tự sinh
  icon: "fa-solid fa-star" | null,
  name: "Task 1",
  expired: "2026-08-24" | null,   // optional
  done: false,
  completedAt: "2026-08-24" | null, // ngày được check done, phục vụ rule ẩn/xóa
  tags: ["DMS", "Support"],
  list: [ /* task con — CHỈ 1 CẤP, không lồng tiếp */ ],
  collapsed: false        // trạng thái mở/thu gọn task con
}
```
- Độ sâu tối đa 2 cấp: **root** và **leaf**. Leaf không có `list`.
- Task con không kế thừa `icon`/`tags` từ task cha — tự quản lý độc lập.
- Thứ tự hiển thị = thứ tự trong mảng (không cần field `sort` riêng).

## CRUD & Task con
- Tạo/sửa/xóa task ở cả 2 cấp.
- Khi tạo: checkbox chọn "thêm lên đầu" hoặc "thêm cuối" danh sách (chỉ ảnh hưởng vị trí lúc tạo, không lưu priority).
- **Click phải vào task root** → mở form nhanh để **thêm task con** (chỉ root mới có menu này, leaf không có vì giới hạn 2 cấp).
- **Double-click** vào tên / hạn / tag → bật editor inline sửa nhanh tại chỗ, **không validate input**.
- Icon: input text đơn giản, user tự gõ class FontAwesome.
- Tags: không giới hạn số lượng, không autocomplete, không gán màu.
- Xóa task: luôn có hộp thoại xác nhận. Không có undo/redo.

## Kéo thả sắp xếp
- Dùng SortableJS.
- Chỉ sắp xếp **cùng cấp**: giữa các root với nhau, và giữa các leaf **trong cùng 1 task cha** với nhau (không kéo leaf qua cha khác).

## Hoàn thành task
- Check/uncheck có animation.
- Task cha: khi **toàn bộ task con đã done** → tự động check done task cha.
- Ngược lại, nếu 1 task con bị uncheck mà cha đang done → tự uncheck cha.
- Click checkbox của task cha (đang có task con) sẽ cascade xuống toàn bộ task con.

## Màu sắc theo hạn (`expired`)
- Xanh: còn hạn (ngày > hôm nay)
- Vàng: đến hạn hôm nay
- Đỏ: trễ hạn (ngày < hôm nay)
- Task không có `expired` → màu trung tính
- Task đã done → hiển thị mờ/gạch ngang, bỏ qua tô màu hạn

## Quy tắc ẩn/xóa task đã hoàn thành
- Task **chưa hoàn thành**: luôn hiển thị.
- Task **hoàn thành hôm nay hoặc hôm qua**: vẫn hiển thị bình thường.
- Task **hoàn thành từ 2 ngày trước trở lên**: **xóa vĩnh viễn** khỏi dữ liệu (không chỉ ẩn), chạy kiểm tra mỗi khi mở app / sau mỗi thay đổi.

## Hiển thị mỗi task (1 dòng)
`checkbox → icon → tên task → tags → hạn (badge màu) → nút xóa`
Task có con: thêm nút expand/collapse. Task con thụt lề dưới task cha.

## Lưu trữ
- LocalStorage, không giới hạn dung lượng riêng (giả định ~50 task trở xuống).
- Không xử lý xung đột nhiều tab.
- Có nút tải file backup JSON và nút nhập (import) từ file JSON, có confirm khi import (ghi đè toàn bộ dữ liệu hiện tại).

---

## 🔍 BỔ SUNG: Chức năng Filter / Tìm kiếm

**Mục tiêu:** cho phép người dùng nhanh chóng lọc ra các task cần xem giữa danh sách lớn, kết hợp được nhiều điều kiện cùng lúc.

### 1. Tìm kiếm gần đúng theo tên
- 1 ô input text, lọc theo **tên task** (áp dụng cho cả root và leaf).
- Match dạng gần đúng: substring, không phân biệt hoa/thường, **không phân biệt dấu tiếng Việt** (vd gõ "hop" vẫn match "Họp").
- Nếu task con khớp nhưng task cha không khớp → vẫn hiển thị task cha (tự động mở rộng/expand) để thấy task con khớp đó.

### 2. Tìm kiếm gần đúng theo tag
- Cùng ô search ở trên, hoặc tách riêng — **gộp chung vào cùng 1 ô search** cho đơn giản: nếu chuỗi gõ vào khớp tên **hoặc** khớp bất kỳ tag nào của task → hiển thị.

### 3. Click vào tag để filter theo tag
- Mỗi tag-pill hiển thị trên task có thể **click để thêm vào bộ lọc tag đang active**.
- Các tag đang được chọn hiển thị dưới dạng chip riêng phía trên danh sách (có nút x để bỏ từng tag).
- Chọn nhiều tag cùng lúc → logic **OR** (task khớp ít nhất 1 trong các tag đã chọn thì hiển thị).
- Click lại vào tag đã chọn (hoặc bấm x trên chip) → bỏ tag đó khỏi bộ lọc.

### 4. Lọc theo thời gian (hạn task)
- Bộ lọc nhanh dạng nút chọn (chip), không cần combo phức tạp:
  - "Trễ hạn" (đỏ)
  - "Hôm nay" (vàng)
  - "Còn hạn" (xanh)
  - "Không hạn"
- Có thể chọn nhiều điều kiện cùng lúc (OR trong nhóm thời gian).

### 5. Kết hợp các bộ lọc
- Giữa 3 nhóm (search text / tag / thời gian): kết hợp **AND** — task phải thỏa tất cả nhóm đang active thì mới hiển thị.
- Trong cùng 1 nhóm (nhiều tag, nhiều mốc thời gian): **OR**.
- Có nút "Xóa lọc" để reset toàn bộ về trạng thái hiển thị mặc định.
- Filter chỉ ảnh hưởng hiển thị, **không xóa hay thay đổi dữ liệu** trong localStorage.
- Task cha luôn hiển thị (và tự expand) nếu có ít nhất 1 task con thỏa điều kiện lọc, kể cả khi bản thân task cha không thỏa.

## 🏷️ BỔ SUNG: Mã dự án (Project)

- Mỗi task (cả root và leaf) có thêm field `project` (optional): mã ngắn do user tự đặt, vd "LA" (LogAsia), "KG" (Kiên Giang). Không giới hạn danh sách project có sẵn — user tự gõ mã mới bất kỳ lúc nào, không có validate/autocomplete.
- Nhập qua ô "Mã dự án" trong form thêm task (cả thêm root và thêm task con). Nếu gõ kèm dấu ngoặc vuông `[LA]` thì tự động bỏ ngoặc khi lưu, hiển thị lại luôn kèm ngoặc `[LA]` cho nhất quán.
- Mỗi task hiển thị 1 badge màu ngay trước icon (sau checkbox), chứa mã dự án. Màu được tự sinh theo mã (cùng mã → luôn ra cùng 1 màu, khác mã → màu khác nhau), không cần chọn thủ công.
- Double-click vào badge → sửa nhanh mã dự án (giống cơ chế sửa tag/tên/hạn, không validate).
- Click (đơn) vào badge → thêm/bỏ mã đó khỏi bộ lọc dự án đang chọn (hiển thị dạng chip màu tương ứng phía trên danh sách, có nút x để bỏ).
- Gõ mã dự án vào ô tìm kiếm chung (search) → cũng tìm ra các task thuộc dự án đó (search hiện tại đã mở rộng để khớp cả tên, tag và mã dự án).
- Kết hợp với các bộ lọc khác theo đúng quy tắc đã có: chọn nhiều dự án cùng lúc = OR; giữa các nhóm filter (search/tag/thời gian/dự án) = AND.