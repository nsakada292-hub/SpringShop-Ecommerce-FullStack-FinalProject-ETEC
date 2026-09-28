/**
 * Accessible Modal Controller
 */
export class Modal {
  constructor(modalElementId) {
    this.modal = document.getElementById(modalElementId);
    this.onCloseCallbacks = [];
    this.init();
  }

  init() {
    if (!this.modal) return;

    // Close on clicking backdrop
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Close buttons inside modal with [data-close-modal]
    const closeButtons = this.modal.querySelectorAll('[data-close-modal]');
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.close());
    });

    // Escape key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    const content = this.modal.querySelector('.modal-content') || this.modal.firstElementChild;
    if (content) {
      content.classList.remove('scale-95', 'opacity-0');
      content.classList.add('scale-100', 'opacity-100');
    }
  }

  close() {
    if (!this.modal) return;
    const content = this.modal.querySelector('.modal-content') || this.modal.firstElementChild;
    if (content) {
      content.classList.remove('scale-100', 'opacity-100');
      content.classList.add('scale-95', 'opacity-0');
    }

    setTimeout(() => {
      this.modal.classList.add('hidden');
      this.modal.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
      this.onCloseCallbacks.forEach((cb) => cb());
    }, 150);
  }

  isOpen() {
    return this.modal && !this.modal.classList.contains('hidden');
  }

  onClose(callback) {
    if (typeof callback === 'function') {
      this.onCloseCallbacks.push(callback);
    }
  }
}
