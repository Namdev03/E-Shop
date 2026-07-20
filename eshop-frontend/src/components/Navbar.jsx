import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingCart, Heart, Bell, Menu, X, ChevronDown,
  LayoutDashboard, Package, LogOut, User,
} from "lucide-react";
import { toast } from "react-toastify";
import { SearchBar } from "./SearchBar.jsx";
import { logoutUser } from "../redux/slices/userSlice.js";
import { logoutSeller } from "../redux/slices/sellerSlice.js";

export function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const userProfile = useSelector((state) => state.user.profile);
  const sellerProfile = useSelector((state) => state.seller.profile);
  const cartCount = useSelector((state) => state.cart.cart.items?.length || 0);
  const wishlistCount = useSelector((state) => state.wishlist.items?.length || 0);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const displayName = role === "seller" ? sellerProfile?.storeName : userProfile?.fullName;

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    setIsOpen(false);
    const action = role === "seller" ? logoutSeller() : logoutUser();
    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Logged out successfully");
      navigate("/");
    } else {
      toast.error(result.payload || "Logout failed");
    }
  };

  if (role === "seller") {
    return (
      <nav className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/seller/dashboard" className="text-xl font-bold text-[#101828]">
            E-Shop <span className="text-[#C81E5C]">Seller</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/seller/notifications" className="relative rounded-full p-2 hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C81E5C] text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full py-1 pl-2 pr-3 text-sm font-medium transition hover:bg-gray-100"
              >
                {displayName || "Seller"} <ChevronDown size={14} />
              </button>
              <div
                className={`absolute right-0 mt-2 w-52 rounded-xl border border-[#E5E7EB] bg-white py-2 shadow-lg transition ${
                  profileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <Link
                  to="/seller/products"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  <Package size={16} className="text-[#C81E5C]" /> My Products
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 lg:px-8">
          <Link to="/" className="shrink-0 text-xl font-bold text-[#101828] sm:text-2xl">
            E-<span className="text-[#C81E5C]">Shop</span>
          </Link>

          <div className="hidden flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {isLoggedIn ? (
              <>
                <Link to="/wishlist" className="relative rounded-full p-2.5 hover:bg-gray-100" aria-label="Wishlist">
                  <Heart size={20} className="text-gray-700" />
                  {wishlistCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C81E5C] text-[10px] font-semibold text-white">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative rounded-full p-2.5 hover:bg-gray-100" aria-label="Cart">
                  <ShoppingCart size={20} className="text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C81E5C] text-[10px] font-semibold text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/notifications" className="relative rounded-full p-2.5 hover:bg-gray-100" aria-label="Notifications">
                  <Bell size={20} className="text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C81E5C] text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-1 rounded-full p-1.5 hover:bg-gray-100">
                    <User size={20} className="text-gray-700" />
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  <div
                    className={`absolute right-0 mt-2 w-52 rounded-xl border border-[#E5E7EB] bg-white py-2 shadow-lg transition ${
                      profileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                      <Package size={16} className="text-[#C81E5C]" /> My Orders
                    </Link>
                    <Link to="/addresses" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                      <LayoutDashboard size={16} className="text-[#C81E5C]" /> Addresses
                    </Link>
                    <div className="my-1 border-t border-[#E5E7EB]" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-[#101828] hover:bg-gray-100">
                  Log in
                </Link>
                <Link to="/signup" className="rounded-full bg-[#101828] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C81E5C]">
                  Sign up
                </Link>
                <Link to="/seller/login" className="rounded-full border border-[#101828] px-4 py-2 text-sm font-semibold text-[#101828] hover:bg-gray-50">
                  Sell on E-Shop
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(true)} className="ml-auto text-[#101828] lg:hidden" aria-label="Open menu">
            <Menu size={26} />
          </button>
        </div>

        <div className="border-t border-[#E5E7EB] px-5 py-2.5 lg:hidden">
          <SearchBar />
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/40" />
        <div
          className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <span className="text-xl font-bold text-[#101828]">E-Shop</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="space-y-1 p-5">
            {isLoggedIn ? (
              <>
                <MobileLink to="/wishlist" icon={Heart} label="Wishlist" onClick={() => setIsOpen(false)} />
                <MobileLink to="/cart" icon={ShoppingCart} label="Cart" onClick={() => setIsOpen(false)} />
                <MobileLink to="/orders" icon={Package} label="My Orders" onClick={() => setIsOpen(false)} />
                <MobileLink to="/notifications" icon={Bell} label="Notifications" onClick={() => setIsOpen(false)} />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="rounded-lg border border-[#101828] py-3 text-center font-semibold">
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="rounded-lg bg-[#101828] py-3 text-center font-semibold text-white">
                  Sign up
                </Link>
                <Link to="/seller/login" onClick={() => setIsOpen(false)} className="rounded-lg border border-[#C81E5C] py-3 text-center font-semibold text-[#C81E5C]">
                  Sell on E-Shop
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MobileLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-50">
      <Icon size={18} className="text-[#C81E5C]" />
      {label}
    </Link>
  );
}
