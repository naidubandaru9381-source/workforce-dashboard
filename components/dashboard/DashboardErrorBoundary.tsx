"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  title: string;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
}

export default class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  state: DashboardErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): DashboardErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo,
  ) {
    console.error(
      "Dashboard widget error:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-800">
            {this.props.title}
          </h2>

          <p className="mt-2 text-sm text-red-700">
            This widget failed to load. Other dashboard
            widgets are still available.
          </p>

          <button
            type="button"
            onClick={() =>
              this.setState({
                hasError: false,
              })
            }
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}