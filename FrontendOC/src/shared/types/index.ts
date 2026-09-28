export interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  bio?: string | null
  address?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  avatarUrl?: string | null
  role: 'USER' | 'ADMIN'
}

export interface AuthResponse {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface Category {
  id: number
  categoryName: string
  parentCategoryId: number | null
  description: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  productName: string
  description: string
  price: number
  discountPercentage: number
  salePrice: number
  stockQuantity: number
  category: {
    id: number
    categoryName: string
  }
  size: string
  color: string
  material: string
  image: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  quantity: number
  subtotal: number
}

export interface Cart {
  id: number
  userId: number
  items: CartItem[]
  totalAmount: number
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: number
  orderNumber?: number | null
  userId: number
  orderDate: string
  totalAmount: number
  status: OrderStatus
  shippingAddress: string
  recipientName: string
  recipientEmail: string
  recipientPhone: string
  latitude: number | null
  longitude: number | null
  currency?: string
  paymentTransactionId?: string | null
  items: OrderItem[]
}

export type PaymentCurrency = 'USD' | 'KHR'

export type PaymentQrType = 'MERCHANT' | 'INDIVIDUAL'

export interface PaymentInitiateResponse {
  orderId: number
  qr: string | null
  md5: string | null
  currency: PaymentCurrency
  amount: number
  expiresAt: string
  mock: boolean
  demo: boolean
  /**
   * MERCHANT = corporate KHQR (tag 30) issued against a bank merchant ID.
   * INDIVIDUAL = solo wallet KHQR (tag 29); some payer apps reject these
   * because the receiver is a personal wallet rather than a registered business.
   */
  qrType: PaymentQrType
}

export interface PaymentStatusResponse {
  orderId: number
  status: OrderStatus
  paid: boolean
  currency: PaymentCurrency | null
  amount: number | null
  transactionId: string | null
  /** True when the QR on screen has passed its expiry but may still settle. */
  qrExpired: boolean
  /** Customer-facing explanation when the order is not yet paid. */
  message: string | null
}

export interface Review {
  id: number
  userId: number
  userName: string
  productId: number
  rating: number
  comment: string
  createdAt: string
}

export interface WishlistItem {
  id: number
  product: Product
  addedAt: string
}

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalReviews: number
  totalCustomers: number
}

export interface Coupon {
  id: number
  code: string
  email: string
  userId?: number | null
  discountPercent: number
  maxUsages: number
  usedCount: number
  used: boolean
  usedAt?: string | null
  expiresAt?: string | null
  createdAt: string
}

export interface ErrorResponse {
  status: number
  message: string
  timestamp: string
}
