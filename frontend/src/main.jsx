import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "30px",
            color: "#991b1b",
            backgroundColor: "#fef2f2",
            fontFamily: "monospace",
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
            🚨 Error de React Detectado 🚨
          </h2>
          <p>
            <strong>Mensaje:</strong> {this.state.error?.toString()}
          </p>
          <hr style={{ margin: "20px 0", borderColor: "#fca5a5" }} />
          <p>
            <strong>Lugar del error (Component Stack):</strong>
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
          >
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
