/**
 * Toast Notification Component
 * Displays elegant, non-blocking toast notifications
 */
const Toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0';
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = 3500) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-4 opacity-0 animate-fade-in ${this.getTypeStyles(type)}`;
    
    const icon = this.getTypeIcon(type);

    toast.innerHTML = `
      <div class="flex-shrink-0 text-lg mt-0.5">${icon}</div>
      <div class="flex-1 font-medium leading-snug">${message}</div>
      <button class="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity ml-1" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    const dismiss = () => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  },

  getTypeStyles(type) {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800';
      case 'error':
        return 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800';
      case 'warning':
        return 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800';
      default:
        return 'bg-white text-gray-800 border-gray-200 shadow-md dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700';
    }
  },

  getTypeIcon(type) {
    switch (type) {
      case 'success':
        return '<i class="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400"></i>';
      case 'error':
        return '<i class="fa-solid fa-circle-exclamation text-rose-600 dark:text-rose-400"></i>';
      case 'warning':
        return '<i class="fa-solid fa-triangle-exclamation text-amber-600 dark:text-amber-400"></i>';
      default:
        return '<i class="fa-solid fa-circle-info text-blue-600 dark:text-blue-400"></i>';
    }
  },

  success(msg, duration) { this.show(msg, 'success', duration); },
  error(msg, duration) { this.show(msg, 'error', duration); },
  warning(msg, duration) { this.show(msg, 'warning', duration); },
  info(msg, duration) { this.show(msg, 'info', duration); }
};

window.Toast = Toast;
