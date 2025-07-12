'use client'

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4" data-theme="cupcake">
          <div className="card w-full max-w-md bg-base-100 shadow-2xl border-2 border-error/20">
            <div className="card-body text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-error mb-2">
                เกิดข้อผิดพลาด
              </h1>
              <p className="text-base-content/70 mb-6">
                แอปพลิเคชันพบข้อผิดพลาดที่ไม่คาดคิด
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-primary w-full"
                >
                  รีเฟรชหน้า
                </button>
                <button 
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="btn btn-ghost w-full"
                >
                  ลองใหม่
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-base-200 rounded text-xs text-left">
                  <strong>Debug Info:</strong><br />
                  {this.state.error?.toString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
