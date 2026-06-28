import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/shared/NotificationBell";
import { HiBars3, HiXMark, HiUser, HiArrowRightOnRectangle } from "react-icons/hi2";

const publicLinks = [
  { to: "/restauration", label: "🍴 Restauration" },
  { to: "/commerces", label: "🛍️ Boutiques" },
  { to: "/courses", label: "🚚 Courses" },
  { to: "/suivi", label: "📍 Suivi" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const dashboardPath = user
    ? user.role === "admin" ? "/admin"
      : user.role === "livreur" ? "/livreur"
        : user.role === "commercant" ? "/commercant"
          : "/client"
    : "/";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg safe-top">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 text-white shrink-0">
            <span className="text-xl sm:text-2xl">🛵</span>
            <span className="font-bold text-base sm:text-lg whitespace-nowrap">Gagnoa Digital</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-0.5">
            {publicLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === l.to ? "bg-white/20 text-white" : "text-orange-50 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {l.label}
              </Link>
            ))}
            <span className="mx-1.5 h-5 w-px bg-white/30" />

            {/* Notification Bell - seulement si connecté */}
            {user && <NotificationBell />}

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <HiUser className="text-sm" />
                  <span className="max-w-[80px] truncate">{user.nom.split(" ")[0]}</span>
                  <span className="text-xs opacity-70">
                    ({user.role === "admin" ? "Admin" : user.role === "livreur" ? "Livreur" : user.role === "commercant" ? "Commerçant" : "Client"})
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors touch-target"
                  title="Déconnexion"
                >
                  <HiArrowRightOnRectangle className="text-sm" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="ml-2 px-4 py-2 bg-white text-orange-600 rounded-full font-semibold text-sm hover:bg-orange-50 transition-all shadow-md"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 -mr-1 text-white rounded-lg hover:bg-white/10 touch-target"
            aria-label="Menu"
          >
            {open ? <HiXMark className="text-2xl" /> : <HiBars3 className="text-2xl" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-1 animate-slide-up">
            {user && (
              <Link
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-white/20 text-white"
              >
                <span className="text-lg">
                  {user.role === "admin" ? "👑" : user.role === "livreur" ? "🛵" : user.role === "commercant" ? "🪄" : "👤"}
                </span>
                Mon espace — {user.nom}
              </Link>
            )}
            {publicLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium ${location.pathname === l.to ? "bg-white/20 text-white" : "text-orange-50 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-orange-50 hover:bg-white/10 hover:text-white"
              >
                🚪 Déconnexion
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block mt-2 px-4 py-3 bg-white text-orange-600 rounded-xl text-center font-semibold text-sm"
              >
                Se connecter
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}