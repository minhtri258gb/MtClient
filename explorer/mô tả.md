viết file index.html tạo file explorer trên web, dùng API giả lập để đọc danh sách file,
folder và đọc nội dung,
giả lập các api này để khi phát triển gán vào sau,
file explorer chứa tree và view,
phần view cho phép xem ở 4 dạng list, detail, thumpnail, icon.
có thể xem nhanh file text, img, audio, video, cho phép kéo thả để upload, có thể download file,
cho phép chọn nhiều file để tải cùng lúc, api sẽ nén bằng 7zip và trả blob sau,




* Tính năng
  - tree folder
  - dual panel
    - chuyển giữa 2 single và dual
    - ko đồng bộ scroll
    - chung tree folder
  - multi tab
  - view list
  - view detail
  - view icon
  - view thumbnail
  - contextMenu và Toolbar (toàn bộ dùng API)
    - convert type bằng ffmpeg, magick, pandoc
    - nén / giải nén bằng 7z
    - split / merge file
    - tạo checksum
  - chọn nhiều file bằng chuột
  - tải một hoặc nhiều file
  - 

* Cấu hình
  - file fileconfig.json load từ FE khi mở app
  - thumbnail_size: 64 // 128, 256, 512
  - detail_attribute: 'name,ext,size,modified,duration,imgSize' // custom thuộc tính tùy vào api, có thể mở rộng

=> tập trung vào frontend và giả lập call backend, các api tôi sẽ tự dựng
=> khoan bắt đầu, hãy bổ sung thêm các thiếu sót để tôi chọn,




Dưới đây là các mảng còn thiếu mà bạn nên cân nhắc bổ sung, chia theo nhóm — chưa code gì cả, chỉ để bạn chọn:

1. Điều hướng & Tree
Lazy load node: tree chỉ gọi API expand khi click mở folder (quan trọng để mock API giả lập độ trễ mạng thật)
Breadcrumb path ở đầu view pane, click để nhảy nhanh
Search/filter trong tree (theo tên) và trong view (theo tên/loại/size/date)
Bookmark/Favorite folder, và Recent locations
Context menu chuột phải trên tree (New folder, Rename, Delete, Properties...)
2. View pane (List/Detail/Thumbnail/Icon)
Sort: theo tên, size, ngày sửa, loại — click header ở Detail view
Multi-column resize ở Detail view
Custom attribute ở Detail — bạn đã nêu, cần thêm: cho phép ẩn/hiện cột, thứ tự cột kéo thả, lưu preset theo từng folder hoặc global
Group by (theo loại file, theo ngày...) — tùy chọn thêm
Virtualized rendering cho folder nhiều file (hàng nghìn item) để không lag — nên tính từ đầu vì ảnh hưởng kiến trúc component
3. Preview nhanh
Bạn nêu text/img/audio/video — bổ sung thêm:
PDF preview (rất hay gặp)
Preview pane có thể tách rời (dock) hoặc thu gọn, hoặc mở dạng modal/lightbox
Với text: có syntax highlight theo extension không?
Với ảnh: có cần zoom/pan, xoay ảnh không?
4. Upload / Download
Upload: kéo thả cả folder (webkitdirectory) hay chỉ file rời?
Upload: hiển thị progress bar từng file + tổng, cho phép pause/cancel, xử lý trùng tên (skip/rename/overwrite)
Download nhiều file: bạn nói API nén 7z trả blob — cần mock luôn progress cho quá trình nén (vì file lớn nén sẽ lâu), có polling status hay chờ 1 response?
Có cần download từng file riêng lẻ (không nén) khi chỉ chọn 1 file không?
5. Copy/Move/Clipboard (chưa thấy bạn nhắc)
Cut/Copy/Paste file giữa các folder (đặc biệt quan trọng với dual panel — kéo thả từ panel trái sang phải)
Xử lý conflict khi paste trùng tên
Undo gần nhất (ít nhất là undo delete → thùng rác ảo)
Rename inline, Delete (có thùng rác/trash hay xóa thẳng?)
6. Chọn nhiều file
Bạn đã có "chọn nhiều để tải" — bổ sung: Ctrl/Shift click, checkbox mode (hữu ích trên thumbnail/icon view), select all/invert, thanh trạng thái hiển thị "đã chọn X file, tổng Y MB"
7. Toolbar / Plugin architecture
Cần thiết kế toolbar là hệ plugin: mỗi tool khai báo (icon, label, điều kiện hiện — vd chỉ hiện khi chọn ≥1 file, loại file phù hợp), gọi 1 "mock command API" chung thay vì hardcode từng nút
Cần panel kết quả/log cho các tác vụ chạy nền (checksum, convert...) — dạng queue/notification, vì các việc này không tức thời
8. Dual panel & Tab
Đồng bộ hay độc lập scroll/sort giữa 2 panel?
Tab: có thể kéo tab giữa 2 panel không, có pin tab không?
Có cần chế độ single panel / dual panel switch nhanh (phím tắt kiểu Total Commander F9...)?
9. Mock API layer
Thiết kế mock để giả lập độ trễ (delay) và giả lập lỗi ngẫu nhiên (test UI error state) — cấu hình được
Mock data: sinh cây thư mục giả lớn (nhiều cấp, nhiều file loại khác nhau) để test performance/UI
Định nghĩa rõ contract API (request/response shape) ngay từ đầu để sau bạn build backend thật khớp luôn
10. Khác
Keyboard shortcuts (F2 rename, Delete, Ctrl+C/V, F5 refresh...)
Responsive/mobile có cần không, hay chỉ desktop?
Theme sáng/tối
State persistence (localStorage) cho: layout, view mode đang chọn, thumbnail size, cột hiển thị, panel đang mở
