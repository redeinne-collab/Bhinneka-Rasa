import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    if (!type || (type !== 'personality' && type !== 'main'))
      return res.status(400).json({ success: false, message: 'Tipe kuis tidak valid' });

    const questions = await db.query<{ id: number; question_text: string }>`
      SELECT id, question_text FROM quiz_questions WHERE quiz_type = ${type}
    `;

    const questionsWithOptions = await Promise.all(questions.map(async (q) => {
      const options = await db.query`
        SELECT id, option_text, option_letter, food_target, is_correct
        FROM quiz_options WHERE question_id = ${q.id} ORDER BY option_letter ASC
      `;
      return { ...q, options };
    }));

    res.json({ success: true, data: questionsWithOptions });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
  }
});

export default router;
