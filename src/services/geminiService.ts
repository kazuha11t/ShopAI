// src/services/geminiService.ts
// Chương 8 (Bước 8): Lớp bọc Gemini SDK — UI chỉ gọi askShopAI(), không biết đang nói chuyện với ai.
// Chương 9 chỉ cần thay ruột askShopAI() bằng axios.post('/api/ai/chat'), AIChatScreen không đổi.

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type Content,
} from '@google/generative-ai';
import { GEMINI_API_KEY } from '@constants/geminiConfig';
import {
  GEMINI_GENERATION_CONFIG,
  GEMINI_MODEL_NAME,
  MAX_HISTORY_TURNS,
  SHOPAI_SYSTEM_PROMPT,
} from '@constants/aiPrompt';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: GEMINI_MODEL_NAME,
  systemInstruction: SHOPAI_SYSTEM_PROMPT, // Đặt ở đây thay vì nhét vào tin nhắn (Phần 8.9)
  generationConfig: GEMINI_GENERATION_CONFIG,
  // Safety Settings (Phần 8.9): chặn nội dung độc hại từ mức trung bình trở lên
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
});

/** Một lượt hội thoại theo đúng định dạng Gemini yêu cầu. */
export type ChatTurn = Content & {
  role: 'user' | 'model';
  parts: { text: string }[];
};

/**
 * Gửi câu hỏi kèm lịch sử hội thoại lên Gemini.
 *
 * @param question Câu hỏi mới của user
 * @param history  Các lượt trước đó. Nhờ có nó, AI mới hiểu câu "cái đó giá bao nhiêu?"
 *                 đang nói về sản phẩm nào.
 */
export const askShopAI = async (question: string, history: ChatTurn[] = []): Promise<string> => {
  // Chỉ giữ N lượt gần nhất để không phình chi phí (Phần 8.11)
  let trimmed = history.slice(-MAX_HISTORY_TURNS * 2);
  // Gemini bắt buộc lịch sử phải bắt đầu bằng lượt của 'user'
  while (trimmed.length > 0 && trimmed[0].role !== 'user') {
    trimmed = trimmed.slice(1);
  }

  // startChat() để Gemini tự quản lý ngữ cảnh thay vì ta nối chuỗi thủ công
  const chat = model.startChat({ history: trimmed });

  const result = await chat.sendMessage(question);
  const text = result.response.text();

  // Bộ lọc an toàn có thể chặn câu trả lời -> text rỗng (Phần 8.9)
  if (!text || !text.trim()) {
    throw new Error('AI không trả lời được câu này (có thể đã bị bộ lọc an toàn chặn).');
  }

  return text.trim();
};

/** Chuyển thông báo lỗi kỹ thuật thành câu chữ người dùng đọc hiểu được. */
export const toFriendlyError = (error: unknown): string => {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('429')) {
    return 'Trợ lý đang bận (quá nhiều yêu cầu). Bạn đợi vài giây rồi thử lại nhé.';
  }
  if (msg.includes('API key') || msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
    return 'API Key chưa đúng. Hãy kiểm tra lại file geminiConfig.ts.';
  }
  if (msg.includes('Network') || msg.includes('fetch')) {
    return 'Mất kết nối mạng. Bạn kiểm tra Wi-Fi/4G giúp mình nhé.';
  }
  if (msg.includes('bộ lọc an toàn') || msg.includes('SAFETY')) {
    return 'AI không trả lời được câu này (có thể đã bị bộ lọc an toàn chặn).';
  }

  return 'Trợ lý gặp sự cố tạm thời. Bạn thử lại giúp mình nhé.';
};
