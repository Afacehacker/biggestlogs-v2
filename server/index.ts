import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://biggestlogs.vercel.app",
      "https://biggestlogs-v2-frontend.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(cors({
  origin: [
    "https://biggestlogs.vercel.app",
    "https://biggestlogs-v2-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- TLogs External API Logic ---
const TLOGS_API_KEY = process.env.TLOGS_API_KEY;
const TLOGS_BASE_URL = process.env.TLOGS_BASE_URL || "https://tlogsmarketplace.com/api";

const tlogsApi = axios.create({
  baseURL: TLOGS_BASE_URL,
});

async function getServices() {
  try {
    const response = await tlogsApi.get(`/products.php?api_key=${TLOGS_API_KEY}`);
    const data = response.data;
    let products: any[] = [];

    // TLogs API Structure: { categories: [ { name: "...", products: [...] } ] }
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach((cat: any) => {
        if (cat.products && Array.isArray(cat.products)) {
          cat.products.forEach((p: any, idx: number) => {
            if (idx === 0) console.log("PRODUCT_SAMPLE_RAW:", JSON.stringify(p));
            products.push({
              ...p,
              category_name: cat.name
            });
          });
        }
      });
    } else if (Array.isArray(data)) {
      products = data;
    }
    
    // Normalize and Categorize fields
    const normalized = products.map((p: any) => {
      const name = (p.name || p.product_name || p.Name || "Unnamed Product").toUpperCase();
      let category = (p.category_name || p.Category || "Other").toUpperCase();

      // Regroup common categories
      if (name.includes("FACEBOOK") || category.includes("FACEBOOK") || name.startsWith("FB ")) category = "Facebook";
      else if (name.includes("INSTAGRAM") || category.includes("INSTAGRAM") || name.startsWith("IG ")) category = "Instagram";
      else if (name.includes("TIKTOK") || category.includes("TIKTOK")) category = "TikTok";
      else if (name.includes("GOOGLE") || name.includes("GMAIL") || category.includes("GOOGLE")) category = "Google";
      else if (name.includes("TWITTER") || name.includes("X.COM") || category.includes("TWITTER")) category = "Twitter (X)";
      else if (name.includes("NETFLIX") || name.includes("DISNEY") || name.includes("PREMIUM")) category = "Premium Accounts";
      else {
        // Fallback: Title Case the category
        category = category.charAt(0) + category.slice(1).toLowerCase();
      }
      
      return {
        id: p.id || p.product_id || p.ID || String(Math.random()),
        name: p.name || p.product_name || p.Name,
        category: category,
        price: parseFloat(p.price || p.Price || p.cost || 0),
        stock: parseInt(p.stock || p.amount || p.Quantity || p.Stock || p.count || 0),
        description: p.description || p.Description || ""
      };
    });

    // Sort by price ascending
    return normalized.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error("Fetch Services Error:", error);
    return [];
  }
}

// Pricing Helper
async function getPricingConfig() {
  const markupSetting = await prisma.setting.findUnique({
    where: { key: "MARKUP_PERCENTAGE" },
  });
  const markupMultiplier = markupSetting ? parseFloat(markupSetting.value) / 100 : 5;
  const conversionRate = parseFloat(process.env.VND_TO_NGN_RATE || "0.06");
  return { markupMultiplier, conversionRate };
}

// --- Middlewares ---
const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  let userId = req.headers['x-user-id'];
  const authHeader = req.headers['authorization'];

  // If no x-user-id, try extracting from Bearer token (Legacy v1 support)
  if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'biggestlogs_secret_key_2026');
      userId = decoded.id;
    } catch (error) {
      console.error("JWT_VERIFICATION_FAILED:", error);
      // Don't return yet, we'll check userId below
    }
  }

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId as string } });
    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH_MIDDLEWARE_ERROR:", error);
    res.status(500).json({ message: "Auth internal error" });
  }
};

const adminMiddleware = async (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// --- Socket.io Logic ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('addUser', ({ userId, isAdmin }) => {
    socket.join(userId);
    if (isAdmin) socket.join('admins');
    console.log(`User ${userId} joined`);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, isAdmin } = data;
    if (isAdmin) {
      // Admin sending to user
      io.to(receiverId).emit('getMessage', data);
    } else {
      // User sending to admin
      io.to('admins').emit('getMessage', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// --- Routes ---

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.send('BIGGESTLOGS API is running... 🚀');
});

// Health Check
app.get('/api/ping', (req: Request, res: Response) => {
  res.json({ status: 'alive', time: new Date() });
});

// Compatibility Route: /api/accounts (Mapping services to v1 format)
app.get('/api/accounts', async (req: Request, res: Response) => {
  try {
    const services = await getServices();
    const { markupMultiplier, conversionRate } = await getPricingConfig();

    const formatted = services.map((s: any) => ({
      id: s.id,
      platform: s.category, // Map category to platform
      type: "Account",      // Default type
      title: s.name,        // Map name to title
      description: s.description,
      price: Math.ceil(s.price * conversionRate * markupMultiplier),
      stock: s.stock,
      image: "https://tlogsmarketplace.com/assets/images/product-placeholder.png",
      badges: [s.category.toLowerCase()],
      quality: 100
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch accounts" });
  }
});

// 1. Get Services
app.get('/api/services', async (req: Request, res: Response) => {
  try {
    const services = await getServices();
    const { markupMultiplier, conversionRate } = await getPricingConfig();

    const servicesWithMarkup = services.map((service: any) => ({
      ...service,
      basePrice: service.price * conversionRate,
      finalPrice: Math.ceil(service.price * conversionRate * markupMultiplier),
    }));

    res.json(servicesWithMarkup);
  } catch (error) {
    console.error("GET_SERVICES_API_ERROR", error);
    res.status(500).json({ 
      message: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// 2. Place Order
app.post('/api/orders', authMiddleware, async (req: any, res: Response) => {
  try {
    const { serviceId, accountId } = req.body; // accountId is legacy v1 alias
    const idToUse = serviceId || accountId;
    const user = req.user;

    const services = await getServices();
    const service = services.find((s: any) => s.id === idToUse);

    if (!service) return res.status(404).json({ message: "Service/Account not found" });

    const { markupMultiplier, conversionRate } = await getPricingConfig();
    const finalPrice = Math.ceil(service.price * conversionRate * markupMultiplier);

    if (user.balance < finalPrice) return res.status(400).json({ message: "Insufficient balance" });

    const result = await prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: finalPrice } },
      });

      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          serviceName: service.name,
          basePrice: service.price * conversionRate,
          markupPrice: finalPrice,
          amount: finalPrice,
          status: "PENDING",
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: finalPrice,
          type: "DEDUCTION",
          status: "COMPLETED",
          reference: `ORDER-${newOrder.id}`,
        },
      });

      return newOrder;
    });

    // --- CALL REAL TLOGS API FOR PURCHASE ---
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'buyProduct');
      formData.append('id', serviceId); // serviceId is the product ID
      formData.append('amount', '1');
      formData.append('api_key', TLOGS_API_KEY as string);

      const tlogsResponse = await tlogsApi.post('/buy_product', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (tlogsResponse.data.status === 'success') {
        const updatedOrder = await prisma.order.update({
          where: { id: result.id },
          data: { 
            status: "COMPLETED", 
            externalOrderId: tlogsResponse.data.trans_id,
            details: tlogsResponse.data.data // Store the actual logs/data
          }
        });
        res.json({ 
          message: "Order completed successfully", 
          order: updatedOrder 
        });
      } else {
        // If API fails, we should ideally refund or mark as failed for manual review
        await prisma.order.update({
          where: { id: result.id },
          data: { status: "FAILED", details: { error: tlogsResponse.data.msg || "External API Error" } }
        });
        res.status(400).json({ message: tlogsResponse.data.msg || "Marketplace error" });
      }
    } catch (apiError) {
      console.error("TLogs Purchase API Error:", apiError);
      await prisma.order.update({
        where: { id: result.id },
        data: { status: "FAILED", details: { error: "Connection to marketplace failed" } }
      });
      res.status(500).json({ message: "Marketplace connection failed" });
    }
  } catch (error) {
    console.error("PLACE_ORDER_ERROR:", error);
    res.status(500).json({ 
      message: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// 3. User Orders
app.get('/api/user/orders', authMiddleware, async (req: any, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { user: { select: { name: true, email: true } } }, // Populate for v1 compatibility
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders.map((o: any) => ({ ...o, account: { title: o.serviceName, price: o.amount } }))); // Fake populate for v1
});

// Alias for v1 frontend
app.get('/api/orders/myorders', authMiddleware, async (req: any, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

// 3b. User Transactions (Actual data for Wallet)
app.get('/api/user/transactions', authMiddleware, async (req: any, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// --- Legacy Auth Routes (v1 compatibility) ---

app.post('/api/users/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user.id }, 
        process.env.JWT_SECRET || 'biggestlogs_secret_key_2026', 
        { expiresIn: '30d' }
      );

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.role === 'ADMIN',
        role: user.role,
        balance: user.balance,
        token: token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'biggestlogs_secret_key_2026', 
      { expiresIn: '30d' }
    );

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === 'ADMIN',
      role: user.role,
      balance: user.balance,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// 3c. User Profile (Fresh balance)
app.get('/api/user/profile', authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, balance: true, email: true, name: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Alias for v1 frontend
app.get('/api/users/profile', authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, balance: true, email: true, name: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// 4. Admin Data
app.get('/api/admin/data', authMiddleware, adminMiddleware, async (req: any, res: Response) => {
  try {
    const [users, orders, settings, deposits] = await Promise.all([
      prisma.user.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.order.findMany({ 
        take: 50, 
        orderBy: { createdAt: 'desc' }, 
        include: { user: { select: { email: true } } } 
      }),
      prisma.setting.findMany(),
      prisma.deposit.findMany({ 
        take: 50, 
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
      }),
    ]);
  
    const stats = {
      totalUsers: await prisma.user.count(),
      totalOrders: await prisma.order.count(),
      totalRevenue: (orders as any[]).reduce((acc: number, order: any) => acc + (order.status === "COMPLETED" ? order.amount : 0), 0),
      totalPendingDeposits: deposits.filter(d => d.status === "PENDING").length,
    };
  
    const formattedSettings = settings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
  
    res.json({ users, orders, settings: formattedSettings, stats, deposits });
  } catch (error) {
    console.error("ADMIN_DATA_ERROR:", error);
    res.status(500).json({ 
      message: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// 5. User Deposits
app.post('/api/deposits', authMiddleware, upload.single('screenshot'), async (req: any, res: Response) => {
  try {
    const { amount, paymentRef, accountDetails } = req.body;
    const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const deposit = await prisma.deposit.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        paymentRef,
        accountDetails,
        screenshotUrl,
        status: "PENDING",
      }
    });

    res.json({ message: "Deposit request submitted successfully", deposit });
  } catch (error) {
    console.error("Deposit Error:", error);
    res.status(500).json({ 
      message: "Failed to submit deposit", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// 6. Admin Manual Deposits
app.get('/api/admin/deposits', authMiddleware, adminMiddleware, async (req: any, res: Response) => {
  const deposits = await prisma.deposit.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, name: true } } }
  });
  res.json(deposits);
});

app.post('/api/admin/deposits/action', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const { depositId, action } = req.body; // action: APPROVE or REJECT

  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true }
    });

    if (!deposit) return res.status(404).json({ message: "Deposit not found" });
    if (deposit.status !== "PENDING") return res.status(400).json({ message: "Deposit already processed" });

    if (action === "APPROVE") {
      await prisma.$transaction([
        prisma.deposit.update({
          where: { id: depositId },
          data: { status: "APPROVED" }
        }),
        prisma.user.update({
          where: { id: deposit.userId },
          data: { balance: { increment: deposit.amount } }
        }),
        prisma.transaction.create({
          data: {
            userId: deposit.userId,
            amount: deposit.amount,
            type: "DEPOSIT",
            status: "COMPLETED",
            reference: `DEP-APP-${deposit.id}`
          }
        })
      ]);
      res.json({ message: "Deposit approved and balance updated" });
    } else {
      await prisma.deposit.update({
        where: { id: depositId },
        data: { status: "REJECTED" }
      });
      res.json({ message: "Deposit rejected" });
    }
  } catch (error) {
    console.error("DEPOSIT_ACTION_ERROR:", error);
    res.status(500).json({ 
      message: "Error processing deposit action", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// 6. User Management
app.post('/api/admin/users/update', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const { userId, balance, role } = req.body;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { balance: parseFloat(balance), role }
  });
  res.json(user);
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id as string } });
  res.json({ message: "User deleted" });
});

// 5. Admin Settings
app.post('/api/admin/settings', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ message: "Key is required" });
    }
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
    res.json(setting);
  } catch (error) {
    console.error("ADMIN_SETTINGS_POST_ERROR:", error);
    res.status(500).json({ 
      message: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// --- Support System Routes ---

// Create Ticket
app.post('/api/support/tickets', authMiddleware, async (req: any, res: Response) => {
  try {
    const { subject, initialMessage } = req.body;
    const ticket = await prisma.ticket.create({
      data: {
        userId: req.user.id,
        subject,
        messages: {
          create: {
            senderId: req.user.id,
            text: initialMessage,
            isAdmin: false
          }
        }
      }
    });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

// Fetch Tickets (User)
app.get('/api/support/tickets', authMiddleware, async (req: any, res: Response) => {
  const tickets = await prisma.ticket.findMany({
    where: { userId: req.user.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(tickets);
});

// Fetch All Tickets (Admin)
app.get('/api/admin/tickets', authMiddleware, adminMiddleware, async (req: any, res: Response) => {
  const tickets = await prisma.ticket.findMany({
    include: { user: { select: { name: true, email: true } }, messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(tickets);
});

// Send Message
app.post('/api/support/tickets/:ticketId/messages', authMiddleware, async (req: any, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { text, isAdmin } = req.body;
    
    // Check if user owns ticket OR is admin
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: req.user.id,
        text,
        isAdmin: isAdmin === true && req.user.role === 'ADMIN'
      }
    });

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

const serverWrapper = httpServer.listen(PORT, () => {
  console.log(`Express server with Socket.io running on port ${PORT}`);
});

serverWrapper.on('error', (err) => {
  console.error("SERVER_ERROR:", err);
});

