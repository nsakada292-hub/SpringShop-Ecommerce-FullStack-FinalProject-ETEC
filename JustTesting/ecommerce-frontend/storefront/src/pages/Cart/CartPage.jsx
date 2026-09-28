import { useCart } from "../../hooks/useCart";
import CartItemRow from "../../components/cart/CartItemRow";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, loading, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Your Bag
      </h1>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState
          title="Your bag is empty"
          description="Looks like you haven't added anything yet"
        >
          <Link
            to="/category/women"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-lagoon-gradient rounded-lg hover:opacity-90"
          >
            Start Shopping
          </Link>
        </EmptyState>
      ) : (
        <Card shape="lg">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                Subtotal
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <Button className="w-full justify-center" size="lg" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
