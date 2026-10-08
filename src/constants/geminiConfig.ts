// src/constants/geminiConfig.ts
// ============================================================================
// ⚠️⚠️⚠️  CẢNH BÁO BẢO MẬT — CHỈ DÙNG CHO MỤC ĐÍCH HỌC TẬP/LỚP HỌC  ⚠️⚠️⚠️
// ============================================================================
// File này chứa API Key ngay trên Mobile (Client). Bất kỳ ai dịch ngược file
// APK/IPA bằng Apktool đều đọc được chuỗi Key này chỉ trong vài phút,
// rồi xài ké/đánh sập quota Gemini của bạn (OWASP Mobile M1).
//
// TUYỆT ĐỐI KHÔNG dùng cách này cho dự án thương mại thật.
// TUYỆT ĐỐI KHÔNG commit file này khi đã điền Key thật lên Git repository công khai.
//
// -> Ở CHƯƠNG 9, file này sẽ bị XÓA HẲN. Logic gọi Gemini chuyển xuống Backend
//    NestJS, Mobile chỉ gọi API nội bộ (`/api/ai/chat`) — không hề biết Key thật.
// ============================================================================
// Lấy Key miễn phí tại: https://aistudio.google.com/apikey
export const GEMINI_API_KEY = 'ĐIỀN_API_KEY_CỦA_BẠN_VÀO_ĐÂY';
