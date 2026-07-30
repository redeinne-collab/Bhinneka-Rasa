import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoginModal from '../../components/LoginModal'
import { Star, Trophy, Loader2, ChevronLeft, CheckCircle2, XCircle, Target, BookOpen, ArrowLeft } from 'lucide-react'

import API_BASE_URL from '../../config/api'

const SECTIONS = [
  { id: 1, name: 'Soto Medan', emoji: '🍜', color: 'from-amber-500 to-orange-600', desc: '10 Soal tentang sejarah & resep Soto Medan' },
  { id: 2, name: 'Ci Cong Fan', emoji: '🥟', color: 'from-red-500 to-rose-600', desc: '10 Soal tentang akulturasi Tionghoa-Medan' },
  { id: 3, name: 'Bika Ambon', emoji: '🍰', color: 'from-yellow-500 to-amber-600', desc: '10 Soal tentang kue bersarang khas Medan' },
  { id: 4, name: 'Kari Bihun', emoji: '🍛', color: 'from-orange-500 to-red-600', desc: '10 Soal tentang perpaduan India & Tionghoa' },
  { id: 5, name: 'Bolu Meranti', emoji: '🧁', color: 'from-pink-500 to-rose-600', desc: '10 Soal tentang bolu gulung legendaris' }
]

const QUESTIONS_PER_SECTION = 10
const POINTS_PER_QUESTION = 10

interface Option {
  id: number
  option_text: string
  option_letter: string
  is_correct: number
}

interface Question {
  id: number
  question_text: string
  options: Option[]
}

export default function MainQuiz() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setShowLoginModal(false)
  }, [isAuthenticated])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/quiz?type=main`)
        const data = await res.json()
        if (data.success) setAllQuestions(data.data)
      } catch (error) {
        console.error('Error fetching main quiz:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const activeQuestions = selectedSectionIndex !== null 
    ? allQuestions.slice(selectedSectionIndex * QUESTIONS_PER_SECTION, (selectedSectionIndex + 1) * QUESTIONS_PER_SECTION)
    : []

  const currentSection = selectedSectionIndex !== null ? SECTIONS[selectedSectionIndex] : null

  const handleStartQuiz = (sectionIndex: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    setSelectedSectionIndex(sectionIndex)
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  const handleBackToMenu = () => {
    setSelectedSectionIndex(null)
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
  }

  const handleAnswer = (optionId: number, isCorrect: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(optionId)
    
    const newScore = isCorrect === 1 ? score + POINTS_PER_QUESTION : score
    setScore(newScore)

    setTimeout(() => {
      if (currentQuestion < activeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setShowResult(true)
        saveToDatabase(newScore, selectedSectionIndex!)
      }
    }, 800)
  }

  const saveToDatabase = async (totalScore: number, sectionIdx: number) => {
    if (!user) return
    try {
      setIsSubmitting(true)
      const scorePayload: Record<string, number> = { score_kb: 0, score_sm: 0, score_bm: 0, score_ba: 0, score_cf: 0 }
      const keys = ['score_kb', 'score_sm', 'score_bm', 'score_ba', 'score_cf']
      scorePayload[keys[sectionIdx]] = totalScore

      await fetch(`${API_BASE_URL}/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          quiz_type: 'main',
          food_result: currentSection?.name || null,
          total_score: totalScore,
          ...scorePayload
        })
      })
      console.log('✅ Main quiz result saved')
    } catch (error) {
      console.error('Error saving main quiz result:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== 1. TAMPILAN LOADING ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
          <p className="text-amber-800 font-medium">Memuat menu kuis...</p>
        </div>
      </div>
    )
  }

  // ========== 2. TAMPILAN MENU PEMILIHAN ==========
  if (selectedSectionIndex === null) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
          <div className="max-w-5xl mx-auto pt-8">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium">
              <ChevronLeft className="w-5 h-5" /> Kembali
            </button>

            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">Pilih Kuliner untuk Dikuis</h1>
              <p className="text-gray-600">Uji pengetahuanmu tentang salah satu makanan khas Medan di bawah ini</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SECTIONS.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => handleStartQuiz(idx)}
                  className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden border border-gray-100"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${section.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {section.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{section.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{section.desc}</p>
                    <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      <span>Mulai Kuis</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
      </>
    )
  }

  // ========== 3. TAMPILAN HASIL ==========
  if (showResult && currentSection) {
    const maxScore = activeQuestions.length * POINTS_PER_QUESTION
    const percentage = Math.round((score / maxScore) * 100)
    const isPass = percentage >= 70

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
          <div className="max-w-2xl mx-auto pt-8">
            <button onClick={handleBackToMenu} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium">
              <ChevronLeft className="w-5 h-5" /> Pilih Kuliner Lain
            </button>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className={`bg-gradient-to-r ${isPass ? 'from-amber-500 to-orange-600' : 'from-slate-500 to-slate-700'} p-8 text-white text-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '20px 20px' }}></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-4">{currentSection.emoji}</div>
                  <h2 className="text-3xl font-bold mb-2">{currentSection.name}</h2>
                  <p className="text-white/90">{isPass ? 'Luar Biasa! Pengetahuanmu sangat mantap!' : 'Ayo belajar lagi tentang kuliner ini!'}</p>
                </div>
              </div>

              <div className="p-8">
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-500 mb-2">Skor Kamu</p>
                  <div className="text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{score}</div>
                  <p className="text-gray-500 mt-1">dari {maxScore} poin ({percentage}%)</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBackToMenu} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    Pilih Kuliner Lain
                  </button>
                  <button onClick={() => navigate('/')} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                    Beranda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
      </>
    )
  }

  // ========== 4. TAMPILAN KUIS (Per Section) ==========
  if (activeQuestions.length === 0 || !currentSection) return null

  const question = activeQuestions[currentQuestion]
  const totalProgress = ((currentQuestion + 1) / activeQuestions.length) * 100

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <button onClick={handleBackToMenu} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium">
            <ChevronLeft className="w-5 h-5" /> Kembali ke Menu
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${currentSection.color} text-white text-sm font-bold mb-4 shadow-md`}>
                <span className="text-lg">{currentSection.emoji}</span>
                <span>Kuis {currentSection.name}</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 font-medium">Soal {currentQuestion + 1} dari {activeQuestions.length}</span>
                <span className="text-sm text-amber-600 font-bold flex items-center gap-1">
                  <Star className="w-4 h-4" /> Skor: {score}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className={`bg-gradient-to-r ${currentSection.color} h-3 rounded-full transition-all duration-500 ease-out`} style={{ width: `${totalProgress}%` }}></div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-tight">{question.question_text}</h2>

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selectedAnswer === option.id
                const isCorrect = option.is_correct === 1
                let borderColor = 'border-gray-200 hover:border-amber-400 hover:bg-amber-50/50'
                let bgIcon = 'bg-gray-100 text-gray-600'
                let showIcon = false

                if (isSelected) {
                  showIcon = true
                  if (isCorrect) { borderColor = 'border-green-500 bg-green-50'; bgIcon = 'bg-green-500 text-white' }
                  else { borderColor = 'border-red-500 bg-red-50'; bgIcon = 'bg-red-500 text-white' }
                } else if (selectedAnswer !== null && isCorrect) {
                  borderColor = 'border-green-500 bg-green-50'; bgIcon = 'bg-green-500 text-white'; showIcon = true
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id, option.is_correct)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-5 text-left rounded-xl border-2 transition-all duration-300 font-medium relative overflow-hidden group ${borderColor} ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${bgIcon}`}>
                        {showIcon ? (isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />) : option.option_letter}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{option.option_text}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Target className="w-3 h-3" /> Pilih jawaban yang paling tepat
              </p>
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
    </>
  )
}