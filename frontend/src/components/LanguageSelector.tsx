import { useState } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
]

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm text-gray-300"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage.native}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors ${
                language === lang.code ? 'text-green-400 bg-gray-700/50' : 'text-gray-300'
              }`}
            >
              <span>{lang.native}</span>
              <span className="text-gray-500 text-xs">{lang.name}</span>
              {language === lang.code && <Check className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}