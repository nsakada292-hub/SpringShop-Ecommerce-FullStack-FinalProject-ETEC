/**
 * Confirmation Dialog Component
 */
class ConfirmationDialog {
  constructor() {
    this.modal = null;
    this.resolve = null;
  }

  ensureModal() {
    if (!this.modal || !document.body.contains(this.modal)) {
      this.modal = document.createElement('div');
      this.modal.id = 'springshop-confirm-modal';
      this.modal.className = 'fixed inset-0 z-[9998] hidden items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 transition-all';
      this.modal.innerHTML = `
        <div class="modal-content relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 transition-all duration-200 scale-95 opacity-0">
          <div class="flex items-center gap-3.5 mb-3">
            <div id="confirm-icon" class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <h3 id="confirm-title" class="text-base font-semibold text-slate-900 dark:text-slate-100">Confirm Action</h3>
              <p id="confirm-message" class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Are you sure you want to proceed?</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 mt-6">
            <button id="confirm-cancel-btn" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
              Cancel
            </button>
            <button id="confirm-ok-btn" type="button" class="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition">
              Confirm
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(this.modal);

      const cancelBtn = this.modal.querySelector('#confirm-cancel-btn');
      const okBtn = this.modal.querySelector('#confirm-ok-btn');

      cancelBtn.addEventListener('click', () => this.close(false));
      okBtn.addEventListener('click', () => this.close(true));
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close(false);
      });
    }
  }

  show({
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = true,
  } = {}) {
    this.ensureModal();

    const titleEl = this.modal.querySelector('#confirm-title');
    const msgEl = this.modal.querySelector('#confirm-message');
    const okBtn = this.modal.querySelector('#confirm-ok-btn');
    const cancelBtn = this.modal.querySelector('#confirm-cancel-btn');
    const iconEl = this.modal.querySelector('#confirm-icon');

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    if (isDanger) {
      okBtn.className = 'px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition';
      iconEl.className = 'w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0';
    } else {
      okBtn.className = 'px-4 py-2 text-sm font-medium text-white bg-spring-dark-green hover:bg-emerald-800 rounded-xl shadow-xs transition';
      iconEl.className = 'w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0';
    }

    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');

    const content = this.modal.querySelector('.modal-content');
    requestAnimationFrame(() => {
      content.classList.remove('scale-95', 'opacity-0');
      content.classList.add('scale-100', 'opacity-100');
    });

    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  close(result) {
    if (!this.modal) return;
    const content = this.modal.querySelector('.modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      this.modal.classList.add('hidden');
      this.modal.classList.remove('flex');
      if (this.resolve) {
        this.resolve(result);
        this.resolve = null;
      }
    }, 150);
  }
}

export const confirmDialog = new ConfirmationDialog();
