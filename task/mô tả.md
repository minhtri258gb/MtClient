Ứng dụng task: 1 file html, js vanila
- tạo, sửa, xóa task (cho phép tạo task con)
  - tên task
  - thời hạn (tùy chọn)
  - tags
  - icon (tùy chọn)
  - checkbox ưu tiên để tạo trên cùng hoặc dưới cùng
- kéo thả để sắp xếp task
- check, uncheck để đánh dấu hoàn thành
- hiển thị màu xanh (còn hạn), vàng (hôm nay), đỏ (trễ hạn)
- click phải để tạo task con
- Cho phép dupclick để bật editor sửa tên nhanh, chọn thời hạn, sửa tag
- cấu trúc dữ liệu
  {
    id: index task nếu cần
    icon: 
    name: "Task 1",
    expired: "2026-08-24",
    done: false,
    tags: ["DMS","Support"]
    list: [
      // ... task con
    ],
    sort: thứ tự nếu cần
  }
- lưu trữ localstorage
- chỉ hiển thị task hoàn thành ngày hôm qua, nếu hoàn thành từ 2 ngày trước thì ẩn


- Chỉ hiển thị task hoàn thành ngày hôm qua" - nhưng task chưa hoàn thành thì sao? Có hiển thị không? -> có
- Task hoàn thành từ 2 ngày trước bị ẩn → Vậy khi nào chúng được xóa hẳn khỏi localStorage hay vẫn giữ lại? -> xóa luôn, khỏi ẩn
- Task cha có con đã hoàn thành thì xử lý thế nào? -> toàn bộ task con done thì tự động check done task cha
- độ sâu 2 cấp (root, leaf)
- kéo thả cùng cấp (thay đổi giữa các root và giữa các leaf)
- Task con có kế thừa tags/icon từ task cha không? -> ko kế thừa vì phức tạp, user tự quản lý
- quick editor dạng inline, ko validate
- tags ko giới hạn, ko autocomplete, ko màu
- icon fontawesome, tự user tìm class và bỏ vào
- mỗi task 1 line, hiển thị checkbox -> tên task -> thời hạn (có nút expand / collapse để xem danh sách con), danh sách con thụt lề
- ko lưu priority, chỉ đặt đầu hay cuối danh sách khi tạo
- LocalStorage cho nút tải json backup / import conflict nhiều tab? -> giả định ko xảy ra trường hợp này
- ko giới hạn dụng lượng (task ít khoản 50 đổ lại)
- ko dùng trên mobile, web only
- thêm animation check / uncheck
- có confirm khi xóa thủ công
- ko cần undo, redo
dùng 2 thư viện SortableJS, dayjs.min.js
- icon và tag chỉ là input text đơn giản ko cần thư viện
- ko dùng cấu trúc link parent, tạo task con ngay trong list: [] của task cha vì chỉ cần 2 cấp
- ko dùng worker service
