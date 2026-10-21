# ShopAI

[![Mobile CI](https://github.com/kazuha11t/ShopAI/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kazuha11t/ShopAI/actions/workflows/ci.yml)

Ứng dụng mua sắm React Native: đăng nhập JWT, danh mục sản phẩm, giỏ hàng,
đặt hàng, thanh toán giả lập, quét QR, GPS, khóa sinh trắc học và tư vấn AI.

- **Mobile:** repo này, React Native 0.86.3, React 19.2.3, Expo SDK 57.
- **Backend:** [ShopAI-backend](https://github.com/kazuha11t/ShopAI-backend), NestJS + Prisma + SQLite.
- **Đối chiếu đề cương:** [11 chương](docs/11-chapters.md).
- **Kết quả thực tế:** [Báo cáo kiểm chứng](docs/verification.md).

## Chuẩn bị trên máy mới

Cần Node.js 22 (từ 22.13) hoặc 24 (từ 24.3), npm, Java 17, Android SDK và điện thoại Android bật USB debugging.
Build iOS cần macOS/Xcode. Dự án dùng native modules; chạy bằng app native, không dùng Expo Go.

```powershell
git clone https://github.com/kazuha11t/ShopAI.git ShopAI
git clone https://github.com/kazuha11t/ShopAI-backend.git shopai-backend
```

1. Khởi động backend theo [README backend](https://github.com/kazuha11t/ShopAI-backend#readme).
2. Trong Firebase Console, thêm ứng dụng Android với package `com.shopai`, tải
   `google-services.json` và đặt tại `android/app/google-services.json`.
   Cấu hình Firebase riêng của máy không nằm trong Git. Nếu dùng Firebase cho iOS,
   thêm cấu hình tương ứng cho bundle ID `com.shopai`.
3. Trong thư mục `ShopAI`:

```powershell
npm ci
adb devices
adb reverse tcp:3000 tcp:3000
npm start
```

Terminal khác:

```powershell
cd ShopAI
npm run android
```

Nếu terminal đã ở thư mục `ShopAI`, chạy ngay `npm run android`.
Với APK release đã cài sẵn, chỉ cần bật backend và `adb reverse`; không cần Metro.

## Tài khoản demo và API

Sau khi seed demo trên backend, đăng nhập bằng `demo@shopai.com` / `123456`.
Đây là tài khoản dữ liệu mẫu dành cho đồ án.

API mặc định: `http://127.0.0.1:3000/api`, kết nối qua USB bằng ADB reverse.
Muốn dùng server khác:

```powershell
$env:SHOPAI_API_URL = 'https://your-server.example/api'
npm run configure:api
```

Sau đó build lại app. Backend chạy trên máy cá nhân không tự trở thành dịch vụ
online khi push mã nguồn lên GitHub. Gemini API key chỉ cấu hình ở backend.

## Kịch bản demo

1. Đăng nhập, xem sản phẩm, chuyển sáng/tối và mở menu danh mục.
2. Thêm sản phẩm vào giỏ, sửa số lượng, xác nhận đặt hàng.
3. Mở đơn hàng và thanh toán giả lập để chuyển từ PENDING sang PAID.
4. Hỏi AI tư vấn mua sắm; cần backend có Gemini key và Internet.
5. Quét [QR sản phẩm](qr-codes/index.html), thử GPS và khóa sinh trắc học.
6. Mở menu **Cập nhật ứng dụng** để xem kênh, runtime và update ID.

Thanh toán không thu tiền thật. Giá và phí thanh toán được backend xác nhận;
GPS trên Home chỉ ước tính khoảng cách/phí. Phí demo phía server là 25.000đ trước voucher.

## Kiểm thử và CI

```powershell
npm run typecheck
npm run lint
npm test -- --runInBand
```

[Workflow CI](.github/workflows/ci.yml) chạy các bước trên cho mỗi push/pull request.
Các luồng Maestro nằm trong [.maestro](.maestro); cần backend và điện thoại đã mở khóa.
Kết quả local đã ghi: 16 test mobile, 15 test backend và 2 flow Maestro đạt.
Xem [báo cáo](docs/verification.md) để phân biệt kết quả local, xác nhận người dùng và dịch vụ bên ngoài.

## APK release và OTA

Trên máy Windows đã cấu hình Java/Android SDK và Firebase:

```powershell
node scripts/create-local-signing.cjs
.\scripts\build-release.ps1 -Architectures arm64-v8a
```

APK sinh tại `android/app/build/outputs/apk/release/app-release.apk`.
Khóa ký nằm trong `.local-signing/`; sao lưu riêng để giữ chữ ký khi cập nhật.
APK, khóa ký, log, database và thư mục `node_modules` không đưa vào Git.

Expo project hiện liên kết kênh `preview`, runtime `1.0.0-rn0863`.
Chỉ người có quyền trên dự án Expo mới phát hành được bản cập nhật cho dự án đó.
Hướng dẫn OTA, cấu hình native và giới hạn nằm trong [đối chiếu 11 chương](docs/11-chapters.md).

## Minh chứng

- [Đơn hàng PAID trên điện thoại](docs/evidence/android-order-paid.png).
- [OTA đã áp dụng trên điện thoại](docs/evidence/android-ota-applied.png).
- Camera QR và sinh trắc học đã được người dùng xác nhận; GPS đã lấy được vị trí.
- Crashlytics trên Firebase Console và build iOS cần được kiểm chứng riêng.
