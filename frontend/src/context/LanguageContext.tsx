import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../api/client'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  translate: (text: string) => Promise<string>
  t: (key: string) => string
  isTranslating: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'farm_profile': 'Farm Profile',
    'crop_recommendation': 'Crop Recommendation',
    'disease_detection': 'Disease Detection',
    'smart_irrigation': 'Smart Irrigation',
    'yield_forecast': 'Yield Forecast',
    'profit_forecast': 'Profit Forecast',
    'market_intelligence': 'Market Intelligence',
    'govt_schemes': 'Government Schemes',
    'ai_copilot': 'AI Copilot',
    'alerts': 'Alerts',
    'logout': 'Logout',
    'search': 'Search',
    'welcome': 'Welcome',
    'farm_health_score': 'Farm Health Score',
    'active_crops': 'Active Crops',
    'irrigation_status': 'Irrigation Status',
    'farm_size': 'Farm Size',
    'soil_type': 'Soil Type',
    'location': 'Location',
    'total_profit': 'Total Profit',
    'profit_per_acre': 'Profit per Acre',
    'roi': 'ROI',
    'break_even_yield': 'Break-even Yield',
    'recommendations': 'Recommendations',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'create': 'Create',
    'update': 'Update',
  },
  hi: {
    'dashboard': 'डैशबोर्ड',
    'farm_profile': 'फार्म प्रोफाइल',
    'crop_recommendation': 'फसल अनुशंसा',
    'disease_detection': 'रोग पहचान',
    'smart_irrigation': 'स्मार्ट सिंचाई',
    'yield_forecast': 'उपज पूर्वानुमान',
    'profit_forecast': 'लाभ पूर्वानुमान',
    'market_intelligence': 'बाजार जानकारी',
    'govt_schemes': 'सरकारी योजनाएं',
    'ai_copilot': 'एआई सहायक',
    'alerts': 'सूचनाएं',
    'logout': 'लॉगआउट',
    'search': 'खोजें',
    'welcome': 'स्वागत है',
    'farm_health_score': 'फार्म स्वास्थ्य स्कोर',
    'active_crops': 'सक्रिय फसलें',
    'irrigation_status': 'सिंचाई स्थिति',
    'farm_size': 'फार्म आकार',
    'soil_type': 'मिट्टी का प्रकार',
    'location': 'स्थान',
    'total_profit': 'कुल लाभ',
    'profit_per_acre': 'प्रति एकड़ लाभ',
    'roi': 'आरओआई',
    'break_even_yield': 'ब्रेक-ईवन उपज',
    'recommendations': 'सिफारिशें',
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'success': 'सफलता',
    'save': 'सहेजें',
    'cancel': 'रद्द करें',
    'delete': 'हटाएं',
    'edit': 'संपादित करें',
    'create': 'बनाएं',
    'update': 'अपडेट करें',
  },
  te: {
    'dashboard': 'డాష్బోర్డ్',
    'farm_profile': 'ఫార్మ్ ప్రొఫైల్',
    'crop_recommendation': 'పంట సిఫార్సు',
    'disease_detection': 'వ్యాధి గుర్తింపు',
    'smart_irrigation': 'స్మార్ట్ నీటిపారుదల',
    'yield_forecast': 'దిగుబడి అంచనా',
    'profit_forecast': 'లాభం అంచనా',
    'market_intelligence': 'మార్కెట్ సమాచారం',
    'govt_schemes': 'ప్రభుత్వ పథకాలు',
    'ai_copilot': 'ఎఐ సహాయకుడు',
    'alerts': 'హెచ్చరికలు',
    'logout': 'నిష్క్రమించు',
    'search': 'వెతకండి',
    'welcome': 'స్వాగతం',
    'farm_health_score': 'ఫార్మ్ ఆరోగ్య స్కోరు',
    'active_crops': 'క్రియాశీల పంటలు',
    'irrigation_status': 'నీటిపారుదల స్థితి',
    'farm_size': 'ఫార్మ్ పరిమాణం',
    'soil_type': 'నేల రకం',
    'location': 'ప్రదేశం',
    'total_profit': 'మొత్తం లాభం',
    'profit_per_acre': 'ఎకరానికి లాభం',
    'roi': 'ఆర్ఓఐ',
    'break_even_yield': 'బ్రేక్-ఈవన్ దిగుబడి',
    'recommendations': 'సిఫార్సులు',
    'loading': 'లోడ్ అవుతోంది...',
    'error': 'లోపం',
    'success': 'విజయం',
    'save': 'భద్రపరచు',
    'cancel': 'రద్దు చేయి',
    'delete': 'తొలగించు',
    'edit': 'సవరించు',
    'create': 'సృష్టించు',
    'update': 'నవీకరించు',
  },
  kn: {
    'dashboard': 'ಡ್ಯಾಶ್ಬೋರ್ಡ್',
    'farm_profile': 'ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್',
    'crop_recommendation': 'ಬೆಳೆ ಶಿಫಾರಸು',
    'disease_detection': 'ರೋಗ ಪತ್ತೆ',
    'smart_irrigation': 'ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ',
    'yield_forecast': 'ಇಳುವರಿ ಮುನ್ಸೂಚನೆ',
    'profit_forecast': 'ಲಾಭ ಮುನ್ಸೂಚನೆ',
    'market_intelligence': 'ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ',
    'govt_schemes': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    'ai_copilot': 'ಎಐ ಸಹಾಯಕ',
    'alerts': 'ಎಚ್ಚರಿಕೆಗಳು',
    'logout': 'ಲಾಗ್ಔಟ್',
    'search': 'ಹುಡುಕಿ',
    'welcome': 'ಸ್ವಾಗತ',
    'farm_health_score': 'ಫಾರ್ಮ್ ಆರೋಗ್ಯ ಸ್ಕೋರ್',
    'active_crops': 'ಸಕ್ರಿಯ ಬೆಳೆಗಳು',
    'irrigation_status': 'ನೀರಾವರಿ ಸ್ಥಿತಿ',
    'farm_size': 'ಫಾರ್ಮ್ ಗಾತ್ರ',
    'soil_type': 'ಮಣ್ಣಿನ ಪ್ರಕಾರ',
    'location': 'ಸ್ಥಳ',
    'total_profit': 'ಒಟ್ಟು ಲಾಭ',
    'profit_per_acre': 'ಎಕರೆಗೆ ಲಾಭ',
    'roi': 'ಆರ್ಓಐ',
    'break_even_yield': 'ಬ್ರೇಕ್-ಈವನ್ ಇಳುವರಿ',
    'recommendations': 'ಶಿಫಾರಸುಗಳು',
    'loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'error': 'ದೋಷ',
    'success': 'ಯಶಸ್ಸು',
    'save': 'ಉಳಿಸು',
    'cancel': 'ರದ್ದು ಮಾಡು',
    'delete': 'ಅಳಿಸು',
    'edit': 'ಸಂಪಾದಿಸು',
    'create': 'ರಚಿಸು',
    'update': 'ನವೀಕರಿಸು',
  },
  ta: {
    'dashboard': 'டாஷ்போர்ட்',
    'farm_profile': 'பண்ணை சுயவிவரம்',
    'crop_recommendation': 'பயிர் பரிந்துரை',
    'disease_detection': 'நோய் கண்டறிதல்',
    'smart_irrigation': 'ஸ்மார்ட் நீர்ப்பாசனம்',
    'yield_forecast': 'மகசூல் முன்னறிவிப்பு',
    'profit_forecast': 'லாப முன்னறிவிப்பு',
    'market_intelligence': 'சந்தை தகவல்',
    'govt_schemes': 'அரசு திட்டங்கள்',
    'ai_copilot': 'எஐ உதவியாளர்',
    'alerts': 'எச்சரிக்கைகள்',
    'logout': 'வெளியேறு',
    'search': 'தேடு',
    'welcome': 'வரவேற்கிறோம்',
    'farm_health_score': 'பண்ணை ஆரோக்கிய மதிப்பெண்',
    'active_crops': 'செயலில் உள்ள பயிர்கள்',
    'irrigation_status': 'நீர்ப்பாசன நிலை',
    'farm_size': 'பண்ணை அளவு',
    'soil_type': 'மண் வகை',
    'location': 'இருப்பிடம்',
    'total_profit': 'மொத்த லாபம்',
    'profit_per_acre': 'ஏக்கருக்கு லாபம்',
    'roi': 'ஆர்ஓஐ',
    'break_even_yield': 'பிரேக்-ஈவன் மகசூல்',
    'recommendations': 'பரிந்துரைகள்',
    'loading': 'ஏற்றுகிறது...',
    'error': 'பிழை',
    'success': 'வெற்றி',
    'save': 'சேமி',
    'cancel': 'ரத்து செய்',
    'delete': 'நீக்கு',
    'edit': 'திருத்து',
    'create': 'உருவாக்கு',
    'update': 'புதுப்பி',
  },
  mr: {
    'dashboard': 'डॅशबोर्ड',
    'farm_profile': 'फार्म प्रोफाइल',
    'crop_recommendation': 'पीक शिफारस',
    'disease_detection': 'रोग शोध',
    'smart_irrigation': 'स्मार्ट सिंचन',
    'yield_forecast': 'उत्पादन अंदाज',
    'profit_forecast': 'नफा अंदाज',
    'market_intelligence': 'बाजार माहिती',
    'govt_schemes': 'सरकारी योजना',
    'ai_copilot': 'एआय सहाय्यक',
    'alerts': 'सूचना',
    'logout': 'बाहेर पडा',
    'search': 'शोधा',
    'welcome': 'स्वागत आहे',
    'farm_health_score': 'फार्म आरोग्य स्कोअर',
    'active_crops': 'सक्रिय पिके',
    'irrigation_status': 'सिंचन स्थिती',
    'farm_size': 'फार्म आकार',
    'soil_type': 'मातीचा प्रकार',
    'location': 'स्थान',
    'total_profit': 'एकूण नफा',
    'profit_per_acre': 'प्रति एकर नफा',
    'roi': 'आरओआय',
    'break_even_yield': 'ब्रेक-ईवन उत्पादन',
    'recommendations': 'शिफारसी',
    'loading': 'लोड होत आहे...',
    'error': 'त्रुटी',
    'success': 'यश',
    'save': 'जतन करा',
    'cancel': 'रद्द करा',
    'delete': 'हटवा',
    'edit': 'संपादित करा',
    'create': 'तयार करा',
    'update': 'अद्यतनित करा',
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'en' ? 'ltr' : 'ltr'
  }, [language])

  const translate = async (text: string): Promise<string> => {
    if (language === 'en') return text
    
    setIsTranslating(true)
    try {
      const response = await api.post('/translate', {
        text: text,
        target_language: language
      })
      return response.data.translated || text
    } catch (error) {
      console.error('Translation error:', error)
      return text
    } finally {
      setIsTranslating(false)
    }
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}