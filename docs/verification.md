# Biên bản kiểm chứng ShopAI

Cập nhật ngày 21/10/2026. Chỉ các kiểm tra đã có kết quả mới được ghi PASS.
Tài liệu này không thay thế video hoặc kiểm thử trên máy thật.

## Kết quả đã xác nhận

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Backend TypeScript, lint, build | PASS | `npm run typecheck`, `npm run lint`, `npm run build` |
| Mobile Jest/RNTL | PASS, 7 suites / 16 tests | `test-mobile-final.log`: auth, cart, checkout, JWT expiry, theme, root và ShopButton |
| Mobile TypeScript/lint | PASS | TypeScript không lỗi; ESLint 0 errors, 11 warnings |
| Backend unit và HTTP integration | PASS, 7 suites / 15 tests | Auth, JWT, Prisma, giá server, tồn kho, idempotency, quyền xem đơn, pay và lưu bền |
| Database phát triển | Đã migrate và seed | 20 sản phẩm; API phân trang trả dữ liệu |
| Expo project | Đã liên kết | Project `4b642b27-8be1-453d-8113-75431a709943`, owner `trieu1912ts-team` |
| Native OTA | Đã cấu hình | Android/iOS dùng runtime `1.0.0-rn0863`, channel `preview` |
| Export Android | PASS | `artifacts/export-smoke`, bundle Hermes và 21 assets |
| EAS Update | PASS trên NX725J | [Update preview](https://expo.dev/accounts/trieu1912ts-team/projects/shopai/updates/cd327d81-59d4-4f8c-bf83-22ace572d02c); app tải, reload và hiển thị update ID `01a15c80-03f0-7ea4-9c53-585140a3927b`, nguồn “Bản cập nhật OTA”; `artifacts/device-ota-applied.png` |
| Gemini qua JWT/backend thật | PASS | `POST /api/ai/chat` trả lời tiếng Việt về tư vấn chọn điện thoại |
| Thiết bị Android | Đã kết nối | NX725J, Android 15, arm64; ADB reverse cổng 3000 |
| APK Android release | PASS | Gradle `BUILD SUCCESSFUL`; chữ ký được apksigner xác nhận. Bản thử ký debug đã cài cập nhật thành công, không gỡ app hoặc xóa dữ liệu |
| Maestro đăng nhập | PASS trên NX725J | `artifacts/maestro-login-verified.log` |
| Maestro mua hàng | PASS trên NX725J | Thêm giỏ, tạo đơn, thanh toán giả lập và trạng thái PAID; log local `artifacts/maestro-checkout-verified.log`; [ảnh đơn PAID](evidence/android-order-paid.png) |
| GPS | PASS lấy vị trí trên NX725J | Lần đầu timeout được hiển thị đúng; sau reload lấy được vị trí và tính khoảng cách. Không lưu tọa độ trong báo cáo; `artifacts/device-after-ota.png` |
| Sinh trắc học | PASS do người dùng xác nhận | Người dùng xác nhận ShopAI yêu cầu và chấp nhận xác thực sau lần khởi động lại ngày 21/10/2026 |
| Camera quét QR | PASS do người dùng xác nhận | Quét `qr-codes/product-01.png` mở đúng trang chi tiết sản phẩm trên NX725J |

## Ghi chú kiểm chứng

- Android Release đã qua lỗi NDK, Kotlin/KSP, resolve Expo CLI và lint cấu hình mạng. Script build hiện nhắm `:app:assembleRelease` để tránh tạo AAR không cần thiết của từng thư viện.
- Bản OTA mới đã áp dụng thành công; ba biểu tượng trên Home đã hết lỗi mã hóa. Typecheck sau sửa đạt.
- Nhật ký local: `test-current.log`, `build-release.log`, `build-release.stderr.log`.
- Trạng thái build có thể đọc từ `artifacts/build-status.json`.

## Chưa có bằng chứng nghiệm thu

- Nhận test crash/non-fatal trong Firebase Console.
- Workflow GitHub Actions chạy xanh trên remote.
- iOS cần môi trường macOS/Xcode; đường release trên máy hiện tại là Android.

## Bảo mật và giới hạn

Backend tính tiền, kiểm tra tồn kho và quyền sở hữu đơn. Token được lưu trong
Keychain; Gemini key chỉ ở backend. Khóa ký local và biến môi trường được Git ignore.
Thanh toán là giả lập theo yêu cầu đồ án.

`npm audit --omit=dev` ngày 21/10 hiện báo 60 cảnh báo phụ thuộc (14 moderate,
46 high, 0 critical). Đã cập nhật `shell-quote` lên 1.12.0 để xử lý cảnh báo
critical trước đó và gỡ SDK Gemini thừa khỏi mobile. Nhiều đề xuất audit yêu cầu
đổi major/downgrade Expo hoặc React Native; chưa áp dụng tự động vì có thể phá
tương thích native. Không coi app đã sạch cảnh báo bảo mật hoặc sẵn sàng vận hành công khai.
