import mongoose from 'mongoose';

import dns from "dns"
dns.setServers(["8.8.8.8", "1.1.1.1"])

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
