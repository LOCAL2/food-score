'use client'

import { useState, useEffect } from 'react'

export default function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [scoreboardInfo, setScoreboardInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      // Fetch environment debug
      const debugResponse = await fetch('/api/debug')
      const debugData = await debugResponse.json()
      setDebugInfo(debugData)

      // Fetch user info
      try {
        const userResponse = await fetch('/api/user-info')
        const userData = await userResponse.json()
        setUserInfo(userData)
      } catch (error) {
        console.log('User not logged in')
      }

      // Fetch scoreboard
      try {
        const scoreboardResponse = await fetch('/api/scoreboard')
        const scoreboardData = await scoreboardResponse.json()
        setScoreboardInfo(scoreboardData)
      } catch (error) {
        console.log('Scoreboard fetch failed')
      }
    } catch (error) {
      console.error('Debug fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-fetch on mount
    fetchDebugInfo()
  }, [])

  if (!debugInfo) return null

  const hasIssues = Object.values(debugInfo.variables || {}).some(status => status.includes('❌'))

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className={`alert ${hasIssues ? 'alert-warning' : 'alert-success'} shadow-lg`}>
        <div>
          <h3 className="font-bold">Environment Status</h3>
          <div className="text-xs space-y-1">
            {Object.entries(debugInfo.variables || {}).map(([key, status]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span>{status}</span>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <button 
              onClick={fetchDebugInfo}
              disabled={loading}
              className="btn btn-xs"
            >
              {loading ? 'Checking...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
