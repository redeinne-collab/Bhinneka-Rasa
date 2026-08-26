import { Router, Request, Response } from 'express';
import db, { sql } from '../config/database.js';
import googleMaps from '../services/googleMaps.js';

const router = Router();

function safeJsonParse<T>(v: string | null | undefined, fb: T): T {
  if (!v) return fb; try { return JSON.parse(v) as T; } catch { return fb; }
}
function parseCookingSteps(v: string | null | undefined): string[] {
  if (!v) return [];
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : [v]; } catch { return v.split(/\n|\d+\./).filter(s => s.trim()); }
}
function formatOpeningHours(h: Record<string,string>): string {
  const vals = Object.values(h);
  if (vals.every(v => v === vals[0])) return `Setiap hari ${vals[0]}`;
  return Object.entries(h).map(([d,t]) => `${d}: ${t}`).join(' | ');
}

router.get('/restaurants', async (_req, res: Response) => {
  try {
    const rows = await db.query(sql`SELECT * FROM restaurants ORDER BY rating DESC`);
    res.json({ success: true, data: rows.map((r: any) => ({ ...r, opening_hours: safeJsonParse(r.opening_hours, {}), photos: safeJsonParse(r.photos, []) })) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/restaurants/:id', async (req: Request, res: Response) => {
  try {
    const rows = await db.query(sql`SELECT * FROM restaurants WHERE id = ${req.params.id}`);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    const r = rows[0] as any;
    const menuItems = await db.query(sql`SELECT * FROM menu_items WHERE restaurant_id = ${req.params.id}`);
    const reviews = await db.query(sql`SELECT * FROM reviews WHERE restaurant_id = ${req.params.id} ORDER BY created_at DESC`);
    res.json({ success: true, data: { restaurant: { ...r, opening_hours: safeJsonParse(r.opening_hours,{}), photos: safeJsonParse(r.photos,[]) }, menuItems, reviews } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/sync-google', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const results = await googleMaps.searchPlaces(query);
    if (!results.length) return res.status(404).json({ success: false, message: 'Tidak ditemukan di Google Maps' });
    const details = await googleMaps.getPlaceDetails(results[0].place_id);
    if (!details) return res.status(404).json({ success: false, message: 'Gagal mengambil detail' });
    const photos = JSON.stringify(details.photos?.map(p => googleMaps.getPhotoUrl(p.photo_reference)) || []);
    const hours = JSON.stringify(details.opening_hours?.weekday_text || []);
    const priceLevel = details.price_level ? 'Rp'.repeat(details.price_level) : 'Rp';
    await db.query(sql`INSERT OR IGNORE INTO restaurants (google_place_id,name,address,latitude,longitude,phone,website,rating,total_reviews,price_level,opening_hours,photos) VALUES (${details.place_id},${details.name},${details.formatted_address||''},${details.geometry?.location.lat},${details.geometry?.location.lng},${details.formatted_phone_number||null},${details.website||null},${details.rating||0},${details.user_ratings_total||0},${priceLevel},${hours},${photos})`);
    res.json({ success: true, message: 'Berhasil sync!', data: details.name });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/restaurants/:id', async (req: Request, res: Response) => {
  try {
    await db.query(sql`DELETE FROM reviews WHERE restaurant_id = ${req.params.id}`);
    await db.query(sql`DELETE FROM menu_items WHERE restaurant_id = ${req.params.id}`);
    await db.query(sql`DELETE FROM restaurants WHERE id = ${req.params.id}`);
    res.json({ success: true, message: 'Restoran berhasil dihapus' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/menu', async (req: Request, res: Response) => {
  try {
    const { restaurant_id, name, category, price, image_url, is_popular } = req.body;
    const r = await db.query(sql`INSERT INTO menu_items (restaurant_id,name,category,price,image_url,is_popular) VALUES (${restaurant_id},${name},${category},${price},${image_url},${is_popular?1:0}) RETURNING id`);
    res.json({ success: true, id: r[0].id });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const { restaurant_id, user_name, rating, comment } = req.body;
    await db.query(sql`INSERT INTO reviews (restaurant_id,user_name,rating,comment) VALUES (${restaurant_id},${user_name},${rating},${comment})`);
    await db.query(sql`UPDATE restaurants SET rating=(SELECT AVG(rating) FROM reviews WHERE restaurant_id=${restaurant_id}), total_reviews=(SELECT COUNT(*) FROM reviews WHERE restaurant_id=${restaurant_id}) WHERE id=${restaurant_id}`);
    res.json({ success: true, message: 'Ulasan berhasil ditambahkan' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/dishes', async (_req, res: Response) => {
  try {
    const rows = await db.query(sql`SELECT * FROM dishes ORDER BY id ASC`);
    res.json({ success: true, data: rows.map((d: any) => ({
      id: d.id, name: d.name, description: d.description||'', price: d.price||0, image: d.image||'',
      category: d.category||'Traditional', isPopular: !!d.is_popular, rating: 4.5,
      ingredients: safeJsonParse<string[]>(d.ingredients,[]), location: '', history: d.history, journey: d.journey,
      spices: safeJsonParse<string[]>(d.spices,[]), nutrition: safeJsonParse(d.nutrition,null)??undefined,
      cooking_steps: parseCookingSteps(d.cooking_steps)
    }))});
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/dishes/:id', async (req: Request, res: Response) => {
  try {
    const rows = await db.query(sql`SELECT * FROM dishes WHERE id = ${req.params.id}`);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    const d = rows[0] as any;
    const restos = await db.query(sql`SELECT * FROM restaurants WHERE dish_id = ${req.params.id} ORDER BY rating DESC`);
    const steps = parseCookingSteps(d.cooking_steps);
    const recommendedPlaces = restos.map((r: any) => {
      const h = safeJsonParse<Record<string,string>>(r.opening_hours,{});
      return { name: r.name, address: r.address, rating: r.rating, hours: Object.keys(h).length>0?formatOpeningHours(h):'-', priceRange: r.price_level, mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name+' '+r.address)}` };
    });
    res.json({ success: true, data: { id: d.id, name: d.name, description: d.description||'', price: d.price||0, image: d.image||'', category: d.category||'Traditional', isPopular: !!d.is_popular, rating: recommendedPlaces.length>0?recommendedPlaces.reduce((s:number,p:any)=>s+p.rating,0)/recommendedPlaces.length:4.5, ingredients: safeJsonParse<string[]>(d.ingredients,[]), location: (recommendedPlaces[0] as any)?.address||'', history: d.history, journey: d.journey, spices: safeJsonParse<string[]>(d.spices,[]), nutrition: safeJsonParse(d.nutrition,null)??undefined, cooking_steps: steps, recommendedPlaces } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
