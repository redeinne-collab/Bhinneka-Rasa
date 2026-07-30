import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Fix untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env dari ROOT folder (2 level di atas routes/)
// routes/ -> backend/ -> root/
dotenv.config({ path: join(__dirname, '../../.env') });

const router = Router();

// Cek apakah API Key terbaca
console.log('🔑 Checking GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Found' : '❌ Not found');

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || ''
});

const SYSTEM_PROMPT = `Kamu adalah "Chef AI", asisten kuliner ahli dari Bhinneka Rasa yang berspesialisasi dalam kuliner khas Medan, Indonesia. Jawab dalam Bahasa Indonesia yang natural dan ramah.`;

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY tidak ditemukan di file .env!');
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format pesan tidak valid' 
      });
    }

    console.log('📩 Menerima pesan:', messages[messages.length - 1]?.content);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content || 'Maaf, saya tidak bisa menjawab.';
    
    console.log('✅ AI merespon berhasil');
    res.json({ success: true, response: aiResponse });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Gagal menghubungi AI' 
    });
  }
});

export default router;