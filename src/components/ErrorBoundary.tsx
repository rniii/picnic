import { lazyComponent } from "picnic"
import { react } from "plugins/common"
import { createElement } from "plugins/common/react"
import type { ErrorInfo, ReactNode } from "react"

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
        ? "fallback" in this.props
          ? this.props.fallback
          : <div className="error-boundary" title={this.state.error}>{"Something exploded :<"}</div>
        : this.props.children
    }
  }
)

export const withErrorBoundary = <P extends object>(
  component: React.ComponentClass<P> | ((props: P) => React.ReactNode),
) => {
  return (props: P) => createElement(ErrorBoundary, null, createElement(component, props))
}
