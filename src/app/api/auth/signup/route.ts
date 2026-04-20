import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password, name } = await req.json();

    // Support both 'username' and 'email' for compatibility
    const userEmail = email || username;

    if (!userEmail || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: name || userEmail.split('@')[0], // Fallback for username
      email: userEmail,
      password: hashedPassword,
      balance: 0,
      role: 'user',
    });

    return NextResponse.json({ message: 'User created successfully', user: { email: user.email, id: user._id } }, { status: 201 });
  } catch (error: any) {
    console.error('SIGNUP_ERROR', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
