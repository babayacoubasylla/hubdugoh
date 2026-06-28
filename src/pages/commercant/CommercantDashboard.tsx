import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  HiHome,
  HiShoppingBag,
  HiClipboardDocument,
  HiUser,
  HiCurrencyDollar,
  HiStar,
  HiPlus
} from "react-icons/hi2";

const nav = [
  { to: "/commercant", label: "Tableau de bord", icon: HiHome, end: true },
  { to: "/commercant/boutique", label: "Ma boutique", icon: HiShoppingBag },
  { to: "/commercant/commandes", label: "Commandes", icon: HiClipboardDocument },
  { to: "/commercant/profil", label: "Profil", icon: HiUser },
];

export default function CommercantDashboard() {
  const { user, commercant } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    commandesTotal: 0,
    commandesMois: 0,
    revenusTotal: 0,
    revenusMois: 0,
    noteMoyenne: 0,
    produitsCount: 0,
    commandesEnAttente: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (commercant) {
      loadStats();
    }
  }, [commercant]);

  const loadStats = async () => {
    if (!commercant) return;

    try {
      // Commandes du commerçant
      const { data: commandes } = await supabase
        .from('commandes')
        .select('*')
        .eq('commercant_id', commercant.id);

      const livrees = commandes?.filter(c => c.statut === 'livree') || [];
      const enAttente = commandes?.filter(c => c.statut === 'en_attente') || [];

      const maintenant = new Date();
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      const commandesMois = commandes?.filter(c =>
        new Date(c.date_commande) >= debutMois
      ) || [];

      // Revenus
      const revenusTotal = livrees.reduce((sum, c) => sum + c.total, 0);
      const revenusMois = commandesMois.filter(c => c.statut === 'livree')
        .reduce((sum, c) => sum + c.total, 0);

      // Produits
      const { count: produits } = await supabase
        .from('produits')
        .select('*', { count: 'exact', head: true })
        .eq('commercant_id', commercant.id);

      // Note moyenne
      const { data: avis } = await supabase
        .from('avis')
        .select('note')
        .eq('commercant_id', commercant.id);

      const noteMoyenne = avis?.length
        ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
        : commercant.note_moyenne || 0;

      setStats({
        commandesTotal: commandes?.length || 0,
        commandesMois: commandesMois.length,
        revenusTotal,
        revenusMois,
        noteMoyenne: Math.round(noteMoyenne * 10) / 10,
        produitsCount: produits || 0,
        commandesEnAttente: enAttente.length
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (item: typeof nav[0]) => {
    if (item.end) return location.pathname === "/commercant";
    return location.pathname.startsWith(item.to);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🪄</div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl">{commercant?.nom_commerce || "Ma Boutique"}</h1>
              <p className="text-purple-100 text-xs sm:text-sm">{user?.nom} • Commerçant</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4">
        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.commandesTotal}</p>
            <p className="text-xs text-slate-500">Commandes</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.commandesMois}</p>
            <p className="text-xs text-slate-500">Ce mois</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.revenusTotal.toLocaleString()} FCFA</p>
            <p className="text-xs text-slate-500">Revenus totaux</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">⭐ {stats.noteMoyenne}</p>
            <p className="text-xs text-slate-500">Note moyenne</p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Produits en ligne</p>
                <p className="text-2xl font-bold text-slate-800">{stats.produitsCount}</p>
              </div>
              <HiShoppingBag className="text-purple-500 text-3xl" />
            </div>
            <Link
              to="/commercant/boutique"
              className="mt-3 block w-full text-center px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors"
            >
              Gérer les produits
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Commandes en attente</p>
                <p className="text-2xl font-bold text-slate-800">{stats.commandesEnAttente}</p>
              </div>
              <HiClipboardDocument className="text-orange-500 text-3xl" />
            </div>
            <Link
              to="/commercant/commandes"
              className="mt-3 block w-full text-center px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Voir les commandes
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${isActive(item) ? "bg-purple-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-purple-50"
                }`}
            >
              <item.icon className="text-lg" />
              {item.label}
            </Link>
          ))}
        </div>

        <Outlet />
      </div>
    </div>
  );
}