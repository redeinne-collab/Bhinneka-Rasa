import { NavLink } from 'react-router-dom'
import { Home, UtensilsCrossed, MessageCircle, Search, User, Map, ChefHat, Gamepad2 } from 'lucide-react'
import logo from '../assets/logo.svg'

const menuItems = [
  { to: '/', icon: Home, label: 'Beranda' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/search', icon: Search, label: 'Cari' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/map', icon: Map, label: 'Peta Kuliner' },
  { to: '/akulturasi', icon: ChefHat, label: 'Dapur Akulturasi' },
  { to: '/game', icon: Gamepad2, label: 'Game Bhinneka-Rasa' },
  { to: '/profile', icon: User, label: 'Profil' },
]

export default function DesktopSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 border-r border-orange-100 bg-white/80 backdrop-blur-sm min-h-[calc(100vh-64px)] sticky top-16">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bhinneka Rasa" className="w-10 h-10 drop-shadow-md" />
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Bhinneka Rasa
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Jelajahi Cita Rasa Indonesia</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-orange-100 text-xs text-gray-500">
        © 2026 Bhinneka Rasa
      </div>
    </aside>
  )
}