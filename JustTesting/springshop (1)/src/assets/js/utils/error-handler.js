/**
 * Centralized Error Parser & Handler
 */
export const errorHandler = {
  parse(error) {
    if (!error) return 'An unexpected error occurred.';
    
    // Network or offline error
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      return 'Unable to connect to server. Please ensure the backend is running.';
    }

    if (typeof error === 'string') return error;

    if (error.message) return error.message;

    if (error.status) {
      switch (error.status) {
        case 400:
          return error.data?.message || 'Bad request. Please verify your input.';
        case 401:
          return 'Your session has expired. Please sign in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return error.data?.message || 'Requested resource was not found.';
        case 409:
          return error.data?.message || 'A conflict occurred with existing data.';
        case 500:
          return 'Internal server error. Please try again later.';
        default:
          return error.data?.message || `Request failed with status ${error.status}`;
      }
    }

    return 'Something went wrong. Please try again.';
  }
};
