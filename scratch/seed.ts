import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import dbConnect from '../src/lib/mongodb';
import Log from '../src/models/Log';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';

async function seed() {
  await dbConnect();

  // Clear existing
  await Log.deleteMany({});
  await User.deleteMany({});

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  await User.create({
    username: 'admin',
    email: 'admin@biggestlogs.com',
    password: adminPassword,
    balance: 1000000,
    role: 'admin',
  });

  // Create some sample logs
  const sampleLogs = [
    {
      title: 'Premium Netflix Accounts',
      description: 'High-quality Netflix Ultra HD accounts with 1-month warranty.',
      price: 5,
      category: 'Streaming',
      stock: 50,
      content: ['acc1:pass1', 'acc2:pass2'],
    },
    {
      title: 'Verified PayPal Logs',
      description: 'Aged PayPal logs with transaction history and high balance potential.',
      price: 25,
      category: 'Financial',
      stock: 10,
      content: ['ppp1:pass1', 'ppp2:pass2'],
    },
    {
      title: 'RDP - USA High Speed',
      description: 'Windows Server 2022 RDP with 16GB RAM and 1Gbps speed.',
      price: 15,
      category: 'Hosting',
      stock: 20,
      content: ['rdp1:pass1', 'rdp2:pass2'],
    }
  ];

  await Log.insertMany(sampleLogs);

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
