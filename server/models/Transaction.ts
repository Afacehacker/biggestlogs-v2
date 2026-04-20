import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: 'deposit' | 'purchase' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'purchase', 'refund'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
