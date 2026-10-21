import { useThemedStyles } from '@hooks/useThemedStyles';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useProductsQuery } from '@hooks/useProductsQuery';

const ReactQueryDemoScreen = () => {
  const styles = useThemedStyles(baseStyles);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProductsQuery(1, 6);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.status}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Lỗi: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Query Demo</Text>

      <Text style={styles.status}>
        Tổng sản phẩm: {data?.total ?? 0}
      </Text>

      <Text style={styles.status}>
        Đã tải: {data?.data.length ?? 0} sản phẩm
      </Text>

      <Text style={styles.status}>
        {isFetching ? 'Đang cập nhật...' : 'Query đã hoàn tất'}
      </Text>

      <Text style={styles.refresh} onPress={() => refetch()}>
        🔄 Nhấn để refetch
      </Text>

      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.price.toLocaleString('vi-VN')} d</Text>
          </View>
        )}
      />
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  status: {
    marginBottom: 8,
  },
  refresh: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
  },
  item: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  error: {
    fontSize: 16,
  },
});

export default ReactQueryDemoScreen;
