import { lazyComponent } from "picnic"
import { react } from "plugins/common"
import { ErrorInfo, ReactNode } from "react"

interface Props {
  fallback?: ReactNode
  children: ReactNode
}

export const ErrorBoundary = lazyComponent(() =>
  class extends react.Component<Props, { error?: string }> {
    constructor(props: Props) {
      super(props)

      this.state = {}
    }

    static getDerivedStateFromError(error: any) {
      try {
        return { error }
      } catch {
        return { error: "Unknown" }
      }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
      console.error("Component error:", error)
      console.error(errorInfo.componentStack)
    }

    render() {
      return this.state.error
        ? this.props.fallback ?? <div className="error-boundary" title={this.state.error}>{"Something exploded :<"}</div>
        : this.props.children
    }
  }
)
