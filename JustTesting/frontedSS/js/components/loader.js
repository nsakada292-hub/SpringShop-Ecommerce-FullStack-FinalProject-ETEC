const Loader = {
  renderProductSkeletons(count = 8) {
    return Array(count).fill(0).map(() => `
      <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3">
        <div class="w-full h-48 skeleton rounded-xl"></div>
        <div class="h-4 skeleton rounded-md w-3/4"></div>
        <div class="h-3 skeleton rounded-md w-1/2"></div>
        <div class="flex justify-between items-center mt-2">
          <div class="h-5 skeleton rounded-md w-1/4"></div>
          <div class="h-9 skeleton rounded-lg w-20"></div>
        </div>
      </div>
    `).join('');
  },
  renderTableSkeletons(rows = 5, cols = 5) {
    return Array(rows).fill(0).map(() => `
      <tr class="border-b border-slate-100">
        ${Array(cols).fill(0).map(() => `<td class="py-4 px-4"><div class="h-4 skeleton rounded"></div></td>`).join('')}
      </tr>
    `).join('');
  }
};