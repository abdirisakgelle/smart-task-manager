import React from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to localStorage for debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 10 errors
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10);
      }
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error to localStorage:', e);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <div className="text-center">
              <Icon icon="ph:warning-circle" className="text-6xl text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. This has been logged for investigation.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={this.handleRetry}
                  className="btn btn-primary"
                  disabled={this.state.retryCount >= 3}
                >
                  {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="btn btn-outline"
                >
                  Go to Dashboard
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="btn btn-secondary"
                >
                  Reload Page
                </button>
              </div>
              
              {this.state.retryCount >= 3 && (
                <p className="text-sm text-gray-500 mt-4">
                  If the problem persists, please contact support.
                </p>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 