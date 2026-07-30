export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 animate-fade-in">
      <div className="text-center animate-scale-in">
        <div className="w-52 h-52 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-full h-full border-8 border-amber-700 rounded-full flex items-center justify-center bg-white shadow-2xl">
            <svg className="w-36 h-36" viewBox="0 0 100 100">
              <path
                className="animate-draw-fork"
                d="M35 20 L35 75 M30 25 L30 35 M35 25 L35 35 M40 25 L40 35 M32 75 L45 90"
                stroke="#D97706"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse
                className="animate-draw-spoon"
                cx="58"
                cy="35"
                rx="12"
                ry="18"
                fill="#78350F"
              />
              <path
                d="M58 53 L58 75 L50 85"
                stroke="#78350F"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-6xl font-bold text-amber-900 tracking-widest mb-3 animate-slide-up drop-shadow-lg">
          BHINNEKA
        </h1>
        <p className="text-amber-700 tracking-[0.3em] text-sm font-semibold animate-slide-up-delayed uppercase">
          RASA
        </p>
      </div>
    </div>
  )
}