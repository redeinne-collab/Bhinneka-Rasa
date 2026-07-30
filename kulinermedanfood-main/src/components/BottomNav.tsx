import { NavLink } from 'react-router-dom'
import { Home, UtensilsCrossed, MessageCircle, Search, User } from 'lucide-react'

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/search', icon: Search, label: 'Cari' },
  { to: '/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  return (
    // 👇 Kunci: hidden di md ke atas
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition ${
                isActive ? 'text-orange-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-full transition ${isActive ? 'bg-orange-100' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}