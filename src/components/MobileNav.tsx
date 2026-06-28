import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HiHome, HiShoppingBag, HiCube, HiUserGroup, HiMapPin, HiUser } from "react-icons/hi2";

const publicLinks = [
  { to: "/", label: "Accueil", icon: HiHome },
  { to: "/restauration", label: "Repas", icon: HiShoppingBag },
  { to: "/commerces", label: "Boutiques", icon: HiCube },
  { to: "/livreurs", label: "Livreurs", icon: HiUserGroup },
  { to: "/suivi", label: "Suivi", icon: HiMapPin },
];

export default function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/admin") || location.pathname.startsWith("/livreur") || location.pathname.startsWith("/commercant") || location.pathname.startsWith("/client");

  const dashboardPath = user
    ? user.role === "admin" ? "/admin" : user.role === "livreur" ? "/livreur" : user.role === "commercant" ? "/commercant" : "/client"
    : "/";

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16 px-1">
        {user && (
          <Link
            to={dashboardPath}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 transition-colors relative ${
              isDashboard ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <HiUser className={`text-xl ${isDashboard ? "scale-110" : ""} transition-transform`} />
            <span className={`text-[10px] font-medium leading-none ${isDashboard ? "font-semibold" : ""}`}>Espace</span>
            {isDashboard && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-orange-500 rounded-full" />}
          </Link>
        )}
        {publicLinks.slice(0, user ? 3 : 5).map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 transition-colors relative ${
                active ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
              }`}
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <Icon className={`text-xl ${active ? "scale-110" : ""} transition-transform`} />
              <span className={`text-[10px] font-medium leading-none ${active ? "font-semibold" : ""}`}>{label}</span>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-orange-500 rounded-full" />}
            </Link>
          );
        })}
        {user && (
          <Link
            to="/suivi"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 transition-colors relative ${
              location.pathname === "/suivi" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
            }`}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <HiMapPin className={`text-xl ${location.pathname === "/suivi" ? "scale-110" : ""} transition-transform`} />
            <span className={`text-[10px] font-medium leading-none ${location.pathname === "/suivi" ? "font-semibold" : ""}`}>Suivi</span>
          </Link>
        )}
        {!user && (
          <Link
            to="/login"
            className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 text-slate-400 hover:text-orange-600 transition-colors"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <HiUser className="text-xl" />
            <span className="text-[10px] font-medium leading-none">Connexion</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
