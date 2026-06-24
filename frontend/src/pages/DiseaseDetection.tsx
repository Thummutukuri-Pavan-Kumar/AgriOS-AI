import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, X, Loader2, CheckCircle, AlertTriangle, 
  Shield, Leaf, Droplets, Apple, Bug
} from 'lucide-react'
import api from '../api/client'

interface DetectionResult {
  disease_name: string
  confidence: number
  severity: string
  symptoms: string[]
  treatment: string
  prevention: string
  organic_remedy: string
  chemical_remedy: string
  detected_at: string
}

export default function DiseaseDetection() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    setError(null)
    setResult(null)
    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await api.post('/disease/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setResult(response.data)
    } catch (err: any) {
      console.error('Error detecting disease:', err)
      setError(err.response?.data?.detail || 'Failed to detect disease. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getSeverityColor = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'mild': return 'text-green-400 bg-green-900/30'
      case 'moderate': return 'text-yellow-400 bg-yellow-900/30'
      case 'severe': return 'text-red-400 bg-red-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Disease Detection</h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload a leaf image to detect diseases and get treatment recommendations
        </p>
      </div>

      {/* Upload Area */}
      {!result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging 
                ? 'border-green-500 bg-green-900/20' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {preview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-64 rounded-lg border border-gray-700"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">{selectedFile?.name}</p>
                  <p className="text-gray-500 text-xs">
                    {(selectedFile?.size || 0) / 1024 / 1024} MB
                  </p>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Detect Disease
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Drop your leaf image here</p>
                  <p className="text-gray-500 text-sm">or click to browse</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Choose Image
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Result Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Bug className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">{result.disease_name}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(result.severity)}`}>
                      {result.severity}
                    </span>
                    <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                      {result.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Symptoms */}
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Symptoms
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.symptoms.map((symptom, i) => (
                  <span key={i} className="bg-gray-800 text-gray-300 text-sm px-3 py-1.5 rounded-lg">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* Treatment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-green-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Organic Remedy
                </h3>
                <p className="text-gray-300 text-sm">{result.organic_remedy}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-blue-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Chemical Remedy
                </h3>
                <p className="text-gray-300 text-sm">{result.chemical_remedy}</p>
              </div>
            </div>

            {/* Treatment Details */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4">
              <h3 className="text-yellow-400 text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Treatment Plan
              </h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.treatment}</p>
            </div>

            <div className="mt-4 bg-gray-800 rounded-lg p-4">
              <h3 className="text-blue-400 text-sm font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Prevention Tips
              </h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.prevention}</p>
            </div>

            <div className="mt-4 text-right">
              <p className="text-gray-500 text-xs">
                Detected at: {new Date(result.detected_at).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Detect another disease
          </button>
        </div>
      )}
    </div>
  )
}