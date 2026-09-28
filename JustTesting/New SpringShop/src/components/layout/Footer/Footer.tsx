import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { success } = useToast();
  const { isKhmer } = useTheme();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    success('Thank you for joining the SpringShop newsletter! Enjoy 10% off your next order.');
    setEmail('');
  };

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 transition-colors mt-20">
      {/* Brand Value Props Banner */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e1ff]/10 text-[#009dff] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Fast Shipping</p>
              <p className="text-[11px] text-zinc-500">Free delivery on orders $75+</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4ce600]/10 text-[#00e000] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">30-Day Returns</p>
              <p className="text-[11px] text-zinc-500">Hassle-free exchange policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Authentic Pieces</p>
              <p className="text-[11px] text-zinc-500">100% verified crafted goods</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Eco Materials</p>
              <p className="text-[11px] text-zinc-500">Sustainable organic fibers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Address */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-black text-base">
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
                Spring<span className="text-[#009dff]">Shop</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Contemporary apparel, artisanal footwear, and botanical skincare curated for intentional everyday living.
            </p>
            <div className="space-y-2 pt-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#009dff] shrink-0 mt-0.5" />
                <span>Level 18, Vattanac Capital Tower, Preah Monivong Blvd, Phnom Penh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#00e000] shrink-0" />
                <span>+855 23 888 999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#00e1ff] shrink-0" />
                <span>support@springshop.com</span>
              </div>
            </div>
          </div>

          {/* Shop Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              {isKhmer ? 'ប្រភេទផលិតផល' : 'Collections'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/category/women" className="text-zinc-500 dark:text-zinc-400 hover:text-[#009dff] transition-colors">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/category/men" className="text-zinc-500 dark:text-zinc-400 hover:text-[#009dff] transition-colors">
                  Men's Essentials
                </Link>
              </li>
              <li>
                <Link to="/category/beauty" className="text-zinc-500 dark:text-zinc-400 hover:text-[#009dff] transition-colors">
                  Clean Beauty & Care
                </Link>
              </li>
              <li>
                <Link to="/category/kid" className="text-zinc-500 dark:text-zinc-400 hover:text-[#009dff] transition-colors">
                  Kids & Baby
                </Link>
              </li>
              <li>
                <Link to="/category/all?sortBy=newest" className="text-zinc-500 dark:text-zinc-400 hover:text-[#009dff] transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              {isKhmer ? 'សេវាកម្មអតិថិជន' : 'Customer Care'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/orders/me" className="text-zinc-500 dark:text-zinc-400 hover:text-[#009dff] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-zinc-500 dark:text-zinc-400 hover:text-[#009dff] transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-zinc-500 dark:text-zinc-400 hover:text-[#009dff] transition-colors">
                  Bag & Shipping Estimate
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-[#009dff] hover:underline font-semibold transition-colors">
                  Staff Admin Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Input */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              {isKhmer ? 'ទទួលពត៌មានពិសេស' : 'Join Our Newsletter'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Subscribe for exclusive capsule drops, seasonal previews, and member-only rewards.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#009dff] transition-all"
              />
              <button
                type="submit"
                className="btn-primary-gradient px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar & Copyright */}
        <div className="mt-12 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} SpringShop Inc. All rights reserved. Powered by Spring Boot REST API & React.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
