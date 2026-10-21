import { useThemedStyles } from '@hooks/useThemedStyles';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { MOCK_PRODUCTS, Product } from '@data/mockProducts';
import {
  addToCart,
  clearCart,
  removeFromCart,
} from '@store/redux/cartSlice';
import { AppDispatch, RootState } from '@store/redux/store';

const ReduxCartDemoScreen: React.FC = () => {
  const styles = useThemedStyles(baseStyles);
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector((state: RootState) => state.cart.items);

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const handleAdd = (product: Product) => {
    dispatch(addToCart(product));
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>
          {item.price.toLocaleString('vi-VN')} đ
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAdd(item)}
      >
        <Text style={styles.buttonText}>+ Thêm</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redux Toolkit Demo</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Số lượng: {totalQuantity}
        </Text>

        <Text style={styles.summaryText}>
          Tổng tiền: {totalPrice.toLocaleString('vi-VN')} đ
        </Text>
      </View>

      <FlatList
        data={MOCK_PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
      />

      <View style={styles.cartSection}>
        <Text style={styles.sectionTitle}>
          Redux Cart ({items.length} sản phẩm)
        </Text>

        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.cartInfo}>
              <Text style={styles.cartName}>{item.name}</Text>
              <Text>
                SL: {item.quantity} ×{' '}
                {item.price.toLocaleString('vi-VN')} đ
              </Text>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(item.id)}
            >
              <Text style={styles.buttonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => dispatch(clearCart())}
        >
          <Text style={styles.clearText}>Xóa toàn bộ Redux Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },

  summary: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },

  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  list: {
    paddingBottom: 12,
  },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },

  productInfo: {
    flex: 1,
    marginRight: 8,
  },

  productName: {
    fontSize: 15,
    fontWeight: '600',
  },

  price: {
    marginTop: 4,
  },

  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },

  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#dc2626',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  cartSection: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  cartInfo: {
    flex: 1,
    marginRight: 8,
  },

  cartName: {
    fontWeight: '600',
  },

  clearButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#111827',
    alignItems: 'center',
  },

  clearText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ReduxCartDemoScreen;