import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';
import ShopButton from '@components/ShopButton';
import { useTheme } from '@contexts/ThemeContext';

export default function UpdatesScreen() {
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const check = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        Alert.alert('Đã cập nhật', 'Bạn đang dùng bản mới nhất của kênh này.');
        return;
      }
      await Updates.fetchUpdateAsync();
      Alert.alert('Bản cập nhật đã sẵn sàng', 'Khởi động lại ứng dụng để áp dụng?', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Khởi động lại', onPress: () => { Updates.reloadAsync().catch(() => Alert.alert('Chưa khởi động lại được', 'Hãy đóng và mở lại ứng dụng.')); } },
      ]);
    } catch {
      Alert.alert('Chưa cập nhật được', 'Kiểm tra kết nối mạng rồi thử lại.');
    } finally { setBusy(false); }
  };
  return <View style={[styles.container, { backgroundColor: colors.background }]}>
    <Text style={[styles.title, { color: colors.text }]}>Cập nhật ShopAI</Text>
    <Text style={{ color: colors.text }}>Phiên bản: {Updates.runtimeVersion ?? 'development'}</Text>
    <Text style={{ color: colors.text }}>Kênh: {Updates.channel ?? 'local'}</Text>
    <Text style={{ color: colors.text }}>Bản đang chạy: {Updates.isEmbeddedLaunch ? 'Bản cài đặt' : 'Bản cập nhật OTA'}</Text>
    {Updates.updateId && <Text selectable style={{ color: colors.textLight }}>Mã bản cập nhật: {Updates.updateId}</Text>}
    <Text style={{ color: colors.textLight }}>{Updates.isEnabled ? 'Bản cập nhật được kiểm tra an toàn theo phiên bản ứng dụng.' : 'Cập nhật OTA hoạt động trên bản release đã cấu hình.'}</Text>
    <ShopButton title="Kiểm tra cập nhật" onPress={check} isLoading={busy} disabled={!Updates.isEnabled} />
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 20 }, title: { fontSize: 24, fontWeight: '700' } });
