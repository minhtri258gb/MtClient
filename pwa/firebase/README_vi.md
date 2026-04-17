
# PWA + Firebase Cloud Messaging (Vanilla JS)

Dự án mẫu siêu gọn để nhận thông báo đẩy từ Firebase trên web, chỉ dùng JavaScript thuần.

## Bước 1: Tạo Project & Web Push trên Firebase
1. Tạo project trên Firebase Console.
2. Tạo app Web và copy `firebaseConfig` (apiKey, projectId, v.v.).
3. Vào **Project Settings > Cloud Messaging > Web configuration**:
   - Tạo **Key pair** (VAPID).
   - Lấy **Public key** dán vào `vapidKey` trong `app.js`.

## Bước 2: Điền cấu hình
- Mở `app.js` và `firebase-messaging-sw.js` rồi thay các giá trị `YOUR_*` bằng thông tin dự án của bạn.

## Bước 3: Serve bằng HTTPS hoặc localhost
- Firebase Messaging yêu cầu **HTTPS** trên domain thật.
- Khi phát triển, bạn có thể dùng `http://localhost`.
- Ví dụ dùng Node:
  ```bash
  npx http-server -p 8080 .
  ```

## Bước 4: Quyền & Token
- Mở trang, nhấn **Xin quyền thông báo**, sau đó **Lấy FCM token**.
- Xem token trong giao diện và DevTools Console.
- Lưu token trên server của bạn nếu cần gửi đẩy theo user.

## Bước 5: Gửi thử thông báo
- Firebase Console > Cloud Messaging > Send message
  - Notification title/body.
  - **Web Push** > thêm icon (nếu muốn), đặt `link` nếu muốn mở URL khi bấm.
  - Chọn **Add FCM registration token** và dán token đã lấy.
- Hoặc gửi từ server của bạn qua FCM HTTP v1 API.

## Lưu ý
- `firebase-messaging-sw.js` **bắt buộc** nằm đúng scope được register (ở root dự án là dễ nhất).
- Nếu bạn đổi tên file SW, cập nhật lại trong `app.js`.
- Foreground message sẽ vào `onMessage` trong `app.js`.
- Background message sẽ hiện thông báo qua `firebase-messaging-sw.js`.

Chúc bạn build vui vẻ! 🎉
