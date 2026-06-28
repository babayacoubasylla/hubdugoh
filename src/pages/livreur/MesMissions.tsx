import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface Mission {
  id: string;
  commande_id: string;
  livreur_id: string;
  statut: 'disponible' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';
  gain_livreur: number | null;
  commission_plateforme: number | null;
  created_at: string;
  date_acceptation: string | null;
  date_debut: string | null;
  date_fin: string | null;
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
    etapes: { nom: string; complete: boolean; horodatage?: string }[];
  };
}

const ETAPES = ["Mission acceptée", "Récupération", "En cours de livraison", "Livrée"];

export default function MesMissions() {
  const { user, livreur } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (livreur) {
      loadMissions();
    }
  }, [livreur]);

  const loadMissions = async () => {
    if (!livreur) return;

    try {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          commande:commandes(*)
        `)
        .eq('livreur_id', livreur.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
      toast.error('Erreur lors du chargement de vos missions');
    } finally {
      setLoading(false);
    }
  };

  const passerEtape = async (missionId: string, commandeId: string, currentStatut: string) => {
    try {
      // Trouver l'étape actuelle
      const idx = ETAPES.findIndex((e) => e === currentStatut);
      const nextStep = idx < ETAPES.length - 1 ? ETAPES[idx + 1] : null;

      if (!nextStep) {
        // Mission terminée
        await supabase
          .from('missions')
          .update({
            statut: 'terminee',
            date_fin: new Date().toISOString()
          })
          .eq('id', missionId);

        await supabase
          .from('commandes')
          .update({
            statut: 'livree',
            date_livraison: new Date().toISOString(),
            paiement_effectue: true
          })
          .eq('id', commandeId);

        // Incrémenter les missions du livreur
        await supabase.rpc('incrementer_missions_livreur', {
          p_livreur_id: livreur?.id
        });

        // Créer une notification pour le client
        await supabase
          .from('notifications')
          .insert({
            user_id: livreur?.profil_id,
            titre: '🎉 Mission terminée',
            message: `Vous avez terminé la mission #${missionId.slice(0, 8)}`,
            type: 'mission',
            lu: false
          });

        toast.success('🎉 Mission terminée avec succès !');
        loadMissions();
        return;
      }

      // Mettre à jour les étapes de la commande
      const { data: commande } = await supabase
        .from('commandes')
        .select('etapes')
        .eq('id', commandeId)
        .single();

      let etapes = commande?.etapes || [];
      const etapeIndex = etapes.findIndex((e: any) => e.nom === nextStep);

      if (etapeIndex !== -1) {
        etapes[etapeIndex].complete = true;
        etapes[etapeIndex].horodatage = new Date().toLocaleTimeString();
      }

      // Mettre à jour la commande
      await supabase
        .from('commandes')
        .update({
          etapes: etapes,
          statut: nextStep === 'Livrée' ? 'livree' : 'en_cours'
        })
        .eq('id', commandeId);

      // Mettre à jour la mission
      const missionStatut = nextStep === 'Livrée' ? 'terminee' : 'en_cours';
      await supabase
        .from('missions')
        .update({
          statut: missionStatut,
          date_debut: nextStep === 'Récupération' ? new Date().toISOString() : undefined,
          date_fin: nextStep === 'Livrée' ? new Date().toISOString() : undefined
        })
        .eq('id', missionId);

      toast.success(`✅ Étape : ${nextStep}`);

      if (nextStep === 'Livrée') {
        toast.success('🎉 Mission terminée !');
      }

      loadMissions();
    } catch (error) {
      console.error('Erreur mise à jour étape:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getCurrentStep = (mission: Mission) => {
    if (mission.statut === 'terminee') return 3;
    if (mission.statut === 'annulee') return -1;

    const etapes = mission.commande?.etapes || [];
    const completedCount = etapes.filter((e: any) => e.complete).length;
    return Math.min(completedCount, 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const missionsActives = missions.filter(m => m.statut !== 'annulee');

  if (missionsActives.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-slate-400">
        <div className="text-5xl mb-3">📭</div>
        <p className="font-medium">Aucune mission</p>
        <p className="text-sm mt-1">Acceptez des missions disponibles !</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        📋 Mes missions ({missionsActives.length})
      </h2>

      <div className="space-y-4">
        {missionsActives.map((m) => {
          const currentIdx = getCurrentStep(m);
          const statut = m.statut === 'terminee' ? 'Terminée' :
            m.statut === 'en_cours' ? 'En cours' :
              m.statut === 'acceptee' ? 'Acceptée' : 'En attente';

          return (
            <div key={m.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Mission #{m.commande?.reference || m.id.slice(0, 8)}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {m.commande?.commerce_nom || 'Commerce'}
                  </span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {m.gain_livreur?.toLocaleString() || m.commande?.total?.toLocaleString() || 0} FCFA
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-2">
                {m.commande?.produits?.map((p: any) => p.nom).join(', ') || 'Mission'}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <span>👤 {m.commande?.client_nom || 'Client'}</span>
                <span>•</span>
                <span>📍 {m.commande?.client_adresse || 'Adresse'}</span>
              </div>

              {/* Barre de progression */}
              <div className="flex items-center gap-1 mb-4">
                {ETAPES.map((_e, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < currentIdx ? "bg-green-500 text-white" :
                        i === currentIdx ? "bg-blue-500 text-white animate-pulse" :
                          "bg-slate-200 text-slate-500"
                      }`}>
                      {i < currentIdx ? "✓" : i === currentIdx ? "●" : i + 1}
                    </div>
                    {i < ETAPES.length - 1 && (
                      <div className={`flex-1 h-1 mx-0.5 rounded transition-all ${i < currentIdx ? "bg-green-500" : "bg-slate-200"
                        }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">
                  {m.statut === 'terminee' ? '✅ Terminée' :
                    m.statut === 'en_cours' ? '🔄 En cours' :
                      m.statut === 'acceptee' ? '⏳ Acceptée' : '📦 En attente'}
                </span>

                {m.statut !== 'terminee' && m.statut !== 'annulee' && (
                  <button
                    onClick={() => passerEtape(m.id, m.commande_id, ETAPES[currentIdx] || 'Mission acceptée')}
                    className="px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 active:scale-[0.97] transition-all flex items-center gap-2"
                  >
                    Étape suivante →
                  </button>
                )}

                {m.statut === 'terminee' && (
                  <span className="text-green-600 font-bold text-sm">✅ Terminée</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}