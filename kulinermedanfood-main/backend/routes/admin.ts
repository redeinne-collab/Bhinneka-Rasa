import { Router, Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import db, { sql } from '../config/database.js';

const router = Router();
router.use(authenticateToken);
router.use(requireAdmin);

const q = (table: string) => db.query(sql`SELECT COUNT(*) as count FROM ${sql.ident(table)}`);

router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [a,b,c,d,e,f,g] = await Promise.all([q('dishes'),q('menu_items'),q('restaurants'),q('reviews'),q('users'),q('quiz_questions'),q('quiz_results')]);
    res.json({ success: true, data: { totalDishes:(a[0] as any).count||0, totalMenuItems:(b[0] as any).count||0, totalRestaurants:(c[0] as any).count||0, totalReviews:(d[0] as any).count||0, totalUsers:(e[0] as any).count||0, totalQuestions:(f[0] as any).count||0, totalQuizResults:(g[0] as any).count||0 }});
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// RESTAURANTS
router.get('/restaurants', async (_req, res: Response) => {
  try { res.json({ success: true, data: await db.query(sql`SELECT * FROM restaurants ORDER BY name ASC`) }); }
  catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/restaurants', async (req: AuthRequest, res: Response) => {
  try {
    const { google_place_id,name,address,latitude,longitude,phone,website,rating,total_reviews,price_level,opening_hours,photos,dish_id,dish_name,dish_history,dish_ingredients,dish_nutrition } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama restoran wajib diisi' });
    const gpid = google_place_id || `manual-${String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
    const r = await db.query(sql`INSERT INTO restaurants (google_place_id,name,address,latitude,longitude,phone,website,rating,total_reviews,price_level,opening_hours,photos,dish_id,dish_name,dish_history,dish_ingredients,dish_nutrition) VALUES (${gpid},${name},${address||''},${latitude||0},${longitude||0},${phone||''},${website||''},${rating||0},${total_reviews||0},${price_level||''},${opening_hours||''},${photos||''},${dish_id||null},${dish_name||''},${dish_history||''},${dish_ingredients||''},${dish_nutrition||''}) RETURNING id`);
    res.status(201).json({ success: true, data: (await db.query(sql`SELECT * FROM restaurants WHERE id = ${r[0].id}`))[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.put('/restaurants/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { google_place_id,name,address,latitude,longitude,phone,website,rating,total_reviews,price_level,opening_hours,photos,dish_id,dish_name,dish_history,dish_ingredients,dish_nutrition } = req.body;
    await db.query(sql`UPDATE restaurants SET google_place_id=${google_place_id||null},name=${name},address=${address||''},latitude=${latitude||0},longitude=${longitude||0},phone=${phone||''},website=${website||''},rating=${rating||0},total_reviews=${total_reviews||0},price_level=${price_level||''},opening_hours=${opening_hours||''},photos=${photos||''},dish_id=${dish_id||null},dish_name=${dish_name||''},dish_history=${dish_history||''},dish_ingredients=${dish_ingredients||''},dish_nutrition=${dish_nutrition||''} WHERE id=${id}`);
    res.json({ success: true, data: (await db.query(sql`SELECT * FROM restaurants WHERE id = ${id}`))[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.delete('/restaurants/:id', async (req: AuthRequest, res: Response) => {
  try { await db.query(sql`DELETE FROM restaurants WHERE id = ${req.params.id}`); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// DISHES
router.get('/dishes', async (_req, res: Response) => {
  try { res.json({ success: true, data: await db.query(sql`SELECT * FROM dishes ORDER BY created_at DESC`) }); }
  catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/dishes', async (req: AuthRequest, res: Response) => {
  try {
    const { name,description,history,ingredients,nutrition,image,category,price,is_popular,journey,spices,cooking_steps } = req.body;
    if (!name||!description) return res.status(400).json({ success: false, message: 'Nama dan deskripsi wajib diisi' });
    const r = await db.query(sql`INSERT INTO dishes (name,description,history,ingredients,nutrition,image,category,price,is_popular,journey,spices,cooking_steps) VALUES (${name},${description},${history||''},${ingredients||''},${nutrition||''},${image||''},${category||''},${price||0},${is_popular?1:0},${journey||''},${spices||''},${cooking_steps||''}) RETURNING id`);
    res.status(201).json({ success: true, data: (await db.query(sql`SELECT * FROM dishes WHERE id = ${r[0].id}`))[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.put('/dishes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name,description,history,ingredients,nutrition,image,category,price,is_popular,journey,spices,cooking_steps } = req.body;
    await db.query(sql`UPDATE dishes SET name=${name},description=${description},history=${history||''},ingredients=${ingredients||''},nutrition=${nutrition||''},image=${image||''},category=${category||''},price=${price||0},is_popular=${is_popular?1:0},journey=${journey||''},spices=${spices||''},cooking_steps=${cooking_steps||''} WHERE id=${id}`);
    res.json({ success: true, data: (await db.query(sql`SELECT * FROM dishes WHERE id = ${id}`))[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.delete('/dishes/:id', async (req: AuthRequest, res: Response) => {
  try { await db.query(sql`DELETE FROM dishes WHERE id = ${req.params.id}`); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// MENU ITEMS
router.get('/menu-items', async (_req, res: Response) => {
  try { res.json({ success: true, data: await db.query(sql`SELECT * FROM menu_items ORDER BY created_at DESC`) }); }
  catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/menu-items', async (req: AuthRequest, res: Response) => {
  try {
    const { restaurant_id,name,description,category,price,rating,total_ratings,image_url,is_popular,is_available,is_vegetarian,is_spicy } = req.body;
    const r = await db.query(sql`INSERT INTO menu_items (restaurant_id,name,description,category,price,rating,total_ratings,image_url,is_popular,is_available,is_vegetarian,is_spicy) VALUES (${restaurant_id},${name},${description},${category},${price},${rating||0},${total_ratings||0},${image_url||''},${is_popular?1:0},${is_available!==false?1:0},${is_vegetarian?1:0},${is_spicy?1:0}) RETURNING id`);
    res.status(201).json({ success: true, data: (await db.query(sql`SELECT * FROM menu_items WHERE id = ${r[0].id}`))[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.put('/menu-items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { restaurant_id,name,description,category,price,rating,total_ratings,image_url,is_popular,is_available,is_vegetarian,is_spicy } = req.body;
    await db.query(sql`UPDATE menu_items SET restaurant_id=${restaurant_id},name=${name},description=${description},category=${category},price=${price},rating=${rating||0},total_ratings=${total_ratings||0},image_url=${image_url||''},is_popular=${is_popular?1:0},is_available=${is_available!==false?1:0},is_vegetarian=${is_vegetarian?1:0},is_spicy=${is_spicy?1:0} WHERE id=${id}`);
    res.json({ success: true, data: (await db.query(sql`SELECT * FROM menu_items WHERE id = ${id}`))[0] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.delete('/menu-items/:id', async (req: AuthRequest, res: Response) => {
  try { await db.query(sql`DELETE FROM menu_items WHERE id = ${req.params.id}`); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// QUIZ helpers
async function getQWithOpts(id: any) {
  const q = await db.query(sql`SELECT * FROM quiz_questions WHERE id = ${id}`);
  const opts = await db.query(sql`SELECT * FROM quiz_options WHERE question_id = ${id} ORDER BY option_letter ASC`);
  return { ...q[0], options: opts };
}

// PERSONALITY QUIZ
router.get('/personality-questions', async (_req, res: Response) => {
  try {
    const qs = await db.query(sql`SELECT * FROM quiz_questions WHERE quiz_type = 'personality' ORDER BY id ASC`);
    res.json({ success: true, data: await Promise.all(qs.map((q: any) => getQWithOpts(q.id))) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/personality-questions', async (req: AuthRequest, res: Response) => {
  try {
    const { question_text, options } = req.body;
    const r = await db.query(sql`INSERT INTO quiz_questions (quiz_type,question_text) VALUES ('personality',${question_text}) RETURNING id`);
    for (const o of options) await db.query(sql`INSERT INTO quiz_options (question_id,option_text,option_letter,food_target,is_correct) VALUES (${r[0].id},${o.option_text},${o.option_letter},${o.food_target},0)`);
    res.status(201).json({ success: true, data: await getQWithOpts(r[0].id) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.put('/personality-questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; const { question_text, options } = req.body;
    await db.query(sql`UPDATE quiz_questions SET question_text=${question_text} WHERE id=${id}`);
    await db.query(sql`DELETE FROM quiz_options WHERE question_id=${id}`);
    for (const o of options) await db.query(sql`INSERT INTO quiz_options (question_id,option_text,option_letter,food_target,is_correct) VALUES (${id},${o.option_text},${o.option_letter},${o.food_target},0)`);
    res.json({ success: true, data: await getQWithOpts(id) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.delete('/personality-questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.query(sql`DELETE FROM quiz_options WHERE question_id=${req.params.id}`);
    await db.query(sql`DELETE FROM quiz_questions WHERE id=${req.params.id}`);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// MAIN QUIZ
router.get('/main-questions', async (_req, res: Response) => {
  try {
    const qs = await db.query(sql`SELECT * FROM quiz_questions WHERE quiz_type = 'main' ORDER BY id ASC`);
    res.json({ success: true, data: await Promise.all(qs.map((q: any) => getQWithOpts(q.id))) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/main-questions', async (req: AuthRequest, res: Response) => {
  try {
    const { question_text, options } = req.body;
    const r = await db.query(sql`INSERT INTO quiz_questions (quiz_type,question_text) VALUES ('main',${question_text}) RETURNING id`);
    for (const o of options) await db.query(sql`INSERT INTO quiz_options (question_id,option_text,option_letter,food_target,is_correct) VALUES (${r[0].id},${o.option_text},${o.option_letter},${null},${o.is_correct?1:0})`);
    res.status(201).json({ success: true, data: await getQWithOpts(r[0].id) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.put('/main-questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; const { question_text, options } = req.body;
    await db.query(sql`UPDATE quiz_questions SET question_text=${question_text} WHERE id=${id}`);
    await db.query(sql`DELETE FROM quiz_options WHERE question_id=${id}`);
    for (const o of options) await db.query(sql`INSERT INTO quiz_options (question_id,option_text,option_letter,food_target,is_correct) VALUES (${id},${o.option_text},${o.option_letter},${null},${o.is_correct?1:0})`);
    res.json({ success: true, data: await getQWithOpts(id) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.delete('/main-questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.query(sql`DELETE FROM quiz_options WHERE question_id=${req.params.id}`);
    await db.query(sql`DELETE FROM quiz_questions WHERE id=${req.params.id}`);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// QUIZ RESULTS
router.get('/quiz-results', async (_req, res: Response) => {
  try {
    res.json({ success: true, data: await db.query(sql`SELECT qr.*, u.username, u.email FROM quiz_results qr LEFT JOIN users u ON qr.user_id = u.id ORDER BY qr.created_at DESC`) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
