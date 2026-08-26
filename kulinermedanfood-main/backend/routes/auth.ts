import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { sql } from '../config/database.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kuliner-medan-secret-2024';

interface UserRow { id: number; username: string; email: string; password_hash: string; role: string; }

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });

    const existing = await db.query(sql`SELECT id FROM users WHERE email = ${email}`);
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (${username}, ${email}, ${hash}, 'user')
      RETURNING id
    `);
    const userId = result[0].id;
    const token = jwt.sign({ userId, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Registrasi berhasil', token, user: { id: userId, username, email, role: 'user' } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });

    const rows = await db.query(sql`SELECT * FROM users WHERE email = ${email}`) as UserRow[];
    const user = rows[0];
    if (!user) return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const token = jwt.sign({ userId: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Login berhasil', token, user: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
});

export default router;
