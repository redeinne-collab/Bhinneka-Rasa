import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Components
import SplashScreen from './components/SplashScreen'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import DesktopSidebar from './components/DesktopSidebar'
import AdminLayout from './layouts/AdminLayout' // <-- Import Layout Admin Baru

// Pages
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import ChatPage from './pages/ChatPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import PersonalityQuiz from './features/quiz/PersonalityQuiz'
import MainQuiz from './features/quiz/MainQuiz'
import FoodDetail from './features/food/FoodDetail'
import FoodMap from './features/map/FoodMap'
import DapurAkulturasi from './features/akulturasi/DapurAkulturasi'
import BhinnekaRasaGame from './features/game/BhinnekaRasaGame'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageMenu from './pages/admin/ManageMenu'
import ManagePersonalityQuiz from './pages/admin/ManagePersonalityQuiz'
import ManageMainQuiz from './pages/admin/ManageMainQuiz'

// --- 1. Layout Khusus User (Dengan Sidebar & Bottom Nav) ---
function UserLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 w-full pb-20 md:pb-0 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-4 md:py-6">
            <Outlet /> {/* Render halaman user di sini */}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

// --- 2. Proteksi Route Admin ---
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace /> // Tendang ke homepage jika bukan admin
  }
  
  return <>{children}</>
}

// --- 3. Konten Utama Aplikasi ---
function AppContent() {
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()
  
  // Route yang TIDAK pakai layout user (full screen)
  const FULL_SCREEN_ROUTES = ['/map', '/login', '/register']
  const isFullScreen = FULL_SCREEN_ROUTES.includes(location.pathname)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <SplashScreen />

  return (
    <Routes>
      {/* A. ROUTE FULL SCREEN (Tanpa Sidebar/Header) */}
      <Route path="/map" element={<FoodMap />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* B. ROUTE USER BIASA (Dengan Sidebar & Bottom Nav) */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/food/:id" element={<FoodDetail />} />
        <Route path="/akulturasi" element={<DapurAkulturasi />} />
        <Route path="/game" element={<BhinnekaRasaGame />} />
        
        {/* Quiz Routes */}
        <Route path="/quiz/main" element={<MainQuiz />} />
        <Route path="/quiz/personality" element={<PersonalityQuiz />} />
        <Route path="/quiz/:id" element={<Navigate to="/quiz/main" replace />} />
        
        {/* Profile & Settings */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* C. ROUTE ADMIN (Dengan Layout Admin Khusus & Proteksi) */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="menu" element={<ManageMenu />} />
        <Route path="personality-quiz" element={<ManagePersonalityQuiz />} />
        <Route path="main-quiz" element={<ManageMainQuiz />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// --- 4. Root App ---
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </Router>
  )
}

export default App