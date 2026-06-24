import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Map, Plus, Trash2, Edit2, Move, Maximize2,
  Sprout, Droplets, Sun, Loader2, AlertCircle,
  Check, X, Calendar, TrendingUp, Layers
} from 'lucide-react'
import api from '../api/client'

interface Field {
  id: number
  field_name: string
  area_acres: number
  crop_type: string | null
  color: string
  x: number
  y: number
  width: number
  height: number
}

interface FarmData {
  farm_id: number
  farm_name: string
  total_area: number
  fields: Field[]
  irrigation_type: string | null
  soil_type: string | null
  water_source: string | null
}

interface CropRotation {
  field_id: number
  field_name: string
  current_crop: string
  next_crop: string
  season: string
  year: number
  reason: string
  profitability: string
}

const COLORS = ['#4ade80', '#facc15', '#f87171', '#60a5fa', '#a78bfa', '#fb923c', '#34d399', '#f472b6']
const CROP_OPTIONS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Chili', 'Soybean', 'Groundnut', 'Sunflower']

export default function FarmTwin() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [farmData, setFarmData] = useState<FarmData | null>(null)
  const [rotations, setRotations] = useState<CropRotation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAddField, setShowAddField] = useState(false)
  const [showRotations, setShowRotations] = useState(false)
  
  const [newField, setNewField] = useState({
    field_name: '',
    area_acres: 0,
    crop_type: '',
    color: '#4ade80'
  })

  useEffect(() => {
    fetchTwinData()
  }, [])

  const fetchTwinData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/twin/farm')
      setFarmData(res.data)
    } catch (err: any) {
      console.error('Error fetching twin data:', err)
      if (err.response?.status === 404) {
        setError('Farm not found. Please create a farm profile first.')
      } else {
        setError('Could not load farm data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchRotations = async () => {
    try {
      const res = await api.post('/twin/crop-rotation')
      setRotations(res.data)
      setShowRotations(true)
    } catch (err) {
      console.error('Error fetching rotations:', err)
    }
  }

  const addField = async () => {
  if (!newField.field_name || newField.area_acres <= 0) {
    setError('Please fill in all field details')
    return
  }

  try {
    const fieldData = {
      field_name: newField.field_name.trim(),
      area_acres: Number(newField.area_acres),
      crop_type: newField.crop_type || null,
      color: newField.color || '#4ade80',
      x: Math.floor(Math.random() * 200),
      y: Math.floor(Math.random() * 200),
      width: 80 + Math.floor(Math.random() * 60),
      height: 80 + Math.floor(Math.random() * 60)
    }

    console.log('Sending field data:', JSON.stringify(fieldData, null, 2))

    const response = await api.post('/twin/fields', fieldData)
    console.log('Response:', response.data)
    
    setFarmData(prev => prev ? {
      ...prev,
      fields: [...prev.fields, response.data]
    } : null)
    
    setShowAddField(false)
    setNewField({ field_name: '', area_acres: 0, crop_type: '', color: '#4ade80' })
    setError(null)
  } catch (err: any) {
    console.error('Error adding field:', err)
    console.error('Error response status:', err.response?.status)
    console.error('Error response data:', err.response?.data)
    
    if (err.response?.status === 400) {
      setError(err.response?.data?.detail || 'Field name already exists or invalid data')
    } else {
      setError('Could not add field. Please try again.')
    }
  }
}
  const deleteField = async (fieldId: number) => {
    if (!confirm('Are you sure you want to delete this field?')) return
    
    try {
      await api.delete(`/twin/fields/${fieldId}`)
      setFarmData(prev => prev ? {
        ...prev,
        fields: prev.fields.filter(f => f.id !== fieldId)
      } : null)
    } catch (err) {
      console.error('Error deleting field:', err)
      setError('Could not delete field. Please try again.')
    }
  }

  const getFieldColor = (index: number) => {
    return COLORS[index % COLORS.length]
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
        <p className="text-gray-400 text-sm">Loading farm map...</p>
      </div>
    )
  }

  if (!farmData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-yellow-400" />
        <p className="text-gray-400 text-sm">{error || 'No farm data found'}</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Farm Digital Twin</h1>
          <p className="text-gray-400 text-sm mt-1">
            {farmData.farm_name} — {farmData.total_area} acres
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddField(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
          <button
            onClick={fetchRotations}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Crop Rotation
          </button>
        </div>
      </div>

      {/* Farm Map */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Map className="w-4 h-4 text-green-400" />
            Farm Layout
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>Crop</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Fallow</span>
            </div>
          </div>
        </div>

        <div 
          ref={canvasRef}
          className="relative bg-gray-800 rounded-lg p-4 min-h-[400px] border border-gray-700"
          style={{ backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {farmData.fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Map className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No fields added yet</p>
              <p className="text-xs">Click "Add Field" to start mapping your farm</p>
            </div>
          ) : (
            <div className="relative w-full h-[400px]">
              {farmData.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="absolute rounded-lg border-2 border-gray-700 hover:border-green-400 transition-all cursor-pointer group"
                  style={{
                    left: `${field.x}px`,
                    top: `${field.y}px`,
                    width: `${field.width}px`,
                    height: `${field.height}px`,
                    backgroundColor: field.color,
                    opacity: 0.85
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <p className="text-white font-semibold text-xs text-center truncate w-full">
                      {field.field_name}
                    </p>
                    {field.crop_type && (
                      <p className="text-white/80 text-xs">{field.crop_type}</p>
                    )}
                    <p className="text-white/60 text-xs">{field.area_acres} acres</p>
                  </div>
                  <button
                    onClick={() => deleteField(field.id)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Field List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-green-400" />
          Fields ({farmData.fields.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {farmData.fields.map((field) => (
            <div key={field.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: field.color }} />
                  <span className="text-white font-medium text-sm">{field.field_name}</span>
                </div>
                <span className="text-gray-400 text-xs">{field.area_acres} acres</span>
              </div>
              {field.crop_type && (
                <p className="text-gray-400 text-xs mt-1">
                  <Sprout className="w-3 h-3 inline" /> {field.crop_type}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Field Modal */}
      {showAddField && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-4">Add New Field</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Field Name</label>
                <input
                  value={newField.field_name}
                  onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
                  placeholder="e.g., North Field"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Area (acres)</label>
                <input
                  type="number"
                  value={newField.area_acres}
                  onChange={(e) => setNewField({ ...newField, area_acres: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
                  placeholder="e.g., 2.5"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Crop Type (Optional)</label>
                <select
                  value={newField.crop_type}
                  onChange={(e) => setNewField({ ...newField, crop_type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
                >
                  <option value="">Select crop</option>
                  {CROP_OPTIONS.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewField({ ...newField, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newField.color === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={addField}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                Add Field
              </button>
              <button
                onClick={() => setShowAddField(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Rotation Modal */}
      {showRotations && rotations.length > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Crop Rotation Plan
              </h2>
              <button
                onClick={() => setShowRotations(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {rotations.map((rotation) => (
                <div key={rotation.field_id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{rotation.field_name}</h3>
                    <span className="text-green-400 text-sm">{rotation.season} {rotation.year}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Current:</span>
                      <span className="text-white text-sm">{rotation.current_crop}</span>
                    </div>
                    <span className="text-gray-600">→</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Next:</span>
                      <span className="text-green-400 text-sm font-medium">{rotation.next_crop}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">{rotation.reason}</p>
                  <p className="text-green-400 text-xs mt-1">
                    <TrendingUp className="w-3 h-3 inline" /> Expected profit: {rotation.profitability}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRotations(false)}
              className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}