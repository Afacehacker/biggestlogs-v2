const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = "mongodb+srv://gideontanomare_db_user:7UeAl7iHGCGv0lVd@cluster0.mxgsl2k.mongodb.net/biggestlogs_v2?retryWrites=true&w=majority&appName=Cluster0";

const TransactionSchema = new mongoose.Schema({
  type: String,
  status: String
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

async function migrateTransactions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Migration");

    // Migrate Types
    const depositUpdate = await Transaction.updateMany({ type: 'deposit' }, { $set: { type: 'DEPOSIT' } });
    console.log(`Updated ${depositUpdate.modifiedCount} deposits to uppercase.`);

    const purchaseUpdate = await Transaction.updateMany({ type: 'purchase' }, { $set: { type: 'DEDUCTION' } });
    console.log(`Updated ${purchaseUpdate.modifiedCount} purchases to DEDUCTION.`);

    // Migrate Statuses
    const pendingUpdate = await Transaction.updateMany({ status: 'pending' }, { $set: { status: 'PENDING' } });
    console.log(`Updated ${pendingUpdate.modifiedCount} pending statuses.`);

    const completedUpdate = await Transaction.updateMany({ status: 'completed' }, { $set: { status: 'COMPLETED' } });
    console.log(`Updated ${completedUpdate.modifiedCount} completed statuses.`);
    
    const failedUpdate = await Transaction.updateMany({ status: 'failed' }, { $set: { status: 'FAILED' } });
    console.log(`Updated ${failedUpdate.modifiedCount} failed statuses.`);

    mongoose.connection.close();
    console.log("Migration finished successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

migrateTransactions();
