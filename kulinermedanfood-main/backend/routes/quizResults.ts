import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/quiz-results/user/:user_id
router.get('/user/:user_id', (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const results = db.prepare(`
      SELECT * FROM quiz_results 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(Number(user_id));
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Error fetching user quiz results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/quiz-results
router.post('/', (req: Request, res: Response) => {
  try {
    const { 
      user_id, quiz_type, food_result, total_score,
      score_kb, score_sm, score_bm, score_ba, score_cf
    } = req.body;

    if (!user_id || !quiz_type) {
      return res.status(400).json({ success: false, message: 'user_id dan quiz_type wajib diisi' });
    }

    const stmt = db.prepare(`
      INSERT INTO quiz_results (user_id, quiz_type, food_result, total_score, score_kb, score_sm, score_bm, score_ba, score_cf)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      Number(user_id), quiz_type, food_result || null, total_score || 0,
      score_kb || 0, score_sm || 0, score_bm || 0, score_ba || 0, score_cf || 0
    );

    const newResult = db.prepare('SELECT * FROM quiz_results WHERE id = ?').get(result.lastInsertRowid);
    console.log(`✅ ${quiz_type} result saved for user:`, user_id);
    res.status(201).json({ success: true, data: newResult });
  } catch (error: any) {
    console.error('❌ Error saving quiz result:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;