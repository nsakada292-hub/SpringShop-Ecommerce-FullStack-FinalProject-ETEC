export const footer = {
  render() {
    return `
      <footer class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© ${new Date().getFullYear()} SpringShop E-Commerce. Powered by Spring Boot REST API & Vanilla JavaScript.</p>
        </div>
      </footer>
    `;
  }
};