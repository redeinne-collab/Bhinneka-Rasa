import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import logo from '../assets/logo.svg'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Bhinneka Rasa" className="w-9 h-9 drop-shadow-md" />
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Bhinneka Rasa
            </h1>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center">
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-semibold shadow hover:scale-105 transition-transform"
            >
              U
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-orange-50 transition"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-orange-100 pt-2 space-y-1">
            <Link 
              to="/profile" 
              className="block px-3 py-2 rounded-lg hover:bg-orange-50 transition"
            >
              Profil
            </Link>
            <Link 
              to="/chat" 
              className="block px-3 py-2 rounded-lg hover:bg-orange-50 transition"
            >
              Chat
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}