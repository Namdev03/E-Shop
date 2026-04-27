import React from "react";

function LandingPage() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* 🔹 Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-pink-600">E-Shop</h1>

        <div className="hidden md:flex gap-6 font-medium">
          <a href="#">Men</a>
          <a href="#">Women</a>
          <a href="#">Kids</a>
          <a href="#">Home</a>
        </div>

        <div className="flex gap-4">
          <button className="text-sm">Login</button>
          <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm">
            Cart
          </button>
        </div>
      </nav>

      {/* 🔹 Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-16 px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Big Fashion Sale
        </h2>
        <p className="text-lg mb-6">
          Up to 70% off on top brands
        </p>
        <button className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold">
          Shop Now
        </button>
      </section>

      {/* 🔹 Categories */}
      <section className="py-10 px-6">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Shop by Category
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Men", "Women", "Kids", "Beauty"].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow hover:shadow-lg p-6 text-center cursor-pointer"
            >
              <div className="h-24 bg-gray-200 rounded mb-4"></div>
              <p className="font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Products */}
      <section className="py-10 px-6">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Trending Products
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl shadow hover:shadow-lg p-4"
            >
              <div className="h-40 bg-gray-200 rounded mb-4"></div>
              <h4 className="font-semibold text-sm">
                Stylish T-Shirt
              </h4>
              <p className="text-pink-600 font-bold">₹799</p>
              <button className="mt-2 w-full bg-pink-600 text-white py-2 rounded-lg text-sm">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6 text-center">
        <p className="text-sm">
          © 2026 E-Shop. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default LandingPage;