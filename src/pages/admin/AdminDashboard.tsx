import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  HiShieldCheck,
  HiUsers,
  HiClipboard,
  HiChartBar,
  HiTruck,
  HiBuildingStorefront,
  HiCurrencyDollar,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiBeaker,
  HiGift,
  HiNewspaper
} from "react-icons/hi2";

const nav = [
  { to: "/admin", label: "Tableau de bord", icon: HiChartBar, end: true },
  { to: "/admin/validation", label: "Validation livreurs", icon: HiShieldCheck },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: HiUsers },
  { to: "/admin/missions", label: "Toutes les missions", icon: HiClipboard },
  { to: "/admin/pharmacies", label: "Pharmacies de garde", icon: HiBeaker },
  { to: "/admin/promos", label: "Promotions", icon: HiGift },
  { to: "/admin/actus", label: "Actualités", icon: HiNewspaper },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUtilisateurs: 0,
    totalLivreurs: 0,
    totalCommercants: 0,
    totalCommandes: 0,
    commandesEnAttente: 0,
    commandesEnCours: 0,
    commandesLivrees: 0,
    commandesAnnulees: 0,
    chiffreAffaires: 0,
    commissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Utilisateurs
      const { count: users } = await supabase
        .from('profils')
        .select('*', { count: 'exact', head: true });

      // Livreurs
      const { count: livreurs } = await supabase
        .from('livreurs')
        .select('*', { count: 'exact', head: true });

      // Commerçants
      const { count: commercants } = await supabase
        .from('commercants')
        .select('*', { count: 'exact', head: true });

      // Commandes par statut
      const { data: commandes } = await supabase
        .from('commandes')
        .select('statut, total');

      const enAttente = commandes?.filter(c => c.statut === 'en_attente').length || 0;
      const enCours = commandes?.filter(c => ['acceptee', 'preparation', 'recuperation', 'en_cours'].includes(c.statut)).length || 0;
      const livrees = commandes?.filter(c => c.statut === 'livree').length || 0;
      const annulees = commandes?.filter(c => c.statut === 'annulee').length || 0;

      // Chiffre d'affaires
      const ca = commandes?.filter(c => c.statut === 'livree').reduce((sum, c) => sum + c.total, 0) || 0;

      // Commissions
      const { data: commissions } = await supabase
        .from('commissions')
        .select('montant')
        .eq('type', 'plateforme');

      const totalCommissions = commissions?.reduce((sum, c) => sum + c.montant, 0) || 0;

      setStats({
        totalUtilisateurs: users || 0,
        totalLivreurs: livreurs || 0,
        totalCommercants: commercants || 0,
        totalCommandes: commandes?.length || 0,
        commandesEnAttente: enAttente,
        commandesEnCours: enCours,
        commandesLivrees: livrees,
        commandesAnnulees: annulees,
        chiffreAffaires: ca,
        commissions: totalCommissions
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (item: typeof nav[0]) => {
    if (item.end) return location.pathname === "/admin";
    return location.pathname.startsWith(item.to);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">👑</div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl">Espace Administration</h1>
              <p className="text-red-100 text-xs sm:text-sm">{user?.nom} — Admin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4">
        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <HiUsers className="text-red-500 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalUtilisateurs}</p>
                <p className="text-xs text-slate-500">Utilisateurs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiTruck className="text-blue-500 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalLivreurs}</p>
                <p className="text-xs text-slate-500">Livreurs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HiBuildingStorefront className="text-purple-500 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalCommercants}</p>
                <p className="text-xs text-slate-500">Commerçants</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiCurrencyDollar className="text-green-500 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.chiffreAffaires.toLocaleString()} FCFA</p>
                <p className="text-xs text-slate-500">Chiffre d'affaires</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commandes par statut */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En attente</p>
                <p className="text-2xl font-bold text-slate-800">{stats.commandesEnAttente}</p>
              </div>
              <HiClock className="text-yellow-500 text-3xl" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En cours</p>
                <p className="text-2xl font-bold text-slate-800">{stats.commandesEnCours}</p>
              </div>
              <HiTruck className="text-blue-500 text-3xl" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Livrées</p>
                <p className="text-2xl font-bold text-slate-800">{stats.commandesLivrees}</p>
              </div>
              <HiCheckCircle className="text-green-500 text-3xl" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Annulées</p>
                <p className="text-2xl font-bold text-slate-800">{stats.commandesAnnulees}</p>
              </div>
              <HiXCircle className="text-red-500 text-3xl" />
            </div>
          </div>
        </div>

        {/* Commissions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Commissions totales</p>
              <p className="text-2xl font-bold text-orange-600">{stats.commissions.toLocaleString()} FCFA</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Commandes totales</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalCommandes}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${isActive(item) ? "bg-red-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-red-50"
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