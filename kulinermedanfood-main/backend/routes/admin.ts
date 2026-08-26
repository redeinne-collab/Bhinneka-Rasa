import { Router, Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import db from '../config/database.js';

const router = Router();
router.use(authenticateToken);
router.use(requireAdmin);

// STATS
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [dishes, menuItems, restaurants, reviews, users, questions, quizResults] = await Promise.all([
      db.query<{count:number}>`SELECT COUNT(*) as count FROM dishes`,
      db.query<{count:number}>`SELECT COUNT(*) as count FROM menu_items`,
      db.query<{count:number}>`SELECT COUNT(*) as count FROM restaurants`,
      db.query<{count:number}>`SELECT COUNT(*) as count FROM reviews`,
      db.query<{count:number}>`SELECT COUNT(*) as count FROM users`,
      db.query<{count:number}>`SELECT COUNT(*) as count FROM quiz_questions`,
      db.query<{count:number}>`SELECT COUNT(*) as count FROM quiz_results`,
    ]);
    res.json({ success: true, data: {
      totalDishes: dishes[0]?.count || 0,
      totalMenuItems: menuItems[0]?.count || 0,
      totalRestaurants: restaurants[0]?.count || 0,
      totalReviews: reviews[0]?.count || 0,
      totalUsers: users[0]?.count || 0,
      totalQuestions: questions[0]?.count || 0,
      totalQuizResults: quizResults[0]?.count || 0,
    }});
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// RESTAURANTS
router.get('/restaurants', async (_req: AuthRequest, res: Response) => {
  try {
    const data = await db.query`SELECT * FROM restaurants ORDER BY name ASC`;
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/restaurants', async (req: AuthRequest, res: Response) => {
  try {
    const { google_place_id, name, address, latitude, longitude, phone, website, rating, total_reviews, price_level, opening_hours, photos, dish_id, dish_name, dish_history, dish_ingredients, dish_nutrition } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama restoran wajib diisi' });
    const gpid = google_place_id || `manual-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const result = await db.query<{id:number}>`
      INSERT INTO restaurants (google_place_id,name,address,latitude,longitude,phone,website,rating,total_reviews,price_level,opening_hours,photos,dish_id,dish_name,dish_history,dish_ingredients,dish_nutrition)
      VALUES (${gpid},${name},${address||''},${latitude||0},${longitude||0},${phone||''},${website||''},${rating||0},${total_reviews||0},${price_level||''},${opening_hours||''},${photos||''},${dish_id||null},${dish_name||''},${dish_history||''},${dish_ingredients||''},${dish_nutrition||''})
      RETURNING id`;
    const row = await db.query`SELECT * FROM restaurants WHERE id = ${result[0].id}`;
    res.status(201).json({ success: true, data: row[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/restaurants/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { google_place_id, name, address, latitude, longitude, phone, website, rating, total_reviews, price_level, opening_hours, photos, dish_id, dish_name, dish_history, dish_ingredients, dish_nutrition } = req.body;
    await db.query`UPDATE restaurants SET google_place_id=${google_place_id||null},name=${name},address=${address||''},latitude=${latitude||0},longitude=${longitude||0},phone=${phone||''},website=${website||''},rating=${rating||0},total_reviews=${total_reviews||0},price_level=${price_level||''},opening_hours=${opening_hours||''},photos=${photos||''},dish_id=${dish_id||null},dish_name=${dish_name||''},dish_history=${dish_history||''},dish_ingredients=${dish_ingredients||''},dish_nutrition=${dish_nutrition||''} WHERE id=${id}`;
    const row = await db.query`SELECT * FROM restaurants WHERE id = ${id}`;
    res.json({ success: true, data: row[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/restaurants/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.query`DELETE FROM restaurants WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// DISHES
router.get('/dishes', async (_req: AuthRequest, res: Response) => {
  try {
    const data = await db.query`SELECT * FROM dishes ORDER BY created_at DESC`;
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/dishes', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, history, ingredients, nutrition, image, category, price, is_popular, journey, spices, cooking_steps } = req.body;
    if (!name || !description) return res.status(400).json({ success: false, message: 'Nama dan deskripsi wajib diisi' });
    const result = await db.query<{id:number}>`
      INSERT INTO dishes (name,description,history,ingredients,nutrition,image,category,price,is_popular,journey,spices,cooking_steps)
      VALUES (${name},${description},${history||''},${ingredients||''},${nutrition||''},${image||''},${category||''},${price||0},${is_popular?1:0},${journey||''},${spices||''},${cooking_steps||''})
      RETURNING id`;
    const row = await db.query`SELECT * FROM dishes WHERE id = ${result[0].id}`;
    res.status(201).json({ success: true, data: row[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/dishes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, history, ingredients, nutrition, image, category, price, is_popular, journey, spices, cooking_steps } = req.body;
    await db.query`UPDATE dishes SET name=${name},description=${description},history=${history||''},ingredients=${ingredients||''},nutrition=${nutrition||''},image=${image||''},category=${category||''},price=${price||0},is_popular=${is_popular?1:0},journey=${journey||''},spices=${spices||''},cooking_steps=${cooking_steps||''} WHERE id=${id}`;
    const row = await db.query`SELECT * FROM dishes WHERE id = ${id}`;
    res.json({ success: true, data: row[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/dishes/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.query`DELETE FROM dishes WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Dish deleted successfully' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// MENU ITEMS
router.get('/menu-items', async (_req: AuthRequest, res: Response) => {
  try {
    const data = await db.query`SELECT * FROM menu_items ORDER BY created_at DESC`;
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/menu-items', async (req: AuthRequest, res: Response) => {
  try {
    const { restaurant_id, name, description, category, price, rating, total_ratings, image_url, is_popular, is_available, is_vegetarian, is_spicy } = req.body;
    const result = await db.query<{id:number}>`
      INSERT INTO menu_items (restaurant_id,name,description,category,price,rating,total_ratings,image_url,is_popular,is_available,is_vegetarian,is_spicy)
      VALUES (${restaurant_id},${name},${description},${category},${price},${rating||0},${total_ratings||0},${image_url||''},${is_popular?1:0},${is_available!==false?1:0},${is_vegetarian?1:0},${is_spicy?1:0})
      RETURNING id`;
    const row = await db.query`SELECT * FROM menu_items WHERE id = ${result[0].id}`;
    res.status(201).json({ success: true, data: row[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/menu-items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { restaurant_id, name, description, category, price, rating, total_ratings, image_url, is_popular, is_available, is_vegetarian, is_spicy } = req.body;
    await db.query`UPDATE menu_items SET restaurant_id=${restaurant_id},name=${name},description=${description},category=${category},price=${price},rating=${rating||0},total_ratings=${total_ratings||0},image_url=${image_url||''},is_popular=${is_popular?1:0},is_available=${is_available!==false?1:0},is_vegetarian=${is_vegetarian?1:0},is_spicy=${is_spicy?1:0} WHERE id=${id}`;
    const row = await db.query`SELECT * FROM menu_items WHERE id = ${id}`;
    res.json({ success: true, data: row[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/menu-items/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.query`DELETE FROM menu_items WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// PERSONALITY QUIZ
router.get('/personality-questions', async (_req: AuthRequest, res: Response) => {
  try {
    const questions = await db.query`SELECT * FROM quiz_questions WHERE quiz_type = 'personality' ORDER BY id ASC`;
    const data = await Promise.all(questions.map(async (q: any) => {
      const options = await db.query`SELECT * FROM quiz_options WHERE question_id = ${q.id} ORDER BY option_letter ASC`;
      return { ...q, options };
    }));
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/personality-questions', async (req: AuthRequest, res: Response) => {
  try {
    const { question_text, options } = req.body;
    const qResult = await db.query<{id:number}>`INSERT INTO quiz_questions (quiz_type, question_text) VALUES ('personality', ${question_text}) RETURNING id`;
    const questionId = qResult[0].id;
    for (const opt of options) {
      await db.query`INSERT INTO quiz_options (question_id,option_text,option_letter,food_target,is_correct) VALUES (${questionId},${opt.option_text},${opt.option_letter},${opt.food_target},0)`;
    }
    const q = await db.query`SELECT * FROM quiz_questions WHERE id = ${questionId}`;
    const opts = await db.query`SELECT * FROM quiz_options WHERE question_id = ${questionId}`;
    res.status(201).json({ success: true, data: { ...q[0], options: opts } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/personality-questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { question_text, options } = req.body;
    await db.query`UPDATE quiz_questions SET question_text = ${question_text} WHERE id = ${id}`;
    await db.query`DELETE FROM quiz_options WHERE question_id = ${id}`;
    for (const opt of options) {
      await db.query`INSERT INTO quiz_options (question_id,option_text,option_letter,food_target,is_correct) VALUES (${id},${opt.option_text},${opt.option_letter},${opt.food_target},0)`;
    }
    const q = await db.query`SELECT * FROM quiz_questions WHERE id = ${id}`;
    const opts = await db.query`SELECT * FROM quiz_options WHERE question_id = ${id}`;
    res.json({ success: true, data: { ...q[0], options: opts } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/personality-questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.query`DELETE FROM quiz_options WHERE question_id = ${req.params.id}`;
    await db.query`DELETE FROM quiz_questions WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// MAIN QUIZ
router.get('/main-questions', async (_req: AuthRequest, res: Response) => {
  try {
    const questions = await db.query`SELECT * FROM quiz_questions WHERE quiz_type = 'main' ORDER BY id ASC`;
    const data = await Promise.all(questions.map(async (q: any) => {
      const options = await db.query`SELECT * FROM quiz_options WHERE question_id = ${q.id} ORDER BY option_letter ASC`;
      return { ...q, options };
    }));
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/main-questions', async (req: AuthRequest, res: Response) => {
  try {
    const { question_text, options } = req.body;
    const qResult = await db.query<{id:number}>`INSERT INTO quiz_questions (quiz_type, question_text) VALUES ('main', ${question_text}) RETURNING id`;
    const questionId = qResult[0].id;
    for (const opt of options) {
      await db.query`INSERT INTO quiz_options (question_id,option_text,option_letter,food_target,is_correct) VALUES (${questionId},${opt.option_text},${opt.option_letter},${null},${opt.is_correct?1:0})`;
    }
    const q = await db.query`SELECT * FROM quiz_questions WHERE id = ${questionId}`;
    const opts = await db.query`SELECT * FROM quiz_options WHERE question_id = ${questionId}`;
    res.status(201).json({ success: true, data: { ...q[0], options: opts } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/main-questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { question_text, options } = req.body;
    await db.query`UPDATE quiz_questions SET question_text = ${question_text} WHERE id = ${id}`;
    await db.query`DELETE FROM quiz_options WHERE question_id = ${id}`;
    for (const opt of options) {
      await db.query`INSERT INTO quiz_options (question_id,option_text,option_letter,food_target,is_correct) VALUES (${id},${opt.option_text},${opt.option_letter},${null},${opt.is_correct?1:0})`;
    }
    const q = await db.query`SELECT * FROM quiz_questions WHERE id = ${id}`;
    const opts = await db.query`SELECT * FROM quiz_options WHERE question_id = ${id}`;
    res.json({ success: true, data: { ...q[0], options: opts } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/main-questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.query`DELETE FROM quiz_options WHERE question_id = ${req.params.id}`;
    await db.query`DELETE FROM quiz_questions WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// QUIZ RESULTS
router.get('/quiz-results', async (_req: AuthRequest, res: Response) => {
  try {
    const results = await db.query`
      SELECT qr.*, u.username, u.email FROM quiz_results qr
      LEFT JOIN users u ON qr.user_id = u.id ORDER BY qr.created_at DESC`;
    res.json({ success: true, data: results });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
