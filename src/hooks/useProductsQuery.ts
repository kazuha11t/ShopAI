import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchProductsApi } from '@services/api';

export const PRODUCTS_QUERY_KEY = ['products'];
const PAGE_SIZE = 6;

export const useProductsQuery = (page = 1, limit = 6) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, page, limit],
    queryFn: () => fetchProductsApi(page, limit),
  });
};

// Chương 6.8: Phân trang thật cho HomeScreen bằng useInfiniteQuery + FlashList onEndReached
export const useInfiniteProductsQuery = () => {
  return useInfiniteQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'infinite'],
    queryFn: ({ pageParam }) => fetchProductsApi(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
};
