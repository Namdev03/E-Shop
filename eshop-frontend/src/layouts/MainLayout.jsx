import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { useAuthCheck } from "../hooks/useAuthCheck.js";
import { useSocketConnection } from "../hooks/useSocketConnection.js";

export function MainLayout() {
  useAuthCheck();
  useSocketConnection();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
