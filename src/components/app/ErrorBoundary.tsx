import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-6">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 text-center shadow-xl">
            <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary mb-3">Something Went Wrong</p>
            <h1 className="text-3xl font-heading font-black mb-3">We hit an unexpected issue.</h1>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Please refresh the page. If the problem continues, return to the homepage and try again.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
              >
                Reload Page
              </button>
              <a
                href="#/"
                className="px-5 py-2.5 rounded-lg border border-border text-sm font-bold hover:bg-background transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
