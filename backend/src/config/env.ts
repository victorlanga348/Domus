import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3333,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'domus-secret-key-change-in-production',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '248488236065-n5dela4vbnsh5kdfqke3n3ol4nedp7m2.apps.googleusercontent.com',
};
