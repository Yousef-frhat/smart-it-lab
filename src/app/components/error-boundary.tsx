import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-[#EF4444]" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-[#94A3B8] mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>

            {/* Error details (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-[#1E293B] border border-[#334155] rounded-lg text-left">
                <p className="text-xs font-mono text-[#EF4444] break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-[10px] font-mono text-[#64748B] overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-md font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-[#334155] text-[#94A3B8] hover:bg-[#1E293B] hover:text-white rounded-md font-medium transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
