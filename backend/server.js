import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change-in-production')) {
  console.warn('WARNING: Using default JWT_SECRET. Set a strong secret in .env for production.');
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
