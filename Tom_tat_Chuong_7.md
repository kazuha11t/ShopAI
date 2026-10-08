# TÓM TẮT BÀI HỌC

**CHƯƠNG 7: NATIVE MODULES, PHẦN CỨNG & QUYỀN TRUY CẬP HỆ ĐIỀU HÀNH**

Giáo trình React Native Thực Chiến · Thời lượng: 6 tiết Lý thuyết + 4 tiết Thực hành · Nguồn: thayduy.github.io/react-native-thuc-chien/docs/CHUONG_7_LT_MOI

## 1. Tổng quan chương

Chương 7 đưa ứng dụng ShopAI ra khỏi “thế giới ảo” của JavaScript để chạm vào **phần cứng thật** của điện thoại: Camera, GPS, bộ rung, thông báo đẩy. Trọng tâm là hiểu **Native Module** hoạt động thế nào, xin **quyền hệ điều hành** đúng chuẩn UX, và áp dụng vào Sprint 7: quét mã vạch bằng Camera + ước tính phí ship theo GPS.

### Mục tiêu học tập

- Hiểu cơ chế giao tiếp JavaScript ↔ Native (JSI, JNI, Objective-C Runtime).
- Nắm chính sách Sandboxing, khai báo quyền trong `Info.plist` (iOS) và `AndroidManifest.xml` (Android).
- Biết Expo Modules và cách dùng chúng trong React Native CLI.
- Phân biệt Autolinking (RN 0.60+) với Manual Linking; xử lý khi Autolinking thất bại.
- Xử lý đúng UX khi người dùng **từ chối quyền vĩnh viễn** bằng `Linking.openSettings()` + `AppState`.
- Dùng Haptic Feedback (rung phản hồi) đúng liều lượng.
- Làm chủ Định vị GPS và áp dụng vào bài toán phí giao hàng.
- Hiểu Frame Processor & pipeline JSI của Camera (Worklet, 60 FPS).
- Tự gỡ rối lỗi build Native kinh điển.
- Nắm nguyên lý Push Notification (FCM/APNs) và 3 trạng thái App.
- Nhìn thấy bộ khung một Native Module tự viết (Kotlin + Swift + JS), phân biệt với Turbo Module.

### Lộ trình đọc gợi ý

1. 7.1 – 7.2: Native Module là gì, vì sao OS khóa phần cứng mặc định.
2. 7.3 – 7.4: Expo Modules và cơ chế Autolinking.
3. 7.5: Đọc kỹ — quyền bị chặn vĩnh viễn (phần gây lỗi UX nhiều nhất).
4. 7.6 – 7.7: Haptic và Location — áp dụng trực tiếp vào Sprint.
5. 7.8: JSI Frame Processor — kiến thức nâng cao, có thể đọc sau.
6. 7.9 – 7.10: Sổ tay tra cứu khi code, không cần học thuộc.
7. Làm Sprint 7 (Bước 1 → 12), quay lại lý thuyết khi bí.
8. 7.11 – 7.12: Kiến thức mở rộng, gắn với Bước 13 tùy chọn.

> **Nhầm lẫn phổ biến:** trạng thái **denied** (từ chối, còn xin lại được) khác **blocked** (từ chối vĩnh viễn, phải mở Cài đặt). iOS chỉ được hỏi **1 lần**, Android được hỏi **2 lần**.

## 2. Tóm tắt lý thuyết

### 7.1. Bản chất của Native Modules

- Code JS chạy trong Hermes bị “giam” trong sandbox, không tự điều khiển được Camera, đèn Flash, bộ rung.
- **Native Module** là khối mã C++/Java/Kotlin/Swift/Objective-C gắn vào app, làm “lính liên lạc”: JS gọi qua JSI → C++ → JNI (Android) → API hệ điều hành.
- Cài một Native Module thì **Hot Reload không còn tác dụng** — phải tắt Metro và build lại (`npm run android` / `npm run ios`).

### 7.2. Sandboxing và quyền hệ điều hành

- Apple và Google áp dụng nguyên tắc **Zero Trust**: mọi phần cứng bị khóa khi cài app.
- **Bước 1 – Khai báo tĩnh:** iOS thêm `NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription` vào `Info.plist` (kèm lý do cụ thể, nếu chung chung sẽ bị App Store từ chối). Android thêm `CAMERA`, `ACCESS_FINE_LOCATION` vào `AndroidManifest.xml`.
- **Bước 2 – Xin quyền lúc chạy (Runtime):** hiện pop-up cho người dùng bấm “Cho phép”. Phải bọc `try/catch` để không crash khi bị từ chối.

### 7.3. Expo Modules trong React Native CLI

- Expo tạo chuẩn **Expo Modules Architecture** (Swift/Kotlin hiện đại), có thể cài vào RN CLI để dùng expo-camera, expo-location, expo-file-system… ổn định.
- Xu hướng 2025+: quét mã bằng **AI chạy ngay trên máy** (Google ML Kit / Apple Vision) — nhanh, không cần mạng, ảnh không rời máy. `react-native-vision-camera` + `useCodeScanner` chính là cách hiện thực hóa xu hướng này.

### 7.4. Autolinking vs Manual Linking

- **Trước RN 0.60:** phải tự sửa Xcode, `settings.gradle`, `build.gradle`, `MainApplication.java` — quên một bước là crash.
- **Từ RN 0.60 – Autolinking:** thư viện tự khai báo qua `react-native.config.js`/podspec. iOS: `use_native_modules!` trong Podfile khi chạy `pod install`. Android: Gradle tự quét `node_modules` và sinh `PackageList.java`.
- Công thức: iOS = `npm install` + `pod install`; Android = `npm install` + build lại. Lệnh `react-native link` đã bị khai tử.
- Phải can thiệp tay khi: thư viện quá cũ; cần cấu hình thêm (VD `VisionCamera_enableCodeScanner=true` trong `gradle.properties`); hoặc muốn tắt autolink một thư viện.
- Kiểm tra: `npx react-native config` — không thấy tên thư viện trong `dependencies` nghĩa là Autolinking đã bỏ sót.

### 7.5. Khi người dùng từ chối quyền vĩnh viễn

| **Trạng thái** | **Ý nghĩa** | **Xin lại được không?** |
|---|---|---|
| granted | Đã cho phép | Không cần xin nữa |
| not-determined | Chưa hỏi lần nào | Có — pop-up sẽ hiện |
| denied | Vừa từ chối | Tùy OS (Android còn hỏi lại được 1 lần) |
| blocked / restricted | Từ chối vĩnh viễn hoặc bị chặn bởi phụ huynh/doanh nghiệp | KHÔNG — pop-up không bao giờ hiện lại |

- **Bẫy UX:** chỉ hiện “Đang đợi cấp quyền…” khiến người dùng kẹt vĩnh viễn → bị đánh giá 1 sao, bị App Store đánh trượt.
- **Giải pháp:** hiện Alert giải thích lý do + nút “Mở Cài đặt” gọi `Linking.openSettings()`, luôn kèm lựa chọn “Để sau”.
- **Just-in-time permission:** chỉ xin quyền đúng lúc người dùng cần tính năng (bấm “Quét mã” mới xin Camera).
- Sau khi người dùng bật quyền trong Settings và quay lại, state React vẫn giữ giá trị cũ → phải lắng nghe `AppState` (`active`) để kiểm tra quyền lại.

### 7.6. Haptic Feedback

| **Tiêu chí** | **Vibration (rung thô)** | **Haptic (rung phản hồi)** |
|---|---|---|
| Thời lượng | Hàng trăm ms đến vài giây | 10–40 ms, gần như tức thời |
| Dùng khi | Cuộc gọi, báo thức | Bấm nút, quét thành công, chọn item |
| API trong RN | `Vibration` có sẵn | Cần thư viện Native |

- Ba lựa chọn: **A.** `Vibration.vibrate(40)` có sẵn (Sprint 7 dùng cách này); **B.** `expo-haptics` (cần Expo Modules – Chương 8); **C.** `react-native-haptic-feedback`.
- Trên iOS, `Vibration.vibrate(số)` bỏ qua thời lượng, luôn rung ~400 ms.
- **Nên rung:** quét thành công, thêm giỏ hàng, thanh toán xong. **Không rung:** mỗi ký tự gõ, mỗi lần cuộn.
- Không dùng rung làm kênh thông tin duy nhất — luôn có phản hồi thị giác đi kèm (trợ năng).
- Android cần khai báo `android.permission.VIBRATE` (quyền install-time, không cần pop-up).

### 7.7. Định vị (Location) – GPS và bài toán phí ship

- Ứng dụng: ước tính phí và thời gian giao hàng, tự điền địa chỉ, tìm cửa hàng gần nhất.

| **Quyền Android** | **Độ chính xác** | **Nguồn** | **Tốn pin** |
|---|---|---|---|
| ACCESS_COARSE_LOCATION | ~1–3 km | Trạm phát sóng, Wi-Fi | Rất ít |
| ACCESS_FINE_LOCATION | ~5–20 m | Vệ tinh GPS/GNSS | Nhiều |

- Android 12+ cho phép người dùng chọn vị trí “Gần đúng” — code phải chấp nhận mà không crash. iOS: chỉ xin **When In Use**, tránh **Always** nếu không thật cần.
- Thư viện: `@react-native-community/geolocation` (Sprint 7 dùng, nhẹ, không cần Expo); `expo-location` (async/await, có Reverse Geocoding – Chương 8); `react-native-geolocation-service`.
- **Ba cái bẫy:** (1) máy ảo không có GPS thật, phải bơm tọa độ giả; (2) **luôn đặt timeout**; (3) **luôn có phương án dự phòng** — GPS hỏng/bị từ chối thì hiện phí ship mặc định, không làm sập màn hình.

### 7.8. Frame Processor & pipeline JSI của Camera

- Một khung Full HD ~3 MB × 60 FPS = **180 MB/giây** — không thể serialize JSON qua Bridge cũ.
- **JSI** cho JS giữ tham chiếu trực tiếp tới đối tượng C++ — dữ liệu ảnh không bị copy, chỉ truyền “con trỏ”.
- **Worklet** (chỉ thị `'worklet'`) tách hàm xử lý frame sang một JS runtime riêng trên luồng Camera → UI vẫn mượt 60 FPS. Trong worklet không dùng được state React; muốn gửi dữ liệu về phải dùng `runOnJS`/Shared Value.
- `useCodeScanner` là Frame Processor viết sẵn bằng C++ (ML Kit/Vision), chạy hoàn toàn ở tầng Native.
- Tự viết Frame Processor khi cần: nhận diện khuôn mặt, OCR, làm mờ nền, chạy model TensorFlow Lite. Không `console.log` trong Frame Processor ở bản Release.

### 7.9. Gỡ rối lỗi build Native

| **Lỗi** | **Nguyên nhân** | **Cách chữa** |
|---|---|---|
| Cannot find native module | Chưa build lại Native / Autolinking bỏ sót | Tắt Metro → pod install → build lại |
| Duplicate class com.google.android.gms | Hai thư viện kéo hai phiên bản SDK Google | Ép version trong `android/build.gradle` |
| Unsupported class file major version 65 | Gradle chạy sai JDK | Dùng JDK 17, trỏ `JAVA_HOME` |
| SDK location not found | Thiếu `local.properties` | Tạo file với `sdk.dir=...` |
| Unable to resolve module (Metro) | Cache Metro bẩn | `npx react-native start --reset-cache` |
| configuring project :react-native-vision-camera | Thiếu cấu hình `gradle.properties` | Thêm `VisionCamera_enableCodeScanner=true` |
| method references exceeds 65536 | Vượt giới hạn DEX | `multiDexEnabled true` |

- **Nuclear Clean** (khi thật sự bế tắc, mất 10–20 phút): dọn 4 tầng — JS (`node_modules`), iOS (Pods, DerivedData), Android (`gradlew clean`, xóa build), Metro (`--reset-cache`).
- **Đọc lỗi đúng cách:** tìm dòng `error:`/`FAILURE:` đầu tiên (không đọc dòng cuối); xác định tầng (Gradle/Pods/Metro); tìm tên thư viện; Google kèm phiên bản RN.
- **Phòng bệnh:** cài từng thư viện một và build ngay; commit Git trước khi đụng Native; đọc Requirements (Vision Camera cần `minSdkVersion 26`); không nâng version RN giữa chừng.

### 7.10. So sánh các thư viện Camera

| **Tiêu chí** | **react-native-vision-camera v4** | **expo-camera** | **react-native-camera** |
|---|---|---|---|
| Tình trạng | Chuẩn công nghiệp | Expo bảo trì | Đã khai tử (2022) |
| Kiến trúc | JSI + C++ | Expo Modules | Bridge cũ |
| Hiệu năng | 60 FPS, Frame Processor | Đủ chụp/quay | Chậm, hay treo |
| Quét mã | `useCodeScanner` (native) | `onBarcodeScanned` | Nhiều bug |
| Nên chọn khi | Quét mã, xử lý ảnh thời gian thực | Chụp ảnh đơn giản | Không bao giờ |

**Kết luận:** ShopAI chọn **Vision Camera** vì cần xử lý frame liên tục 60 FPS để quét mã.

### 7.11. Push Notifications

- Chiều ngược lại với Camera/GPS: **Server đánh thức App**, kể cả khi app đã tắt — kênh giữ chân người dùng mạnh nhất (báo đơn hàng, giảm giá…).
- ShopAI chọn `@react-native-firebase/messaging` (dùng chung dự án Firebase với Crashlytics ở Chương 10).
- Luồng: xin quyền (Android 13+ cần `POST_NOTIFICATIONS`) → `messaging().getToken()` lấy FCM Token → gửi thử từ Firebase Console → FCM đẩy về máy.

| **Trạng thái App** | **Hàm lắng nghe** | **Ai hiển thị thông báo** |
|---|---|---|
| Đang mở (Foreground) | `onMessage()` | App tự vẽ Alert/Toast — OS im lặng |
| Chạy nền (Background) | `onNotificationOpenedApp()` | OS hiện banner; hàm chạy khi bấm banner |
| Tắt hẳn (Killed) | `getInitialNotification()` + `setBackgroundMessageHandler` | OS hiện banner; app khởi động lại khi bấm |

> **Lưu ý:** `setBackgroundMessageHandler` **bắt buộc đặt ở `index.js`**, ngoài React Tree — đặt trong App.tsx hay useEffect sẽ không chạy khi app bị tắt. Không test được Push trên máy ảo thiếu Google Play hoặc iOS Simulator.

### 7.12. Tự viết một Native Module siêu nhỏ

- Ví dụ `ShopAIDevice.getAppFlavor()` trả về "dev"/"production" đọc từ tầng Native.
- **4 mảnh ghép:** `src/native/ShopAIDevice.ts` (vỏ bọc JS có kiểu), `ShopAIDeviceModule.kt` (logic Android, hàm đánh dấu `@ReactMethod`), `ShopAIDevicePackage.kt` (khai báo module, đăng ký tay trong `MainApplication.kt`), `ShopAIDevice.swift` + `.m` (iOS + cầu nối Objective-C).
- Module viết ngay trong app **không được Autolinking lo hộ** (Autolinking chỉ quét `node_modules`).

| **Tiêu chí** | **Native Module (Bridge)** | **Turbo Module (kiến trúc mới)** |
|---|---|---|
| Cách gọi | Qua Bridge, serialize JSON | Qua JSI trực tiếp |
| Đăng ký | ReactPackage thủ công / Autolinking | Codegen sinh từ spec TypeScript |
| Nạp lúc nào | Nạp hết khi khởi động | Lazy load khi gọi lần đầu |
| Độ khó | Dễ | Cần bật New Architecture + Codegen |

## 3. Thực chiến ShopAI – Sprint 7

**User Story:** “Là nhân viên kho, tôi muốn bấm một nút mở Camera, quét mã vạch sản phẩm để tra cứu không cần gõ tay. Camera phải tắt khi rời màn hình, không quét lặp liên tục, máy rung nhẹ khi quét trúng. Ở Trang chủ tôi muốn thấy ngay phí ship ước tính dựa trên vị trí GPS.”

| **Hạng mục** | **Nội dung** |
|---|---|
| Thời lượng gợi ý | 5–7 tiết (bắt buộc máy thật cho Camera) |
| Độ khó | ★★★★☆ |
| Đầu vào | Sprint 6 PASS — Home/Cart/Checkout data layer ổn định |
| Đầu ra | Scanner trong HomeStack; quét mã + haptic; LocationBadge ước tính ship trên Home |

### Yêu cầu nghiệm thu

- Cài **React Native Vision Camera v4+** và bật Code Scanner đúng chuẩn.
- Khai báo quyền Camera + Vibrate + Location chính xác trong `Info.plist` và `AndroidManifest.xml`.
- ScannerScreen: pop-up xin quyền, **khóa chống quét lặp**, tự tắt Camera khi rời màn hình (`useIsFocused`).
- Xử lý trọn vẹn khi từ chối quyền: màn hình giải thích + nút “Mở Cài đặt”, tự dò lại quyền qua `AppState`.
- Rung một nhịp ngắn khi quét thành công, gói trong tiện ích `src/utils/haptics.ts`.
- Đọc được Barcode/QR và trả về HomeScreen qua Route Params.
- Lấy tọa độ GPS bằng `@react-native-community/geolocation`, bọc trong hook `useCurrentLocation`, hiển thị `LocationBadge` trên Home.
- Mọi tính năng phụ (Haptic, Location) đều có **phương án dự phòng**, không làm sập màn hình chính.

### Bản đồ file tạo/sửa

| **File** | **Việc** |
|---|---|
| src/screens/ScannerScreen.tsx | Tạo mới — màn hình Camera quét mã |
| src/utils/haptics.ts | Tạo mới — tiện ích rung phản hồi |
| src/hooks/useCurrentLocation.ts | Tạo mới — hook lấy tọa độ GPS |
| src/components/LocationBadge.tsx | Tạo mới — thẻ vị trí + phí ship |
| src/constants/shipping.ts | Tạo mới — hằng số kho & bảng giá ship |
| src/navigation/HomeStackNavigator.tsx | Sửa — thêm route Scanner |
| src/screens/HomeScreen.tsx | Sửa — nút “Quét Mã” + LocationBadge |
| ios/ShopAI/Info.plist | Sửa — quyền Camera + Location |
| android/app/src/main/AndroidManifest.xml | Sửa — quyền Camera + Vibrate + Location |
| android/gradle.properties | Sửa — bật Code Scanner ML Kit |

### Các bước thực hiện

1. **Bước 1:** Cài `react-native-vision-camera`, bật `VisionCamera_enableCodeScanner=true` (nhúng model ML Kit ~2.4 MB).
2. **Bước 2:** Khai báo quyền Camera + Rung + Vị trí cho iOS và Android.
3. **Bước 3:** Viết tiện ích rung `src/utils/haptics.ts`.
4. **Bước 4:** Viết ScannerScreen (khóa chống quét lặp + xử lý từ chối quyền).
5. **Bước 5:** Khai báo Scanner vào HomeStack (không phá Bottom Tab).
6. **Bước 6:** Cập nhật HomeScreen để nhận mã vạch qua Route Params.
7. **Bước 7:** Cài thư viện định vị & khai báo hằng số vận chuyển (`shipping.ts`, công thức Haversine).
8. **Bước 8:** Viết hook `useCurrentLocation`.
9. **Bước 9:** Viết component `LocationBadge`.
10. **Bước 10:** Gắn LocationBadge vào HomeScreen.
11. **Bước 11:** Build lại Native toàn bộ (tắt Metro, `pod install` nếu iOS, `npm run android/ios`).
12. **Bước 12:** Tự chấm theo bảng kiểm và commit.
13. **Bước 13:** (Tùy chọn) Lấy FCM Token và nhận thông báo thử từ Firebase Console.

**Mốc kiểm chứng:** sau Bước 1–2 build PASS với quyền mới; sau Bước 4–6 mở được Scanner, quét ra mã, không spam; sau Bước 7–10 badge vị trí/phí ship hiện trên Home.

### Bảng kiểm tự chấm (trên điện thoại thật)

| **#** | **Hạng mục kiểm tra** | **Cách thử** |
|---|---|---|
| 1 | Camera mở được, hình mượt | Bấm “Quét Mã” |
| 2 | Quét trúng mã, giá trị hiện ở Home | Quét mã vạch trên hộp sữa/sách |
| 3 | Rung đúng một nhịp khi quét trúng | Cảm nhận trên tay |
| 4 | Không quét lặp / nhảy màn hình nhiều lần | Giữ mã trong khung 5 giây |
| 5 | Camera tắt khi rời màn hình | Bấm Back, đèn báo Camera phải tắt |
| 6 | Từ chối quyền → màn hình giải thích, không kẹt | Gỡ app cài lại, bấm Deny |
| 7 | Nút “Mở Cài đặt” mở đúng trang ShopAI | Bấm thử |
| 8 | Bật quyền rồi quay lại → Camera tự chạy | Không khởi động lại app |
| 9 | LocationBadge hiện tọa độ và phí ship | Nhìn Trang chủ |
| 10 | Từ chối quyền vị trí → vẫn có phí mặc định, không sập | Bấm Deny quyền Location |
| 11 | Bấm “Làm mới” trên badge → dò lại vị trí | Bấm thử |
| 12 | Giỏ hàng, Đăng nhập/Đăng xuất vẫn nguyên vẹn | Bấm dạo quanh app |

## 4. Câu hỏi ôn tập

| **Chủ đề** | **Câu hỏi phải trả lời được** |
|---|---|
| Native Module | Vì sao cài thư viện Native thì Hot Reload vô hiệu, phải build lại? |
| Sandboxing & Permissions | Info.plist khác AndroidManifest ở điểm gì? Vì sao iOS chỉ hỏi 1 lần? |
| Autolinking | pod install và Gradle làm gì sau lưng bạn? Khi nào phải Manual Link? |
| Quyền bị chặn | denied khác blocked thế nào? Vì sao cần AppState sau openSettings()? |
| Haptic | Vibration khác Haptic ra sao? Vì sao bọc vào file tiện ích riêng? |
| Location | FINE khác COARSE? Vì sao bắt buộc có timeout và phương án dự phòng? |
| JSI & Frame Processor | Vì sao 180 MB/giây không thể đi qua Bridge? Chỉ thị 'worklet' làm gì? |
| Gỡ rối build | Đọc log lỗi Native bắt đầu từ đâu? Nuclear Clean gồm mấy tầng? |
| So sánh Camera | Vì sao ShopAI chọn Vision Camera thay vì Expo Camera? |
| Push Notification | Vì sao setBackgroundMessageHandler phải đặt ở index.js? 3 trạng thái App khác nhau ra sao? |
| Native Module tự viết | Cần 4 file nào để gọi ShopAIDevice.getAppFlavor()? Native Module khác Turbo Module ở đâu? |

## 5. Chuẩn bị cho Chương 8

- Chương 8: mã hóa phần cứng (Hardware-backed Keystore) và tích hợp mô hình AI trực tiếp vào app.
- Expo Modules sẽ được cài ở Bước 1 Sprint 8 → có thể nâng cấp `haptics.ts` sang `expo-haptics`, `useCurrentLocation` sang `expo-location`.
- Kỹ năng xin quyền Runtime (checking / granted / denied + `Linking.openSettings()`) sẽ được tái sử dụng cho Sinh trắc học (Face ID / vân tay).
