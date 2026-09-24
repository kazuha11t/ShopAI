// src/data/mockProducts.ts
// Dữ liệu mẫu sản phẩm dùng cho Chương 2, 4, 5

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
    name: 'Áo Thun Nam Cotton Oversize',
    price: 250000,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
    category: 'Thời trang nam',
    rating: 4.8,
    description: 'Áo thun phong cách basic oversize thoáng mát, chất vải 100% cotton cao cấp thấm hút mồ hôi tốt.',
    reviews: [
      { id: 'r1', author: 'Minh Anh', rating: 5, comment: 'Vải mát, form đẹp, đúng như hình!', createdAt: '2026-08-01' },
      { id: 'r2', author: 'Quốc Bảo', rating: 4, comment: 'Giao hàng hơi lâu nhưng chất lượng ổn.', createdAt: '2026-08-10' },
    ],
  },
  {
    id: '2',
    name: 'Quần Jeans Slimfit Co Giãn',
    price: 490000,
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=500&q=80',
    category: 'Thời trang nam',
    rating: 4.6,
    description: 'Quần jeans phom dáng slimfit tôn dáng, chất denim co giãn 4 chiều vận động thoải mái cả ngày.',
  },
  {
    id: '3',
    name: 'Giày Sneaker Trắng Năng Động',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
    category: 'Giày dép',
    rating: 4.9,
    description: 'Sneaker phong cách retro minimalism, đế đệm khí êm chân chống trơn trượt hiệu quả.',
  },
  {
    id: '4',
    name: 'Túi Đeo Chéo Canvas Tiện Lợi',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    category: 'Phụ kiện',
    rating: 4.5,
    description: 'Túi vải canvas cao cấp, nhiều ngăn chứa đồ khoa học, kháng nước nhẹ thích hợp đi chơi hay đi học.',
  },
  {
    id: '5',
    name: 'Đồng Hồ Nam Dây Da Cổ Điển',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80',
    category: 'Phụ kiện',
    rating: 4.7,
    description: 'Mặt kính Sapphire chống trầy xước, máy Nhật bền bỉ, dây da bò tự nhiên thanh lịch sang trọng.',
  },
  {
    id: '6',
    name: 'Mũ Lưỡi Trai Thêu Chữ ShopAI',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80',
    category: 'Phụ kiện',
    rating: 4.9,
    description: 'Thiết kế form chuẩn tôn dáng mặt, chất vải kaki mềm thấm hút tốt, khóa kim loại điều chỉnh linh hoạt.',
  },
];
