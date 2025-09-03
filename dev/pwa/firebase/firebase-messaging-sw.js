
// Service Worker dành riêng cho Firebase Messaging (background notifications)
// Lưu ý: file này phải ở thư mục gốc (cùng cấp index.html) hoặc đúng scope khi register.

importScripts("https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging-compat.js");

// IMPORTANT: Giống như app.js, điền cấu hình Firebase của bạn ở đây
firebase.initializeApp({
  apiKey: "AIzaSyC7xlNwGWdMwRsWTE2YyiZyBGTM9KqUPdg",
  authDomain: "mtpwa-4464a.firebaseapp.com",
  projectId: "mtpwa-4464a",
  storageBucket: "mtpwa-4464a.firebasestorage.app",
  messagingSenderId: "644225886365",
  appId: "1:644225886365:web:1954855aa00c1062644c74"
});

// Lấy instance messaging
const messaging = firebase.messaging();

// Background handler: kích hoạt khi nhận push lúc web ở background/đóng
messaging.onBackgroundMessage(function(payload) {
  const title = (payload.notification && payload.notification.title) || "Thông báo";
  const options = {
    body: (payload.notification && payload.notification.body) || "",
    icon: (payload.notification && payload.notification.icon) || "./icons/icon-192.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

// Xử lý click vào thông báo
self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  const urlToOpen = event.notification?.data?.click_action || "/";
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      let client = allClients.find(c => c.url.includes(self.registration.scope));
      if (client) {
        client.navigate(urlToOpen);
        client.focus();
      } else {
        clients.openWindow(urlToOpen);
      }
    })()
  );
});
