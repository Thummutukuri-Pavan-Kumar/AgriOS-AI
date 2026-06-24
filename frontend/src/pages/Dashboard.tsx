// import { Sprout, Droplets, TrendingUp, AlertTriangle, Activity, Sun } from 'lucide-react'

// const stats = [
//   { label: 'Farm Health Score', value: '78/100', icon: Activity, color: 'text-green-400', bg: 'bg-green-900/30' },
//   { label: 'Active Crops', value: '3', icon: Sprout, color: 'text-blue-400', bg: 'bg-blue-900/30' },
//   { label: 'Irrigation Status', value: 'Optimal', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
//   { label: 'Yield Forecast', value: '+12%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
//   { label: 'Active Alerts', value: '2', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
//   { label: 'Weather', value: '28°C Sunny', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-900/30' },
// ]

// const alerts = [
//   { type: 'warning', message: 'Soil moisture below optimal in Field B', time: '2h ago' },
//   { type: 'info', message: 'Best time to apply fertilizer: Tomorrow morning', time: '4h ago' },
//   { type: 'success', message: 'Tomato crop health score improved to 85%', time: '1d ago' },
// ]

// export default function Dashboard() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-white">Farm Dashboard</h1>
//         <p className="text-gray-400 text-sm mt-1">Welcome back — here's your farm intelligence overview</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {stats.map((stat) => (
//           <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
//             <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
//               <stat.icon className={`w-6 h-6 ${stat.color}`} />
//             </div>
//             <div>
//               <p className="text-gray-400 text-xs">{stat.label}</p>
//               <p className="text-white font-semibold text-lg">{stat.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Alerts */}
//       <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//         <h2 className="text-white font-semibold mb-4">Recent Alerts & Recommendations</h2>
//         <div className="space-y-3">
//           {alerts.map((alert, i) => (
//             <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
//               <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
//                 alert.type === 'warning' ? 'bg-yellow-400' :
//                 alert.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
//               }`} />
//               <div className="flex-1">
//                 <p className="text-gray-200 text-sm">{alert.message}</p>
//                 <p className="text-gray-500 text-xs mt-0.5">{alert.time}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Modules Grid */}
//       <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//         <h2 className="text-white font-semibold mb-4">Platform Modules</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {['Disease Detection', 'Smart Irrigation', 'Yield Forecasting', 'Profit Forecasting',
//             'Market Intelligence', 'Govt Schemes', 'Farm Digital Twin', 'Risk Prediction'].map(m => (
//             <div key={m} className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
//               <p className="text-gray-400 text-xs">{m}</p>
//               <span className="text-xs text-green-400 mt-1 block">Coming Soon</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { 
//   Sprout, Droplets, TrendingUp, AlertTriangle, Activity, Sun, 
//   Loader2, Leaf, AlertCircle
// } from 'lucide-react'
// import api from '../api/client'

// interface FarmData {
//   id: number
//   farm_name: string
//   location_state: string
//   location_district: string
//   total_area_acres: number
//   soil_type: string
//   primary_crops: string[]
//   water_source: string
//   health_score: number
// }

// export default function Dashboard() {
//   const navigate = useNavigate()
//   const [loading, setLoading] = useState(true)
//   const [farm, setFarm] = useState<FarmData | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [alerts, setAlerts] = useState([
//     { type: 'info' as const, message: 'Welcome to AgriOS AI! Complete your farm profile to get started.', time: 'Now' }
//   ])

//   useEffect(() => {
//     // Check if token exists
//     const token = localStorage.getItem('access_token')
//     console.log('Token on dashboard load:', token)
//     if (!token) {
//       console.log('No token found, redirecting to login')
//       navigate('/login')
//       return
//     }
//     fetchFarmData()
//   }, [navigate])

//   const fetchFarmData = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const token = localStorage.getItem('access_token')
//       console.log('Fetching farm data with token:', token)
      
//       const res = await api.get('/farm/my-farm')
//       console.log('Farm data response:', res.data)
//       setFarm(res.data)
      
//       // Generate alerts based on farm data
//       const newAlerts = []
      
//       if (res.data.health_score < 50) {
//         newAlerts.push({
//           type: 'warning' as const,
//           message: `Farm health score is ${res.data.health_score}% — consider reviewing your farm practices`,
//           time: 'Now'
//         })
//       } else if (res.data.health_score > 80) {
//         newAlerts.push({
//           type: 'success' as const,
//           message: `Great job! Your farm health score is ${res.data.health_score}% — keep it up! 🌾`,
//           time: 'Now'
//         })
//       }

//       if (res.data.primary_crops && res.data.primary_crops.length > 0) {
//         newAlerts.push({
//           type: 'success' as const,
//           message: `Growing ${res.data.primary_crops.join(', ')} — ask the AI Copilot for crop-specific advice`,
//           time: 'Now'
//         })
//       }

//       if (newAlerts.length === 0) {
//         newAlerts.push({
//           type: 'info' as const,
//           message: 'Your farm is set up! Explore the AI Copilot for personalized advice.',
//           time: 'Now'
//         })
//       }

//       setAlerts(newAlerts)
//     } catch (err: any) {
//       console.error('Error fetching farm:', err)
//       console.error('Error details:', err.response?.data)
      
//       if (err.response?.status === 401) {
//         console.log('401 received, redirecting to login')
//         localStorage.removeItem('access_token')
//         navigate('/login')
//         return
//       } else if (err.response?.status === 404) {
//         // No farm yet — this is expected
//         setFarm(null)
//         setAlerts([
//           { type: 'info' as const, message: 'Create your farm profile to start getting insights!', time: 'Now' }
//         ])
//       } else {
//         setError('Could not load farm data. Please try again.')
//         setAlerts([
//           { type: 'warning' as const, message: 'Using demo data. Create your farm profile for personalized insights.', time: 'Now' }
//         ])
//         // Set a demo farm so dashboard still looks good
//         setFarm({
//           id: 0,
//           farm_name: 'Demo Farm',
//           location_state: 'Karnataka',
//           location_district: 'Mandya',
//           total_area_acres: 10,
//           soil_type: 'Black Soil',
//           primary_crops: ['Rice', 'Tomato'],
//           water_source: 'Borewell',
//           health_score: 72
//         })
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getStats = () => {
//     if (!farm) {
//       return [
//         { label: 'Farm Health Score', value: '—', icon: Activity, color: 'text-gray-400', bg: 'bg-gray-800/30' },
//         { label: 'Active Crops', value: '0', icon: Sprout, color: 'text-blue-400', bg: 'bg-blue-900/30' },
//         { label: 'Irrigation', value: 'Not Set', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
//         { label: 'Farm Size', value: '—', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
//         { label: 'Soil Type', value: 'Not Set', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
//         { label: 'Location', value: '—', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-900/30' },
//       ]
//     }

//     return [
//       { 
//         label: 'Farm Health Score', 
//         value: `${farm.health_score}/100`, 
//         icon: Activity, 
//         color: farm.health_score > 70 ? 'text-green-400' : farm.health_score > 40 ? 'text-yellow-400' : 'text-red-400',
//         bg: farm.health_score > 70 ? 'bg-green-900/30' : farm.health_score > 40 ? 'bg-yellow-900/30' : 'bg-red-900/30'
//       },
//       { 
//         label: 'Active Crops', 
//         value: farm.primary_crops?.length || 0, 
//         icon: Sprout, 
//         color: 'text-blue-400', 
//         bg: 'bg-blue-900/30' 
//       },
//       { 
//         label: 'Irrigation', 
//         value: farm.water_source || 'Not Set', 
//         icon: Droplets, 
//         color: 'text-cyan-400', 
//         bg: 'bg-cyan-900/30' 
//       },
//       { 
//         label: 'Farm Size', 
//         value: `${farm.total_area_acres} acres`, 
//         icon: TrendingUp, 
//         color: 'text-emerald-400', 
//         bg: 'bg-emerald-900/30' 
//       },
//       { 
//         label: 'Soil Type', 
//         value: farm.soil_type || 'Not Set', 
//         icon: AlertTriangle, 
//         color: 'text-yellow-400', 
//         bg: 'bg-yellow-900/30' 
//       },
//       { 
//         label: 'Location', 
//         value: `${farm.location_district}, ${farm.location_state}`,
//         icon: Sun, 
//         color: 'text-orange-400', 
//         bg: 'bg-orange-900/30' 
//       },
//     ]
//   }

//   const stats = getStats()

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96 gap-4">
//         <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
//         <p className="text-gray-400 text-sm">Loading your farm data...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-white">Farm Dashboard</h1>
//         <p className="text-gray-400 text-sm mt-1">
//           {farm 
//             ? `Welcome to ${farm.farm_name} — here's your farm intelligence overview` 
//             : 'Welcome! Create your farm profile to get started 🌾'}
//         </p>
//         {error && (
//           <div className="mt-2 bg-yellow-900/30 border border-yellow-800 text-yellow-400 text-sm px-4 py-2 rounded-lg">
//             ⚠️ {error}
//           </div>
//         )}
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {stats.map((stat) => (
//           <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
//             <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
//               <stat.icon className={`w-6 h-6 ${stat.color}`} />
//             </div>
//             <div>
//               <p className="text-gray-400 text-xs">{stat.label}</p>
//               <p className="text-white font-semibold text-lg">{stat.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Quick Actions if no farm */}
//       {!farm && (
//         <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
//           <Leaf className="w-12 h-12 text-green-500 mx-auto mb-3" />
//           <h3 className="text-white font-semibold text-lg mb-2">Set Up Your Farm</h3>
//           <p className="text-gray-400 text-sm mb-4">Create your farm profile to unlock all features</p>
//           <button 
//             onClick={() => navigate('/farm-profile')}
//             className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
//           >
//             Create Farm Profile →
//           </button>
//         </div>
//       )}

//       {/* Alerts */}
//       <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//         <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
//           <AlertCircle className="w-4 h-4 text-yellow-400" />
//           Recommendations & Alerts
//         </h2>
//         <div className="space-y-3">
//           {alerts.map((alert, i) => (
//             <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
//               <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
//                 alert.type === 'warning' ? 'bg-yellow-400' :
//                 alert.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
//               }`} />
//               <div className="flex-1">
//                 <p className="text-gray-200 text-sm">{alert.message}</p>
//                 <p className="text-gray-500 text-xs mt-0.5">{alert.time}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Modules Grid */}
//       <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//         <h2 className="text-white font-semibold mb-4">Platform Modules</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {[
//             'Disease Detection', 
//             'Smart Irrigation', 
//             'Yield Forecasting', 
//             'Profit Forecasting',
//             'Market Intelligence', 
//             'Govt Schemes', 
//             'Farm Digital Twin', 
//             'Risk Prediction'
//           ].map(m => (
//             <div key={m} className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
//               <p className="text-gray-400 text-xs">{m}</p>
//               <span className="text-xs text-green-400 mt-1 block">Coming Soon</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { 
//   Sprout, Droplets, TrendingUp, AlertTriangle, Activity, Sun, 
//   Loader2, Leaf, AlertCircle, CheckCircle, Info
// } from 'lucide-react'
// import api from '../api/client'

// interface FarmData {
//   id: number
//   farm_name: string
//   location_state: string
//   location_district: string
//   total_area_acres: number
//   soil_type: string
//   primary_crops: string[]
//   water_source: string
//   health_score: number
// }

// export default function Dashboard() {
//   const navigate = useNavigate()
//   const [loading, setLoading] = useState(true)
//   const [farm, setFarm] = useState<FarmData | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const token = localStorage.getItem('access_token')
//     if (!token) {
//       navigate('/login')
//       return
//     }
//     fetchFarmData()
//   }, [navigate])

//   const fetchFarmData = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await api.get('/farm/my-farm')
//       console.log('Farm data:', res.data)
//       setFarm(res.data)
//     } catch (err: any) {
//       console.error('Error fetching farm:', err)
//       if (err.response?.status === 401) {
//         localStorage.removeItem('access_token')
//         navigate('/login')
//         return
//       } else if (err.response?.status === 404) {
//         // No farm yet
//         setFarm(null)
//       } else {
//         setError('Could not load farm data. Please try again.')
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getStats = () => {
//     if (!farm) {
//       return [
//         { label: 'Farm Health Score', value: '—', icon: Activity, color: 'text-gray-400', bg: 'bg-gray-800/30' },
//         { label: 'Active Crops', value: '0', icon: Sprout, color: 'text-blue-400', bg: 'bg-blue-900/30' },
//         { label: 'Irrigation', value: 'Not Set', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
//         { label: 'Farm Size', value: '—', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
//         { label: 'Soil Type', value: 'Not Set', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
//         { label: 'Location', value: '—', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-900/30' },
//       ]
//     }

//     return [
//       { 
//         label: 'Farm Health Score', 
//         value: `${farm.health_score}/100`, 
//         icon: Activity, 
//         color: farm.health_score > 70 ? 'text-green-400' : farm.health_score > 40 ? 'text-yellow-400' : 'text-red-400',
//         bg: farm.health_score > 70 ? 'bg-green-900/30' : farm.health_score > 40 ? 'bg-yellow-900/30' : 'bg-red-900/30'
//       },
//       { 
//         label: 'Active Crops', 
//         value: farm.primary_crops?.length || 0, 
//         icon: Sprout, 
//         color: 'text-blue-400', 
//         bg: 'bg-blue-900/30' 
//       },
//       { 
//         label: 'Irrigation', 
//         value: farm.water_source || 'Not Set', 
//         icon: Droplets, 
//         color: 'text-cyan-400', 
//         bg: 'bg-cyan-900/30' 
//       },
//       { 
//         label: 'Farm Size', 
//         value: `${farm.total_area_acres} acres`, 
//         icon: TrendingUp, 
//         color: 'text-emerald-400', 
//         bg: 'bg-emerald-900/30' 
//       },
//       { 
//         label: 'Soil Type', 
//         value: farm.soil_type || 'Not Set', 
//         icon: AlertTriangle, 
//         color: 'text-yellow-400', 
//         bg: 'bg-yellow-900/30' 
//       },
//       { 
//         label: 'Location', 
//         value: `${farm.location_district}, ${farm.location_state}`,
//         icon: Sun, 
//         color: 'text-orange-400', 
//         bg: 'bg-orange-900/30' 
//       },
//     ]
//   }

//   const stats = getStats()

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96 gap-4">
//         <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
//         <p className="text-gray-400 text-sm">Loading your farm data...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-white">Farm Dashboard</h1>
//         <p className="text-gray-400 text-sm mt-1">
//           {farm 
//             ? `Welcome to ${farm.farm_name} — here's your farm intelligence overview` 
//             : 'Welcome! Create your farm profile to get started 🌾'}
//         </p>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
//           <AlertCircle className="w-4 h-4" />
//           {error}
//         </div>
//       )}

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {stats.map((stat) => (
//           <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
//             <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
//               <stat.icon className={`w-6 h-6 ${stat.color}`} />
//             </div>
//             <div>
//               <p className="text-gray-400 text-xs">{stat.label}</p>
//               <p className="text-white font-semibold text-lg">{stat.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Quick Actions if no farm */}
//       {!farm && !loading && (
//         <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
//           <Leaf className="w-12 h-12 text-green-500 mx-auto mb-3" />
//           <h3 className="text-white font-semibold text-lg mb-2">Set Up Your Farm</h3>
//           <p className="text-gray-400 text-sm mb-4">Create your farm profile to unlock all features</p>
//           <button 
//             onClick={() => navigate('/farm-profile')}
//             className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
//           >
//             Create Farm Profile →
//           </button>
//         </div>
//       )}

//       {/* Modules Grid */}
//       <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//         <h2 className="text-white font-semibold mb-4">Platform Modules</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {[
//             'Crop Recommendation', 
//             'Disease Detection', 
//             'Smart Irrigation', 
//             'Yield Forecasting',
//             'Profit Forecasting', 
//             'Market Intelligence', 
//             'Govt Schemes', 
//             'AI Copilot'
//           ].map(m => (
//             <div key={m} className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700 hover:border-green-500 transition-colors cursor-pointer"
//               onClick={() => {
//                 const path = m.toLowerCase().replace(' ', '-')
//                 navigate(`/${path}`)
//               }}>
//               <p className="text-gray-300 text-xs">{m}</p>
//               <span className="text-xs text-green-400 mt-1 block">Click to Open</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sprout, Droplets, TrendingUp, Activity, Sun, 
  Loader2, Leaf, ArrowRight, Award, Calendar,
  Shield, Sparkles, ChevronRight
} from 'lucide-react'
import api from '../api/client'

interface FarmData {
  id: number
  farm_name: string
  location_state: string
  location_district: string
  total_area_acres: number
  soil_type: string
  primary_crops: string[]
  water_source: string
  health_score: number
}

const modules = [
  { name: 'Crop Recommendation', path: '/crops', icon: '🌱', color: 'from-emerald-500/20 to-emerald-600/10', emoji: '🌾' },
  { name: 'Disease Detection', path: '/disease', icon: '🔬', color: 'from-red-500/20 to-red-600/10', emoji: '🦠' },
  { name: 'Smart Irrigation', path: '/irrigation', icon: '💧', color: 'from-blue-500/20 to-blue-600/10', emoji: '🌊' },
  { name: 'Yield Forecasting', path: '/yield', icon: '📊', color: 'from-purple-500/20 to-purple-600/10', emoji: '📈' },
  { name: 'Profit Forecasting', path: '/profit', icon: '💰', color: 'from-green-500/20 to-green-600/10', emoji: '💵' },
  { name: 'Market Intelligence', path: '/market', icon: '🏪', color: 'from-yellow-500/20 to-yellow-600/10', emoji: '📊' },
  { name: 'Govt Schemes', path: '/schemes', icon: '📋', color: 'from-orange-500/20 to-orange-600/10', emoji: '🏛️' },
  { name: 'AI Copilot', path: '/copilot', icon: '🤖', color: 'from-indigo-500/20 to-indigo-600/10', emoji: '💡' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [farm, setFarm] = useState<FarmData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchFarmData()
  }, [navigate])

  const fetchFarmData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/farm/my-farm')
      console.log('Farm data:', res.data)
      setFarm(res.data)
    } catch (err: any) {
      console.error('Error fetching farm:', err)
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/login')
        return
      } else if (err.response?.status === 404) {
        setFarm(null)
      } else {
        setError('Could not load farm data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getHealthScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟'
    if (score >= 60) return '👍'
    if (score >= 40) return '⚠️'
    return '🔴'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <Leaf className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Loading your farm...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-800/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🌾</span>
              {farm ? `Welcome to ${farm.farm_name}` : 'Welcome to AgriOS AI'}
            </h1>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {farm 
                ? `Your farm intelligence overview — ${farm.location_district}, ${farm.location_state}` 
                : 'Create your farm profile to get started'}
            </p>
          </div>
          {farm && (
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getHealthScoreEmoji(farm.health_score)}</span>
                <span className={`text-3xl font-bold ${getHealthScoreColor(farm.health_score)}`}>
                  {farm.health_score}%
                </span>
              </div>
              <p className="text-gray-500 text-xs">Farm Health Score</p>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Stats Cards with Animations */}
      {farm ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all group">
            <p className="text-gray-500 text-xs">Health Score</p>
            <p className={`text-xl font-bold ${getHealthScoreColor(farm.health_score)} group-hover:scale-105 transition-transform`}>
              {farm.health_score}%
            </p>
            <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  farm.health_score >= 80 ? 'bg-green-400' :
                  farm.health_score >= 60 ? 'bg-yellow-400' :
                  farm.health_score >= 40 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${farm.health_score}%` }}
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Crops</p>
            <p className="text-xl font-bold text-white">{farm.primary_crops?.length || 0}</p>
            <p className="text-gray-500 text-xs truncate">{farm.primary_crops?.join(', ') || 'None'}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Area</p>
            <p className="text-xl font-bold text-white">{farm.total_area_acres}</p>
            <p className="text-gray-500 text-xs">acres</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Soil</p>
            <p className="text-sm font-medium text-white truncate">{farm.soil_type || 'Not set'}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Irrigation</p>
            <p className="text-sm font-medium text-white truncate">{farm.water_source || 'Not set'}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Location</p>
            <p className="text-sm font-medium text-white truncate">{farm.location_district}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800/30 rounded-xl p-8 text-center">
          <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-white font-semibold text-lg">Set Up Your Farm</h3>
          <p className="text-gray-400 text-sm mb-4">Create your farm profile to unlock all features</p>
          <button 
            onClick={() => navigate('/farm-profile')}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg text-sm transition-all hover:scale-105 flex items-center gap-2 mx-auto"
          >
            Create Farm Profile
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modules Grid with Icons */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800/30 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-green-400" />
            Platform Modules
          </h2>
          <span className="text-gray-500 text-xs">{modules.length} modules</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modules.map((module) => (
            <div 
              key={module.name}
              onClick={() => navigate(module.path)}
              className={`bg-gradient-to-br ${module.color} rounded-xl p-4 text-center border border-gray-700 hover:border-green-500 hover:scale-105 transition-all duration-300 cursor-pointer group`}
            >
              <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{module.icon}</div>
              <p className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">
                {module.name}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-green-400">Open</span>
                <ChevronRight className="w-3 h-3 text-green-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Footer */}
      {farm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">🌾 Total Crops</p>
            <p className="text-white font-semibold">{farm.primary_crops?.length || 0}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">💧 Water Source</p>
            <p className="text-white font-semibold text-sm">{farm.water_source || 'N/A'}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">📍 State</p>
            <p className="text-white font-semibold text-sm">{farm.location_state}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">📅 Updated</p>
            <p className="text-white font-semibold text-sm">Today</p>
          </div>
        </div>
      )}
    </div>
  )
}