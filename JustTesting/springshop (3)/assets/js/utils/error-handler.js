/**
 * Error Handler Utility
 * Formats backend HTTP error responses into human-friendly messages
 */
const ErrorHandler = {
  format(error) {
    if (!error) return 'An unexpected error occurred. Please try again.';
    
    if (typeof error === 'string') return error;

    // Handle standard Spring Boot error responses
    if (error.message) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return 'Unable to connect to Spring Boot backend. Please ensure the backend is running at ' + (window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:8080');
      }
      return error.message;
    }

    if (error.status) {
      switch (error.status) {
        case 400:
          return error.error || error.detail || 'Bad request. Please check the entered data.';
        case 401:
          return 'Your session has expired or you are unauthorized. Please sign in again.';
        case 403:
          return 'Access denied. You do not have permission for this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'A conflict occurred (e.g. item already exists or stock limit reached).';
        case 500:
          return 'Internal Server Error. Please verify backend logs.';
        default:
          return `Request failed with status ${error.status}`;
      }
    }

    return 'Something went wrong. Please try again.';
  }
};

window.ErrorHandler = ErrorHandler;
