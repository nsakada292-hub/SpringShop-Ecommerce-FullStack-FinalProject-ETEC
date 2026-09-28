import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Setup upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage
const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage: storageEngine });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product files
app.use('/uploads/products', express.static(UPLOAD_DIR));

// CORS support for external dev if needed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =================== IN-MEMORY SEEDED DATABASE =================== //

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
  category: { id: number; categoryName: string };
  size?: string;
  color?: string;
  material?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
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

// Seed Users
let users: User[] = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    email: 'customer@springshop.com',
    password: 'password123',
    role: 'USER',
  },
  {
    id: 2,
    name: 'Alexander Ward',
    email: 'admin@springshop.com',
    password: 'admin123',
    role: 'ADMIN',
  },
];

// Seed Categories
let categories: Category[] = [
  {
    id: 1,
    categoryName: "Women's Collection",
    parentCategoryId: null,
    description: 'Contemporary tops, dresses, outerwear and knitwear for women.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    categoryName: "Men's Apparel",
    parentCategoryId: null,
    description: 'Refined shirts, jackets, chinos and smart casuals for men.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    categoryName: 'Shoes & Footwear',
    parentCategoryId: null,
    description: 'Handcrafted leather boots, sneakers and loafers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    categoryName: 'Bags & Accessories',
    parentCategoryId: null,
    description: 'Designer tote bags, leather belts, watches and scarves.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    categoryName: 'Dresses',
    parentCategoryId: 1,
    description: 'Casual summer dresses and evening silhouettes.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    categoryName: 'Outerwear',
    parentCategoryId: 2,
    description: 'Trench coats, wool overcoats and lightweight bombers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Products
let products: Product[] = [
  {
    id: 1,
    productName: 'Olive Linen Chore Jacket',
    description: 'Tailored from breathable European flax linen with utility pockets and horn buttons. Perfect layering piece for all seasons.',
    price: 89.0,
    stockQuantity: 18,
    category: { id: 2, categoryName: "Men's Apparel" },
    size: 'M',
    color: 'Sage Olive',
    material: '100% European Linen',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    productName: 'Pleated A-Line Midi Dress',
    description: 'Airy cotton poplin midi dress featuring sharp accordion pleats, cinched waist, and subtle mother-of-pearl hardware.',
    price: 119.5,
    stockQuantity: 12,
    category: { id: 1, categoryName: "Women's Collection" },
    size: 'S',
    color: 'Pale Matcha',
    material: '98% Organic Cotton, 2% Elastane',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    productName: 'Saddle Leather Crossbody Bag',
    description: 'Vegetable-tanned full-grain leather bag with brass clasp and adjustable shoulder strap. Develops rich patina over time.',
    price: 145.0,
    stockQuantity: 8,
    category: { id: 4, categoryName: 'Bags & Accessories' },
    size: 'One Size',
    color: 'Warm Caramel',
    material: 'Full Grain Tuscan Leather',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    productName: 'Minimalist Leather Derby Shoes',
    description: 'Classic plain-toe derby shoes built with Goodyear welt construction and cushioned leather footbed for all-day comfort.',
    price: 165.0,
    stockQuantity: 14,
    category: { id: 3, categoryName: 'Shoes & Footwear' },
    size: '42 EU / 9 US',
    color: 'Espresso Brown',
    material: 'Calfskin Leather',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    productName: 'Oversized Silk-Blend Blouse',
    description: 'Fluid drape blouse with dropped shoulders, elongated cuffs, and relaxed silhouette. Effortlessly chic for office or dinner.',
    price: 78.0,
    stockQuantity: 22,
    category: { id: 1, categoryName: "Women's Collection" },
    size: 'M',
    color: 'Ivory Cream',
    material: '70% Mulberry Silk, 30% Modal',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    productName: 'Relaxed Tapered Chino Trousers',
    description: 'Mid-weight cotton twill chinos tailored with double front pleats and tapered ankle cuffs. garment-dyed for vintage softness.',
    price: 68.0,
    stockQuantity: 16,
    category: { id: 2, categoryName: "Men's Apparel" },
    size: '32/32',
    color: 'Stone Sand',
    material: '100% Combed Cotton',
    image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    productName: 'Woven Straw Summer Fedora',
    description: 'Hand-woven toquilla straw hat with grosgrain ribbon band. Provides UPF 50+ sun protection with timeless vacation flair.',
    price: 42.0,
    stockQuantity: 25,
    category: { id: 4, categoryName: 'Bags & Accessories' },
    size: 'M/L',
    color: 'Natural Straw',
    material: '100% Natural Straw',
    image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    productName: 'Low-Top Canvas Court Sneakers',
    description: 'Vintage athletic court sneaker with vulcanized rubber sole, organic cotton upper, and cushioned memory foam insole.',
    price: 72.0,
    stockQuantity: 4,
    category: { id: 3, categoryName: 'Shoes & Footwear' },
    size: '41 EU',
    color: 'Off-White / Forest',
    material: 'Organic Cotton Canvas & Natural Gum Rubber',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Cart Items
let cartItems: CartItem[] = [
  { id: 1, cartId: 1, productId: 1, quantity: 1 },
  { id: 2, cartId: 1, productId: 3, quantity: 1 },
];

// Seed Orders
let orders: Order[] = [
  {
    id: 101,
    userId: 1,
    orderDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    totalAmount: 234.0,
    status: 'DELIVERED',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
    items: [
      {
        id: 1,
        orderId: 101,
        productId: 1,
        productName: 'Olive Linen Chore Jacket',
        quantity: 1,
        unitPrice: 89.0,
        subtotal: 89.0,
      },
      {
        id: 2,
        orderId: 101,
        productId: 3,
        productName: 'Saddle Leather Crossbody Bag',
        quantity: 1,
        unitPrice: 145.0,
        subtotal: 145.0,
      },
    ],
  },
  {
    id: 102,
    userId: 1,
    orderDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    totalAmount: 119.5,
    status: 'PENDING',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
    items: [
      {
        id: 3,
        orderId: 102,
        productId: 2,
        productName: 'Pleated A-Line Midi Dress',
        quantity: 1,
        unitPrice: 119.5,
        subtotal: 119.5,
      },
    ],
  },
];

// Seed Reviews
let reviews: Review[] = [
  {
    id: 1,
    userId: 1,
    userName: 'Sarah Jenkins',
    productId: 1,
    rating: 5,
    comment: 'Exceptional jacket! The linen feels very high grade and durable. The fit is true to size and looks great over a crisp t-shirt.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    userName: 'Sarah Jenkins',
    productId: 3,
    rating: 5,
    comment: 'The leather smells wonderful and the stitching is immaculate. Fits my phone, wallet and sunglasses comfortably.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 3,
    userId: 2,
    userName: 'Alexander Ward',
    productId: 2,
    rating: 4,
    comment: 'Pleating is sharp and holds up well after dry cleaning. Soft fabric with great drape.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Helpers
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  // Token format in mock: "token-user-{id}" or decoded
  const match = token.match(/user-(\d+)/);
  if (match) {
    const id = parseInt(match[1], 10);
    return users.find((u) => u.id === id) || null;
  }
  // Default to user 1 if valid token string
  return users[0] || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Full authentication is required to access this resource' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access Denied: Administrator role required' });
  }
  (req as any).user = user;
  next();
}

// =================== AUTH CONTROLLER =================== //

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    password,
    role: 'USER',
  };
  users.push(newUser);

  const token = `token-user-${newUser.id}-${Date.now()}`;
  res.status(200).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = `token-user-${user.id}-${Date.now()}`;
  res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// =================== CATEGORIES CONTROLLER =================== //

app.get('/api/categories', (req: Request, res: Response) => {
  res.json(categories);
});

app.get('/api/categories/top-level', (req: Request, res: Response) => {
  const top = categories.filter((c) => c.parentCategoryId === null);
  res.json(top);
});

app.get('/api/categories/:id/subcategories', (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id, 10);
  const subs = categories.filter((c) => c.parentCategoryId === parentId);
  res.json(subs);
});

app.get('/api/categories/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat);
});

app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  const { categoryName, parentCategoryId, description } = req.body;
  if (!categoryName) return res.status(400).json({ message: 'Category name is required' });

  const newCat: Category = {
    id: categories.length + 1,
    categoryName,
    parentCategoryId: parentCategoryId ? Number(parentCategoryId) : null,
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  categories.push(newCat);
  res.status(200).json(newCat);
});

app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });

  const { categoryName, parentCategoryId, description } = req.body;
  if (categoryName) cat.categoryName = categoryName;
  if (parentCategoryId !== undefined) cat.parentCategoryId = parentCategoryId ? Number(parentCategoryId) : null;
  if (description !== undefined) cat.description = description;
  cat.updatedAt = new Date().toISOString();

  res.json(cat);
});

app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  categories = categories.filter((c) => c.id !== id);
  res.sendStatus(204);
});

// =================== PRODUCTS CONTROLLER =================== //

app.get('/api/products', (req: Request, res: Response) => {
  res.json(products);
});

app.get('/api/products/search', (req: Request, res: Response) => {
  const keyword = String(req.query.keyword || '').toLowerCase();
  const matched = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword) ||
      p.category.categoryName.toLowerCase().includes(keyword)
  );
  res.json(matched);
});

app.get('/api/products/category/:categoryId', (req: Request, res: Response) => {
  const catId = parseInt(req.params.categoryId, 10);
  const matched = products.filter((p) => p.category.id === catId);
  res.json(matched);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const prod = products.find((p) => p.id === id);
  if (!prod) return res.status(404).json({ message: 'Product not found' });
  res.json(prod);
});

app.post('/api/products', upload.single('file'), (req: Request, res: Response) => {
  const { productName, description, price, stockQuantity, categoryId, size, color, material } = req.body;

  const category = categories.find((c) => c.id === Number(categoryId)) || {
    id: Number(categoryId) || 1,
    categoryName: 'Fashion',
  };

  let imageUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
  if (req.file) {
    imageUrl = `/uploads/products/${req.file.filename}`;
  }

  const newProd: Product = {
    id: products.length + 1,
    productName: productName || 'Untitled Product',
    description: description || '',
    price: parseFloat(price) || 0,
    stockQuantity: parseInt(stockQuantity, 10) || 0,
    category: { id: category.id, categoryName: (category as any).categoryName || 'Apparel' },
    size: size || '',
    color: color || '',
    material: material || '',
    image: imageUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.unshift(newProd);
  res.status(200).json(newProd);
});

app.put('/api/products/:id', upload.single('file'), (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const prod = products.find((p) => p.id === id);
  if (!prod) return res.status(404).json({ message: 'Product not found' });

  const { productName, description, price, stockQuantity, categoryId, size, color, material } = req.body;

  if (productName) prod.productName = productName;
  if (description !== undefined) prod.description = description;
  if (price !== undefined) prod.price = parseFloat(price);
  if (stockQuantity !== undefined) prod.stockQuantity = parseInt(stockQuantity, 10);
  if (size !== undefined) prod.size = size;
  if (color !== undefined) prod.color = color;
  if (material !== undefined) prod.material = material;

  if (categoryId) {
    const cat = categories.find((c) => c.id === Number(categoryId));
    if (cat) {
      prod.category = { id: cat.id, categoryName: cat.categoryName };
    }
  }

  if (req.file) {
    prod.image = `/uploads/products/${req.file.filename}`;
  }

  prod.updatedAt = new Date().toISOString();
  res.json(prod);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  products = products.filter((p) => p.id !== id);
  res.sendStatus(204);
});

// =================== CART CONTROLLER =================== //

function getCartResponse(userId: number) {
  const items = cartItems.filter((i) => i.cartId === userId);
  let totalAmount = 0;
  const itemResponses = items.map((item) => {
    const prod = products.find((p) => p.id === item.productId) || {
      id: item.productId,
      productName: 'Product',
      price: 29.99,
    };
    const subtotal = prod.price * item.quantity;
    totalAmount += subtotal;
    return {
      id: item.id,
      productId: prod.id,
      productName: prod.productName,
      productPrice: prod.price,
      quantity: item.quantity,
      subtotal,
    };
  });

  return {
    id: userId,
    userId,
    items: itemResponses,
    totalAmount,
  };
}

app.get('/api/cart', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  res.json(getCartResponse(user.id));
});

app.post('/api/cart/items', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  const existing = cartItems.find((i) => i.cartId === user.id && i.productId === Number(productId));
  if (existing) {
    existing.quantity += qty;
  } else {
    cartItems.push({
      id: cartItems.length + 1,
      cartId: user.id,
      productId: Number(productId),
      quantity: qty,
    });
  }

  res.json(getCartResponse(user.id));
});

app.put('/api/cart/items/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const cartItemId = parseInt(req.params.id, 10);
  const quantity = parseInt(req.query.quantity as string, 10);

  if (isNaN(quantity) || quantity <= 0) {
    cartItems = cartItems.filter((i) => i.id !== cartItemId);
  } else {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (item) item.quantity = quantity;
  }

  res.json(getCartResponse(user.id));
});

app.delete('/api/cart/items/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const cartItemId = parseInt(req.params.id, 10);
  cartItems = cartItems.filter((i) => i.id !== cartItemId);
  res.json(getCartResponse(user.id));
});

app.delete('/api/cart', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  cartItems = cartItems.filter((i) => i.cartId !== user.id);
  res.sendStatus(204);
});

// =================== ORDERS CONTROLLER =================== //

app.post('/api/orders', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { shippingAddress } = req.body;
  const userCartItems = cartItems.filter((i) => i.cartId === user.id);

  if (userCartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  let totalAmount = 0;
  const orderItems: OrderItem[] = [];

  for (const ci of userCartItems) {
    const prod = products.find((p) => p.id === ci.productId);
    if (!prod) continue;
    if (prod.stockQuantity < ci.quantity) {
      return res.status(400).json({ message: `Not enough stock for ${prod.productName}` });
    }
    const subtotal = prod.price * ci.quantity;
    totalAmount += subtotal;
    orderItems.push({
      id: orderItems.length + 1,
      orderId: 0,
      productId: prod.id,
      productName: prod.productName,
      quantity: ci.quantity,
      unitPrice: prod.price,
      subtotal,
    });
    // decrement stock
    prod.stockQuantity -= ci.quantity;
  }

  const newOrder: Order = {
    id: 100 + orders.length + 1,
    userId: user.id,
    orderDate: new Date().toISOString(),
    totalAmount,
    status: 'PENDING',
    shippingAddress: shippingAddress || 'Standard Delivery Address',
    items: orderItems,
  };

  orderItems.forEach((item) => (item.orderId = newOrder.id));
  orders.unshift(newOrder);

  // Clear user cart
  cartItems = cartItems.filter((i) => i.cartId !== user.id);

  res.status(200).json(newOrder);
});

app.get('/api/orders/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const userOrders = orders.filter((o) => o.userId === user.id);
  res.json(userOrders);
});

app.get('/api/orders/all', (req: Request, res: Response) => {
  res.json(orders);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const ord = orders.find((o) => o.id === id);
  if (!ord) return res.status(404).json({ message: 'Order not found' });
  res.json(ord);
});

app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const status = (req.query.status as string || '').toUpperCase();
  const ord = orders.find((o) => o.id === id);
  if (!ord) return res.status(404).json({ message: 'Order not found' });

  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status: ${status}` });
  }

  ord.status = status as any;
  res.json(ord);
});

app.put('/api/orders/:id/cancel', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const ord = orders.find((o) => o.id === id);
  if (!ord) return res.status(404).json({ message: 'Order not found' });

  if (ord.status === 'SHIPPED' || ord.status === 'DELIVERED') {
    return res.status(400).json({ message: 'Cannot cancel an order that has already shipped' });
  }

  // Restore stock
  ord.items.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) prod.stockQuantity += item.quantity;
  });

  ord.status = 'CANCELLED';
  res.sendStatus(204);
});

// =================== REVIEWS CONTROLLER =================== //

app.get('/api/reviews/product/:productId', (req: Request, res: Response) => {
  const prodId = parseInt(req.params.productId, 10);
  const prodReviews = reviews.filter((r) => r.productId === prodId);
  res.json(prodReviews);
});

app.get('/api/reviews/product/:productId/average', (req: Request, res: Response) => {
  const prodId = parseInt(req.params.productId, 10);
  const prodReviews = reviews.filter((r) => r.productId === prodId);
  if (prodReviews.length === 0) return res.json(0.0);
  const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
  res.json(sum / prodReviews.length);
});

app.post('/api/reviews', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { productId, rating, comment } = req.body;

  const existing = reviews.find((r) => r.userId === user.id && r.productId === Number(productId));
  if (existing) {
    return res.status(400).json({ message: 'You already reviewed this product' });
  }

  const numRating = parseInt(rating, 10);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const newReview: Review = {
    id: reviews.length + 1,
    userId: user.id,
    userName: user.name,
    productId: Number(productId),
    rating: numRating,
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };

  reviews.unshift(newReview);
  res.status(200).json(newReview);
});

app.put('/api/reviews/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const id = parseInt(req.params.id, 10);
  const review = reviews.find((r) => r.id === id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.userId !== user.id && user.role !== 'ADMIN') {
    return res.status(400).json({ message: 'You can only edit your own review' });
  }

  const { rating, comment } = req.body;
  if (rating) review.rating = parseInt(rating, 10);
  if (comment !== undefined) review.comment = comment;

  res.json(review);
});

app.delete('/api/reviews/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const id = parseInt(req.params.id, 10);
  const review = reviews.find((r) => r.id === id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.userId !== user.id && user.role !== 'ADMIN') {
    return res.status(400).json({ message: 'You can only delete your own review' });
  }

  reviews = reviews.filter((r) => r.id !== id);
  res.sendStatus(204);
});

// =================== USERS CONTROLLER =================== //

app.get('/api/users/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.put('/api/users/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { name, email } = req.body;

  if (email && email !== user.email) {
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id)) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    user.email = email;
  }
  if (name) user.name = name;

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.put('/api/users/me/password', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { currentPassword, newPassword } = req.body;

  if (user.password !== currentPassword) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  res.sendStatus(204);
});

app.get('/api/users', (req: Request, res: Response) => {
  res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// =================== VITE MIDDLEWARE / STATIC SERVING =================== //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'mpa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/admin')) {
        res.sendFile(path.join(distPath, 'admin.html'));
      } else {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpringShop Application & Spring Boot API Gateway running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
