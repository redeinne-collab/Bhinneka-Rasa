import { Router, Request, Response } from 'express';
import db from '../config/database.js';
import googleMaps from '../services/googleMaps.js';

const router = Router();

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function parseCookingSteps(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return value.split(/\n|\d+\./).filter(s => s.trim().length > 0);
  }
}

function formatOpeningHours(hours: Record<string, string>): string {
  const values = Object.values(hours);
  if (values.every(v => v === values[0])) return `Setiap hari ${values[0]}`;
  return Object.entries(hours).map(([day, h]) => `${day}: ${h}`).join(' | ');
}

// GET all restaurants
router.get('/restaurants', async (_req: Request, res: Response) => {
  try {
    const restaurants = await db.query`SELECT * FROM restaurants ORDER BY rating DESC`;
    const parsed = restaurants.map((r: any) => ({
      ...r,
      opening_hours: safeJsonParse(r.opening_hours, {}),
      photos: safeJsonParse(r.photos, [])
    }));
    res.json({ success: true, data: parsed });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET restaurant detail
router.get('/restaurants/:id', async (req: Request, res: Response) => {
  try {
    const rows = await db.query`SELECT * FROM restaurants WHERE id = ${req.params.id}`;
    if (!rows.length) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    const restaurant = rows[0] as any;
    const menuItems = await db.query`SELECT * FROM menu_items WHERE restaurant_id = ${req.params.id}`;
    const reviews = await db.query`SELECT * FROM reviews WHERE restaurant_id = ${req.params.id} ORDER BY created_at DESC`;
    res.json({
      success: true,
      data: {
        restaurant: { ...restaurant, opening_hours: safeJsonParse(restaurant.opening_hours, {}), photos: safeJsonParse(restaurant.photos, []) },
        menuItems,
        reviews
      }
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST sync from Google Maps
router.post('/sync-google', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const results = await googleMaps.searchPlaces(query);
    if (results.length === 0)
      return res.status(404).json({ success: false, message: 'Tidak ditemukan di Google Maps' });

    const details = await googleMaps.getPlaceDetails(results[0].place_id);
    if (!details) return res.status(404).json({ success: false, message: 'Gagal mengambil detail' });

    const photosArray = details.photos ? details.photos.map(p => googleMaps.getPhotoUrl(p.photo_reference)) : [];
    await db.query`
      INSERT OR IGNORE INTO restaurants (google_place_id,name,address,latitude,longitude,phone,website,rating,total_reviews,price_level,opening_hours,photos)
      VALUES (${details.place_id},${details.name},${details.formatted_address||''},${details.geometry?.location.lat},${details.geometry?.location.lng},${details.formatted_phone_number||null},${details.website||null},${details.rating||0},${details.user_ratings_total||0},${details.price_level?'Rp'.repeat(details.price_level):'Rp'},${JSON.stringify(details.opening_hours?.weekday_text||[])},${JSON.stringify(photosArray)})
    `;
    res.json({ success: true, message: 'Berhasil sync dari Google Maps!', data: details.name });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE restaurant
router.delete('/restaurants/:id', async (req: Request, res: Response) => {
  try {
    await db.query`DELETE FROM reviews WHERE restaurant_id = ${req.params.id}`;
    await db.query`DELETE FROM menu_items WHERE restaurant_id = ${req.params.id}`;
    await db.query`DELETE FROM restaurants WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Restoran berhasil dihapus' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST add menu
router.post('/menu', async (req: Request, res: Response) => {
  try {
    const { restaurant_id, name, category, price, image_url, is_popular } = req.body;
    const result = await db.query<{id:number}>`
      INSERT INTO menu_items (restaurant_id,name,category,price,image_url,is_popular)
      VALUES (${restaurant_id},${name},${category},${price},${image_url},${is_popular?1:0})
      RETURNING id`;
    res.json({ success: true, id: result[0].id });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST add review
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const { restaurant_id, user_name, rating, comment } = req.body;
    await db.query`INSERT INTO reviews (restaurant_id,user_name,rating,comment) VALUES (${restaurant_id},${user_name},${rating},${comment})`;
    await db.query`UPDATE restaurants SET rating=(SELECT AVG(rating) FROM reviews WHERE restaurant_id=${restaurant_id}), total_reviews=(SELECT COUNT(*) FROM reviews WHERE restaurant_id=${restaurant_id}) WHERE id=${restaurant_id}`;
    res.json({ success: true, message: 'Ulasan berhasil ditambahkan' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET all dishes
router.get('/dishes', async (_req: Request, res: Response) => {
  try {
    const rows = await db.query`SELECT * FROM dishes ORDER BY id ASC`;
    const parsed = rows.map((d: any) => ({
      id: d.id,
      name: d.name,
      description: d.description || '',
      price: d.price || 0,
      image: d.image || '',
      category: d.category || 'Traditional',
      isPopular: !!d.is_popular,
      rating: 4.5,
      ingredients: safeJsonParse<string[]>(d.ingredients, []),
      location: '',
      history: d.history,
      journey: d.journey,
      spices: safeJsonParse<string[]>(d.spices, []),
      nutrition: safeJsonParse<Record<string,unknown>|null>(d.nutrition, null) ?? undefined,
      cooking_steps: parseCookingSteps(d.cooking_steps)
    }));
    res.json({ success: true, data: parsed });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET dish detail
router.get('/dishes/:id', async (req: Request, res: Response) => {
  try {
    const rows = await db.query`SELECT * FROM dishes WHERE id = ${req.params.id}`;
    if (!rows.length) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    const d = rows[0] as any;
    const restos = await db.query`SELECT * FROM restaurants WHERE dish_id = ${req.params.id} ORDER BY rating DESC`;
    const steps = parseCookingSteps(d.cooking_steps);
    const recommendedPlaces = restos.map((r: any) => {
      const hours = safeJsonParse<Record<string,string>>(r.opening_hours, {});
      return {
        name: r.name, address: r.address, rating: r.rating,
        hours: Object.keys(hours).length > 0 ? formatOpeningHours(hours) : '-',
        priceRange: r.price_level,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name+' '+r.address)}`
      };
    });
    res.json({
      success: true,
      data: {
        id: d.id, name: d.name, description: d.description||'', price: d.price||0,
        image: d.image||'', category: d.category||'Traditional', isPopular: !!d.is_popular,
        rating: recommendedPlaces.length > 0 ? recommendedPlaces.reduce((s: number, p: any) => s+p.rating, 0)/recommendedPlaces.length : 4.5,
        ingredients: safeJsonParse<string[]>(d.ingredients, []),
        location: (recommendedPlaces[0] as any)?.address || '',
        history: d.history, journey: d.journey,
        spices: safeJsonParse<string[]>(d.spices, []),
        nutrition: safeJsonParse<Record<string,unknown>|null>(d.nutrition, null) ?? undefined,
        cooking_steps: steps, recommendedPlaces
      }
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
