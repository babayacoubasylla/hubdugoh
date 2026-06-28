import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { HiUserGroup, HiClipboard, HiBuildingStorefront, HiExclamationTriangle } from "react-icons/hi2";

export default function AdminOverview() {
  const { allUsers } = useAuth();
  const [stats, setStats] = useState({
    totalLivreurs: 0,
    totalMissions: 0,
    totalCommerces: 0,
    enAttente: 0,
    livreursEnAttente: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Total livreurs
      const { count: totalLivreurs } = await supabase
        .from('livreurs')
        .select('*', { count: 'exact', head: true });

      // Total missions
      const { count: totalMissions } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true });

      // Total commerçants
      const { count: totalCommerces } = await supabase
        .from('commercants')
        .select('*', { count: 'exact', head: true });

      // Livreurs en attente (non vérifiés)
      const { data: livreursNonVerifies } = await supabase
        .from('profils')
        .select('id, nom, telephone, created_at')
        .eq('role', 'livreur')
        .eq('verifie', false)
        .limit(5);

      setStats({
        totalLivreurs: totalLivreurs || 0,
        totalMissions: totalMissions || 0,
        totalCommerces: totalCommerces || 0,
        enAttente: livreursNonVerifies?.length || 0,
        livreursEnAttente: livreursNonVerifies || []
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Chargement...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Tableau de bord</h2>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: "Livreurs", value: stats.totalLivreurs, icon: HiUserGroup, color: "bg-blue-500" },
          { label: "Missions", value: stats.totalMissions, icon: HiClipboard, color: "bg-orange-500" },
          { label: "Commerces", value: stats.totalCommerces, icon: HiBuildingStorefront, color: "bg-purple-500" },
          { label: "En attente", value: stats.enAttente, icon: HiExclamationTriangle, color: "bg-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white text-lg mb-3`}>
              <s.icon />
            </div>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Livreurs en attente */}
      {stats.livreursEnAttente.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-amber-800 text-sm">
            ⚠️ {stats.livreursEnAttente.length} livreur(s) en attente de validation
          </h3>
          <div className="mt-3 space-y-2">
            {stats.livreursEnAttente.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between bg-white rounded-xl p-3 text-sm">
                <span className="font-medium">{l.nom}</span>
                <span className="text-xs text-slate-400">{l.telephone}</span>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  En attente
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dernières missions */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-slate-800 mb-3">📋 Dernières missions</h3>
        <p className="text-sm text-slate-400">Aucune mission récente</p>
        {/* Vous pouvez ajouter ici une liste des dernières missions */}
      </div>
    </div>
  );
}