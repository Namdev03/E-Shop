import { Link } from "react-router";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E5E7EB] bg-[#101828] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="text-xl font-bold">
            E-<span className="text-[#C81E5C]">Shop</span>
          </div>
          <p className="mt-3 text-sm text-white/60">
            Everything you need, delivered fast — from trusted sellers across the country.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">Shop</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/products" className="hover:text-white">All Products</Link></li>
            <li><Link to="/products?flashSale=true" className="hover:text-white">Flash Sale</Link></li>
            <li><Link to="/products?newArrivals=true" className="hover:text-white">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">Company</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link to="/seller/signup" className="hover:text-white">Sell on E-Shop</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">Contact</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-center gap-2"><Mail size={14} /> support@eshop.com</li>
            <li className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> Bengaluru, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {year} E-Shop. All rights reserved.
      </div>
    </footer>
  );
}
