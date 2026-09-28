import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import CartItemRow from "./CartItemRow";
import Button from "../common/Button";
import Loader from "../common/Loader";
import CloseButton from "../common/CloseButton";
import EmptyState from "../common/EmptyState";
import useScrollLock from "../../hooks/useScrollLock";

export default function BagDrawer({ open, onClose }) {
  const { items, loading, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  useScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Your Bag {totalItems > 0 && <span className="text-sm font-normal text-slate-400">({totalItems})</span>}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <EmptyState
              className="h-full"
              icon={
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="Your bag is empty"
            />
          ) : (
            items.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600 dark:text-slate-300">Subtotal</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full justify-center"
              size="lg"
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
