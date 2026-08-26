import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, quiz_type, food_result = null, total_score = 0, score_kb = 0, score_sm = 0, score_bm = 0, score_ba = 0, score_cf = 0 } = req.body;
    if (!user_id || !quiz_type)
      return res.status(400).json({ success: false, message: 'user_id dan quiz_type wajib diisi' });

    const result = await db.query<{ id: number }>`
      INSERT INTO quiz_results (user_id, quiz_type, score, result, food_result, total_score, score_kb, score_sm, score_bm, score_ba, score_cf)
      VALUES (${user_id}, ${quiz_type}, ${total_score || 0}, ${food_result}, ${food_result}, ${total_score || 0}, ${score_kb || 0}, ${score_sm || 0}, ${score_bm || 0}, ${score_ba || 0}, ${score_cf || 0})
      RETURNING id
    `;
    const newRow = await db.query`SELECT * FROM quiz_results WHERE id = ${result[0].id}`;
    res.status(201).json({ success: true, data: newRow[0] });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const rows = await db.query`
      SELECT * FROM quiz_results WHERE user_id = ${req.params.userId}
      ORDER BY created_at DESC, id DESC
    `;
    res.json({ success: true, data: rows });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const rows = await db.query`
      SELECT qr.*, u.username, u.email
      FROM quiz_results qr LEFT JOIN users u ON qr.user_id = u.id
      ORDER BY qr.created_at DESC
    `;
    res.json({ success: true, data: rows });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
});

export default router;
