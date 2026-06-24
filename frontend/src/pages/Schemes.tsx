import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, CheckCircle, XCircle, Calendar,
  ExternalLink, Phone, Loader2, AlertCircle,
  TrendingUp, Award, Clock, IndianRupee
} from 'lucide-react'
import api from '../api/client'

interface Scheme {
  scheme_name: string
  scheme_type: string
  description: string
  eligibility_criteria: string[]
  benefits: string
  financial_benefit: number
  application_process: string[]
  deadline: string
  website: string
  helpline: string
  is_eligible: boolean
  match_score: number
}

interface UpcomingDeadline {
  scheme_name: string
  deadline: string
  days_remaining: number
  priority: string
}

const CATEGORY_OPTIONS = ['General', 'SC', 'ST', 'OBC']
const FARMER_TYPE_OPTIONS = ['Small', 'Medium', 'Large']
const CROP_OPTIONS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Chili', 'Soybean', 'Groundnut', 'Sunflower']

export default function Schemes() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [farm, setFarm] = useState<any>(null)
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    crop_type: '',
    farm_size: 0,
    category: 'General',
    farmer_type: 'Small'
  })

  useEffect(() => {
    fetchFarm()
    fetchDeadlines()
  }, [])

  const fetchFarm = async () => {
    try {
      const res = await api.get('/farm/my-farm')
      setFarm(res.data)
      setFormData(prev => ({
        ...prev,
        state: res.data.location_state || '',
        district: res.data.location_district || '',
        farm_size: res.data.total_area_acres || 0
      }))
    } catch (err) {
      console.error('Error fetching farm:', err)
    }
  }

  const fetchDeadlines = async () => {
    try {
      const res = await api.get('/schemes/deadlines')
      setUpcomingDeadlines(res.data)
    } catch (err) {
      console.error('Error fetching deadlines:', err)
    }
  }

  const getRecommendations = async () => {
    if (!formData.state || !formData.district) {
      setError('Please complete your farm profile with state and district')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/schemes/recommend', {
        state: formData.state,
        district: formData.district,
        crop_type: formData.crop_type || undefined,
        farm_size: formData.farm_size,
        category: formData.category,
        farmer_type: formData.farmer_type
      })
      setSchemes(response.data)
    } catch (err: any) {
      console.error('Error getting schemes:', err)
      setError('Could not get scheme recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getEligibilityColor = (score: number) => {
    if (score >= 70) return 'text-green-400 bg-green-900/30'
    if (score >= 50) return 'text-yellow-400 bg-yellow-900/30'
    return 'text-red-400 bg-red-900/30'
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'text-red-400'
    return 'text-yellow-400'
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
        <h1 className="text-2xl font-bold text-white">Government Schemes</h1>
        <p className="text-gray-400 text-sm mt-1">
          Discover and apply for government schemes based on your farm profile
        </p>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-400" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-2">
            {upcomingDeadlines.map((deadline, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div>
                  <p className="text-white text-sm font-medium">{deadline.scheme_name}</p>
                  <p className="text-gray-400 text-xs">Deadline: {deadline.deadline}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getPriorityColor(deadline.priority)}`}>
                    {deadline.days_remaining} days left
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(deadline.priority)} bg-gray-800`}>
                    {deadline.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Farmer Type</label>
            <select
              value={formData.farmer_type}
              onChange={(e) => setFormData({ ...formData, farmer_type: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              {FARMER_TYPE_OPTIONS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Crop Type (Optional)</label>
            <select
              value={formData.crop_type}
              onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              <option value="">Select crop</option>
              {CROP_OPTIONS.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={getRecommendations}
          disabled={loading}
          className="mt-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Finding schemes...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Find Eligible Schemes
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
      {schemes.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs">Total Schemes</p>
              <p className="text-white font-bold text-2xl">{schemes.length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs">Eligible</p>
              <p className="text-green-400 font-bold text-2xl">
                {schemes.filter(s => s.is_eligible).length}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs">Potential Benefits</p>
              <p className="text-green-400 font-bold text-2xl">
                ₹{schemes.reduce((sum, s) => sum + (s.is_eligible ? s.financial_benefit : 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {schemes.map((scheme, index) => (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold text-lg">{scheme.scheme_name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400">
                      {scheme.scheme_type}
                    </span>
                    {scheme.is_eligible ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Eligible
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Not Eligible
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{scheme.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEligibilityColor(scheme.match_score)}`}>
                  {scheme.match_score}% Match
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-xs font-medium mb-2">Benefits</p>
                  <p className="text-green-400 font-medium">{scheme.benefits}</p>
                  {scheme.financial_benefit > 0 && (
                    <p className="text-gray-300 text-sm mt-1">
                      <IndianRupee className="w-3 h-3 inline" /> {scheme.financial_benefit.toLocaleString()} per year
                    </p>
                  )}
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-xs font-medium mb-2">Deadline</p>
                  <p className="text-white text-sm">{scheme.deadline}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <p className="text-gray-400 text-xs">Helpline: {scheme.helpline}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-xs font-medium mb-2">Eligibility Criteria</p>
                <ul className="list-disc list-inside space-y-1">
                  {scheme.eligibility_criteria.map((criteria, i) => (
                    <li key={i} className="text-gray-300 text-sm">{criteria}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-xs font-medium mb-2">Application Process</p>
                <ol className="list-decimal list-inside space-y-1">
                  {scheme.application_process.map((step, i) => (
                    <li key={i} className="text-gray-300 text-sm">{step}</li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <a 
                  href={scheme.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}