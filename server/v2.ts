import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import prisma from './prisma';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "https://biggestlogs-v2-frontend.onrender.com",
  "https://biggestlogs.vercel.app",
  "http://localhost:3000"
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

// Auth Middleware
const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  let userId = req.headers['x-user-id'] as string;
  const authHeader = req.headers['authorization'];

  if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'biggestlogs_secret_key_2026');
      userId = decoded.id;
    } catch (error) {
      console.error("JWT_VERIFY_ERR", error);
    }
  }

  if (!userId) return res.status(401).json({ message: 'Unauthorized: No User ID provided' });
  
  if (!isValidObjectId(userId)) {
      console.error("INVALID_OBJECT_ID:", userId);
      return res.status(401).json({ message: 'Unauthorized: Invalid User ID format' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ message: 'User not found in v2 database' });
    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH_DB_ERR:", error);
    res.status(500).json({ message: "Internal server error during authentication" });
  }
};

// TLogs API Config
const TLOGS_API_KEY = process.env.TLOGS_API_KEY;
const TLOGS_BASE_URL = process.env.TLOGS_BASE_URL || "https://tlogsmarketplace.com/api";
const tlogsApi = axios.create({ baseURL: TLOGS_BASE_URL });

async function getPricingConfig() {
  try {
    const markupSetting = await prisma.setting.findUnique({ where: { key: "MARKUP_PERCENTAGE" } });
    const markupMultiplier = markupSetting ? parseFloat(markupSetting.value) / 100 : 5;
    const conversionRate = parseFloat(process.env.VND_TO_NGN_RATE || "0.06");
    return { markupMultiplier, conversionRate };
  } catch (e) {
    console.warn("PRICING_CONFIG_FALLBACK: Using defaults");
    return { markupMultiplier: 5, conversionRate: 0.06 };
  }
}

// ─── API Routes ─────────────────────────────────────────────────────────────

app.get('/api/ping', (req, res) => res.json({ status: 'v2-online', time: new Date() }));

// 1. Services / Marketplace (V2 Format)
app.get('/api/services', async (req, res) => {
  try {
    if (!TLOGS_API_KEY) throw new Error("TLOGS_API_KEY is missing");
    
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
        stock: parseInt(p.amount || 0),
        description: p.description || ""
      };
    });
    res.json(normalized);
  } catch (error: any) {
    console.error("SERVICES_ERR:", error.message);
    res.status(500).json({ message: "Marketplace unavailable", details: error.message });
  }
});

// 2. User Profile
app.get('/api/user/profile', authMiddleware, async (req: any, res) => {
  res.json({ ...req.user, _id: req.user.id, isAdmin: req.user.role === 'ADMIN' });
});

// 3. User Profile (V1 Alias)
app.get('/api/users/profile', authMiddleware, async (req: any, res) => {
    res.json({ ...req.user, _id: req.user.id, isAdmin: req.user.role === 'ADMIN' });
});

// 4. Accounts (V1 Compatibility)
app.get('/api/accounts', async (req, res) => {
  try {
    if (!TLOGS_API_KEY) throw new Error("TLOGS_API_KEY is missing");

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
      stock: parseInt(p.amount || 0),
      image: "https://tlogsmarketplace.com/assets/images/product-placeholder.png",
      badges: [p.cat?.toLowerCase()],
      quality: 100
    })));
  } catch (error: any) { 
    console.error("ACCOUNTS_V1_ERR:", error.message);
    res.status(500).json({message: "API Error", error: error.message}); 
  }
});

// Socket.io for Support
io.on('connection', (socket) => {
  socket.on('addUser', ({ userId, isAdmin }) => {
    if (isValidObjectId(userId)) {
        socket.join(userId);
        if (isAdmin) socket.join('admins');
    }
  });
  socket.on('sendMessage', (data) => {
    const { receiverId, isAdmin } = data;
    if (isAdmin) io.to(receiverId).emit('getMessage', data);
    else io.to('admins').emit('getMessage', data);
  });
});

httpServer.listen(PORT, () => console.log(`🚀 BIGGESTLOGSV2 Dedicated Backend running on port ${PORT}`));
