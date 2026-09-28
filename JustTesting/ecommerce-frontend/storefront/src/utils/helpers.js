export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price, currency = "$") {
  if (price === undefined || price === null) return "";
  return `${currency}${Number(price).toFixed(2)}`;
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
}

export function capitalize(str) {
  return str ? String(str).charAt(0).toUpperCase() + String(str).slice(1) : "";
}

// Presentational hints for the backend OrderStatus enum.
export const ORDER_STATUS_META = {
  PENDING: { label: "Pending", color: "amber" },
  PAID: { label: "Paid", color: "blue" },
  SHIPPED: { label: "Shipped", color: "aqua" },
  DELIVERED: { label: "Delivered", color: "lime" },
  CANCELLED: { label: "Cancelled", color: "red" },
};

export function orderStatusMeta(status) {
  return ORDER_STATUS_META[String(status || "").toUpperCase()] || {
    label: status || "Unknown",
    color: "slate",
  };
}