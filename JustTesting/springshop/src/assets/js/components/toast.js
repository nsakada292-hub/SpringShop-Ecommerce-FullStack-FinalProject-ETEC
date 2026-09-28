/**
 * Toast Notification Component
 */
class ToastManager {
  constructor() {
    this.container = null;
  }

  ensureContainer() {
    if (!this.container || !document.body.contains(this.container)) {
      this.container = document.createElement('div');
      this.container.id = 'springshop-toast-container';
      this.container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0';
      document.body.appendChild(this.container);
    }
  }

  show({ title, message, type = 'info', duration = 4000 }) {
    this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto transform transition-all duration-300 ease-out translate-y-2 opacity-0 flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md ${this.getTypeStyles(type)}`;

    const iconSvg = this.getIcon(type);

    toast.innerHTML = `
      <div class="flex-shrink-0 mt-0.5">${iconSvg}</div>
      <div class="flex-1 min-w-0">
        ${title ? `<h4 class="text-sm font-semibold leading-tight">${title}</h4>` : ''}
        <p class="text-xs mt-0.5 opacity-90 leading-relaxed">${message || ''}</p>
      </div>
      <button type="button" class="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded-lg focus:outline-none" aria-label="Close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    const dismiss = () => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);

    this.container.appendChild(toast);

    // Animate entry
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  getTypeStyles(type) {
    switch (type) {
      case 'success':
        return 'bg-emerald-900/90 text-white border-emerald-700 shadow-emerald-950/20';
      case 'error':
        return 'bg-rose-900/90 text-white border-rose-700 shadow-rose-950/20';
      case 'warning':
        return 'bg-amber-900/90 text-white border-amber-700 shadow-amber-950/20';
      default:
        return 'bg-slate-900/90 text-white border-slate-700 shadow-slate-950/20';
    }
  }

  getIcon(type) {
    switch (type) {
      case 'success':
        return '<svg class="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      case 'error':
        return '<svg class="w-5 h-5 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      case 'warning':
        return '<svg class="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
      default:
        return '<svg class="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }
  }

  success(message, title = 'Success') {
    this.show({ title, message, type: 'success' });
  }

  error(message, title = 'Error') {
    this.show({ title, message, type: 'error', duration: 6000 });
  }

  warning(message, title = 'Warning') {
    this.show({ title, message, type: 'warning' });
  }

  info(message, title = 'Info') {
    this.show({ title, message, type: 'info' });
  }
}

export const toast = new ToastManager();
