export const toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 3000) {
    this.init();
    const el = document.createElement('div');
    const colors = {
      success: 'bg-spring-dark-green text-white',
      error: 'bg-red-600 text-white',
      info: 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900',
      warning: 'bg-amber-500 text-white'
    };
    el.className = `px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 transform transition-all duration-200 translate-y-2 opacity-0 pointer-events-auto ${colors[type] || colors.info}`;
    el.innerHTML = `<span>${message}</span>`;
    this.container.appendChild(el);

    requestAnimationFrame(() => {
      el.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      el.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => el.remove(), 200);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error', 4000); },
  info(msg) { this.show(msg, 'info'); }
};