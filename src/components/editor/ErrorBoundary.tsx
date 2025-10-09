import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Editor Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground">
              The editor encountered an unexpected error. Don't worry, your work may be recovered.
            </p>
            {this.state.error && (
              <details className="text-left text-xs bg-muted p-3 rounded">
                <summary className="cursor-pointer font-semibold mb-2">Error details</summary>
                <pre className="overflow-auto">{this.state.error.message}</pre>
              </details>
            )}
            <Button onClick={this.handleReload} className="w-full">
              Reload Editor
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
