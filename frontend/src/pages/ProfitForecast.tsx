import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart,
  Calculator, Leaf, Loader2, AlertCircle, CheckCircle,
  BarChart, ArrowUp, ArrowDown, Minus
} from 'lucide-react'
import api from '../api/client'

interface CostBreakdown {
  seed_cost: number
  fertilizer_cost: number
  pesticide_cost: number
  labor_cost: number
  irrigation_cost: number
  harvesting_cost: number
  transport_cost: number
  miscellaneous_cost: number
  total_cost: number
}

interface RevenueBreakdown {
  expected_yield: number
  market_price: number
  total_revenue: number
}

interface ProfitForecast {
  crop_name: string
  area_acres: number
  cost_breakdown: CostBreakdown
  revenue_breakdown: RevenueBreakdown
  total_profit: number
  profit_per_acre: number
  roi_percentage: number
  break_even_yield: number
  profit_margin: number
  recommendations: string[]
  generated_at: string
}

const CROP_OPTIONS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Chili', 'Soybean', 'Groundnut', 'Sunflower']

export default function ProfitForecast() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [farm, setFarm] = useState<any>(null)
  const [forecast, setForecast] = useState<ProfitForecast | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    crop_type: 'Rice',
    area_acres: 0,
    expected_yield: 2.5,
    market_price: 0,
    seed_cost: 0,
    fertilizer_cost: 0,
    pesticide_cost: 0,
    labor_cost: 0,
    irrigation_cost: 0,
    harvesting_cost: 0,
    transport_cost: 0,
    miscellaneous_cost: 0
  })

  useEffect(() => {
    fetchFarm()
  }, [])

  const fetchFarm = async () => {
    try {
      const res = await api.get('/farm/my-farm')
      setFarm(res.data)
      setFormData(prev => ({
        ...prev,
        area_acres: res.data.total_area_acres
      }))
    } catch (err) {
      console.error('Error fetching farm:', err)
    }
  }

  const getForecast = async () => {
    if (!farm) {
      setError('Please create a farm profile first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/profit/forecast', formData)
      setForecast(response.data)
    } catch (err: any) {
      console.error('Error getting forecast:', err)
      setError('Could not generate profit forecast. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
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
        <h1 className="text-2xl font-bold text-white">Profit Forecasting</h1>
        <p className="text-gray-400 text-sm mt-1">
          AI-powered profit analysis and ROI calculation
        </p>
      </div>

      {/* Form */}
      {/* Form */}
<div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <label className="text-gray-400 text-sm mb-1.5 block">Area (acres)</label>
      <input
        type="number"
        value={formData.area_acres}
        onChange={(e) => setFormData({ ...formData, area_acres: parseFloat(e.target.value) || 0 })}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
      />
    </div>
    <div>
      <label className="text-gray-400 text-sm mb-1.5 block">Expected Yield (tons/acre)</label>
      <input
        type="number"
        step="0.1"
        value={formData.expected_yield}
        onChange={(e) => setFormData({ ...formData, expected_yield: parseFloat(e.target.value) || 0 })}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
      />
    </div>
  </div>

  {/* Second row of inputs */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
    <div>
      <label className="text-gray-400 text-sm mb-1.5 block">Market Price (₹/ton)</label>
      <input
        type="number"
        value={formData.market_price}
        onChange={(e) => setFormData({ ...formData, market_price: parseFloat(e.target.value) || 0 })}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
        placeholder="0 for default"
      />
    </div>
    <div>
      <label className="text-gray-400 text-sm mb-1.5 block">Seed Cost (₹/acre)</label>
      <input
        type="number"
        value={formData.seed_cost}
        onChange={(e) => setFormData({ ...formData, seed_cost: parseFloat(e.target.value) || 0 })}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
        placeholder="0 for default"
      />
    </div>
    <div>
      <label className="text-gray-400 text-sm mb-1.5 block">Fertilizer Cost (₹/acre)</label>
      <input
        type="number"
        value={formData.fertilizer_cost}
        onChange={(e) => setFormData({ ...formData, fertilizer_cost: parseFloat(e.target.value) || 0 })}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
        placeholder="0 for default"
      />
    </div>
    <div>
      <label className="text-gray-400 text-sm mb-1.5 block">Labor Cost (₹/acre)</label>
      <input
        type="number"
        value={formData.labor_cost}
        onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
        placeholder="0 for default"
      />
    </div>
  </div>

  {/* Single Calculate Button */}
  <button
    onClick={getForecast}
    disabled={loading}
    className="mt-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
  >
    {loading ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Calculating...
      </>
    ) : (
      <>
        <DollarSign className="w-4 h-4" />
        Calculate Profit
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

      {/* Results */}
      {forecast && (
        <div className="space-y-4">
          {/* Summary Cards */}
          {/* Summary Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
    <p className="text-gray-500 text-xs">Total Profit</p>
    <p className={`text-2xl font-bold ${forecast.total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      {formatCurrency(forecast.total_profit)}
    </p>
  </div>
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
    <p className="text-gray-500 text-xs">Profit per Acre</p>
    <p className={`text-2xl font-bold ${forecast.profit_per_acre >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      {formatCurrency(forecast.profit_per_acre)}
    </p>
  </div>
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
    <p className="text-gray-500 text-xs">ROI</p>
    <p className={`text-2xl font-bold ${forecast.roi_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      {forecast.roi_percentage}%
    </p>
  </div>
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
    <p className="text-gray-500 text-xs">Break-even Yield</p>
    <p className="text-white font-bold text-xl">
      {forecast.break_even_yield} tons/acre
    </p>
  </div>
</div>

          {/* Cost Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-400" />
              Cost Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Seeds</p>
                <p className="text-white font-medium">{formatCurrency(forecast.cost_breakdown.seed_cost)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Fertilizer</p>
                <p className="text-white font-medium">{formatCurrency(forecast.cost_breakdown.fertilizer_cost)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Pesticides</p>
                <p className="text-white font-medium">{formatCurrency(forecast.cost_breakdown.pesticide_cost)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Labor</p>
                <p className="text-white font-medium">{formatCurrency(forecast.cost_breakdown.labor_cost)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Irrigation</p>
                <p className="text-white font-medium">{formatCurrency(forecast.cost_breakdown.irrigation_cost)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Harvesting</p>
                <p className="text-white font-medium">{formatCurrency(forecast.cost_breakdown.harvesting_cost)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Transport</p>
                <p className="text-white font-medium">{formatCurrency(forecast.cost_breakdown.transport_cost)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Miscellaneous</p>
                <p className="text-white font-medium">{formatCurrency(forecast.cost_breakdown.miscellaneous_cost)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 col-span-2 md:col-span-4">
                <p className="text-gray-500 text-xs">Total Cost</p>
                <p className="text-white font-bold">{formatCurrency(forecast.cost_breakdown.total_cost)}</p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-green-400" />
              Revenue Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Total Yield</p>
                <p className="text-white font-bold text-xl">{forecast.revenue_breakdown.expected_yield.toFixed(2)} tons</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Market Price</p>
                <p className="text-white font-bold text-xl">{formatCurrency(forecast.revenue_breakdown.market_price)}/ton</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Total Revenue</p>
                <p className="text-green-400 font-bold text-xl">{formatCurrency(forecast.revenue_breakdown.total_revenue)}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                  <Leaf className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-xs">
              Generated: {new Date(forecast.generated_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}