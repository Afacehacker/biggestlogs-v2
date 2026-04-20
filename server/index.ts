import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from './models/User';
import Log from './models/Log';
import Transaction from './models/Transaction';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  "https://biggestlogs.vercel.app", 
  "https://biggestlogs-v2.vercel.app",
  "http://localhost:3000", 
  "https://biggestlogs-v2-1.onrender.com"
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Auth Middleware
const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  let userId = req.headers['x-user-id'] as string;
  const authHeader = req.headers['authorization'];

  try {
    let authUser = null;
    if (userId) {
      authUser = await User.findById(userId);
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'biggestlogs_secret_key_v2');
      authUser = await User.findById(decoded.id);
    }

    if (!authUser) return res.status(401).json({ message: 'User not found' });
    req.user = authUser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token or unauthorized' });
  }
};

// --- Routes ---
app.get('/', (req, res) => res.send('BIGGESTLOGSV2 Backend Running (MongoDB)'));

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password || '')) {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.NEXTAUTH_SECRET || 'biggestlogs_secret_key_v2');
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, balance: user.balance } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const getPricingConfig = async () => {
  try {
    const conversionRate = parseFloat(process.env.VND_TO_NGN_RATE || "0.06");
    return { markupMultiplier: 5, conversionRate }; // Assuming default markup since setting isn't imported
  } catch (e) {
    return { markupMultiplier: 5, conversionRate: 0.06 };
  }
};

// User Profile
app.get('/api/user/profile', authMiddleware, async (req: any, res) => {
  res.json({ 
    ...req.user.toObject(), 
    id: req.user._id, 
    _id: req.user._id, 
    isAdmin: req.user.role === 'admin' 
  });
});

// User Orders
app.get('/api/user/orders', authMiddleware, async (req: any, res) => {
  try {
    const orders = await Transaction.find({ user: req.user._id, type: 'purchase' }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// User Transactions
app.get('/api/user/transactions', authMiddleware, async (req: any, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Create Order (Marketplace)
app.post('/api/orders', authMiddleware, async (req: any, res) => {
  try {
    const { serviceId } = req.body;
    // Mock implementation for placing an order
    const order = new Transaction({
      user: req.user._id,
      amount: 0, // Should be fetched from service
      type: 'purchase',
      status: 'pending',
      description: `Order for service ${serviceId}`,
    });
    await order.save();
    res.json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order' });
  }
});

// Services (Logs) fetch
app.get('/api/services', async (req, res) => {
  try {
    const TLOGS_API_KEY = process.env.TLOGS_API_KEY;
    if (!TLOGS_API_KEY) throw new Error("TLOGS_API_KEY is missing");
    
    const tlogsApi = axios.create({ baseURL: process.env.TLOGS_BASE_URL || "https://tlogsmarketplace.com/api" });
    const { data } = await tlogsApi.get(`/products.php?api_key=${TLOGS_API_KEY}`);
    let products: any[] = [];
    if (data.categories) {
      data.categories.forEach((cat: any) => {
        if (cat.products) cat.products.forEach((p: any) => products.push({ ...p, category_name: cat.name }));
      });
    }
    const { markupMultiplier, conversionRate } = await getPricingConfig();
    const normalized = products.map((p: any) => {
      const basePrice = parseFloat(p.price || 0) * conversionRate;
      return {
        id: String(p.id || p.product_id),
        name: p.name || p.product_name,
        category: p.category_name || "Other",
        price: basePrice,
        finalPrice: Math.ceil(basePrice * markupMultiplier),
        stock: parseInt(p.stock || 0),
        description: p.description || ""
      };
    });
    res.json(normalized);
  } catch (error: any) {
    console.error("SERVICES_ERR:", error.message);
    res.status(500).json({ message: "Marketplace unavailable", details: error.message });
  }
});

// Accounts (V1 Compatibility)
app.get('/api/accounts', async (req, res) => {
  try {
    const TLOGS_API_KEY = process.env.TLOGS_API_KEY;
    if (!TLOGS_API_KEY) throw new Error("TLOGS_API_KEY is missing");

    const tlogsApi = axios.create({ baseURL: process.env.TLOGS_BASE_URL || "https://tlogsmarketplace.com/api" });
    const { data } = await tlogsApi.get(`/products.php?api_key=${TLOGS_API_KEY}`);
    let products: any[] = [];
    if (data.categories) data.categories.forEach((cat: any) => {
      if (cat.products) products.push(...cat.products.map((p:any) => ({...p, cat: cat.name})));
    });
    const { markupMultiplier, conversionRate } = await getPricingConfig();
    res.json(products.map((p: any) => ({
      id: String(p.id || p.product_id),
      platform: p.cat || "Other",
      type: "Account",
      title: p.name || p.product_name,
      price: Math.ceil(parseFloat(p.price || 0) * conversionRate * markupMultiplier),
      stock: parseInt(p.stock || 0),
      image: "https://tlogsmarketplace.com/assets/images/product-placeholder.png",
      badges: [p.cat?.toLowerCase()],
      quality: 100
    })));
  } catch (error: any) { 
    res.status(500).json({message: "API Error", error: error.message}); 
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

httpServer.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
