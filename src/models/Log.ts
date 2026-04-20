import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  content: string[]; // Actual log data
  seller: string;
  status: 'active' | 'sold' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const LogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    content: [{ type: String }],
    seller: { type: String, default: 'Admin' },
    status: { type: String, enum: ['active', 'sold', 'hidden'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
