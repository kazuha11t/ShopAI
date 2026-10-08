// src/screens/AIChatScreen.tsx
// Chương 8 (Bước 9): Nhân viên tư vấn AI (Gemini) — đủ các mẫu UX của Phần 8.10:
// typing indicator, nút Thử lại, gợi ý khi rỗng, tự cuộn, khoá nút Gửi khi đang chờ.

import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import ShopButton from '@components/ShopButton';
import { COLORS, SIZES } from '@constants/theme';
import { AI_GREETING, AI_SUGGESTIONS } from '@constants/aiPrompt';
import { askShopAI, toFriendlyError, type ChatTurn } from '@services/geminiService';

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  status?: 'sent' | 'error'; // 'error' -> hiện nút Thử lại (Phần 8.10)
  createdAt: number;
};

const formatTime = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', text: AI_GREETING, isBot: true, status: 'sent', createdAt: Date.now() },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const headerHeight = useHeaderHeight();
  const listRef = useRef<FlatList<Message>>(null);
  // Lưu câu hỏi vừa lỗi để nút "Thử lại" biết phải gửi lại cái gì
  const lastQuestionRef = useRef<string>('');

  const scrollToEnd = () => {
    // Hoãn một nhịp để FlatList kịp render item mới rồi mới cuộn
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  /** Dựng lịch sử hội thoại theo định dạng Gemini (bỏ câu chào và tin lỗi). */
  const buildHistory = useCallback((list: Message[]): ChatTurn[] => {
    return list
      .filter((m) => m.id !== 'greeting' && m.status !== 'error')
      .map((m) => ({
        role: m.isBot ? ('model' as const) : ('user' as const),
        parts: [{ text: m.text }],
      }));
  }, []);

  /** Lõi gửi tin — dùng chung cho nút Gửi lẫn nút Thử lại. */
  const send = useCallback(
    async (question: string, historySource: Message[]) => {
      lastQuestionRef.current = question;
      setIsTyping(true);
      scrollToEnd();

      try {
        const reply = await askShopAI(question, buildHistory(historySource));
        setMessages((prev) => [
          ...prev,
          { id: `bot-${Date.now()}`, text: reply, isBot: true, status: 'sent', createdAt: Date.now() },
        ]);
      } catch (error) {
        console.log('[AIChat] Lỗi gọi Gemini:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            text: toFriendlyError(error),
            isBot: true,
            status: 'error',
            createdAt: Date.now(),
          },
        ]);
      } finally {
        setIsTyping(false);
        scrollToEnd();
      }
    },
    [buildHistory],
  );

  const handleSend = useCallback(
    (overrideText?: string) => {
      const text = (overrideText ?? inputText).trim();
      if (!text || isTyping) return; // Chống spam: đang chờ AI thì không cho gửi tiếp

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        text,
        isBot: false,
        status: 'sent',
        createdAt: Date.now(),
      };
      // Câu hỏi mới -> bỏ các bong bóng lỗi cũ khỏi màn hình
      const next = [...messages.filter((m) => m.status !== 'error'), userMsg];

      setMessages(next);
      setInputText(''); // Xoá ô nhập NGAY LẬP TỨC để user thấy phản hồi tức thì
      // Lịch sử gửi lên AI là các tin TRƯỚC câu hỏi này (câu hỏi đi riêng qua sendMessage)
      send(text, next.slice(0, -1));
    },
    [inputText, isTyping, messages, send],
  );

  /** Nút Thử lại: xoá bong bóng lỗi rồi gửi lại đúng câu hỏi cũ. */
  const handleRetry = useCallback(() => {
    if (isTyping || !lastQuestionRef.current) return;
    const cleaned = messages.filter((m) => m.status !== 'error');
    setMessages(cleaned);
    // Câu hỏi lỗi đang nằm cuối danh sách -> không đưa nó vào lịch sử lần nữa
    send(lastQuestionRef.current, cleaned.slice(0, -1));
  }, [isTyping, messages, send]);

  const renderItem = ({ item }: { item: Message }) => (
    <View style={item.isBot ? styles.rowBot : styles.rowUser}>
      <View
        style={[
          styles.bubble,
          item.isBot ? styles.botBubble : styles.userBubble,
          item.status === 'error' && styles.errorBubble,
        ]}
      >
        <Text
          selectable // Chạm giữ để copy (Phần 8.10)
          style={item.isBot ? styles.botText : styles.userText}
        >
          {item.text}
        </Text>
      </View>
      <Text style={styles.time}>{formatTime(item.createdAt)}</Text>

      {item.status === 'error' && (
        <Pressable onPress={handleRetry} style={styles.retryBtn} hitSlop={8}>
          <Text style={styles.retryText}>🔄 Thử lại</Text>
        </Pressable>
      )}
    </View>
  );

  /** Trạng thái rỗng: gợi ý sẵn câu hỏi để user biết hỏi gì (Phần 8.10). */
  const renderSuggestions = () => (
    <View style={styles.suggestBox}>
      <Text style={styles.suggestTitle}>Gợi ý cho bạn:</Text>
      <View style={styles.chipRow}>
        {AI_SUGGESTIONS.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => handleSend(s)} disabled={isTyping}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const canSend = inputText.trim().length > 0 && !isTyping;

  return (
    // KeyboardAvoidingView — chống bàn phím che khung Chat (Android đang bật edge-to-edge nên cũng cần)
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <View style={styles.statusBar}>
        <View style={[styles.dot, isTyping && styles.dotTyping]} />
        <Text style={styles.statusText}>
          Nhân viên AI (Gemini) · {isTyping ? 'Đang soạn tin...' : 'Đang hoạt động'}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={scrollToEnd}
        keyboardShouldPersistTaps="handled" // Bấm chip gợi ý được cả khi bàn phím đang mở
        ListFooterComponent={
          <>
            {/* Chỉ hiện gợi ý khi user chưa hỏi câu nào (mới có câu chào) */}
            {messages.length <= 1 && renderSuggestions()}
            {/* Typing indicator (Phần 8.10) */}
            {isTyping && (
              <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={COLORS.textLight} />
                <Text style={styles.typingText}>  Trợ lý đang soạn tin...</Text>
              </View>
            )}
          </>
        }
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập câu hỏi tư vấn..."
          placeholderTextColor={COLORS.textLight}
          maxLength={500} // Chặn dán cả cuốn tiểu thuyết (Phần 8.11, chiến lược #2)
          editable={!isTyping} // Khoá ô nhập khi đang chờ AI
          multiline
        />
        <ShopButton
          title="Gửi"
          onPress={() => handleSend()}
          isLoading={isTyping}
          disabled={!canSend} // Ô rỗng hoặc đang chờ -> nút mờ, không bấm được
          style={canSend ? styles.sendBtn : { ...styles.sendBtn, ...styles.sendBtnDisabled }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 6 },
  dotTyping: { backgroundColor: COLORS.warning },
  statusText: { fontSize: 12, color: COLORS.textLight },

  listContent: { padding: SIZES.padding, flexGrow: 1 },
  rowBot: { alignItems: 'flex-start', marginBottom: 10 },
  rowUser: { alignItems: 'flex-end', marginBottom: 10 },

  bubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, maxWidth: '80%' },
  botBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  errorBubble: { backgroundColor: '#FFF1F0', borderWidth: 1, borderColor: COLORS.error },
  botText: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  userText: { color: COLORS.textInverse, fontSize: 15, lineHeight: 21 },
  time: { fontSize: 11, color: COLORS.textLight, marginTop: 3, marginHorizontal: 4 },

  typingBubble: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  typingText: { color: COLORS.textLight, fontSize: 13 },

  retryBtn: { marginTop: 4, paddingHorizontal: 4 },
  retryText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },

  suggestBox: { marginTop: 8, marginBottom: 16 },
  suggestTitle: { fontSize: 13, color: COLORS.textLight, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
  },
  chipText: { color: COLORS.primary, fontSize: 13 },

  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 10,
    color: COLORS.text,
  },
  sendBtn: { width: 72, height: 40 },
  sendBtnDisabled: { opacity: 0.5 },
});
