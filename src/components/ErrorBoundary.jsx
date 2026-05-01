import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24,
          maxWidth: 560,
          margin: '40px auto',
          background: 'rgba(20, 30, 45, 0.98)',
          border: '2px solid rgba(212, 175, 55, 0.5)',
          borderRadius: 12,
          color: '#e0d8c8',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h2 style={{ margin: '0 0 12px', color: '#d4af37' }}>Something went wrong</h2>
          <p style={{ margin: 0, fontSize: 14 }}>{this.state.error?.message}</p>
          {typeof this.state.error?.stack === 'string' && (
            <pre style={{
              marginTop: 12,
              padding: 12,
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 8,
              fontSize: 11,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
