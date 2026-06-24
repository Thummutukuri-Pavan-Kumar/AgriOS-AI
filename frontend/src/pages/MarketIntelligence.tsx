import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, TrendingDown, Minus, DollarSign, 
  BarChart, AlertCircle, Loader2, Leaf, Calendar,
  ShoppingCart, Bell, ArrowUp, ArrowDown
} from 'lucide-react'
import api from '../api/client'

interface MarketPrice {
  crop_name: string
  state: string
  market: string
  current_price: number
  price_unit: string
  price_trend: string
  price_change_percent: number
  demand_level: string
  best_selling_time: string
  historical_prices: number[]
  generated_at: string
}

interface MarketAlert {
  crop_name: string
  current_price: number
  previous_price: number
  change_percent: number
  alert_type: string
  message: string
  created_at: string
}

const CROP_OPTIONS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Chili', 'Soybean', 'Groundnut', 'Sunflower']
const STATE_OPTIONS = ['Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Punjab', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Telangana', 'Madhya Pradesh', 'Bihar', 'Rajasthan', 'West Bengal']

export default function MarketIntelligence() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [farm, setFarm] = useState<any>(null)
  const [marketData, setMarketData] = useState<MarketPrice | null>(null)
  const [alerts, setAlerts] = useState<MarketAlert[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    crop_type: 'Rice',
    state: 'Karnataka',
    district: ''
  })

  useEffect(() => {
    fetchFarm()
    fetchAlerts()
  }, [])

  const fetchFarm = async () => {
    try {
      const res = await api.get('/farm/my-farm')
      setFarm(res.data)
      if (res.data.location_state) {
        setFormData(prev => ({ ...prev, state: res.data.location_state }))
      }
    } catch (err) {
      console.error('Error fetching farm:', err)
    }
  }

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/market/alerts')
      setAlerts(res.data)
    } catch (err) {
      console.error('Error fetching alerts:', err)
    }
  }

  const getMarketPrices = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/market/prices', formData)
      setMarketData(response.data)
    } catch (err: any) {
      console.error('Error getting market prices:', err)
      setError('Could not get market prices. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'Up') return <TrendingUp className="w-5 h-5 text-green-400" />
    if (trend === 'Down') return <TrendingDown className="w-5 h-5 text-red-400" />
    return <Minus className="w-5 h-5 text-yellow-400" />
  }

  const getTrendColor = (trend: string) => {
    if (trend === 'Up') return 'text-green-400'
    if (trend === 'Down') return 'text-red-400'
    return 'text-yellow-400'
  }

  const getDemandColor = (demand: string) => {
    if (demand === 'High') return 'text-green-400 bg-green-900/30'
    if (demand === 'Medium') return 'text-yellow-400 bg-yellow-900/30'
    return 'text-red-400 bg-red-900/30'
  }

  const getAlertIcon = (type: string) => {
    if (type === 'Price Surge') return <ArrowUp className="w-4 h-4 text-green-400" />
    if (type === 'Price Drop') return <ArrowDown className="w-4 h-4 text-red-400" />
    return <Bell className="w-4 h-4 text-yellow-400" />
  }

  if (!farm) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-yellow-400" />
        <p className="text-gray-400 text-sm">Please create a farm profile first</p>
        <button 
          onClick={() => navigate('/farm-profile')}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Go to Farm Profile
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Intelligence</h1>
        <p className="text-gray-400 text-sm mt-1">
          Real-time crop prices, trends, and market insights
        </p>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-400" />
            Market Alerts
          </h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                {getAlertIcon(alert.alert_type)}
                <div className="flex-1">
                  <p className="text-gray-200 text-sm">{alert.message}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {alert.crop_name} • {alert.alert_type} • {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Crop Type</label>
            <select
              value={formData.crop_type}
              onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              {CROP_OPTIONS.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">State</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              {STATE_OPTIONS.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={getMarketPrices}
          disabled={loading}
          className="mt-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching prices...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Get Market Prices
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Market Data Results */}
      {marketData && (
        <div className="space-y-4">
          {/* Price Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white text-xl font-bold">{marketData.crop_name}</h2>
                <p className="text-gray-400 text-sm">{marketData.market}, {marketData.state}</p>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(marketData.price_trend)}
                <span className={getTrendColor(marketData.price_trend)}>
                  {marketData.price_change_percent}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Current Price</p>
                <p className="text-white font-bold text-xl">
                  ₹{marketData.current_price.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs">{marketData.price_unit}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Trend</p>
                <p className={`font-bold text-xl ${getTrendColor(marketData.price_trend)}`}>
                  {marketData.price_trend}
                </p>
                <p className="text-gray-500 text-xs">{marketData.price_change_percent}% change</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Demand</p>
                <p className={`font-bold text-xl px-2 py-0.5 rounded-full inline-block ${getDemandColor(marketData.demand_level)}`}>
                  {marketData.demand_level}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Best Time to Sell</p>
                <p className="text-green-400 font-bold text-sm">{marketData.best_selling_time}</p>
              </div>
            </div>
          </div>

          {/* Price History Chart - Simple Bar Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-green-400" />
              7-Day Price History
            </h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {marketData.historical_prices.map((price, i) => {
                const maxPrice = Math.max(...marketData.historical_prices)
                const height = (price / maxPrice) * 100
                const isToday = i === marketData.historical_prices.length - 1
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t-lg ${isToday ? 'bg-green-500' : 'bg-green-900/50'}`}
                      style={{ height: `${height}%`, minHeight: '10px' }}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      {isToday ? 'Today' : `Day ${i + 1}`}
                    </p>
                    <p className="text-gray-400 text-xs">₹{price.toLocaleString()}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-xs">
              Updated: {new Date(marketData.generated_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}