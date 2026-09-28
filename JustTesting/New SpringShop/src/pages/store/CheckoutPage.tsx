import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderApi } from '../../api/orderApi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState(user?.name || 'Dara Customer');
  const [email, setEmail] = useState(user?.email || 'customer@springshop.com');
  const [phone, setPhone] = useState('+855 12 345 678');
  const [street, setStreet] = useState('No. 45, Street 240, Daun Penh');
  const [city, setCity] = useState('Phnom Penh');
  const [postalCode, setPostalCode] = useState('12000');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'ABA_KHQR' | 'COD'>('ABA_KHQR');

  // Card details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKhqrModalOpen, setIsKhqrModalOpen] = useState(false);

  const shippingFee = totalAmount >= 75 ? 0 : 5;
  const finalTotal = totalAmount + shippingFee;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      error('Your shopping bag is empty.');
      return;
    }

    if (!name || !email || !phone || !street || !city) {
      error('Please complete all delivery details.');
      return;
    }

    if (paymentMethod === 'ABA_KHQR') {
      setIsKhqrModalOpen(true);
      return;
    }

    await executeOrderCreation('PAID');
  };

  const executeOrderCreation = async (paymentStatus = 'PAID') => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          productPrice: i.productPrice,
          quantity: i.quantity,
          subtotal: i.subtotal,
        })),
        shippingAddress: {
          fullName: name,
          phone,
          street,
          city,
          postalCode,
          country: 'Cambodia',
        },
        paymentMethod: paymentMethod === 'ABA_KHQR' ? 'ABA PAY KHQR' : paymentMethod === 'CARD' ? 'Credit Card' : 'Cash on Delivery',
        totalAmount: finalTotal,
      };

      const newOrder = await orderApi.create(orderPayload);
      await clearCart();
      setIsKhqrModalOpen(false);
      success('Order placed successfully! Confirmation email dispatched.');
      navigate(`/order-confirmation/${newOrder.id}`);
    } catch (err: any) {
      console.error('Order placement error:', err);
      error(err?.message || 'Failed to complete order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No items to checkout</h2>
        <p className="text-xs text-zinc-400 mt-2 mb-6">Your bag is empty.</p>
        <Link to="/" className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-semibold">
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Express Checkout
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Complete your delivery and payment details to dispatch your order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Step 1 & Step 2 Form */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Step 1: Customer & Shipping Details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Delivery Address & Contact
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Recipient Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email for Tracking Receipt"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Contact Phone Number"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="City / Province"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Street Address / Residence"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Payment Option
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ABA KHQR (Bakong / Cambodian QR) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('ABA_KHQR')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  paymentMethod === 'ABA_KHQR'
                    ? 'border-[#009dff] bg-[#00e1ff]/10 ring-2 ring-[#009dff]/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <QrCode className="w-5 h-5 text-[#009dff]" />
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00e000] text-zinc-950 uppercase tracking-widest">
                    Recommended
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">ABA PAY KHQR</p>
                  <p className="text-[10px] text-zinc-500">Scan via Bakong or ABA</p>
                </div>
              </button>

              {/* Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  paymentMethod === 'CARD'
                    ? 'border-[#009dff] bg-[#00e1ff]/10 ring-2 ring-[#009dff]/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                <CreditCard className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Credit / Debit Card</p>
                  <p className="text-[10px] text-zinc-500">Visa, Mastercard, JCB</p>
                </div>
              </button>

              {/* Cash On Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  paymentMethod === 'COD'
                    ? 'border-[#009dff] bg-[#00e1ff]/10 ring-2 ring-[#009dff]/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                <Truck className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Cash on Delivery</p>
                  <p className="text-[10px] text-zinc-500">Pay when delivered</p>
                </div>
              </button>
            </div>

            {/* Credit Card Sub-Form */}
            {paymentMethod === 'CARD' && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiry Date"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                  <Input
                    label="Security CVV"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ABA KHQR Notice */}
            {paymentMethod === 'ABA_KHQR' && (
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-center gap-3">
                <QrCode className="w-5 h-5 text-[#009dff] shrink-0" />
                <span>
                  Clicking <strong>Place Order</strong> opens the KHQR QR code. You can scan with ABA Mobile, Bakong, or any Cambodian banking app to confirm.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Order Review & Placement Box */}
        <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Order Items ({items.length})
            </h3>
            <Link to="/cart" className="text-xs text-[#009dff] hover:underline">
              Edit Bag
            </Link>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800 pr-1">
            {items.map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-8 h-10 object-cover rounded-md bg-zinc-100 dark:bg-zinc-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                      {item.productName}
                    </p>
                    <p className="text-zinc-400 text-[11px]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {shippingFee === 0 ? <strong className="text-[#00e000]">FREE</strong> : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-zinc-100 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <span>Total Amount</span>
              <span className="text-[#009dff]">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handlePlaceOrder}
            isLoading={isSubmitting}
            className="w-full py-3.5 text-sm"
          >
            <span>Place Order Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-[#00e000]" />
            <span>Guaranteed Authentic & Safe Delivery</span>
          </div>
        </div>
      </div>

      {/* ABA KHQR Interactive Payment Modal */}
      <Modal
        isOpen={isKhqrModalOpen}
        onClose={() => setIsKhqrModalOpen(false)}
        title="ABA PAY KHQR"
        maxWidth="sm"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="px-3 py-1 bg-[#00e1ff]/15 text-[#009dff] text-xs font-bold rounded-full">
            Bakong National QR Code
          </div>

          {/* QR Code Canvas Mock */}
          <div className="p-4 bg-white border-2 border-zinc-900 rounded-2xl shadow-md">
            <div className="w-48 h-48 bg-zinc-950 p-2 rounded-xl flex flex-col items-center justify-center text-white relative">
              <QrCode className="w-40 h-40 text-white" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xs shadow-md border-2 border-white">
                  KHQR
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              ${finalTotal.toFixed(2)} USD
            </p>
            <p className="text-xs text-zinc-500">
              Merchant: <strong>SpringShop Co., Ltd</strong>
            </p>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
            Open ABA Mobile or any Bakong-compatible Cambodian banking app and point your camera at the QR code.
          </p>

          <div className="w-full pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => executeOrderCreation('PAID')}
              isLoading={isSubmitting}
              className="w-full py-3"
            >
              Simulate Instant KHQR Scan & Confirm
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsKhqrModalOpen(false)}
              className="w-full text-xs"
            >
              Cancel Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
