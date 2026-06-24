// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
// import { Routes, Route, Navigate } from 'react-router-dom'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import Dashboard from './pages/Dashboard'
// import FarmProfile from './pages/FarmProfile'
// import Copilot from './pages/Copilot'
// import CropRecommendation from './pages/CropRecommendation'
// import Layout from './components/layout/Layout'
// import DiseaseDetection from './pages/DiseaseDetection'
// import Irrigation from './pages/Irrigation'
// import YieldForecast from './pages/YieldForecast'
// import ProfitForecast from './pages/ProfitForecast'
// import MarketIntelligence from './pages/MarketIntelligence'
// import Schemes from './pages/Schemes'
// import Alerts from './pages/Alerts'

// const isAuthenticated = () => !!localStorage.getItem('access_token')

// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />
// }

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//         <Route index element={<Navigate to="/dashboard" />} />
//         <Route path="dashboard" element={<Dashboard />} />
//         <Route path="farm-profile" element={<FarmProfile />} />
//         <Route path="copilot" element={<Copilot />} />
//         <Route path="crops" element={<CropRecommendation />} />
//         <Route path="disease" element={<DiseaseDetection />} />
//         <Route path="irrigation" element={<Irrigation />} />
//         <Route path="yield" element={<YieldForecast />} />
//         <Route path="profit" element={<ProfitForecast />} />
//         <Route path="market" element={<MarketIntelligence />} />
//         <Route path="schemes" element={<Schemes />} />
//         <Route path="alerts" element={<Alerts />} />
     
//       </Route>
//     </Routes>
//   )
// }

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './context/LanguageContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FarmProfile from './pages/FarmProfile'
import Copilot from './pages/Copilot'
import CropRecommendation from './pages/CropRecommendation'
import DiseaseDetection from './pages/DiseaseDetection'
import Irrigation from './pages/Irrigation'
import YieldForecast from './pages/YieldForecast'
import ProfitForecast from './pages/ProfitForecast'
import MarketIntelligence from './pages/MarketIntelligence'
import Schemes from './pages/Schemes'
import Alerts from './pages/Alerts'
import Layout from './components/layout/Layout'

const queryClient = new QueryClient()

const isAuthenticated = () => !!localStorage.getItem('access_token')

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="farm-profile" element={<FarmProfile />} />
            <Route path="copilot" element={<Copilot />} />
            <Route path="crops" element={<CropRecommendation />} />
            <Route path="disease" element={<DiseaseDetection />} />
            <Route path="irrigation" element={<Irrigation />} />
            <Route path="yield" element={<YieldForecast />} />
            <Route path="profit" element={<ProfitForecast />} />
            <Route path="market" element={<MarketIntelligence />} />
            <Route path="schemes" element={<Schemes />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </QueryClientProvider>
  )
}