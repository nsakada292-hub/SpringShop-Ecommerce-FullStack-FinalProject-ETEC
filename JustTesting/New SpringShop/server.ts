import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- In-Memory Seed Data matching Spring Boot Controllers & DTOs ---

interface Category {
  id: number;
  categoryName: string;
  parentCategoryId: number | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
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
  size: string;
  color: string;
  material: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
}

interface Cart {
  id: number;
  userId: number;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  userId: number;
  userName: string;
  orderDate: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  items: OrderItem[];
}

interface Review {
  id: number;
  userId: number;
  userName: string;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  verified: boolean;
  otpCode?: string;
  otpExpiry?: number;
  createdAt: string;
}

interface StoreSettings {
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

// Initial Data
let categories: Category[] = [
  { id: 1, categoryName: 'Women', parentCategoryId: null, description: 'Womenswear and accessories', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 2, categoryName: 'Men', parentCategoryId: null, description: 'Menswear and essentials', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 3, categoryName: 'Beauty', parentCategoryId: null, description: 'Skincare, makeup, and cosmetics', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 4, categoryName: 'Kid', parentCategoryId: null, description: 'Kids and baby essentials', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  // Subcategories
  { id: 5, categoryName: 'Clothes', parentCategoryId: 1, description: 'Dresses, shirts, and skirts', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 6, categoryName: 'Shoes', parentCategoryId: 1, description: 'Heels, flats, and sneakers', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 7, categoryName: 'Accessories', parentCategoryId: 1, description: 'Jewelry, scarves, and belts', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 8, categoryName: 'Clothes', parentCategoryId: 2, description: 'Shirts, trousers, and jackets', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 9, categoryName: 'Shoes', parentCategoryId: 2, description: 'Loafers, sneakers, and boots', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 10, categoryName: 'Accessories', parentCategoryId: 2, description: 'Watches, bags, and ties', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 11, categoryName: 'Skincare', parentCategoryId: 3, description: 'Serums, cleansers, and creams', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 12, categoryName: 'Haircare', parentCategoryId: 3, description: 'Oils, masks, and shampoos', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 13, categoryName: 'Makeup', parentCategoryId: 3, description: 'Lipsticks, foundation, palettes', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 14, categoryName: 'Clothes', parentCategoryId: 4, description: 'Tees, shorts, and rompers', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 15, categoryName: 'Shoes', parentCategoryId: 4, description: 'Sandals and sneakers', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 16, categoryName: 'Toys', parentCategoryId: 4, description: 'Educational and soft plush toys', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
];

let products: Product[] = [
  {
    id: 1,
    productName: 'Linen Oversized Azure Shirt',
    description: 'Breezy lightweight pure organic linen shirt styled with clean mother-of-pearl buttons and tailored relaxed sleeves.',
    price: 68.00,
    stockQuantity: 42,
    categoryId: 5,
    category: { id: 5, categoryName: 'Clothes' },
    size: 'S, M, L, XL',
    color: 'Sky Blue, Clean White, Sage',
    material: '100% French Linen',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T10:00:00',
    updatedAt: '2026-02-10T10:00:00',
  },
  {
    id: 2,
    productName: 'Minimalist Chelsea Ankle Boots',
    description: 'Full-grain Italian calfskin leather ankle boots featuring elastic side gores, pull tabs, and durable crepe rubber soles.',
    price: 145.00,
    stockQuantity: 18,
    categoryId: 6,
    category: { id: 6, categoryName: 'Shoes' },
    size: '37, 38, 39, 40, 41',
    color: 'Obsidian Black, Deep Espresso',
    material: 'Genuine Leather, Natural Crepe',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-12T11:00:00',
    updatedAt: '2026-02-12T11:00:00',
  },
  {
    id: 3,
    productName: 'Botanical Radiance Vitamin C Elixir',
    description: 'Potent concentrated antioxidant facial oil with active 15% THD ascorbate, rosehip oil, and calming camellia seed extract.',
    price: 54.00,
    stockQuantity: 65,
    categoryId: 11,
    category: { id: 11, categoryName: 'Skincare' },
    size: '30ml, 50ml',
    color: 'Golden Amber',
    material: 'Cold-pressed Botanical Oils',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-14T09:30:00',
    updatedAt: '2026-02-14T09:30:00',
  },
  {
    id: 4,
    productName: 'Structured Tailored Wool Blazer',
    description: 'Sharp double-breasted silhouette made from sustainable virgin wool blend with peaked lapels and satin lining.',
    price: 189.00,
    stockQuantity: 14,
    categoryId: 5,
    category: { id: 5, categoryName: 'Clothes' },
    size: 'XS, S, M, L',
    color: 'Midnight Navy, Oat Cream',
    material: '80% Virgin Wool, 20% Recycled Poly',
    image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-15T14:00:00',
    updatedAt: '2026-02-15T14:00:00',
  },
  {
    id: 5,
    productName: 'Men Relaxed Pleated Chinos',
    description: 'Modern tapered trousers with double forward pleats and comfortable organic cotton twill weaving.',
    price: 79.00,
    stockQuantity: 30,
    categoryId: 8,
    category: { id: 8, categoryName: 'Clothes' },
    size: '30, 32, 34, 36',
    color: 'Khaki, Charcoal, Forest Green',
    material: '98% Cotton, 2% Elastane',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-16T12:00:00',
    updatedAt: '2026-02-16T12:00:00',
  },
  {
    id: 6,
    productName: 'Hydrating Ceramide Moisture Cream',
    description: 'Ultra-nourishing barrier repair cream formulated with 5 essential ceramides, hyaluronic acid, and centella asiatica.',
    price: 42.00,
    stockQuantity: 50,
    categoryId: 11,
    category: { id: 11, categoryName: 'Skincare' },
    size: '50ml',
    color: 'Ivory Cream',
    material: 'Cruelty-Free Derm Formulation',
    image: 'https://images.unsplash.com/photo-1608248597359-00994f31620c?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-18T10:00:00',
    updatedAt: '2026-02-18T10:00:00',
  },
  {
    id: 7,
    productName: 'Kids Organic Cotton Stripe Romper',
    description: 'Super-soft breathable combed cotton romper with nickel-free snaps along the inseam for easy changing.',
    price: 32.00,
    stockQuantity: 28,
    categoryId: 14,
    category: { id: 14, categoryName: 'Clothes' },
    size: '3-6M, 6-12M, 12-18M, 2T',
    color: 'Aqua Stripe, Mint Sage',
    material: '100% GOTS Certified Cotton',
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-20T08:00:00',
    updatedAt: '2026-02-20T08:00:00',
  },
  {
    id: 8,
    productName: 'Handcrafted Canvas & Leather Tote',
    description: 'Spacious daily commuter tote with heavyweight waxed canvas, vegetable-tanned leather straps, and an interior laptop sleeve.',
    price: 115.00,
    stockQuantity: 22,
    categoryId: 7,
    category: { id: 7, categoryName: 'Accessories' },
    size: 'One Size',
    color: 'Sand Tan, Olive Night',
    material: '18oz Waxed Cotton, Bridle Leather',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-21T15:30:00',
    updatedAt: '2026-02-21T15:30:00',
  },
  {
    id: 9,
    productName: 'Men Merino Wool Knit Polo',
    description: 'Fine 14-gauge extrafine Australian merino wool polo collar knit with seamless shoulder construction.',
    price: 95.00,
    stockQuantity: 25,
    categoryId: 8,
    category: { id: 8, categoryName: 'Clothes' },
    size: 'S, M, L, XL',
    color: 'Cerulean Blue, Heather Gray, Black',
    material: '100% Merino Wool',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-22T16:00:00',
    updatedAt: '2026-02-22T16:00:00',
  },
  {
    id: 10,
    productName: 'Silk Velvet Matte Lip Stain',
    description: 'Long-wearing non-drying lip pigment with nourishing squalane oil and soft velvet blurring pigments.',
    price: 28.00,
    stockQuantity: 80,
    categoryId: 13,
    category: { id: 13, categoryName: 'Makeup' },
    size: '4.5ml',
    color: 'Crimson Rose, Warm Nude, Berry Glow',
    material: 'Vegan Botanical Formula',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-23T10:15:00',
    updatedAt: '2026-02-23T10:15:00',
  },
  {
    id: 11,
    productName: 'Handmade Wooden Stacking Rainbow',
    description: 'Child-safe sustainable beechwood nesting arches finished in water-based non-toxic pastel plant dyes.',
    price: 38.00,
    stockQuantity: 19,
    categoryId: 16,
    category: { id: 16, categoryName: 'Toys' },
    size: '10 Arches Set',
    color: 'Pastel Meadow',
    material: 'Natural Beechwood',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-24T11:00:00',
    updatedAt: '2026-02-24T11:00:00',
  },
  {
    id: 12,
    productName: 'Men Hand-Stitched Leather Loafers',
    description: 'Classic penny loafers crafted with soft glove leather, padded insoles, and channeled blake-stitch welt construction.',
    price: 155.00,
    stockQuantity: 12,
    categoryId: 9,
    category: { id: 9, categoryName: 'Shoes' },
    size: '40, 41, 42, 43, 44',
    color: 'Burnished Tan, Black Velvet',
    material: 'Full Grain Leather',
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-02-25T13:45:00',
    updatedAt: '2026-02-25T13:45:00',
  }
];

let users: User[] = [
  {
    id: 1,
    name: 'Sophea Admin',
    email: 'admin@springshop.com',
    password: 'Password123!',
    role: 'ADMIN',
    verified: true,
    createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    name: 'Dara Customer',
    email: 'customer@springshop.com',
    password: 'Password123!',
    role: 'USER',
    verified: true,
    createdAt: '2026-01-15T00:00:00',
  },
  {
    id: 3,
    name: 'Chan Vathanaka',
    email: 'chan@example.com',
    password: 'Password123!',
    role: 'USER',
    verified: true,
    createdAt: '2026-02-01T00:00:00',
  },
  {
    id: 4,
    name: 'Bopha Pich',
    email: 'bopha@example.com',
    password: 'Password123!',
    role: 'USER',
    verified: true,
    createdAt: '2026-02-14T00:00:00',
  }
];

let carts: Cart[] = [
  { id: 1, userId: 1 },
  { id: 2, userId: 2 }
];

let cartItems: CartItem[] = [
  { id: 1, cartId: 2, productId: 1, quantity: 1 },
  { id: 2, cartId: 2, productId: 3, quantity: 2 }
];

let wishlists: { [userId: number]: number[] } = {
  2: [1, 3, 4]
};

let orders: Order[] = [
  {
    id: 101,
    userId: 2,
    userName: 'Dara Customer',
    orderDate: '2026-02-20T14:22:00',
    totalAmount: 213.00,
    status: 'DELIVERED',
    shippingAddress: 'Building 12, Preah Norodom Blvd, Phnom Penh',
    items: [
      { id: 1, orderId: 101, productId: 1, productName: 'Linen Oversized Azure Shirt', quantity: 1, unitPrice: 68.00, subtotal: 68.00 },
      { id: 2, orderId: 101, productId: 2, productName: 'Minimalist Chelsea Ankle Boots', quantity: 1, unitPrice: 145.00, subtotal: 145.00 }
    ]
  },
  {
    id: 102,
    userId: 3,
    userName: 'Chan Vathanaka',
    orderDate: '2026-02-24T16:10:00',
    totalAmount: 189.00,
    status: 'SHIPPED',
    shippingAddress: 'Street 310, Boeung Keng Kang 1, Phnom Penh',
    items: [
      { id: 3, orderId: 102, productId: 4, productName: 'Structured Tailored Wool Blazer', quantity: 1, unitPrice: 189.00, subtotal: 189.00 }
    ]
  },
  {
    id: 103,
    userId: 4,
    userName: 'Bopha Pich',
    orderDate: '2026-02-28T09:40:00',
    totalAmount: 110.00,
    status: 'PROCESSING',
    shippingAddress: 'Russian Federation Blvd, Tuol Kouk, Phnom Penh',
    items: [
      { id: 4, orderId: 103, productId: 3, productName: 'Botanical Radiance Vitamin C Elixir', quantity: 1, unitPrice: 54.00, subtotal: 54.00 },
      { id: 5, orderId: 103, productId: 10, productName: 'Silk Velvet Matte Lip Stain', quantity: 2, unitPrice: 28.00, subtotal: 56.00 }
    ]
  }
];

let reviews: Review[] = [
  {
    id: 1,
    userId: 2,
    userName: 'Dara Customer',
    productId: 1,
    rating: 5,
    comment: 'The linen quality is exquisite! Incredible breathability and fits perfectly with the subtle azure gradient.',
    createdAt: '2026-02-21T18:00:00'
  },
  {
    id: 2,
    userId: 3,
    userName: 'Chan Vathanaka',
    productId: 2,
    rating: 5,
    comment: 'Supreme comfort right out of the box. The leather finish is soft and durable.',
    createdAt: '2026-02-22T09:30:00'
  },
  {
    id: 3,
    userId: 4,
    userName: 'Bopha Pich',
    productId: 3,
    rating: 5,
    comment: 'Transformed my morning routine. Hydrates intensely without leaving any greasy residue!',
    createdAt: '2026-02-25T11:15:00'
  },
  {
    id: 4,
    userId: 2,
    userName: 'Dara Customer',
    productId: 4,
    rating: 4,
    comment: 'Very sharp lapel lines. Looks exceptional for meetings and formal occasions.',
    createdAt: '2026-02-26T14:40:00'
  }
];

let storeSettings: StoreSettings = {
  shopName: 'SpringShop',
  shopEmail: 'support@springshop.com',
  phone: '+855 23 888 999',
  address: 'Level 18, Vattanac Capital Tower, Monivong Blvd, Phnom Penh, Cambodia',
  currency: 'USD ($)',
  taxRate: 10,
  freeShippingThreshold: 75,
  notifyOnNewOrder: true,
  notifyOnLowStock: true,
  notifyOnNewReview: true
};

let notifications = [
  { id: 1, type: 'ORDER', title: 'New Order #103', message: 'Bopha Pich placed an order for $110.00', time: '10 mins ago', read: false },
  { id: 2, type: 'STOCK', title: 'Low Stock Alert', message: 'Minimalist Chelsea Ankle Boots is down to 18 units', time: '1 hour ago', read: false },
  { id: 3, type: 'REVIEW', title: 'New 5-Star Review', message: 'Dara Customer reviewed Linen Oversized Azure Shirt', time: '3 hours ago', read: true }
];

// Helper: extract user from Authorization header
function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  // Support both demo token shapes "token-<email>" or standard jwt token string
  const foundUser = users.find(u => token.includes(u.email) || token.startsWith('demo-token-user-' + u.id));
  if (foundUser) return foundUser;
  // Fallback to customer or admin for testing if token provided
  if (token.includes('admin')) return users.find(u => u.role === 'ADMIN') || users[0];
  return users[1] || users[0];
}

// ----------------------------------------------------
// 1. CATEGORY CONTROLLER ENDPOINTS
// ----------------------------------------------------

app.get('/api/categories', (req, res) => {
  const { type } = req.query;
  if (type) {
    const parent = categories.find(c => c.parentCategoryId === null && c.categoryName.toLowerCase() === String(type).toLowerCase());
    if (parent) {
      const subs = categories.filter(c => c.parentCategoryId === parent.id);
      return res.json(subs);
    }
  }
  res.json(categories);
});

app.get('/api/categories/top-level', (req, res) => {
  const topLevel = categories.filter(c => c.parentCategoryId === null);
  res.json(topLevel);
});

app.get('/api/categories/:id', (req, res) => {
  const cat = categories.find(c => c.id === Number(req.params.id));
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat);
});

app.get('/api/categories/:id/subcategories', (req, res) => {
  const subs = categories.filter(c => c.parentCategoryId === Number(req.params.id));
  res.json(subs);
});

app.post('/api/categories', (req, res) => {
  const { categoryName, parentCategoryId, description } = req.body;
  if (!categoryName) return res.status(400).json({ message: 'Category name is required' });
  const newCat: Category = {
    id: Date.now(),
    categoryName,
    parentCategoryId: parentCategoryId ? Number(parentCategoryId) : null,
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  categories.push(newCat);
  res.json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
  const id = Number(req.params.id);
  const cat = categories.find(c => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  const { categoryName, parentCategoryId, description } = req.body;
  if (categoryName) cat.categoryName = categoryName;
  if (parentCategoryId !== undefined) cat.parentCategoryId = parentCategoryId ? Number(parentCategoryId) : null;
  if (description !== undefined) cat.description = description;
  cat.updatedAt = new Date().toISOString();
  res.json(cat);
});

app.delete('/api/categories/:id', (req, res) => {
  const id = Number(req.params.id);
  // Check if products attached
  const hasProducts = products.some(p => p.categoryId === id);
  if (hasProducts) {
    return res.status(400).json({ message: 'Cannot delete category with attached products' });
  }
  categories = categories.filter(c => c.id !== id);
  res.status(204).send();
});

// ----------------------------------------------------
// 2. PRODUCT CONTROLLER ENDPOINTS
// ----------------------------------------------------

app.get('/api/products', (req, res) => {
  const { category, type, search, sortBy, limit } = req.query;
  let result = [...products];

  if (category) {
    const catName = String(category).toLowerCase();
    const parent = categories.find(c => c.parentCategoryId === null && c.categoryName.toLowerCase() === catName);
    if (parent) {
      const childIds = categories.filter(c => c.parentCategoryId === parent.id).map(c => c.id);
      result = result.filter(p => p.categoryId === parent.id || childIds.includes(p.categoryId));
    }
  }

  if (type) {
    const types = String(type).split(',').map(t => t.trim().toLowerCase());
    result = result.filter(p => types.includes(p.category.categoryName.toLowerCase()));
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.categoryName.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (limit) {
    result = result.slice(0, Number(limit));
  }

  res.json(result);
});

app.get('/api/products/search', (req, res) => {
  const keyword = String(req.query.keyword || '').toLowerCase();
  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(keyword) ||
    p.description.toLowerCase().includes(keyword) ||
    p.category.categoryName.toLowerCase().includes(keyword)
  );
  res.json(filtered);
});

app.get('/api/products/category/:categoryId', (req, res) => {
  const catId = Number(req.params.categoryId);
  const filtered = products.filter(p => p.categoryId === catId);
  res.json(filtered);
});

app.get('/api/products/:id', (req, res) => {
  const prod = products.find(p => p.id === Number(req.params.id));
  if (!prod) return res.status(404).json({ message: 'Product not found' });
  res.json(prod);
});

app.post('/api/products', (req, res) => {
  const { productName, description, price, stockQuantity, categoryId, size, color, material, image } = req.body;
  const cat = categories.find(c => c.id === Number(categoryId)) || { id: Number(categoryId) || 1, categoryName: 'Apparel' };

  const newProduct: Product = {
    id: Date.now(),
    productName: productName || 'Untitled Product',
    description: description || '',
    price: Number(price) || 0,
    stockQuantity: Number(stockQuantity) || 0,
    categoryId: Number(categoryId) || 1,
    category: {
      id: cat.id,
      categoryName: cat.categoryName
    },
    size: size || 'S, M, L',
    color: color || 'Default',
    material: material || 'Cotton',
    image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  products.unshift(newProduct);
  notifications.unshift({
    id: Date.now(),
    type: 'STOCK',
    title: 'Product Created',
    message: `Added ${newProduct.productName} with ${newProduct.stockQuantity} in stock`,
    time: 'Just now',
    read: false
  });

  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const prod = products.find(p => p.id === id);
  if (!prod) return res.status(404).json({ message: 'Product not found' });

  const { productName, description, price, stockQuantity, categoryId, size, color, material, image } = req.body;
  if (productName !== undefined) prod.productName = productName;
  if (description !== undefined) prod.description = description;
  if (price !== undefined) prod.price = Number(price);
  if (stockQuantity !== undefined) prod.stockQuantity = Number(stockQuantity);
  if (size !== undefined) prod.size = size;
  if (color !== undefined) prod.color = color;
  if (material !== undefined) prod.material = material;
  if (image) prod.image = image;

  if (categoryId !== undefined) {
    const cat = categories.find(c => c.id === Number(categoryId));
    if (cat) {
      prod.categoryId = cat.id;
      prod.category = { id: cat.id, categoryName: cat.categoryName };
    }
  }
  prod.updatedAt = new Date().toISOString();

  res.json(prod);
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

// ----------------------------------------------------
// 3. CART CONTROLLER ENDPOINTS
// ----------------------------------------------------

function getOrCreateCartForUser(userId: number): Cart {
  let cart = carts.find(c => c.userId === userId);
  if (!cart) {
    cart = { id: Date.now(), userId };
    carts.push(cart);
  }
  return cart;
}

function buildCartResponse(cart: Cart) {
  const items = cartItems.filter(ci => ci.cartId === cart.id);
  let totalAmount = 0;
  const itemResponses = items.map(item => {
    const prod = products.find(p => p.id === item.productId);
    const productPrice = prod ? prod.price : 0;
    const subtotal = productPrice * item.quantity;
    totalAmount += subtotal;
    return {
      id: item.id,
      productId: item.productId,
      productName: prod ? prod.productName : 'Unknown Product',
      productPrice,
      productImage: prod ? prod.image : '',
      quantity: item.quantity,
      subtotal
    };
  });

  return {
    id: cart.id,
    userId: cart.userId,
    items: itemResponses,
    totalAmount
  };
}

app.get('/api/cart', (req, res) => {
  const user = getAuthUser(req) || users[1]; // fallback to Dara Customer
  const cart = getOrCreateCartForUser(user.id);
  res.json(buildCartResponse(cart));
});

app.post('/api/cart/items', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const cart = getOrCreateCartForUser(user.id);
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  const existing = cartItems.find(ci => ci.cartId === cart.id && ci.productId === Number(productId));
  if (existing) {
    existing.quantity += qty;
  } else {
    cartItems.push({
      id: Date.now(),
      cartId: cart.id,
      productId: Number(productId),
      quantity: qty
    });
  }

  res.json(buildCartResponse(cart));
});

app.put('/api/cart/items/:cartItemId', (req, res) => {
  const cartItemId = Number(req.params.cartItemId);
  const quantity = Number(req.query.quantity !== undefined ? req.query.quantity : req.body.quantity);

  const itemIndex = cartItems.findIndex(ci => ci.id === cartItemId);
  if (itemIndex === -1) return res.status(404).json({ message: 'Cart item not found' });

  const cart = carts.find(c => c.id === cartItems[itemIndex].cartId);
  if (quantity <= 0) {
    cartItems.splice(itemIndex, 1);
  } else {
    cartItems[itemIndex].quantity = quantity;
  }

  res.json(cart ? buildCartResponse(cart) : { items: [], totalAmount: 0 });
});

app.delete('/api/cart/items/:cartItemId', (req, res) => {
  const cartItemId = Number(req.params.cartItemId);
  const itemIndex = cartItems.findIndex(ci => ci.id === cartItemId);
  if (itemIndex === -1) return res.status(404).json({ message: 'Cart item not found' });

  const cartId = cartItems[itemIndex].cartId;
  cartItems.splice(itemIndex, 1);
  const cart = carts.find(c => c.id === cartId);
  res.json(cart ? buildCartResponse(cart) : { items: [], totalAmount: 0 });
});

app.delete('/api/cart', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const cart = getOrCreateCartForUser(user.id);
  cartItems = cartItems.filter(ci => ci.cartId !== cart.id);
  res.status(204).send();
});

// ----------------------------------------------------
// 4. WISHLIST API (STOREFRONT LOVE LIST)
// ----------------------------------------------------

app.get('/api/wishlist', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const list = wishlists[user.id] || [];
  const wishedProducts = products.filter(p => list.includes(p.id));
  res.json(wishedProducts);
});

app.post('/api/wishlist/:productId', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const productId = Number(req.params.productId);
  if (!wishlists[user.id]) wishlists[user.id] = [];
  if (!wishlists[user.id].includes(productId)) {
    wishlists[user.id].push(productId);
  }
  const wishedProducts = products.filter(p => wishlists[user.id].includes(p.id));
  res.json(wishedProducts);
});

app.delete('/api/wishlist/:productId', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const productId = Number(req.params.productId);
  if (wishlists[user.id]) {
    wishlists[user.id] = wishlists[user.id].filter(id => id !== productId);
  }
  const wishedProducts = products.filter(p => (wishlists[user.id] || []).includes(p.id));
  res.json(wishedProducts);
});

// ----------------------------------------------------
// 5. ORDER CONTROLLER ENDPOINTS
// ----------------------------------------------------

app.post('/api/orders', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const { shippingAddress } = req.body;
  const cart = getOrCreateCartForUser(user.id);
  const itemsInCart = cartItems.filter(ci => ci.cartId === cart.id);

  if (itemsInCart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Stock check
  for (const item of itemsInCart) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod || prod.stockQuantity < item.quantity) {
      return res.status(400).json({ message: `Not enough stock for ${prod ? prod.productName : 'item'}` });
    }
  }

  let totalAmount = 0;
  const orderItemsList: OrderItem[] = [];

  for (const item of itemsInCart) {
    const prod = products.find(p => p.id === item.productId)!;
    const subtotal = prod.price * item.quantity;
    totalAmount += subtotal;
    prod.stockQuantity -= item.quantity;

    orderItemsList.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      orderId: 0,
      productId: prod.id,
      productName: prod.productName,
      quantity: item.quantity,
      unitPrice: prod.price,
      subtotal
    });
  }

  const newOrder: Order = {
    id: 100 + orders.length + 1,
    userId: user.id,
    userName: user.name,
    orderDate: new Date().toISOString(),
    totalAmount,
    status: 'PENDING',
    shippingAddress: shippingAddress || 'Standard Shipping Address',
    items: orderItemsList
  };

  orderItemsList.forEach(item => { item.orderId = newOrder.id; });
  orders.unshift(newOrder);

  // Clear cart
  cartItems = cartItems.filter(ci => ci.cartId !== cart.id);

  // Notify admin
  notifications.unshift({
    id: Date.now(),
    type: 'ORDER',
    title: `New Order #${newOrder.id}`,
    message: `${user.name} placed order for $${totalAmount.toFixed(2)}`,
    time: 'Just now',
    read: false
  });

  res.json(newOrder);
});

app.get('/api/orders/me', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const myOrders = orders.filter(o => o.userId === user.id);
  res.json(myOrders);
});

app.get('/api/orders/all', (req, res) => {
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.query.status || req.body.status || '').toUpperCase();
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status: ${status}` });
  }

  order.status = status as Order['status'];
  res.json(order);
});

app.put('/api/orders/:id/cancel', (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    return res.status(400).json({ message: 'Cannot cancel an order that has already shipped' });
  }

  order.status = 'CANCELLED';
  res.status(204).send();
});

// ----------------------------------------------------
// 6. REVIEW CONTROLLER ENDPOINTS
// ----------------------------------------------------

app.get('/api/reviews', (req, res) => {
  const { productId, limit } = req.query;
  let resList = [...reviews];
  if (productId) {
    resList = resList.filter(r => r.productId === Number(productId));
  }
  if (limit) {
    resList = resList.slice(0, Number(limit));
  }
  res.json(resList);
});

app.get('/api/reviews/product/:productId', (req, res) => {
  const pid = Number(req.params.productId);
  const pReviews = reviews.filter(r => r.productId === pid);
  res.json(pReviews);
});

app.get('/api/reviews/product/:productId/average', (req, res) => {
  const pid = Number(req.params.productId);
  const pReviews = reviews.filter(r => r.productId === pid);
  if (pReviews.length === 0) return res.json(0.0);
  const sum = pReviews.reduce((acc, r) => acc + r.rating, 0);
  res.json(Number((sum / pReviews.length).toFixed(1)));
});

app.post('/api/reviews', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const { productId, rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const existing = reviews.find(r => r.userId === user.id && r.productId === Number(productId));
  if (existing) {
    return res.status(400).json({ message: 'You already reviewed this product' });
  }

  const newReview: Review = {
    id: Date.now(),
    userId: user.id,
    userName: user.name,
    productId: Number(productId),
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  notifications.unshift({
    id: Date.now(),
    type: 'REVIEW',
    title: 'New Review',
    message: `${user.name} rated product ${rating} stars`,
    time: 'Just now',
    read: false
  });

  res.json(newReview);
});

app.delete('/api/reviews/:id', (req, res) => {
  const id = Number(req.params.id);
  reviews = reviews.filter(r => r.id !== id);
  res.status(204).send();
});

// ----------------------------------------------------
// 7. USER & AUTH CONTROLLER ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: Date.now(),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password,
      role: 'USER',
      verified: false,
      createdAt: new Date().toISOString()
    };
    users.push(user);
  }

  // Generate 6-digit OTP
  const otp = '123456';
  user.otpCode = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  console.log(`[SpringShop Auth] OTP for ${user.email} is: ${otp}`);
  res.json({
    message: `Account registered! Verification code sent to ${email}. (Demo OTP: ${otp})`,
    demoOtp: otp
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const otp = '123456';
  user.otpCode = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  console.log(`[SpringShop Auth] OTP for ${user.email} is: ${otp}`);
  res.json({
    message: `Verification code sent to ${email}. (Demo OTP: ${otp})`,
    demoOtp: otp
  });
});

app.post('/api/auth/send-otp', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  const otp = '123456';
  if (user) {
    user.otpCode = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
  }
  res.json({ message: `Verification code sent to ${email}. (Demo OTP: ${otp})`, demoOtp: otp });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otpCode } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) return res.status(400).json({ message: 'Invalid email or code' });

  if (otpCode !== '123456' && otpCode !== user.otpCode) {
    return res.status(400).json({ message: 'Invalid code. Please check and re-enter.' });
  }

  user.verified = true;
  user.otpCode = undefined;

  const token = `jwt-token-${user.id}-${user.email}-${Date.now()}`;
  const refreshToken = `refresh-token-${user.id}-${Date.now()}`;

  res.json({
    token,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 86400000,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  const otp = '123456';
  if (user) {
    user.otpCode = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
  }
  res.json({ message: `Reset code sent to ${email}. (Demo Code: ${otp})`, demoOtp: otp });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, otpCode, newPassword } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) return res.status(400).json({ message: 'User not found' });
  if (otpCode !== '123456' && otpCode !== user.otpCode) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  user.password = newPassword;
  user.otpCode = undefined;
  res.json({ message: 'Password reset successful. Please log in with your new password.' });
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({
    token: `jwt-refreshed-token-${Date.now()}`,
    refreshToken: `refresh-token-${Date.now()}`,
    tokenType: 'Bearer',
    expiresIn: 86400000
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/users/me', (req, res) => {
  const user = getAuthUser(req) || users[1];
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

app.put('/api/users/me', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

app.put('/api/users/me/password', (req, res) => {
  const user = getAuthUser(req) || users[1];
  const { currentPassword, newPassword } = req.body;
  if (user.password && user.password !== currentPassword) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  res.status(204).send();
});

app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  })));
});

app.patch('/api/users/:id/role', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
  user.role = newRole;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// ----------------------------------------------------
// 8. DASHBOARD STATS & NOTIFICATIONS
// ----------------------------------------------------

app.get('/api/dashboard/stats', (req, res) => {
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalReviews = reviews.length;
  const totalCustomers = users.filter(u => u.role === 'USER').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);

  // Sales data for chart (daily / weekly)
  const salesData = [
    { period: 'Mon', revenue: 420, orders: 4 },
    { period: 'Tue', revenue: 680, orders: 6 },
    { period: 'Wed', revenue: 510, orders: 5 },
    { period: 'Thu', revenue: 890, orders: 9 },
    { period: 'Fri', revenue: 1250, orders: 12 },
    { period: 'Sat', revenue: 1680, orders: 15 },
    { period: 'Sun', revenue: 1420, orders: 13 },
  ];

  res.json({
    totalProducts,
    totalOrders,
    totalReviews,
    totalCustomers,
    totalRevenue,
    salesData,
    recentOrders: orders.slice(0, 5),
    recentReviews: reviews.slice(0, 5)
  });
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.patch('/api/notifications/mark-read', (req, res) => {
  notifications.forEach(n => { n.read = true; });
  res.json({ success: true });
});

// ----------------------------------------------------
// 9. STORE SETTINGS
// ----------------------------------------------------

app.get('/api/settings', (req, res) => {
  res.json(storeSettings);
});

app.put('/api/settings', (req, res) => {
  storeSettings = { ...storeSettings, ...req.body };
  res.json(storeSettings);
});

// ----------------------------------------------------
// Server Start & Vite Middleware Setup
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpringShop Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
