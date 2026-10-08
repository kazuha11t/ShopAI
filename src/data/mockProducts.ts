// src/data/mockProducts.ts
// Dữ liệu mẫu sản phẩm dùng cho Chương 2, 4, 5
// 20 sản phẩm công nghệ lấy từ CellphoneS (cellphones.com.vn), giá tại thời điểm 24/09/2026

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
  description?: string;
  reviews?: Review[];
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 17 Pro Max 256GB',
    price: 34590000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-17-pro-max_3.jpg',
    category: 'Điện thoại',
    rating: 4.9,
    description: 'iPhone 17 Pro Max 256GB chính hãng, màn hình sắc nét, hiệu năng mạnh mẽ cùng camera chất lượng cao và pin dùng thoải mái cả ngày.',
    reviews: [
      { id: 'r1', author: 'Minh Anh', rating: 5, comment: 'Máy chạy mượt, giao hàng nhanh, đóng gói cẩn thận!', createdAt: '2026-09-01' },
      { id: 'r2', author: 'Quốc Bảo', rating: 4, comment: 'Pin tốt, camera đẹp, giá hơi cao nhưng xứng đáng.', createdAt: '2026-09-10' },
    ],
  },
  {
    id: '2',
    name: 'iPhone 17 256GB',
    price: 28490000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone_17_256gb-3_2.jpg',
    category: 'Điện thoại',
    rating: 4.8,
    description: 'iPhone 17 256GB chính hãng, màn hình sắc nét, hiệu năng mạnh mẽ cùng camera chất lượng cao và pin dùng thoải mái cả ngày.',
  },
  {
    id: '3',
    name: 'POCO X8 Pro Max 12GB 256GB',
    price: 13990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-poco-x8-pro-max_2.jpg',
    category: 'Điện thoại',
    rating: 4.7,
    description: 'POCO X8 Pro Max 12GB 256GB chính hãng, màn hình sắc nét, hiệu năng mạnh mẽ cùng camera chất lượng cao và pin dùng thoải mái cả ngày.',
  },
  {
    id: '4',
    name: 'iPhone 17 Pro 256GB',
    price: 31790000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-17-pro-256-gb.png',
    category: 'Điện thoại',
    rating: 4.8,
    description: 'iPhone 17 Pro 256GB chính hãng, màn hình sắc nét, hiệu năng mạnh mẽ cùng camera chất lượng cao và pin dùng thoải mái cả ngày.',
  },
  {
    id: '5',
    name: 'HONOR Magic V5 16GB 512GB',
    price: 33490000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/h/o/honor-magic-v5_1.jpg',
    category: 'Điện thoại',
    rating: 4.9,
    description: 'HONOR Magic V5 16GB 512GB chính hãng, màn hình sắc nét, hiệu năng mạnh mẽ cùng camera chất lượng cao và pin dùng thoải mái cả ngày.',
  },
  {
    id: '6',
    name: 'Laptop Lenovo IdeaPad Slim 3 14IPH11 83UQ003NVN',
    price: 23590000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_16_63.png',
    category: 'Laptop',
    rating: 4.6,
    description: 'Laptop Lenovo IdeaPad Slim 3 14IPH11 83UQ003NVN chính hãng, cấu hình ổn định cho học tập, làm việc và giải trí, thiết kế hiện đại, bảo hành toàn quốc.',
  },
  {
    id: '7',
    name: 'Laptop Acer Gaming Nitro ProPanel ANV15-52-50VA',
    price: 28990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_975_17.png',
    category: 'Laptop',
    rating: 4.7,
    description: 'Laptop Acer Gaming Nitro ProPanel ANV15-52-50VA chính hãng, cấu hình ổn định cho học tập, làm việc và giải trí, thiết kế hiện đại, bảo hành toàn quốc.',
  },
  {
    id: '8',
    name: 'Laptop Dell 14 DC14250 DC4C5386W',
    price: 26990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_945_33.png',
    category: 'Laptop',
    rating: 4.8,
    description: 'Laptop Dell 14 DC14250 DC4C5386W chính hãng, cấu hình ổn định cho học tập, làm việc và giải trí, thiết kế hiện đại, bảo hành toàn quốc.',
  },
  {
    id: '9',
    name: 'Laptop ASUS TUF Gaming A16 FA607NUQ-RL007W',
    price: 34990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_d_i_9_23.png',
    category: 'Laptop',
    rating: 4.9,
    description: 'Laptop ASUS TUF Gaming A16 FA607NUQ-RL007W chính hãng, cấu hình ổn định cho học tập, làm việc và giải trí, thiết kế hiện đại, bảo hành toàn quốc.',
  },
  {
    id: '10',
    name: 'Laptop Acer Gaming Aspire 7 A715-59G-59RD',
    price: 25990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_1042.png',
    category: 'Laptop',
    rating: 4.6,
    description: 'Laptop Acer Gaming Aspire 7 A715-59G-59RD chính hãng, cấu hình ổn định cho học tập, làm việc và giải trí, thiết kế hiện đại, bảo hành toàn quốc.',
  },
  {
    id: '11',
    name: 'Xiaomi Pad Mini 8GB 256GB',
    price: 13990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-pad-mini.jpg',
    category: 'Máy tính bảng',
    rating: 4.8,
    description: 'Xiaomi Pad Mini 8GB 256GB chính hãng, màn hình lớn tiện lợi cho học tập, xem phim và làm việc di động, thời lượng pin bền bỉ.',
  },
  {
    id: '12',
    name: 'Lenovo Legion Tab Gen 5 12GB 256GB',
    price: 20440000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/e/lenovo-legion-tab-gen-5_1.jpg',
    category: 'Máy tính bảng',
    rating: 4.7,
    description: 'Lenovo Legion Tab Gen 5 12GB 256GB chính hãng, màn hình lớn tiện lợi cho học tập, xem phim và làm việc di động, thời lượng pin bền bỉ.',
  },
  {
    id: '13',
    name: 'Samsung Galaxy Tab S10 FE Wifi 12GB 256GB',
    price: 13190000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/may-tinh-bang-samsung-galaxy-tab-s10-fe.1_1_1.png',
    category: 'Máy tính bảng',
    rating: 4.9,
    description: 'Samsung Galaxy Tab S10 FE Wifi 12GB 256GB chính hãng, màn hình lớn tiện lợi cho học tập, xem phim và làm việc di động, thời lượng pin bền bỉ.',
  },
  {
    id: '14',
    name: 'Samsung Galaxy Tab S10 Lite Wifi 6GB 128GB',
    price: 8490000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/may-tinh-bang-samsung-galaxy-tab-a11-plus-wifi_2.jpg',
    category: 'Máy tính bảng',
    rating: 4.6,
    description: 'Samsung Galaxy Tab S10 Lite Wifi 6GB 128GB chính hãng, màn hình lớn tiện lợi cho học tập, xem phim và làm việc di động, thời lượng pin bền bỉ.',
  },
  {
    id: '15',
    name: 'Tai nghe Bluetooth Apple AirPods Chính hãng Đã kích hoạt bảo hành',
    price: 3490000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/2/_/2_9_46_1_1.jpg',
    category: 'Tai nghe',
    rating: 4.8,
    description: 'Tai nghe Bluetooth Apple AirPods Chính hãng Đã kích hoạt bảo hành chính hãng, âm thanh chất lượng cao, kết nối không dây ổn định và đeo thoải mái trong thời gian dài.',
  },
  {
    id: '16',
    name: 'Tai nghe Bluetooth Apple AirPods Pro 3 2025 Type-C',
    price: 6590000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_111_1_1.png',
    category: 'Tai nghe',
    rating: 4.9,
    description: 'Tai nghe Bluetooth Apple AirPods Pro 3 2025 Type-C chính hãng, âm thanh chất lượng cao, kết nối không dây ổn định và đeo thoải mái trong thời gian dài.',
  },
  {
    id: '17',
    name: 'Tai nghe Bluetooth True Wireless Beats Solo Buds',
    price: 1590000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-beats-solo-buds.png',
    category: 'Tai nghe',
    rating: 4.7,
    description: 'Tai nghe Bluetooth True Wireless Beats Solo Buds chính hãng, âm thanh chất lượng cao, kết nối không dây ổn định và đeo thoải mái trong thời gian dài.',
  },
  {
    id: '18',
    name: 'Tai nghe Sony không dây chống ồn WF-1000XM6',
    price: 7190000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/f/r/frame_430.png',
    category: 'Tai nghe',
    rating: 4.8,
    description: 'Tai nghe Sony không dây chống ồn WF-1000XM6 chính hãng, âm thanh chất lượng cao, kết nối không dây ổn định và đeo thoải mái trong thời gian dài.',
  },
  {
    id: '19',
    name: 'Tai nghe không dây Gaming Sony INZONE Buds',
    price: 3490000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-sony-inzone-buds-spa.png',
    category: 'Tai nghe',
    rating: 4.6,
    description: 'Tai nghe không dây Gaming Sony INZONE Buds chính hãng, âm thanh chất lượng cao, kết nối không dây ổn định và đeo thoải mái trong thời gian dài.',
  },
  {
    id: '20',
    name: 'Tai nghe Bluetooth True Wireless Sony WF-C710N',
    price: 1890000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/o/sony-wf-c7110-0.png',
    category: 'Tai nghe',
    rating: 4.7,
    description: 'Tai nghe Bluetooth True Wireless Sony WF-C710N chính hãng, âm thanh chất lượng cao, kết nối không dây ổn định và đeo thoải mái trong thời gian dài.',
  },
];
