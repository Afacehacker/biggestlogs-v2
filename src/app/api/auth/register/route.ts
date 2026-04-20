import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      balance: 0,
      role: 'user',
    });

    return NextResponse.json({ message: 'User created successfully', user: { username: user.username, id: user._id } }, { status: 201 });
  } catch (error: any) {
    console.error('REGISTER_ERROR', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
