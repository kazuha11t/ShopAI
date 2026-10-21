# ShopAI — triển khai và nghiệm thu 11 chương

Đối chiếu:
- https://thayduy.github.io/react-native-thuc-chien/docs/BAN_DO_DE_CUONG
- https://thayduy.github.io/react-native-thuc-chien/docs/SHOPAI_HOAN_THIEN

“Có mã nguồn” không đồng nghĩa với “đã nghiệm thu trên thiết bị”. Chỉ đánh dấu PASS sau khi thực hiện các bước bên dưới. Kết quả chạy được ghi riêng trong `verification.md`.

## Khởi động

Hai repository cạnh nhau: `ShopAI` (mobile), `shopai-backend` (Nest).
Dùng Node.js 24.9 trở lên để chạy và kiểm thử cả hai repo; backend Jest cần
khả năng nạp ESM của Node 24. Cả hai repo có `.nvmrc` chọn Node 24.

Backend, PowerShell:

```powershell
cd D:\shopAI\shopai-backend
npm ci
# Máy mới: sao chép .env.example thành .env; điền JWT_SECRET ngẫu nhiên >=32 ký tự.
# GEMINI_API_KEY chỉ nằm trên backend. Không đưa vào mã nguồn mobile.
npm run db:deploy
$env:SEED_DEMO = 'true'
npm run db:seed
npm run start:dev
```

Seed tạo dữ liệu sản phẩm mẫu và tài khoản `demo@shopai.com` / `123456` khi `SEED_DEMO=true`.
Seed không ghi đè sản phẩm/tồn kho/tài khoản đã có. Không bật tài khoản demo trên dịch vụ công khai.

Mobile:

Trên máy mới, tải cấu hình ứng dụng Android `com.shopai` từ Firebase Console
và đặt tại `android/app/google-services.json` trước khi build. File cấu hình
Firebase riêng được Git ignore; không có trong bản clone từ GitHub.

```powershell
cd D:\shopAI\ShopAI
npm ci
adb reverse tcp:3000 tcp:3000
npm start
# Terminal khác:
npm run android
```

Địa chỉ mặc định: `http://127.0.0.1:3000/api`, dùng ADB reverse cho emulator hoặc máy USB.
Nếu dùng server khác: đặt `SHOPAI_API_URL`, chạy `npm run configure:api`, build lại app.
Server phát hành phải dùng HTTPS. HTTP được cho phép riêng cho loopback/emulator để học và demo local.
Swagger tại `http://localhost:3000/docs`.

## Bản đồ triển khai

| Chương | Mã nguồn chính | Cách chứng minh |
|---|---|---|
| 1 | package.json, android/, ios/, Git | Cài dependencies, build và mở app |
| 2 | screens/, components/, CatalogSectionsScreen | JSX, props/state, input/press, Fetch có abort, SectionList danh mục |
| 3 | ThemeContext, useThemedStyles, ShopButton, ShopInput | Đổi giao diện tối/sáng; Context + useReducer; memo ProductCard; useMemo/useCallback |
| 4 | HomeScreen, ProductCard | Grid FlashList, animation Reanimated, safe area, pull-to-refresh, loading/error/empty |
| 5 | App, MainDrawerNavigator, MainTabNavigator, các stack | Auth conditional navigation, Drawer/Tab/Stack, route params, deep link |
| 6 | store/redux/, Zustand stores, services/shopApi, hooks/useProductsQuery | Redux demo chạy từ Home; Query cache/phân trang; Zod phản hồi API; Bearer/401 |
| 7 | ScannerScreen, useLocation, LocationBadge | Quyền camera/GPS; quét ID từ API; rung; estimate giao hàng |
| 8 | useAuthStore, useAppLock, BiometricGateScreen, AIChatScreen | Keychain, khóa khi nền quá hạn, lịch sử AI/typing/retry |
| 9 | backend auth/, products/, orders/, ai/, prisma/ | Auth JWT thật, scrypt, SQLite, đơn theo tài khoản, giá do server tính, AI proxy |
| 10 | Firebase native config, monitoring.ts, UpdatesScreen, scripts/create-local-signing | Crash/non-fatal, APK release ký riêng; EAS Update kênh preview và bản native cùng runtime |
| 11 | __tests__/, backend test/commerce.spec.ts, .maestro/, .github/, fastlane/ | Jest/RNTL, Supertest + SQLite, E2E, pipeline lint/typecheck/test, local release lane |

## Luồng mua hàng

1. Đăng ký tài khoản mới hoặc đăng nhập tài khoản demo.
2. Home lấy danh mục từ Nest, kéo xuống tải trang tiếp theo và kéo lên để refresh.
3. Mở chi tiết, thêm vào giỏ, đổi số lượng.
4. Checkout lấy báo giá từ server; gửi **ID và số lượng**, không tin giá từ client.
5. Phí giao hàng hiện là biểu phí demo cố định 25.000đ, trước voucher. GPS là ước tính và không được dùng làm giá thanh toán đáng tin cậy.
6. Server kiểm tra tồn kho, giá và tổng đã xác nhận. Tạo đơn PENDING và trừ tồn kho trong một transaction.
7. Retry cùng request ID trả về cùng đơn. Chỉ xóa giỏ sau khi server xác nhận thành công.
8. Tab Đơn hàng đọc từ server. Bấm thanh toán giả lập để đổi PAID; không thu tiền thật.
9. Khởi động lại server: hóa đơn và trạng thái vẫn có trong SQLite.
10. Tài khoản B không được xem/trả tiền đơn của A. API trả 404; thiếu JWT trả 401.

## Các bài tập đề cương

- Context chia sẻ theme; reducer mô tả hành động đổi/khôi phục theme.
- Redux Toolkit: `createSlice`, `configureStore`, Provider, selector và dispatch trong `ReduxCartDemoScreen`.
- Zustand giữ client state giỏ hàng/auth. React Query giữ server state sản phẩm/đơn; không sao chép đơn server vào Zustand.
- Fetch + SectionList: mở Drawer → Danh mục sản phẩm. Axios dùng cho các API nghiệp vụ; interceptor tự gắn JWT và xử lý hết phiên.
- Drawer là menu cạnh; Tab là chuyển khu vực chính; Stack là lịch sử màn hình. Deep link đi từ ngoài app qua URL.
- `shopai://product/1`, `shopai://cart`, `shopai://orders`, `shopai://categories`.

## Kiểm thử và debug

```powershell
npm run typecheck
npm run lint
npm test -- --runInBand
# Chạy tương tự trong shopai-backend.
```

Backend test dùng database tạm độc lập và áp dụng SQL migration của dự án; không sửa database phát triển. AI provider được mock trong test để không gọi dịch vụ trả phí.

Mobile có unit test tiền/giỏ/Zod/session, RNTL ShopButton và Checkout, smoke test root auth.
Mock chỉ mô phỏng native bridge trong Jest; không thay thế thử camera/sinh trắc học.

Maestro: seed demo + bật backend + ADB reverse + cài app, sau đó:

```powershell
maestro test .maestro/login_home.yaml
maestro test .maestro/cart_checkout.yaml
```

Các flow không xóa dữ liệu ứng dụng. Flow đăng nhập sẽ đăng xuất phiên đang mở
trên Home nếu có; hành vi đăng xuất bình thường xóa giỏ và cache phiên đó.
Dùng tài khoản demo và giỏ thử nghiệm. Nếu App Lock đang chặn, người dùng cần
mở khóa bằng sinh trắc học trước khi chạy flow.

React Native DevTools: mở Metro, nhấn `j`; xem Components và record Profiler khi thay số lượng giỏ.
Chụp minh chứng component/render hoặc breakpoint; xác nhận request API qua log phát triển/server.
Flipper là công cụ lịch sử trong đề cương; không thêm lại plugin Flipper cũ vào New Architecture chỉ để đủ tên công cụ. Trình bày Network/Layout Inspector trước đây và đối chiếu với DevTools hiện hành.

CI nằm riêng trong từng repository. Có file workflow không có nghĩa đã chạy xanh trên GitHub: cần push lên remote và lưu URL lần chạy.

## Release và thông tin cần bảo quản

`node scripts/create-local-signing.cjs` tạo khóa ký local riêng một lần; không ghi đè khóa có sẵn.
Thư mục `.local-signing/` bị Git ignore. Sao lưu an toàn để các bản cập nhật giữ cùng chữ ký.
Không đưa khóa ký, mật khẩu, `.env`, JWT secret hoặc Gemini key vào Git.

```powershell
.\scripts\build-release.ps1
```

Script Windows dùng Java 17 và giới hạn hai Gradle workers. Không chạy thêm một
build khác khi `artifacts/build-status.json` còn ghi `running`.

APK: `android/app/build/outputs/apk/release/app-release.apk`.
Lần build có lỗi không được xem là minh chứng release; xem `verification.md` cho trạng thái thực tế.

Crashlytics: dùng nút test chỉ hiện trong debug, mở lại app sau crash và xác nhận trên Firebase Console.
Non-fatal chỉ gửi loại lỗi kỹ thuật, không gửi JWT, địa chỉ giao hàng hay nội dung chat.
OTA thay JS/assets trong cùng native runtime; đổi thư viện native cần build mới. Không dùng Expo Go để nghiệm thu Keychain, VisionCamera hoặc Firebase native của dự án này.

Dự án Expo đã liên kết với `trieu1912ts-team/shopai`; kênh `preview` nối nhánh
`preview`, runtime `1.0.0-rn0863`. Bản thử dùng API local qua ADB reverse.
Lệnh cập nhật sau khi kiểm tra code:

```powershell
npx eas-cli@latest update --channel preview --environment preview --platform android --message "Mô tả thay đổi"
```

Mở màn “Cập nhật ShopAI” trong Drawer để kiểm tra/tải bản mới rồi xác nhận
khởi động lại. Publish thành công chưa đủ chứng minh điện thoại đã áp dụng OTA.

## Giới hạn nghiệm thu

- Chưa có cổng thu tiền thật; thanh toán giả lập là yêu cầu khóa học.
- AI cần key hợp lệ trên backend và mạng. Không hiển thị phản hồi giả nếu dịch vụ lỗi.
- Camera thật, quyền GPS, khóa sinh trắc học, nhận crash trên Console, OTA tải trên thiết bị và CI từ remote phải có minh chứng riêng.
- Phiên bản iOS cần macOS/Xcode để build và thử. Android là đường nghiệm thu local trên máy Windows này.
