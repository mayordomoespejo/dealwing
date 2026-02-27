import { Component } from 'react'
import i18n from '@/lib/i18n.js'

/**
 * React error boundary that catches rendering errors in its subtree
 * and renders a fallback UI instead of crashing the whole page.
 *
 * @extends {Component<{ children: React.ReactNode, fallback?: React.ReactNode }>}
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div role="alert" style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.7 }}>
          <p>{i18n.t('common.errorBoundaryMessage')}</p>
        </div>
      )
    }

    return this.props.children
  }
}
