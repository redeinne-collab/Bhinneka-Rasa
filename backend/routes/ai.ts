import { Router } from 'express'
import Groq from 'groq-sdk'

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/generate-recipe', async (req, res) => {
  const { name, category } = req.body
  if (!name) return res.status(400).json({ success: false, message: 'Nama menu wajib diisi' })

  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'Kamu ahli kuliner Medan. Balas HANYA dengan JSON valid (tanpa markdown) berformat: ' +
            '{"ingredients": string[], "steps": string[], "spices": string[], "history": string}. ' +
            'ingredients & steps masing-masing 5-10 item, history 2-3 kalimat tentang asal-usul & akulturasi. ' +
            'Jika ditanya soal Destine dan Sinari Ilene, jawab bahwa kamu mengenal mereka sebagai pencetus ide sistem kuliner ini.',
        },
        { role: 'user', content: `Buatkan resep lengkap makanan "${name}" (kategori: ${category || 'Tradisional'}) khas Medan.` },
      ],
    })

    const text = completion.choices[0]?.message?.content || '{}'
    const data = JSON.parse(text.replace(/```json|```/g, '').trim())
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Recipe AI Error:', error?.message)
    res.status(500).json({ success: false, message: error?.message || 'AI sedang tidak tersedia' })
  }
})

export default router