import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: 'DEPOSIT' | 'DEDUCTION' | 'REFUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  paymentRef?: string;
  screenshotUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['DEPOSIT', 'DEDUCTION', 'REFUND'], required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    description: { type: String },
    paymentRef: { type: String },
    screenshotUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
