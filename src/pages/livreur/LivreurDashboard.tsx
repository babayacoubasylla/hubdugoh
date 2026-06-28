import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  HiHome,
  HiBellAlert,
  HiClipboardDocument,
  HiUser,
  HiCurrencyDollar,
  HiStar,
  HiCheckCircle
} from "react-icons/hi2";

const nav = [
  { to: "/livreur", label: "Tableau de bord", icon: HiHome, end: true },
  { to: "/livreur/missions", label: "Missions disponibles", icon: HiBellAlert },
  { to: "/livreur/mes-missions", label: "Mes missions", icon: HiClipboardDocument },
  { to: "/livreur/profil", label: "Mon profil", icon: HiUser },
];

export default function LivreurDashboard() {
  const { user, livreur } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    missionsTotal: 0,
    missionsMois: 0,
    gainsTotal: 0,
    gainsMois: 0,
    noteMoyenne: 0,
    missionsDisponibles: 0,
    missionsEnCours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (livreur) {
      loadStats();
    }
  }, [livreur]);

  const loadStats = async () => {
    if (!livreur) return;

    try {
      // ✅ 1. Missions du livreur (tous statuts)
      const { data: missions, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('livreur_id', livreur.id);

      if (missionsError) throw missionsError;

      // ✅ 2. Missions terminées = 'terminee' ou 'livree'
      const terminees = missions?.filter(m =>
        m.statut === 'terminee' || m.statut === 'livree'
      ) || [];

      // ✅ 3. Missions en cours = 'en_cours' ou 'acceptee' ou 'recuperation'
      const enCours = missions?.filter(m =>
        m.statut === 'en_cours' || m.statut === 'acceptee' || m.statut === 'recuperation'
      ) || [];

      const maintenant = new Date();
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      const missionsMois = missions?.filter(m =>
        new Date(m.created_at) >= debutMois
      ) || [];

      // ✅ 4. Gains totaux (missions terminées)
      const gainsTotal = terminees.reduce((sum, m) => sum + (m.gain_livreur || 0), 0);
      const gainsMois = missionsMois.filter(m =>
        m.statut === 'terminee' || m.statut === 'livree'
      ).reduce((sum, m) => sum + (m.gain_livreur || 0), 0);

      // ✅ 5. Note moyenne
      const { data: avis, error: avisError } = await supabase
        .from('avis')
        .select('note')
        .eq('livreur_id', livreur.id);

      if (avisError) throw avisError;

      const noteMoyenne = avis?.length
        ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
        : livreur.note_moyenne || 0;

      // ✅ 6. Missions disponibles (statut = 'disponible' uniquement)
      const { count: disponibles, error: dispoError } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'disponible');

      if (dispoError) throw dispoError;

      setStats({
        missionsTotal: missions?.length || 0,
        missionsMois: missionsMois.length,
        gainsTotal,
        gainsMois,
        noteMoyenne: Math.round(noteMoyenne * 10) / 10,
        missionsDisponibles: disponibles || 0,
        missionsEnCours: enCours.length
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (item: typeof nav[0]) => {
    if (item.end) return location.pathname === "/livreur";
    return location.pathname.startsWith(item.to);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🛵</div>
              <div>
                <h1 className="font-bold text-lg sm:text-xl">Espace Livreur</h1>
                <p className="text-green-100 text-xs sm:text-sm">{user?.nom} • {livreur?.moto || 'Livreur'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${livreur?.disponible ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
                }`}>
                {livreur?.disponible ? '🟢 Disponible' : '🔴 Indisponible'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4">
        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.missionsTotal}</p>
            <p className="text-xs text-slate-500">Missions totales</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.missionsMois}</p>
            <p className="text-xs text-slate-500">Ce mois</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.gainsTotal.toLocaleString()} FCFA</p>
            <p className="text-xs text-slate-500">Gains totaux</p>
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
                <p className="text-sm text-slate-500">Missions disponibles</p>
                <p className="text-2xl font-bold text-slate-800">{stats.missionsDisponibles}</p>
              </div>
              <HiBellAlert className="text-blue-500 text-3xl" />
            </div>
            <Link
              to="/livreur/missions"
              className="mt-3 block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              Voir les missions
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Missions en cours</p>
                <p className="text-2xl font-bold text-slate-800">{stats.missionsEnCours}</p>
              </div>
              <HiCheckCircle className="text-green-500 text-3xl" />
            </div>
            <Link
              to="/livreur/mes-missions"
              className="mt-3 block w-full text-center px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors"
            >
              Mes missions
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${isActive(item) ? "bg-green-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-green-50"
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