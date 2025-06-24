import { Component } from "react";

class ErrorBoundary extends Component {
  /** @type {object} */
  props;
  state;

  /** @param {object} props */
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError
      ? this.props.fallback
      : this.props.children;
  }
}

export default ErrorBoundary;
