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
const io = new Server(httpServer, {
  cors: {
    origin: ["*"], // Allow access from Vercel and local
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
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
    const logs = await Log.find({ status: 'active' });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

httpServer.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
