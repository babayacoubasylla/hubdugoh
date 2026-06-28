import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { HiMapPin, HiUser, HiCurrencyDollar, HiTruck } from "react-icons/hi2";
import toast from "react-hot-toast";

interface Mission {
  id: string;
  commande_id: string;
  livreur_id: string | null;
  statut: 'disponible' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';
  gain_livreur: number | null;
  commission_plateforme: number | null;
  created_at: string;
  commande: {
    id: string;
    reference: string;
    type: 'restauration' | 'commerce' | 'course';
    statut: string;
    client_nom: string;
    client_telephone: string;
    client_adresse: string;
    client_quartier: string;
    commerce_nom: string;
    total: number;
    produits: any[];
  };
}

export default function MissionsDisponibles() {
  const { livreur, user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          commande:commandes(*)
        `)
        .eq('statut', 'disponible')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
      toast.error('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  };

  const accepterMission = async (missionId: string, commandeId: string) => {
    if (!livreur) {
      toast.error('Vous devez être connecté en tant que livreur');
      return;
    }

    try {
      // 1. Mettre à jour la mission
      const { error: missionError } = await supabase
        .from('missions')
        .update({
          livreur_id: livreur.id,
          statut: 'acceptee',
          date_acceptation: new Date().toISOString()
        })
        .eq('id', missionId);

      if (missionError) throw missionError;

      // 2. Mettre à jour la commande
      const { error: commandeError } = await supabase
        .from('commandes')
        .update({
          livreur_id: livreur.id,
          livreur_nom: user?.nom,
          statut: 'acceptee'
        })
        .eq('id', commandeId);

      if (commandeError) throw commandeError;

      // 3. Créer une notification pour le client
      await supabase
        .from('notifications')
        .insert({
          user_id: livreur.profil_id,
          titre: '📦 Mission acceptée',
          message: `Vous avez accepté la mission #${missionId.slice(0, 8)}`,
          type: 'mission',
          lu: false
        });

      toast.success('✅ Mission acceptée avec succès !');
      loadMissions();
    } catch (error) {
      console.error('Erreur acceptation:', error);
      toast.error('Erreur lors de l\'acceptation de la mission');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      'restauration': { label: '🍴 Repas', color: 'bg-amber-100 text-amber-700' },
      'commerce': { label: '🛍️ Produit', color: 'bg-purple-100 text-purple-700' },
      'course': { label: '🚚 Course', color: 'bg-blue-100 text-blue-700' }
    };
    return labels[type] || { label: type, color: 'bg-slate-100 text-slate-700' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        🔔 Missions disponibles ({missions.length})
      </h2>

      {missions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-slate-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-medium">Aucune mission en attente</p>
          <p className="text-sm mt-1">Revenez plus tard, de nouvelles missions seront disponibles !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map((mission) => {
            const typeInfo = getTypeLabel(mission.commande?.type || 'course');
            return (
              <div key={mission.id} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        #{mission.commande?.reference || mission.id.slice(0, 8)}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 text-sm">
                      {mission.commande?.commerce_nom || 'Mission'}
                    </p>

                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <HiUser className="text-slate-400" />
                        <span>{mission.commande?.client_nom || 'Client'} • {mission.commande?.client_telephone || ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiMapPin className="text-orange-500" />
                        <span>{mission.commande?.client_adresse || 'Adresse inconnue'}</span>
                      </div>
                      {mission.commande?.produits && (
                        <div className="text-slate-400 mt-1">
                          📦 {mission.commande.produits.length} article(s)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                      <HiCurrencyDollar className="text-green-500" />
                      {mission.commande?.total?.toLocaleString() || 0} FCFA
                    </div>
                    <button
                      onClick={() => accepterMission(mission.id, mission.commande_id)}
                      className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 active:scale-[0.97] transition-all flex items-center gap-2"
                    >
                      <HiTruck className="text-lg" />
                      Accepter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}