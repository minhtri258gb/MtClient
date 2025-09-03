
// IMPORTANT: Điền thông tin dự án Firebase của bạn và VAPID key web push
// Lấy tại Firebase Console > Project Settings > Cloud Messaging > Web configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7xlNwGWdMwRsWTE2YyiZyBGTM9KqUPdg",
  authDomain: "mtpwa-4464a.firebaseapp.com",
  projectId: "mtpwa-4464a",
  storageBucket: "mtpwa-4464a.firebasestorage.app",
  messagingSenderId: "644225886365",
  appId: "1:644225886365:web:1954855aa00c1062644c74"
};

// VAPID key (Public key) cho Web Push
const vapidKey = "BNxWZApUxw_ZsRYbZ4OzMOBlancwM8DJP9y8roJbzGyQK2UJKI1FHpSKzPQLnliNRCjBW_LH48qvBMwEW4SOsWM";

// Firebase v9+ (CDN, ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getMessaging, getToken, onMessage, isSupported } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging.js";

const $log = document.getElementById("log");
const $token = document.getElementById("token");

function log(...args) {
  console.log(...args);
  const s = args.map(a => (typeof a === "string" ? a : JSON.stringify(a, null, 2))).join(" ");
  $log.textContent += s + "\n";
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    log("Trình duyệt không hỗ trợ Service Worker.");
    return null;
  }
  // Đăng ký 2 SW:
  // 1) firebase-messaging-sw.js để nhận FCM background messages
  // 2) (tuỳ chọn) app-sw cho cache/offline (không cần cho demo này)
  try {
    const reg = await navigator.serviceWorker.register("./firebase-messaging-sw.js");
    log("Đăng ký service worker thành công:", reg.scope);
    return reg;
  } catch (err) {
    log("Lỗi đăng ký service worker:", err);
    return null;
  }
}

async function ensurePermission() {
  if (!("Notification" in window)) {
    log("Trình duyệt không hỗ trợ Notification API.");
    return "denied";
  }
  let perm = Notification.permission;
  if (perm === "default") {
    perm = await Notification.requestPermission();
  }
  log("Notification permission:", perm);
  return perm;
}

async function main() {
  // 1) Init Firebase
  const app = initializeApp(firebaseConfig);
  const supported = await isSupported().catch(() => false);
  if (!supported) {
    log("Firebase Messaging không được hỗ trợ trên trình duyệt này.");
    return;
  }
  const messaging = getMessaging(app);

  // 2) Register SW
  const reg = await registerServiceWorker();
  if (!reg) return;

  // 3) Bind UI
  document.getElementById("btn-permission").addEventListener("click", ensurePermission);

  document.getElementById("btn-token").addEventListener("click", async () => {
    const perm = await ensurePermission();
    if (perm !== "granted") {
      log("Chưa có quyền thông báo -> không thể lấy token.");
      return;
    }
    try {
      const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg });
      if (currentToken) {
        log("FCM token:", currentToken);
        $token.textContent = currentToken;
      } else {
        log("Không lấy được token (có thể do quyền chưa cấp).");
      }
    } catch (err) {
      log("Lỗi getToken:", err);
    }
  });

  // 4) Foreground messages: nhận khi trang đang mở
  onMessage(messaging, (payload) => {
    log("onMessage (foreground):", payload);
    // Hiển thị thông báo (tuỳ chọn) khi trang đang mở
    if (payload?.notification?.title) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon || "./icons/icon-192.png",
        data: payload.data || {}
      });
    }
  });

  // 5) Nút test: giả lập foreground message
  document.getElementById("btn-test").addEventListener("click", () => {
    new Notification("Test foreground", { body: "Xin chào từ PWA!", icon: "./icons/icon-192.png" });
    log("Đã bắn thử Notification tại foreground.");
  });
}

main();
