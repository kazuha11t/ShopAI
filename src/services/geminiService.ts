
import { apiClient } from './shopApi';
import { reportFailure } from './monitoring';

export type ChatTurn = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

type BackendHistoryItem = {
  role: 'user' | 'model';
  content: string;
};

type ChatResponse = {
  reply: string;
};

export const askShopAI = async (
  question: string,
  history: ChatTurn[] = [],
): Promise<string> => {
  const trimmed = history.slice(-20);

  // Gemini yêu cầu lịch sử bắt đầu bằng lượt user.
  while (trimmed.length > 0 && trimmed[0].role !== 'user') {
    trimmed.shift();
  }

  const backendHistory: BackendHistoryItem[] = trimmed.map(turn => ({
    role: turn.role,
    content: turn.parts.map(part => part.text).join('\n'),
  }));

  try {
    const response = await apiClient.post<ChatResponse>(
      '/ai/chat',
      {
        message: question.trim(),
        history: backendHistory,
      },
      { timeout: 60000 },
    );

    const reply = response.data?.reply?.trim();

    if (!reply) {
      throw new Error('AI không trả về nội dung.');
    }

    return reply;
  } catch (error: unknown) {
    reportFailure('ai');
    throw new Error(toFriendlyError(error));
  }
};

export const toFriendlyError = (error: unknown): string => {
  const msg = error instanceof Error ? error.message : String(error);
  const normalized = msg.toLowerCase();

  console.error('[ShopAI] Chi tiết lỗi:', msg);

  if (
    normalized.includes('503') ||
    normalized.includes('429') ||
    normalized.includes('service unavailable') ||
    normalized.includes('rate limit') ||
    normalized.includes('overload')
  ) {
    return 'AI đang bận hoặc đã đạt giới hạn yêu cầu. Vui lòng thử lại sau.';
  }

  if (
    normalized.includes('network error') ||
    normalized.includes('econnrefused') ||
    normalized.includes('timeout') ||
    normalized.includes('failed to connect')
  ) {
    return 'Không kết nối được đến ShopAI. Hãy kiểm tra mạng và thử lại.';
  }

  if (
    normalized.includes('401') ||
    normalized.includes('403') ||
    normalized.includes('api key')
  ) {
    return 'ShopAI chưa xác thực được yêu cầu. Vui lòng thử lại sau.';
  }

  return msg || 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.';
};
