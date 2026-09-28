/**
 * Empty & Error State Component
 */
const EmptyState = {
  render({
    icon = 'fa-solid fa-box-open',
    title = 'No items found',
    description = 'There are no records to display at this moment.',
    actionText = null,
    onAction = null,
    actionId = null
  }) {
    return `
      <div class="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
        <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center text-2xl mb-4">
          <i class="${icon}"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">${title}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">${description}</p>
        ${actionText ? `
          <button id="${actionId || 'empty-state-action'}" class="btn-primary">
            ${actionText}
          </button>
        ` : ''}
      </div>
    `;
  },

  renderError({
    title = 'Something went wrong',
    message = 'Unable to fetch data from the server. Please check your connection.',
    retryText = 'Retry',
    retryCallback = null,
    retryHandlerName = null,
    retryId = 'retry-button'
  }) {
    return `
      <div class="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
        <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center text-2xl mb-4 border border-red-200 dark:border-red-900">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">${title}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">${message}</p>
        <button id="${retryId}" onclick="${retryHandlerName || ''}" class="btn-secondary">
          <i class="fa-solid fa-arrow-rotate-right mr-1.5"></i> ${retryText}
        </button>
      </div>
    `;
  }
};

window.EmptyState = EmptyState;
