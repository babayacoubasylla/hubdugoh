import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

export default function LivreurOverview() {
  const { user, livreur } = useAuth();
  const [stats, setStats] = useState({
    totalGains: 0,
    completed: 0,
    pending: 0,
    missionsEnCours: [] as any[]
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
      // Missions du livreur
      const { data: missions } = await supabase
        .from('missions')
        .select(`
          *,
          commande:commandes(*)
        `)
        .eq('livreur_id', livreur.id);

      const completed = missions?.filter(m => m.statut === 'terminee') || [];
      const pending = missions?.filter(m => m.statut === 'en_cours') || [];

      // Gains totaux
      const totalGains = completed.reduce((sum, m) => sum + (m.gain_livreur || 0), 0);

      // Missions en attente disponibles
      const { data: disponibles } = await supabase
        .from('missions')
        .select(`
          *,
          commande:commandes(*)
        `)
        .eq('statut', 'disponible')
        .limit(3);

      setStats({
        totalGains,
        completed: completed.length,
        pending: pending.length,
        missionsEnCours: disponibles || []
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const accepterMission = async (missionId: string) => {
    if (!livreur) return;

    try {
      await supabase
        .from('missions')
        .update({
          livreur_id: livreur.id,
          statut: 'acceptee',
          date_acceptation: new Date().toISOString()
        })
        .eq('id', missionId);

      // Recharger les stats
      await loadStats();
      alert('✅ Mission acceptée !');
    } catch (error) {
      console.error('Erreur acceptation:', error);
      alert('❌ Erreur lors de l\'acceptation');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Chargement...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xl font-bold text-slate-800">{stats.totalGains.toLocaleString()}</div>
          <div className="text-xs text-slate-500">FCFA gagnés</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-xl font-bold text-slate-800">{stats.completed}</div>
          <div className="text-xs text-slate-500">Livrées</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-xl font-bold text-slate-800">{stats.pending}</div>
          <div className="text-xs text-slate-500">En cours</div>
        </div>
      </div>

      {stats.missionsEnCours.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-3">🔔 Missions disponibles</h3>
          <div className="space-y-2">
            {stats.missionsEnCours.slice(0, 3).map((m) => (
              <div key={m.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {m.commande?.commerce_nom || 'Mission'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    📍 {m.commande?.client_adresse || 'Adresse'}
                  </p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="font-bold text-green-600 text-sm">
                    {m.commande?.total?.toLocaleString() || 0} FCFA
                  </p>
                  <button
                    onClick={() => accepterMission(m.id)}
                    className="mt-1 px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 active:scale-[0.97] transition-all"
                  >
                    Accepter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-slate-800 mb-3">📋 Mes dernières missions</h3>
        <p className="text-sm text-slate-400 text-center py-4">Aucune mission récente</p>
        {/* Vous pouvez ajouter ici une liste des missions du livreur */}
      </div>
    </div>
  );
}