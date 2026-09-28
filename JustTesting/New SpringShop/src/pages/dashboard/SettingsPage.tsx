import React, { useState } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Save, Store, Shield, Bell, QrCode } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { success } = useToast();
  const [storeName, setStoreName] = useState('SpringShop Premium Flagship');
  const [supportEmail, setSupportEmail] = useState('support@springshop.com');
  const [supportPhone, setSupportPhone] = useState('+855 23 888 999');
  const [freeShippingMin, setFreeShippingMin] = useState(75);
  const [khqrMerchantId, setKhqrMerchantId] = useState('SPRINGSHOP_KHQR_MERCHANT');
  const [currency, setCurrency] = useState('USD ($)');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('Store settings and payment credentials persisted successfully.');
    }, 500);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Store & System Preferences
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Configure general store identity, delivery rules, ABA KHQR gateway, and staff notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Store Details */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Store className="w-4 h-4 text-[#009dff]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Storefront Identity & Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Store Public Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <Input
              label="Customer Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
            <Input
              label="Direct Support Hotline"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#009dff]"
              >
                <option value="USD ($)">USD ($) — United States Dollar</option>
                <option value="KHR (៛)">KHR (៛) — Cambodian Riel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping & Thresholds */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Shield className="w-4 h-4 text-[#00e000]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Logistics & Delivery Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Free Delivery Order Minimum ($)"
              type="number"
              value={freeShippingMin}
              onChange={(e) => setFreeShippingMin(Number(e.target.value))}
            />
            <Input
              label="Standard Domestic Delivery Fee ($)"
              type="number"
              defaultValue={5}
              disabled
            />
          </div>
        </div>

        {/* Payment Gateway (ABA KHQR) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <QrCode className="w-4 h-4 text-[#00e1ff]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Cambodian Payments (ABA PAY KHQR)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bakong Merchant ID"
              value={khqrMerchantId}
              onChange={(e) => setKhqrMerchantId(e.target.value)}
            />
            <Input
              label="Merchant Account Name"
              defaultValue="SPRINGSHOP CO., LTD"
              disabled
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            className="flex items-center gap-2 px-6"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
