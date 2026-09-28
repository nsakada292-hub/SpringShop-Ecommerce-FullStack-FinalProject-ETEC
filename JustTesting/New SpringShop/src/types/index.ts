export interface Category {
  id: number;
  categoryName: string;
  parentCategoryId: number | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTree {
  [parentName: string]: string[];
}

export interface Product {
  id: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  category: {
    id: number;
    categoryName: string;
  };
  size?: string;
  sizes?: string;
  color?: string;
  material?: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  productPrice?: number;
  quantity: number;
  unitPrice?: number;
  subtotal: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  userId?: number;
  userName?: string;
  orderDate?: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  shippingAddress: any;
  items: OrderItem[];
}

export interface Review {
  id: number;
  userId?: number;
  userName?: string;
  user: {
    id?: number;
    name: string;
    email?: string;
  };
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
  totalCustomers: number;
  totalRevenue: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  recentReviews: Review[];
  revenueChartData: { date: string; revenue: number }[];
  categorySalesData: { category: string; sales: number }[];
  salesData?: { period: string; revenue: number; orders: number }[];
}

export interface StoreSettings {
  shopName: string;
  shopEmail: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  notifyOnNewOrder: boolean;
  notifyOnLowStock: boolean;
  notifyOnNewReview: boolean;
}
