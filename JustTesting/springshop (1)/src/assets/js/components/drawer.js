/**
 * Slide-over Drawer Component (Cart Drawer, Filter Drawer, Mobile Nav Drawer)
 */
export class Drawer {
  constructor(drawerElementId) {
    this.drawer = document.getElementById(drawerElementId);
    this.overlay = this.drawer ? this.drawer.querySelector('.drawer-overlay') : null;
    this.panel = this.drawer ? this.drawer.querySelector('.drawer-panel') : null;
    this.onCloseCallbacks = [];
    this.init();
  }

  init() {
    if (!this.drawer) return;

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    const closeBtns = this.drawer.querySelectorAll('[data-close-drawer]');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.close());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  open() {
    if (!this.drawer) return;
    this.drawer.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    requestAnimationFrame(() => {
      if (this.overlay) {
        this.overlay.classList.remove('opacity-0');
        this.overlay.classList.add('opacity-100');
      }
      if (this.panel) {
        this.panel.classList.remove('translate-x-full');
        this.panel.classList.add('translate-x-0');
      }
    });
  }

  close() {
    if (!this.drawer) return;

    if (this.overlay) {
      this.overlay.classList.remove('opacity-100');
      this.overlay.classList.add('opacity-0');
    }
    if (this.panel) {
      this.panel.classList.remove('translate-x-0');
      this.panel.classList.add('translate-x-full');
    }

    setTimeout(() => {
      this.drawer.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      this.onCloseCallbacks.forEach((cb) => cb());
    }, 250);
  }

  isOpen() {
    return this.drawer && !this.drawer.classList.contains('hidden');
  }

  onClose(callback) {
    if (typeof callback === 'function') {
      this.onCloseCallbacks.push(callback);
    }
  }
}
