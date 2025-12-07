import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional onError callback
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Here you could also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
          <Card className="max-w-md w-full pt-4">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-accent-error" />
              </div>

              <h1 className="text-xl font-bold text-text-primary mb-2">
                Oops! Something went wrong
              </h1>

              <p className="text-text-secondary mb-6">
                We encountered an unexpected error. Don&apos;t worry, it&apos;s
                not your fault.
              </p>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-text-secondary hover:text-text-primary">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="mt-2 p-3 bg-background-tertiary rounded text-xs overflow-auto text-accent-error">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="w-full gap-3 cursor-pointer"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Try Again</span>
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={this.handleRefresh}
                    variant="secondary"
                    className="gap-2 cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reload Page</span>
                  </Button>

                  <Button
                    onClick={this.handleGoHome}
                    variant="secondary"
                    className="gap-2 cursor-pointer"
                  >
                    <Home className="h-4 w-4" />
                    <span>Go Home</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}
