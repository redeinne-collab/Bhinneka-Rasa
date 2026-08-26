import { Router, Request, Response } from 'express';
import db, { sql } from '../config/database.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { restaurant_id } = req.query;
    if (!restaurant_id)
      return res.status(400).json({ success: false, message: 'restaurant_id wajib diisi' });
    const reviews = await db.query(sql`
      SELECT id, restaurant_id, user_name, rating, comment, created_at
      FROM reviews WHERE restaurant_id = ${Number(restaurant_id)}
      ORDER BY created_at DESC
    `);
    res.json(reviews);
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    let { restaurant_id, user_id, user_name, user_avatar, user_email, rating, comment, images, visited_date, is_verified_purchase } = req.body;
    if (!restaurant_id || !rating || !comment)
      return res.status(400).json({ success: false, message: 'Field wajib: restaurant_id, rating, comment' });
    if (!user_name || String(user_name).trim() === '') user_name = `Guest_${Date.now().toString().slice(-6)}`;
    if (!user_id) user_id = 0;
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5)
      return res.status(400).json({ success: false, message: 'Rating harus antara 1-5' });
    const imagesStr = images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;
    const visitedDate = visited_date || new Date().toISOString().split('T')[0];
    const result = await db.query(sql`
      INSERT INTO reviews (restaurant_id,user_id,user_name,user_avatar,user_email,rating,comment,images,visited_date,is_verified_purchase)
      VALUES (${Number(restaurant_id)},${Number(user_id)},${String(user_name).trim()},${user_avatar||null},${user_email||null},${ratingNum},${String(comment).trim()},${imagesStr},${visitedDate},${is_verified_purchase?1:0})
      RETURNING id
    `);
    const newReview = await db.query(sql`SELECT * FROM reviews WHERE id = ${result[0].id}`);
    res.status(201).json(newReview[0]);
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Error' });
  }
});

export default router;
