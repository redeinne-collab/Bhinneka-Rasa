import { useState, useEffect, useRef, useCallback } from 'react'
import { Utensils, ChefHat, ChevronDown, ChevronUp, Clock, Flame, BookOpen, Star, Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'

interface Dish {
  id: number
  name: string
  cooking_steps: string[]
  history?: string
  journey?: string
}

import API_BASE_URL from '../../config/api'

// ─── Audio Player Hook ───────────────────────────────────────────────────────
function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [activeDishId, setActiveDishId] = useState<number | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const stepsRef = useRef<string[]>([])
  const stepIdxRef = useRef<number>(0)
  const dishIdRef = useRef<number | null>(null)

  const stopAll = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
    setCurrentStep(null)
    setActiveDishId(null)
    utteranceRef.current = null
  }, [])

  const speakStep = useCallback((text: string, stepIdx: number, dishId: number, onEnd?: () => void) => {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'id-ID'
    utter.rate = 0.9
    utter.pitch = 1.05
    utter.volume = 1

    // Pilih suara bahasa Indonesia jika tersedia
    const voices = window.speechSynthesis.getVoices()
    const idVoice = voices.find(v => v.lang.startsWith('id')) || voices.find(v => v.lang.startsWith('ms'))
    if (idVoice) utter.voice = idVoice

    utter.onstart = () => { setSpeaking(true); setPaused(false); setCurrentStep(stepIdx); setActiveDishId(dishId) }
    utter.onend = () => { if (onEnd) onEnd(); else { setSpeaking(false); setPaused(false); setCurrentStep(null); setActiveDishId(null) } }
    utter.onerror = () => { setSpeaking(false); setPaused(false); setCurrentStep(null) }

    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [])

  const playAll = useCallback((steps: string[], dishId: number, startFrom = 0) => {
    stepsRef.current = steps
    stepIdxRef.current = startFrom
    dishIdRef.current = dishId

    const playNext = () => {
      const idx = stepIdxRef.current
      if (idx >= stepsRef.current.length) {
        setSpeaking(false); setPaused(false); setCurrentStep(null); setActiveDishId(null)
        return
      }
      speakStep(`Langkah ${idx + 1}. ${stepsRef.current[idx]}`, idx, dishId, () => {
        stepIdxRef.current = idx + 1
        setTimeout(playNext, 600)
      })
    }
    playNext()
  }, [speakStep])

  const playSingleStep = useCallback((text: string, stepIdx: number, dishId: number) => {
    speakStep(`Langkah ${stepIdx + 1}. ${text}`, stepIdx, dishId)
  }, [speakStep])

  const togglePause = useCallback(() => {
    if (paused) {
      window.speechSynthesis.resume()
      setPaused(false)
    } else {
      window.speechSynthesis.pause()
      setPaused(true)
    }
  }, [paused])

  // Bersihkan saat unmount
  useEffect(() => () => { window.speechSynthesis.cancel() }, [])

  return { speaking, paused, currentStep, activeDishId, playAll, playSingleStep, togglePause, stopAll }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LangkahMemasak() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [selectedDish, setSelectedDish] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const speech = useSpeech()

  useEffect(() => { fetchDishes() }, [])

  async function fetchDishes() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/dishes`)
      const data = await res.json()
      setDishes(data.data || [])
    } catch (err) {
      console.error('Error fetching dishes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDish = (dishId: number) => {
    if (selectedDish === dishId) {
      speech.stopAll()
      setSelectedDish(null)
    } else {
      speech.stopAll()
      setSelectedDish(dishId)
    }
  }

  const FontImport = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      .font-serif { font-family: 'Playfair Display', serif; }
      .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
      @keyframes float { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-20px) rotate(5deg)} }
      @keyframes float-reverse { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(20px) rotate(-5deg)} }
      @keyframes shimmer { 0%{background-position:-1000px 0} 100%{background-position:1000px 0} }
      @keyframes pulse-glow { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.6;transform:scale(1.05)} }
      @keyframes speaking-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(251,146,60,0.7)} 50%{box-shadow:0 0 0 12px rgba(251,146,60,0)} }
      .animate-float{animation:float 6s ease-in-out infinite}
      .animate-float-reverse{animation:float-reverse 7s ease-in-out infinite}
      .animate-pulse-glow{animation:pulse-glow 4s ease-in-out infinite}
      .animate-speaking{animation:speaking-pulse 1.2s ease-in-out infinite}
      .shimmer-bg{background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);background-size:1000px 100%;animation:shimmer 3s infinite}
    `}</style>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 font-sans flex items-center justify-center relative overflow-hidden">
        <FontImport />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>
        <div className="text-center space-y-6 relative z-10">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-amber-700 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-amber-800 font-bold text-lg">Menyiapkan resep rahasia...</p>
            <p className="text-amber-600 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 font-sans relative overflow-hidden">
      <FontImport />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-200/30 via-transparent to-orange-200/30"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-gradient-to-br from-yellow-300/20 to-amber-300/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-red-300/20 rounded-full blur-3xl animate-pulse-glow delay-1000"></div>
        </div>
        <div className="absolute top-20 left-10 text-8xl opacity-5 animate-float">🌶️</div>
        <div className="absolute top-40 right-20 text-7xl opacity-5 animate-float-reverse">🧄</div>
        <div className="absolute bottom-40 left-1/4 text-9xl opacity-5 animate-float">🌿</div>
        <div className="absolute bottom-20 right-1/3 text-8xl opacity-5 animate-float-reverse">🍃</div>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden w-full">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        <div className="absolute inset-0 shimmer-bg"></div>
        <div className="relative px-6 lg:px-12 py-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl mb-4 transform hover:scale-110 transition-all duration-500 relative">
            <ChefHat className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 blur-xl opacity-50 animate-pulse"></div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white mb-3 tracking-tight">
            Dapur <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400">Akulturasi</span>
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light mb-6">
            Panduan langkah demi langkah untuk menciptakan keajaiban rasa kuliner khas Medan di dapur Anda
          </p>
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-amber-400 font-serif">{dishes.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Resep</div>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-amber-400 font-serif">{dishes.reduce((a, d) => a + (d.cooking_steps?.length || 0), 0)}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Langkah</div>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-amber-400 font-serif">100%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Tradisional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 relative z-10">
        {dishes.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-lg rounded-3xl border-2 border-dashed border-amber-300">
            <Utensils className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">Belum Ada Resep</h3>
            <p className="text-slate-600">Data kuliner sedang dalam proses penyusunan</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {dishes.map((dish) => {
              const isOpen = selectedDish === dish.id
              const steps = dish.cooking_steps || []
              const isThisDishActive = speech.activeDishId === dish.id

              return (
                <div key={dish.id} className={`group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden transition-all duration-700 ${isOpen ? 'shadow-2xl ring-2 ring-amber-400 ring-offset-4 scale-[1.01]' : 'hover:shadow-2xl hover:-translate-y-1'}`}>
                  <div className="relative bg-white rounded-3xl">

                    {/* Card Header */}
                    <div className="p-5 md:p-6 cursor-pointer relative overflow-hidden" onClick={() => handleToggleDish(dish.id)}>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4 md:gap-6 flex-1">
                          <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isOpen ? 'bg-gradient-to-br from-amber-500 to-orange-600 scale-110 rotate-3' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
                            <Utensils className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-500 ${isOpen ? 'text-white -rotate-3' : 'text-amber-700'}`} />
                          </div>
                          <div className="flex-1">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold font-serif text-slate-800 mb-1.5 group-hover:text-amber-700 transition-colors duration-300">{dish.name}</h2>
                            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-600 flex-wrap">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 rounded-full">
                                <Clock className="w-3 h-3 text-amber-600" /><span className="font-semibold">{steps.length} Langkah</span>
                              </span>
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 rounded-full">
                                <BookOpen className="w-3 h-3 text-orange-600" /><span className="font-semibold">Tradisional</span>
                              </span>
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 rounded-full">
                                <Star className="w-3 h-3 text-yellow-600 fill-current" /><span className="font-semibold">Premium</span>
                              </span>
                              {isThisDishActive && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full animate-pulse">
                                  <Volume2 className="w-3 h-3 text-green-600" /><span className="font-semibold text-green-700">Sedang Diputar</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ml-4 ${isOpen ? 'bg-gradient-to-br from-amber-500 to-orange-600 rotate-180 shadow-xl scale-110' : 'bg-slate-100 group-hover:bg-amber-100'}`}>
                          <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isOpen && steps.length > 0 && (
                      <div className="px-5 md:px-6 pb-6 border-t border-slate-100">
                        <div className="mt-6">
                          {/* Header Langkah + Audio Controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
                                <Flame className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg md:text-xl font-bold font-serif text-slate-800">Langkah-langkah Memasak</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Ikuti setiap langkah dengan teliti</p>
                              </div>
                            </div>

                            {/* ── Audio Control Bar ── */}
                            <div className="flex items-center gap-2 bg-slate-900 rounded-2xl px-4 py-2.5 shadow-xl self-start sm:self-auto">
                              <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              <span className="text-xs text-slate-300 font-medium hidden sm:inline">Audio:</span>

                              {/* Play All / Pause */}
                              {!speech.speaking || speech.activeDishId !== dish.id ? (
                                <button
                                  onClick={() => speech.playAll(steps, dish.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                  title="Putar semua langkah"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" /> Putar Semua
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={speech.togglePause}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 ${speech.paused ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-white'}`}
                                    title={speech.paused ? 'Lanjutkan' : 'Jeda'}
                                  >
                                    {speech.paused ? <><Play className="w-3.5 h-3.5 fill-current" /> Lanjutkan</> : <><Pause className="w-3.5 h-3.5" /> Jeda</>}
                                  </button>
                                  <button
                                    onClick={speech.stopAll}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                    title="Hentikan audio"
                                  >
                                    <Square className="w-3 h-3 fill-current" /> Stop
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Steps Timeline */}
                          <div className="relative">
                            <div className="absolute left-7 md:left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-200 rounded-full"></div>
                            <div className="space-y-5">
                              {steps.map((step, idx) => {
                                const isCurrentStep = speech.activeDishId === dish.id && speech.currentStep === idx
                                const isSpeakingThisStep = isCurrentStep && speech.speaking && !speech.paused
                                return (
                                  <div key={idx} className={`relative flex gap-4 md:gap-5 group/step transition-all duration-300 ${isCurrentStep ? 'scale-[1.02]' : ''}`}>
                                    <div className="flex-shrink-0 relative z-10">
                                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl text-white border-4 border-white shadow-2xl flex items-center justify-center text-base md:text-lg font-bold font-serif transition-all duration-500 relative ${isSpeakingThisStep ? 'bg-gradient-to-br from-amber-500 to-orange-600 scale-110 animate-speaking' : isCurrentStep ? 'bg-gradient-to-br from-amber-400 to-orange-500 scale-105' : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 group-hover/step:from-amber-500 group-hover/step:to-orange-600 group-hover/step:rotate-6 group-hover/step:scale-110'}`}>
                                        {isSpeakingThisStep ? <Volume2 className="w-5 h-5 animate-pulse" /> : idx + 1}
                                      </div>
                                    </div>

                                    <div className={`flex-1 pt-2 pb-3 px-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${isCurrentStep ? 'border-amber-400 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50' : 'border-slate-200 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 group-hover/step:border-amber-300 group-hover/step:shadow-lg'}`}>
                                      {/* Indicator berjalan */}
                                      {isSpeakingThisStep && (
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-2xl">
                                          <div className="h-full bg-white/50 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                        </div>
                                      )}

                                      <div className="flex items-start justify-between gap-3">
                                        <p className={`leading-relaxed text-sm md:text-base flex-1 transition-colors duration-300 ${isCurrentStep ? 'text-amber-900 font-medium' : 'text-slate-700'}`}>
                                          {step.trim()}
                                        </p>
                                        {/* Tombol play per langkah */}
                                        <button
                                          onClick={() => {
                                            if (isSpeakingThisStep) { speech.stopAll() }
                                            else { speech.playSingleStep(step, idx, dish.id) }
                                          }}
                                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md ${isSpeakingThisStep ? 'bg-red-100 text-red-500 hover:bg-red-200' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
                                          title={isSpeakingThisStep ? 'Hentikan' : `Dengarkan langkah ${idx + 1}`}
                                        >
                                          {isSpeakingThisStep ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-8 pt-6 border-t-2 border-slate-100 flex items-center justify-between flex-col md:flex-row gap-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 italic">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse"></div>
                              Pastikan semua bahan sudah siap sebelum memulai (Mise en place)
                            </div>
                            <button
                              onClick={() => { speech.stopAll(); setSelectedDish(null) }}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white font-bold text-sm hover:from-amber-600 hover:via-orange-600 hover:to-amber-600 transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
                            >
                              <span>Tutup Resep</span>
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400"></div>
          <div className="text-amber-600 text-2xl">🍽️</div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400"></div>
        </div>
        <p className="text-slate-600 text-sm">Dibuat dengan ❤️ untuk melestarikan warisan kuliner Medan</p>
      </div>
    </div>
  )
}
