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
import Setting from './models/Setting';
import Ticket from './models/Ticket';
import mongoose from 'mongoose';
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
// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

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

const adminMiddleware = async (req: any, res: Response, next: NextFunction) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Oga, you no be admin! No enter here." });
  }
  next();
};

const blockedIpSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String, default: 'Blocked by Admin' }
}, { timestamps: true });
const BlockedIP = mongoose.models.BlockedIP || mongoose.model('BlockedIP', blockedIpSchema);

// Check Blocked IP Middleware
app.use(async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip) {
    try {
      const blocked = await BlockedIP.findOne({ ip });
      if (blocked) {
        return res.status(403).json({ message: 'Your IP address has been blocked from accessing this site.' });
      }
    } catch (e) { console.error(e); }
  }
  next();
});

// --- Routes ---
app.get('/', (req, res) => res.send('BIGGESTLOGSV2 Backend Running (MongoDB)'));

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password || '')) {
    // Track IP
    user.lastIp = req.ip || req.connection.remoteAddress;
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.NEXTAUTH_SECRET || 'biggestlogs_secret_key_v2');
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, balance: user.balance } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const getPricingConfig = async () => {
  try {
    const markupSetting = await Setting.findOne({ key: "MARKUP_PERCENTAGE" });
    const markupMultiplier = markupSetting ? parseFloat(markupSetting.value) / 100 : 5;
    const conversionRate = parseFloat(process.env.VND_TO_NGN_RATE || "0.06");
    return { markupMultiplier, conversionRate };
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
    isAdmin: req.user.role === 'ADMIN' 
  });
});

// User Deposits (Manual Proof Submission)
app.post('/api/deposits', authMiddleware, upload.single('screenshot'), async (req: any, res) => {
  try {
    const { amount, paymentRef } = req.body;
    if (!req.file || !amount) {
      return res.status(400).json({ message: "Amount and screenshot are required" });
    }

    const deposit = new Transaction({
      user: req.user._id,
      amount: parseFloat(amount),
      type: 'DEPOSIT',
      status: 'PENDING',
      description: 'Manual Deposit Verification',
      paymentRef,
      screenshotUrl: `/uploads/${req.file.filename}`
    });

    await deposit.save();
    res.json({ message: "Proof submitted sharp-sharp! Admin will check soon." });
  } catch (error: any) {
    res.status(500).json({ message: "Error submitting deposit", error: error.message });
  }
});

// User Orders
app.get('/api/user/orders', authMiddleware, async (req: any, res) => {
  try {
    const orders = await Transaction.find({ user: req.user._id, type: 'DEDUCTION' }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// User Orders

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
    const { serviceId, quantity = 1 } = req.body;
    const qty = parseInt(quantity);
    
    if (isNaN(qty) || qty < 1 || qty > 1000) {
      return res.status(400).json({ message: "Invalid quantity. You can buy between 1 and 1000 pieces." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Omo, we can't find your profile oh!" });

    // 1. Fetch products to get the latest price and check stock
    const TLOGS_API_KEY = process.env.TLOGS_API_KEY;
    const tlogsApi = axios.create({ baseURL: process.env.TLOGS_BASE_URL || "https://tlogsmarketplace.com/api" });
    const { data: productsData } = await tlogsApi.get(`/products.php?api_key=${TLOGS_API_KEY}`);
    
    let targetProduct: any = null;
    if (productsData.categories) {
      productsData.categories.forEach((cat: any) => {
        if (cat.products) {
          const found = cat.products.find((p: any) => String(p.id || p.product_id) === String(serviceId));
          if (found) targetProduct = { ...found, category_name: cat.name };
        }
      });
    }

    if (!targetProduct) return res.status(404).json({ message: "This log don finish or e no dey again!" });
    
    const { markupMultiplier, conversionRate } = await getPricingConfig();
    const basePrice = parseFloat(targetProduct.price || 0) * conversionRate;
    const finalPrice = Math.ceil(basePrice * markupMultiplier);
    const totalPrice = finalPrice * qty;
    const stockAvailable = parseInt(targetProduct.amount || 0);

    if (stockAvailable < qty) return res.status(400).json({ message: `Stock don finish! Only ${stockAvailable} remaining. Reduce quantity.` });

    // 2. Check Balance
    if (user.balance < totalPrice) {
      return res.status(400).json({ 
        message: `Insufficient funds! You need ₦${totalPrice.toLocaleString()}, but your balance na ₦${user.balance.toLocaleString()}. Abeg top up your wallet!` 
      });
    }

    // 3. Call TLogs API to buy the product
    const formData = new URLSearchParams();
    formData.append("action", "buyProduct");
    formData.append("id", serviceId);
    formData.append("amount", String(qty));
    formData.append("api_key", TLOGS_API_KEY as string);

    // Some APIs use buy_product.php, others use buy_product
    // Based on common patterns in these types of sites
    const buyRes = await tlogsApi.post("/buy_product.php", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (buyRes.data?.status !== "success") {
      console.error("TLOGS_BUY_ERR:", buyRes.data);
      return res.status(500).json({ 
        message: "Network issue from source! Abeg try again small time or contact support.",
        details: buyRes.data?.msg 
      });
    }

    const itemDetails = buyRes.data.data || buyRes.data.details || buyRes.data.msg;

    // 4. Deduct Balance and Save Transaction
    user.balance -= totalPrice;
    user.totalSpent = (user.totalSpent || 0) + totalPrice;
    await user.save();

    const order = new Transaction({
      user: user._id,
      amount: totalPrice,
      type: 'DEDUCTION',
      status: 'COMPLETED',
      description: `Purchase: ${targetProduct.name} (x${qty})`,
    });
    await order.save();

    res.json({ 
      message: "Correct! Purchase successful! No stories.", 
      order: { 
        ...order.toObject(), 
        details: itemDetails 
      } 
    });

  } catch (error: any) {
    console.error("ORDER_ERR:", error.message);
    res.status(500).json({ message: 'Error placing order. Network or Server issues.', details: error.message });
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
    const formatProductName = (rawName: string) => {
      let name = rawName;
      
      // Replace country codes
      name = name.replace(/\[VN\]/gi, '(Vietnam)');
      name = name.replace(/\[US\]/gi, '(USA)');
      name = name.replace(/\[UK\]/gi, '(UK)');
      name = name.replace(/\[PH\]/gi, '(Philippines)');
      name = name.replace(/\[ID\]/gi, '(Indonesia)');
      name = name.replace(/\[TH\]/gi, '(Thailand)');
      name = name.replace(/\[BR\]/gi, '(Brazil)');
      
      // Replace common abbreviations
      name = name.replace(/\bBM\b/gi, 'Business Manager');
      name = name.replace(/\bMP\b/gi, 'Marketplace');
      name = name.replace(/\b2FA\b/gi, '2-Factor Auth');
      name = name.replace(/\bAcc\b/gi, 'Account');
      name = name.replace(/\bAccs\b/gi, 'Accounts');
      
      // Clean up symbols and formatting
      name = name.replace(/\|/g, '•'); // Replace pipes with bullets
      name = name.replace(/\s+/g, ' ').trim(); // Fix spacing
      
      // Make sure the first letter is capitalized
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const { markupMultiplier, conversionRate } = await getPricingConfig();
    const normalized = products.map((p: any) => {
      const basePrice = parseFloat(p.price || 0) * conversionRate;
      return {
        id: String(p.id || p.product_id),
        name: formatProductName(p.name || p.product_name),
        category: p.category_name || "Other",
        price: basePrice,
        finalPrice: Math.ceil(basePrice * markupMultiplier),
        stock: parseInt(p.amount || 0),
        description: p.description || ""
      };
    });

    const getPlatformPriority = (name: string, category: string) => {
      const text = `${name} ${category}`.toLowerCase();
      if (text.includes('facebook') || text.match(/\\bfb\\b/)) return 1;
      if (text.includes('instagram') || text.match(/\\big\\b/)) return 2;
      if (text.includes('tiktok')) return 3;
      return 4;
    };

    normalized.sort((a: any, b: any) => {
      const priorityA = getPlatformPriority(a.name, a.category);
      const priorityB = getPlatformPriority(b.name, b.category);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.finalPrice - b.finalPrice;
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
    const formatProductName = (rawName: string) => {
      let name = rawName;
      name = name.replace(/\[VN\]/gi, '(Vietnam)');
      name = name.replace(/\[US\]/gi, '(USA)');
      name = name.replace(/\[UK\]/gi, '(UK)');
      name = name.replace(/\[PH\]/gi, '(Philippines)');
      name = name.replace(/\[ID\]/gi, '(Indonesia)');
      name = name.replace(/\[TH\]/gi, '(Thailand)');
      name = name.replace(/\[BR\]/gi, '(Brazil)');
      name = name.replace(/\bBM\b/gi, 'Business Manager');
      name = name.replace(/\bMP\b/gi, 'Marketplace');
      name = name.replace(/\b2FA\b/gi, '2-Factor Auth');
      name = name.replace(/\bAcc\b/gi, 'Account');
      name = name.replace(/\bAccs\b/gi, 'Accounts');
      name = name.replace(/\|/g, '•');
      name = name.replace(/\s+/g, ' ').trim();
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const { markupMultiplier, conversionRate } = await getPricingConfig();
    const normalized = products.map((p: any) => ({
      id: String(p.id || p.product_id),
      platform: p.cat || "Other",
      type: "Account",
      title: formatProductName(p.name || p.product_name),
      price: Math.ceil(parseFloat(p.price || 0) * conversionRate * markupMultiplier),
      stock: parseInt(p.amount || 0),
      image: "https://tlogsmarketplace.com/assets/images/product-placeholder.png",
      badges: [p.cat?.toLowerCase()],
      quality: 100
    }));

    const getPlatformPriority = (title: string, platform: string) => {
      const text = `${title} ${platform}`.toLowerCase();
      if (text.includes('facebook') || text.match(/\\bfb\\b/)) return 1;
      if (text.includes('instagram') || text.match(/\\big\\b/)) return 2;
      if (text.includes('tiktok')) return 3;
      return 4;
    };

    normalized.sort((a: any, b: any) => {
      const priorityA = getPlatformPriority(a.title, a.platform);
      const priorityB = getPlatformPriority(b.title, b.platform);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.price - b.price;
    });

    res.json(normalized);
  } catch (error: any) { 
    res.status(500).json({message: "API Error", error: error.message}); 
  }
});

// --- Admin Routes ---

app.get('/api/admin/data', [authMiddleware, adminMiddleware], async (req: any, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const orders = await Transaction.find({ type: 'DEDUCTION' }).populate('user').sort({ createdAt: -1 });
    const deposits = await Transaction.find({ type: 'DEPOSIT' }).populate('user').sort({ createdAt: -1 });
    const settingsList = await Setting.find();
    
    // Map settings to and object for easier consumption
    const settings: any = {};
    settingsList.forEach(s => settings[s.key] = s.value);

    const stats = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalPendingDeposits: deposits.filter(d => d.status === 'PENDING').length,
    };

    res.json({
      users: users.map(u => ({ id: u._id, name: u.username, email: u.email, balance: u.balance, role: u.role })),
      orders: orders.map(o => ({
        id: o._id,
        serviceName: o.description.replace('Purchase: ', ''),
        user: { email: (o.user as any)?.email || 'Unknown' },
        status: o.status.toUpperCase(),
        amount: o.amount,
        basePrice: Math.ceil(o.amount / 5), // Rough estimation if not stored
        createdAt: o.createdAt
      })),
      deposits: deposits.map(d => ({
        id: d._id,
        user: { email: (d.user as any)?.email || 'Unknown' },
        amount: d.amount,
        status: d.status.toUpperCase(),
        paymentRef: d.paymentRef,
        screenshotUrl: d.screenshotUrl,
        createdAt: d.createdAt
      })),
      stats,
      settings
    });
  } catch (error: any) {
    res.status(500).json({ message: "Admin data error", details: error.message });
  }
});

app.post('/api/admin/settings', [authMiddleware, adminMiddleware], async (req: any, res: Response) => {
  try {
    const { key, value } = req.body;
    await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
    res.json({ message: "Settings updated sharp-sharp!" });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating settings" });
  }
});

// Settings API for Frontend
app.get('/api/settings', async (req: any, res: Response) => {
  try {
    const settingsList = await Setting.find();
    const settings: any = {
      bankName: 'Rubies Microfinance Bank',
      accountName: 'Afeez Salaudeen',
      accountNumber: '8025329616',
      telegramLink: 'https://t.me/boostnaija1'
    };
    
    settingsList.forEach(s => {
      settings[s.key] = s.value;
    });
    
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching settings" });
  }
});

app.put('/api/settings', [authMiddleware, adminMiddleware], async (req: any, res: Response) => {
  try {
    const { bankName, accountName, accountNumber, telegramLink } = req.body;
    
    if (bankName !== undefined) await Setting.findOneAndUpdate({ key: 'bankName' }, { value: bankName }, { upsert: true });
    if (accountName !== undefined) await Setting.findOneAndUpdate({ key: 'accountName' }, { value: accountName }, { upsert: true });
    if (accountNumber !== undefined) await Setting.findOneAndUpdate({ key: 'accountNumber' }, { value: accountNumber }, { upsert: true });
    if (telegramLink !== undefined) await Setting.findOneAndUpdate({ key: 'telegramLink' }, { value: telegramLink }, { upsert: true });
    
    res.json({ message: "Settings updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating settings" });
  }
});

app.post('/api/admin/users/update', [authMiddleware, adminMiddleware], async (req: any, res: Response) => {
  try {
    const { userId, balance, role } = req.body;
    await User.findByIdAndUpdate(userId, { balance: parseFloat(balance), role });
    res.json({ message: "User updated successfully. Omo, balance don change!" });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating user" });
  }
});

app.delete('/api/admin/users/:id', [authMiddleware, adminMiddleware], async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { blockIp } = req.query;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (blockIp === 'true' && user.lastIp) {
        await BlockedIP.findOneAndUpdate(
            { ip: user.lastIp }, 
            { reason: `Blocked when deleting user ${user.email}` }, 
            { upsert: true }
        );
    }
    
    await User.findByIdAndDelete(id);
    res.json({ message: "User don clear! Deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

app.post('/api/admin/deposits/action', [authMiddleware, adminMiddleware], async (req: any, res: Response) => {
  try {
    const { depositId, action } = req.body;
    const deposit = await Transaction.findById(depositId).populate('user');
    
    if (!deposit || deposit.type !== 'DEPOSIT') return res.status(404).json({ message: "Deposit not found" });
    if (deposit.status !== 'PENDING') return res.status(400).json({ message: "This one don finish already." });

    if (action === 'APPROVE') {
      deposit.status = 'COMPLETED';
      const user = await User.findById(deposit.user);
      if (user) {
        user.balance += deposit.amount;
        await user.save();
      }
    } else {
      deposit.status = 'FAILED';
    }

    await deposit.save();
    res.json({ message: `Deposit ${action === 'APPROVE' ? 'Approved' : 'Rejected'} sharp-sharp!` });
  } catch (error: any) {
    res.status(500).json({ message: "Error processing deposit action" });
  }
});

// --- Existing Routes Continued ---
// --- Admin Routes Continued ---

app.get('/api/admin/tickets', [authMiddleware, adminMiddleware], async (req: any, res: Response) => {
  try {
    const tickets = await Ticket.find().populate('user').sort({ updatedAt: -1 });
    res.json(tickets.map(t => ({
      id: t._id,
      user: { name: (t.user as any)?.username, email: (t.user as any)?.email },
      subject: t.subject,
      status: t.status,
      updatedAt: t.updatedAt,
      messages: t.messages.map((m: any) => ({ ...m, id: m._id }))
    })));
  } catch (error: any) {
    res.status(500).json({ message: "Admin tickets error" });
  }
});

app.post('/api/support/tickets/:id/messages', [authMiddleware], async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { text, isAdmin } = req.body;
    const ticket = await Ticket.findById(id);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.messages.push({ text, isAdmin: !!isAdmin, createdAt: new Date() });
    await ticket.save();

    res.json({ message: "Message sent sharp-sharp!" });
  } catch (error: any) {
    res.status(500).json({ message: "Error sending message" });
  }
});

// User Support Routes
app.post('/api/support/tickets', authMiddleware, async (req: any, res: Response) => {
  try {
    const { subject, message } = req.body;
    const ticket = new Ticket({
      user: req.user._id,
      subject,
      messages: [{ text: message, isAdmin: false, createdAt: new Date() }]
    });
    await ticket.save();
    res.json({ message: "Ticket created! We go follow you talk soon.", ticketId: ticket._id });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating ticket" });
  }
});

app.get('/api/user/tickets', authMiddleware, async (req: any, res: Response) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

httpServer.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
