// import { NavLink, useNavigate } from 'react-router-dom'
// import {
//   LayoutDashboard, Sprout, Bug, Droplets, TrendingUp,
//   DollarSign, ShoppingCart, FileText, MessageSquare,
//   Map, Bell, User, LogOut, Leaf
// } from 'lucide-react'

// const navItems = [
//   { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
//   { icon: Sprout, label: 'Crop Recommendation', path: '/crops' },
//   { icon: Bug, label: 'Disease Detection', path: '/disease' },
//   { icon: Droplets, label: 'Smart Irrigation', path: '/irrigation' }, 
//   { icon: TrendingUp, label: 'Yield Forecast', path: '/yield' },
//   { icon: DollarSign, label: 'Profit Forecast', path: '/profit' },
//   { icon: ShoppingCart, label: 'Market Intelligence', path: '/market' },
//   { icon: FileText, label: 'Govt Schemes', path: '/schemes' },
//   { icon: MessageSquare, label: 'AI Copilot', path: '/copilot' },
//   { icon: Map, label: 'Farm Digital Twin', path: '/twin', soon: true },
//   { icon: Bell, label: 'Alerts', path: '/alerts' },
//   { icon: User, label: 'Farm Profile', path: '/farm-profile' },
// ]

// export default function Sidebar() {
//   const navigate = useNavigate()

//   const handleLogout = () => {
//     localStorage.removeItem('access_token')
//     navigate('/login')
//   }

//   return (
//     <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
//       {/* Logo */}
//       <div className="p-6 border-b border-gray-800">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
//             <Leaf className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h1 className="text-white font-bold text-sm">AgriOS AI</h1>
//             <p className="text-gray-400 text-xs">Farm Intelligence</p>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 overflow-y-auto p-3 space-y-1">
//         {navItems.map((item) => (
//           item.soon ? (
//             <div key={item.path}
//               className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 cursor-not-allowed">
//               <item.icon className="w-4 h-4" />
//               <span className="text-sm">{item.label}</span>
//               <span className="ml-auto text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
//             </div>
//           ) : (
//             <NavLink key={item.path} to={item.path}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
//                   isActive
//                     ? 'bg-green-600 text-white'
//                     : 'text-gray-400 hover:bg-gray-800 hover:text-white'
//                 }`
//               }>
//               <item.icon className="w-4 h-4" />
//               {item.label}
//             </NavLink>
//           )
//         ))}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-gray-800">
//         <button onClick={handleLogout}
//           className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors text-sm">
//           <LogOut className="w-4 h-4" />
//           Logout
//         </button>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useLanguage } from '../../context/LanguageContext'
import {
  LayoutDashboard, Sprout, Bug, Droplets, TrendingUp,
  DollarSign, ShoppingCart, FileText, MessageSquare,
  Map, Bell, User, LogOut, Leaf
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, key: 'dashboard', path: '/dashboard' },
  { icon: Sprout, key: 'crop_recommendation', path: '/crops' },
  { icon: Bug, key: 'disease_detection', path: '/disease' },
  { icon: Droplets, key: 'smart_irrigation', path: '/irrigation' },
  { icon: TrendingUp, key: 'yield_forecast', path: '/yield' },
  { icon: DollarSign, key: 'profit_forecast', path: '/profit' },
  { icon: ShoppingCart, key: 'market_intelligence', path: '/market' },
  { icon: FileText, key: 'govt_schemes', path: '/schemes' },
  { icon: MessageSquare, key: 'ai_copilot', path: '/copilot' },
  { icon: Bell, key: 'alerts', path: '/alerts' },
  { icon: User, key: 'farm_profile', path: '/farm-profile' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/alerts/count')
      setUnreadCount(res.data.unread || 0)
    } catch (err) {
      // Silent fail
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">AgriOS AI</h1>
            <p className="text-gray-400 text-xs">{t('farm_intelligence') || 'Farm Intelligence'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          item.soon ? (
            <div key={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 cursor-not-allowed">
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{t(item.key)}</span>
              <span className="ml-auto text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
            </div>
          ) : (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }>
              <item.icon className="w-4 h-4" />
              {t(item.key)}
              {item.path === '/alerts' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors text-sm">
          <LogOut className="w-4 h-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  )
}