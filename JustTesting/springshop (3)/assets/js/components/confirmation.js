/**
 * Confirmation Dialog Component
 */
const Confirmation = {
  show({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    onConfirm = () => {}
  }) {
    let modal = document.getElementById('confirmation-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'confirmation-modal';
      modal.className = 'springshop-modal fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4 backdrop-blur-xs';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full ${isDanger ? 'bg-red-100 dark:bg-red-950 text-red-600' : 'bg-[#E6F0DC] text-[#55883B]'} flex items-center justify-center shrink-0 text-lg">
            <i class="${isDanger ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question'}"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">${title}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">${message}</p>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button id="confirm-cancel-btn" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            ${cancelText}
          </button>
          <button id="confirm-ok-btn" class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#55883B] hover:bg-[#456f30]'}">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    const cancelBtn = modal.querySelector('#confirm-cancel-btn');
    const okBtn = modal.querySelector('#confirm-ok-btn');

    cancelBtn.onclick = () => {
      Modal.close('confirmation-modal');
    };

    okBtn.onclick = () => {
      Modal.close('confirmation-modal');
      onConfirm();
    };

    Modal.open('confirmation-modal');
  }
};

window.Confirmation = Confirmation;
