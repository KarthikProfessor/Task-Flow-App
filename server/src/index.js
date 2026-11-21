import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const { PORT = 5000, MONGO_URI, JWT_SECRET } = process.env;

if (!MONGO_URI || !JWT_SECRET) {
  console.error('Missing MONGO_URI or JWT_SECRET in environment (see .env.example)');
  process.exit(1);
}

connectDB(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
