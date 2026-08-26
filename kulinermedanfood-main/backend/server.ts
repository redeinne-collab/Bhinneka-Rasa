import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import chatRouter from './routes/chat.js';  
import reviewsRouter from './routes/reviews.js';
import quizRouter from './routes/quiz.js'; 
import quizResultsRouter from './routes/quizResults.js';
import adminRouter from './routes/admin.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Izinkan localhost dev + domain Vercel production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (mobile app, curl, dll)
    if (!origin) return callback(null, true);
    // Izinkan semua subdomain vercel.app
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// CORS harus jadi middleware pertama — sebelum semua route,
// termasuk sebelum error handler, agar header CORS selalu ada
// di response (termasuk saat 4xx/5xx).
app.use(cors(corsOptions));

// Handle preflight OPTIONS secara eksplisit untuk semua route
app.options('*', cors(corsOptions));

app.use(express.json());

app.use('/api', apiRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRouter);  
app.use('/api/reviews', reviewsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/quiz-results', quizResultsRouter);
app.use('/api/ai', aiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send(' Kuliner Medan Food Backend is Running!');
});

// Global error handler — harus punya 4 parameter agar Express
// mengenalinya sebagai error handler. CORS middleware sudah berjalan
// sebelum ini, jadi header CORS sudah ada di response.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});