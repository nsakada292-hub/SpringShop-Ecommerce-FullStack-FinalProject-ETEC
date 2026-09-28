import { toast } from '../components/toast.js';

export const errorHandler = {
  handle(error, fallbackMessage = 'An unexpected error occurred') {
    console.error('Handled Application Error:', error);
    let message = fallbackMessage;
    if (typeof error === 'string') {
      message = error;
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }
    toast.error(message);
    return message;
  }
};