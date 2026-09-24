import { useQuery } from '@tanstack/react-query';
import { fetchProductsApi } from '@services/api';

export const PRODUCTS_QUERY_KEY = ['products'];

export const useProductsQuery = (page = 1, limit = 6) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, page, limit],
    queryFn: () => fetchProductsApi(page, limit),
  });
};
