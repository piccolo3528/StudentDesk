import React from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';

/**
 * Higher-Order Component (HOC) that wraps any component with error handling functionality
 * 
 * @param {React.ComponentType} WrappedComponent - The component to wrap with error handling
 * @param {Object} options - Configuration options
 * @param {React.ReactNode} options.fallback - Custom fallback UI to show when an error occurs
 * @returns {React.ComponentType} - Enhanced component with error boundary
 */
const withErrorHandling = (WrappedComponent, options = {}) => {
  // Return a new component
  const WithErrorHandling = (props) => {
    return (
      <ErrorBoundary fallback={options.fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  // Set display name for debugging
  WithErrorHandling.displayName = `WithErrorHandling(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorHandling;
};

export default withErrorHandling; 