import React, { useEffect, useMemo, useState } from 'react';
import { SectionList, Text, View, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@constants/environment';
import { productsPageSchema, apiErrorMessage } from '@services/api';
import type { Product } from '@data/mockProducts';
import { useTheme } from '@contexts/ThemeContext';
import ShopButton from '@components/ShopButton';

/** Fetch + cancellation + SectionList exercise, using the real catalog. */
export default function CatalogSectionsScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError('');
    async function load() {
      const result: Product[] = [];
      let page = 1, total = Infinity;
      while (result.length < total) {
        const response = await fetch(`${API_BASE_URL}/products?page=${page++}&limit=100`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Không tải được danh mục (${response.status}).`);
        const parsed = productsPageSchema.parse(await response.json());
        total = parsed.total;
        result.push(...parsed.data);
        if (!parsed.data.length) break;
      }
      if (active) setProducts(result);
    }
    load().catch(e => { if (active) setError(apiErrorMessage(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [attempt]);
  const sections = useMemo(() => {
    const groups = new Map<string, Product[]>();
    products.forEach(p => { const key = p.category ?? 'Sản phẩm'; groups.set(key, [...(groups.get(key) ?? []), p]); });
    return Array.from(groups, ([title, data]) => ({ title, data }));
  }, [products]);
  return <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
    {loading && <ActivityIndicator accessibilityLabel="Đang tải danh mục" />}
    {!!error && <><Text style={{ color: colors.text }}>{error}</Text><ShopButton title="Thử lại" onPress={() => setAttempt(v => v + 1)} /></>}
    <SectionList sections={sections} keyExtractor={item => item.id}
      renderSectionHeader={({ section }) => <Text style={{ color: colors.text, fontWeight: '700', paddingVertical: 16 }}>{section.title}</Text>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Shop', { screen: 'HomeTab', params: { screen: 'ProductDetail', params: { productId: item.id } } })}>
        <Text style={{ color: colors.text, paddingVertical: 12 }}>{item.name}</Text>
      </Pressable>} />
  </View>;
}
