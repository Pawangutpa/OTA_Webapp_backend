require('dotenv').config();

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('[ENV] Missing environment variables jwt or mongo uri');
  process.exit(1);
}
