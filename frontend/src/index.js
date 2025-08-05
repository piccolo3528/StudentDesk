import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { setupAPIClient, testApiConnection } from './utils/api';
import logger from './utils/logger';

// Configure logger with fallback if it's not properly loaded
try {
  if (logger && typeof logger.configure === 'function') {
    logger.configure({
      currentLevel: process.env.NODE_ENV === 'production' ? 2 : 0, // Debug in dev, Warn in prod
      includeTimestamps: true
    });
    console.info('Logger configured successfully');
  } else {
    console.warn('Logger not properly loaded, falling back to console');
  }
} catch (err) {
  console.error('Error configuring logger:', err);
}

// Initialize API client with our enhanced error handling
setupAPIClient();

// Test API connectivity on startup
testApiConnection()
  .then(result => {
    if (result.success) {
      console.info('API Connection Test: Success');
    } else {
      console.warn('API Connection Test: Failed', { error: result.error.message });
      // Don't block the app from loading, but warn in console
    }
  })
  .catch(err => {
    console.error('API Connection Test: Error', err);
  });

// Create error boundary component for the entire app
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to our centralized logger with fallback
    try {
      if (logger && typeof logger.error === 'function') {
        logger.error('Unhandled Application Error', error, { 
          componentStack: errorInfo?.componentStack
        });
      } else {
        console.error('Unhandled Application Error (fallback logger):', error, errorInfo);
      }
    } catch (err) {
      console.error('Error logging to centralized logger:', err);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>The application encountered an error. Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
          {this.state.error && (
            <div style={{ marginTop: '20px', textAlign: 'left', padding: '10px', backgroundColor: '#f8f8f8', borderRadius: '4px' }}>
              <p style={{ fontWeight: 'bold', color: 'red' }}>{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                  <summary>Component Stack</summary>
                  {this.state.errorInfo.componentStack}
                </details>
              )}
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
