
import { Bell, Search } from 'lucide-react'
import LanguageSelector from '../LanguageSelector'
import { useLanguage } from '../../context/LanguageContext'

export default function Topbar() {
  const { t } = useLanguage()
  const user = { full_name: 'Farmer' }

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2 w-72">
        <Search className="w-4 h-4 text-gray-400" />
        <input 
          placeholder={t('search')} 
          className="bg-transparent text-sm text-gray-300 outline-none w-full placeholder-gray-500" 
        />
      </div>
      <div className="flex items-center gap-4">
        <LanguageSelector />
        <button className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.full_name[0]}
          </div>
          <span className="text-sm text-gray-300">{user.full_name}</span>
        </div>
      </div>
    </header>
  )
}