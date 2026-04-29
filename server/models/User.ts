import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  password?: string;
  balance: number;
  role: 'USER' | 'ADMIN';
  lastIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    balance: { type: Number, default: 0 },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    lastIp: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
