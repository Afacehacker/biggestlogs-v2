const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = "mongodb+srv://gideontanomare_db_user:7UeAl7iHGCGv0lVd@cluster0.mxgsl2k.mongodb.net/biggestlogs_v2?retryWrites=true&w=majority&appName=Cluster0";

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String
});

const User = mongoose.model('User', UserSchema);

async function upgradeUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "afaceabolade@gmail.com";
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`User with email ${email} not found!`);
      return;
    }

    console.log(`Found user: ${user.username}, current role: ${user.role}`);
    
    user.role = 'ADMIN';
    await user.save();
    
    console.log(`Successfully upgraded ${user.username} to ADMIN!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error upgrading user:", error);
  }
}

upgradeUser();
