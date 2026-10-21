import { useThemedStyles } from '@hooks/useThemedStyles';
﻿// src/screens/HomeScreen.tsx
// Chương 2, 3, 4, 5, 6 & 7: Trang chủ ShopAI — 3 trạng thái UI thật (loading/data/error),
// phÃ¢n trang vÃ´ háº¡n (React Query), Dark Mode, Äa ngÃ´n ngá»¯, Countdown, FlashList, GPS, Scanner
import {
  getCrashlytics,
  setAttribute,
  crash,
} from '@react-native-firebase/crashlytics';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, RefreshControl, ActivityIndicator, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import loadingAnimation from '@assets/lottie/loading-pulse.json';
import ProductCard from '@components/ProductCard';
import ShopButton from '@components/ShopButton';
import LocationBadge from '@components/LocationBadge';
import { Product } from '@data/mockProducts';
import { COLORS, SIZES } from '@constants/theme';
import { useTheme } from '@contexts/ThemeContext';
import { useCountdown } from '@hooks/useCountdown';
import { useInfiniteProductsQuery } from '@hooks/useProductsQuery';
import type { HomeStackParamList } from '@navigation/HomeStackNavigator';
import { apiErrorMessage } from '@services/api';


type HomeNavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

interface HomeScreenProps {
  onLogout: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const styles = useThemedStyles(baseStyles);
  const navigation = useNavigation<HomeNavProp>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { formatted: countdownText } = useCountdown(2 * 60 * 60); // Flash sale 2 giá»

  React.useEffect(() => {
    const crashlyticsInstance = getCrashlytics();

    setAttribute(
      crashlyticsInstance,
      'shopai_crashlytics_test',
      'initialized',
    )
      .then(() => console.log('[Crashlytics] SDK initialized'))
      .catch((error: unknown) => {
        console.error(
          '[Crashlytics] Initialization check failed:',
          error,
        );
      });
  }, []);


  // Chương 2 (3 trạng thái UI) + Chương 6.5/6.8 (React Query + phân trang vô hạn)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProductsQuery();

  const products: Product[] = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi');
  };

  const handleProductPress = (productId: string) => {
    // Chỉ gửi duy nhất ID qua params (Chương 5.3)
    navigation.navigate('ProductDetail', { productId });
  };

  const dynamicStyles = {
    safeArea: { backgroundColor: colors.background },
    header: { backgroundColor: colors.surface, borderColor: colors.border },
    headerSub: { color: colors.textLight },
    sectionTitle: { color: colors.text },
  };

  // ===== Trạng thái Loading (lần tải đầu tiên) =====
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
        <View style={styles.centerState}>
          {/* Chương 3.7: Hiệu ứng Lottie khi loading */}
          <LottieView source={loadingAnimation} autoPlay loop style={styles.lottieLoading} />
          <Text style={[styles.centerStateText, { color: colors.textLight }]}>{t('home.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===== Trạng thái Error =====
  if (isError) {
    return (
      <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
        <View style={styles.centerState}>
          <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>{t('home.errorTitle')}</Text>
          <Text style={[styles.errorDetail, { color: colors.textLight }]}>
            {apiErrorMessage(error)}
          </Text>
          <ShopButton title={t('home.retry')} onPress={() => refetch()} style={styles.retryBtn} />
        </View>
      </SafeAreaView>
    );
  }

  // ===== Trạng thái Data =====
  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header vá»›i thÆ°Æ¡ng hiá»‡u, nÃºt Dark Mode, NgÃ´n ngá»¯, Wishlist, QuÃ©t mÃ£, ÄÄƒng xuáº¥t */}
        <View style={[styles.header, dynamicStyles.header]}>
          <View>
            <Text style={styles.headerLogo}>{t('home.brand')}</Text>
            <Text style={[styles.headerSub, dynamicStyles.headerSub]}>{t('home.welcome')}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconToggle} onPress={toggleTheme} hitSlop={6}>
              <Text style={styles.iconToggleText}>{isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}</Text>
            </Pressable>
            <Pressable style={styles.iconToggle} onPress={toggleLanguage} hitSlop={6}>
              <Text style={styles.langToggleText}>{i18n.language === 'vi' ? 'VI' : 'EN'}</Text>
            </Pressable>
            <Pressable style={styles.iconToggle} onPress={() => navigation.navigate('Wishlist')} hitSlop={6}>
              <Text style={styles.iconToggleText}>{'\u2764\uFE0F'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {/* Chương 8: mở Nhân viên tư vấn AI */}
          <ShopButton
            title="Hỏi AI"
            onPress={() => navigation.navigate('AIChat')}
            style={styles.actionBtn}
          />
          <ShopButton
            title={`${t('home.scan')} 📷`}
            onPress={() => navigation.navigate('Scanner')}
            style={styles.actionBtn}
            variant="outline"
          />
          <ShopButton
            title="Redux"
            onPress={() => navigation.navigate('ReduxCartDemo')}
            style={styles.actionBtn}
            variant="outline"
          />
          <ShopButton
            title="React Query"
            onPress={() => navigation.navigate('ReactQueryDemo')}
            style={styles.actionBtn}
            variant="outline"
          />
          <ShopButton
            title={t('home.logout')}
            onPress={onLogout}
            style={styles.actionBtn}
            variant="outline"
          />
          {__DEV__ && (
          <Pressable
            onPress={() => {
              Alert.alert(
                'Kiểm tra Crashlytics',
                'Bạn có muốn thực hiện crash thử nghiệm không?',
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Crash thử',
                    style: 'destructive',
                    onPress: () => {
                      console.log('[Crashlytics] Crash callback entered');

                      Alert.alert(
                        'Đã vào callback',
                        'Nếu thấy hộp thoại này, thao tác Crash thử đã được nhận.',
                        [
                          {
                            text: 'Tiếp tục crash',
                            onPress: () => {
                              console.log('[Crashlytics] Calling native crash');
                              crash(getCrashlytics());
                            },
                          },
                        ],
                      );
                    },
                  },
                ],
              );
            }}
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 8,
              backgroundColor: '#B91C1C',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
              Test Crashlytics
            </Text>
          </Pressable>
        )}
        </View>

        {/* Widget GPS Geolocation tính phí vận chuyển tự động (Chương 7) */}
        <LocationBadge />

        {/* Banner khuyến mãi + Countdown (Custom Hook useCountdown - Chương 3) */}
        <View style={styles.banner}>
          <Text style={styles.bannerBadge}>HOT DEAL 🔥</Text>
          <Text style={styles.bannerTitle}>Siêu Hội Mua Sắm ShopAI</Text>
          <Text style={styles.bannerSub}>
            {t('home.flashSale')}: <Text style={styles.countdownText}>{countdownText}</Text>
          </Text>
        </View>

        {/* Danh sách sản phẩm 2 cột bằng FlashList + Phân trang vô hạn (Chương 4 & 6.8) */}
        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            {t('home.featured')} ({products.length})
          </Text>
          <FlashList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Pressable
                style={styles.productPressable}
                onPress={() => handleProductPress(item.id)}
              >
                <ProductCard product={item} index={index} />
              </Pressable>
            )}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => { refetch(); }}
                colors={[COLORS.primary]}
              />
            }
            onEndReachedThreshold={0.4}
            ListEmptyComponent={<Text style={[styles.centerStateText, { color: colors.text }]}>Chưa có sản phẩm nào.</Text>}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.footerLoadingText}>{t('home.loadMore')}</Text>
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const baseStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 1.5,
  },
  centerStateText: {
    marginTop: SIZES.md,
    fontSize: SIZES.body1,
    color: COLORS.textLight,
  },
  lottieLoading: {
    width: 120,
    height: 120,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  retryBtn: {
    minWidth: 160,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconToggleText: {
    fontSize: 16,
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.sm,
  },
  actionBtn: {
    height: 34,
    paddingHorizontal: 10,
  },
  banner: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.sm,
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: '#1A1A2E',
    borderRadius: SIZES.radius,
  },
  bannerBadge: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bannerSub: {
    color: '#B0B0C0',
    fontSize: 13,
  },
  countdownText: {
    color: '#FFD700',
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SIZES.sm,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SIZES.sm,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  productPressable: {
    flex: 1,
  },
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    gap: 8,
  },
  footerLoadingText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
});

export default HomeScreen;
