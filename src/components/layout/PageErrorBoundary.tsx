import { Component, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Page Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto p-6 max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">
              Hiba történt az oldal betöltése közben
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>Sajnáljuk, váratlan hiba történt. Próbálkozzon újra, vagy térjen vissza a kezdőlapra.</p>
              
              {this.state.error && (
                <details className="text-sm bg-background p-3 rounded border mt-3">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technikai részletek
                  </summary>
                  <pre className="overflow-auto text-xs whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 mt-4">
                <Button onClick={this.handleReset} variant="outline" size="sm">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Újrapróbálás
                </Button>
                <Button onClick={this.handleRefresh} variant="outline" size="sm">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Oldal újratöltése
                </Button>
                <Button onClick={this.handleGoHome} size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Kezdőlap
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
