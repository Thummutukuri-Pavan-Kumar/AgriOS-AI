import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, CheckCircle, XCircle, AlertCircle, 
  Info, Clock, Loader2, Trash2, CheckCheck,
  Droplets, Sun, TrendingUp, FileText, Bug
} from 'lucide-react'
import api from '../api/client'

interface Alert {
  id: number
  alert_type: string
  title: string
  message: string
  priority: string
  is_read: boolean
  action_url: string | null
  crop_type: string | null
  created_at: string
  read_at: string | null
}

interface AlertCount {
  total: number
  unread: number
  high_priority: number
}

const getAlertIcon = (type: string) => {
  switch(type.toLowerCase()) {
    case 'disease': return <Bug className="w-5 h-5" />
    case 'weather': return <Sun className="w-5 h-5" />
    case 'irrigation': return <Droplets className="w-5 h-5" />
    case 'market': return <TrendingUp className="w-5 h-5" />
    case 'scheme': return <FileText className="w-5 h-5" />
    default: return <Bell className="w-5 h-5" />
  }
}

const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'High': return 'text-red-400 bg-red-900/30 border-red-800'
    case 'Medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-800'
    default: return 'text-blue-400 bg-blue-900/30 border-blue-800'
  }
}

const getPriorityIcon = (priority: string) => {
  switch(priority) {
    case 'High': return <AlertCircle className="w-4 h-4" />
    case 'Medium': return <Info className="w-4 h-4" />
    default: return <CheckCircle className="w-4 h-4" />
  }
}

export default function Alerts() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [counts, setCounts] = useState<AlertCount>({ total: 0, unread: 0, high_priority: 0 })
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
    fetchCounts()
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const url = filter === 'unread' ? '/alerts?unread_only=true' : '/alerts'
      const res = await api.get(url)
      setAlerts(res.data)
    } catch (err) {
      console.error('Error fetching alerts:', err)
      setError('Could not load alerts')
    } finally {
      setLoading(false)
    }
  }

  const fetchCounts = async () => {
    try {
      const res = await api.get('/alerts/count')
      setCounts(res.data)
    } catch (err) {
      console.error('Error fetching counts:', err)
    }
  }

  const markAsRead = async (alertId: number) => {
    try {
      await api.put(`/alerts/${alertId}`, { is_read: true })
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_read: true } : a
      ))
      fetchCounts()
    } catch (err) {
      console.error('Error marking alert as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(a => !a.is_read)
      for (const alert of unreadAlerts) {
        await api.put(`/alerts/${alert.id}`, { is_read: true })
      }
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
      fetchCounts()
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteAlert = async (alertId: number) => {
    if (!confirm('Delete this alert?')) return
    try {
      await api.delete(`/alerts/${alertId}`)
      setAlerts(prev => prev.filter(a => a.id !== alertId))
      fetchCounts()
    } catch (err) {
      console.error('Error deleting alert:', err)
    }
  }

  const clearAll = async () => {
    if (!confirm('Delete all alerts?')) return
    try {
      await api.delete('/alerts/clear-all')
      setAlerts([])
      fetchCounts()
    } catch (err) {
      console.error('Error clearing alerts:', err)
    }
  }

  const generateAlerts = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/alerts/generate')
      setAlerts(prev => [...res.data, ...prev])
      fetchCounts()
    } catch (err) {
      console.error('Error generating alerts:', err)
      setError('Could not generate alerts')
    } finally {
      setGenerating(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
        <p className="text-gray-400 text-sm">Loading alerts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts & Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">
            Stay informed about your farm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateAlerts}
            disabled={generating}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            Generate Alerts
          </button>
          {alerts.some(a => !a.is_read) && (
            <button
              onClick={markAllAsRead}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          {alerts.length > 0 && (
            <button
              onClick={clearAll}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs">Total Alerts</p>
          <p className="text-white font-bold text-2xl">{counts.total}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs">Unread</p>
          <p className="text-yellow-400 font-bold text-2xl">{counts.unread}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs">High Priority</p>
          <p className="text-red-400 font-bold text-2xl">{counts.high_priority}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'all' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'unread' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Unread {counts.unread > 0 && `(${counts.unread})`}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-gray-400 text-sm">No alerts yet</h3>
          <p className="text-gray-600 text-xs mt-1">Click "Generate Alerts" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`bg-gray-900 border rounded-xl p-4 transition-all ${
                alert.is_read 
                  ? 'border-gray-800 opacity-70' 
                  : 'border-green-500/50 shadow-green-500/10 shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  alert.is_read ? 'bg-gray-800 text-gray-500' : 'bg-green-900/30 text-green-400'
                }`}>
                  {getAlertIcon(alert.alert_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-medium ${alert.is_read ? 'text-gray-400' : 'text-white'}`}>
                        {alert.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(alert.priority)} flex items-center gap-1`}>
                        {getPriorityIcon(alert.priority)}
                        {alert.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(alert.created_at)}
                    </span>
                    {alert.crop_type && (
                      <span className="text-gray-500 text-xs">🌾 {alert.crop_type}</span>
                    )}
                    <span className="text-gray-500 text-xs capitalize">{alert.alert_type}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    {!alert.is_read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-green-400 hover:text-green-300 text-xs flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}