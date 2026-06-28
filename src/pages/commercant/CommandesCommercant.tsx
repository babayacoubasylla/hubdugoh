import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { HiCheckCircle, HiClock, HiXCircle, HiTruck, HiUser } from "react-icons/hi2";
import toast from "react-hot-toast";

interface Commande {
  id: string;
  reference: string;
  client_nom: string;
  client_telephone: string;
  client_adresse: string;
  client_quartier: string;
  statut: string;
  total: number;
  date_commande: string;
  livreur_nom: string | null;
  livreur_id: string | null;
  produits: any[];
  type: string;
}

export default function CommandesCommercant() {
  const { user, commercant } = useAuth();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('toutes');

  useEffect(() => {
    if (commercant) {
      loadCommandes();
    }
  }, [commercant]);

  const loadCommandes = async () => {
    if (!commercant) return;

    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('commercant_id', commercant.id)
        .order('date_commande', { ascending: false });

      if (error) throw error;
      setCommandes(data || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id: string, newStatut: string) => {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({
          statut: newStatut,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`✅ Commande ${newStatut === 'preparation' ? 'en préparation' : newStatut}`);
      loadCommandes();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'en_attente': '⏳ En attente',
      'acceptee': '✅ Acceptée',
      'preparation': '👨‍🍳 En préparation',
      'recuperation': '📦 Récupération',
      'en_cours': '🚚 En cours',
      'livree': '🎉 Livrée',
      'annulee': '❌ Annulée'
    };
    return labels[statut] || statut;
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'en_attente': 'bg-yellow-100 text-yellow-700',
      'acceptee': 'bg-blue-100 text-blue-700',
      'preparation': 'bg-purple-100 text-purple-700',
      'recuperation': 'bg-indigo-100 text-indigo-700',
      'en_cours': 'bg-orange-100 text-orange-700',
      'livree': 'bg-green-100 text-green-700',
      'annulee': 'bg-red-100 text-red-700'
    };
    return colors[statut] || 'bg-slate-100 text-slate-700';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'restauration': '🍴 Restauration',
      'commerce': '🛍️ Commerce',
      'course': '🚚 Course'
    };
    return labels[type] || type;
  };

  const filteredCommandes = filter === 'toutes'
    ? commandes
    : commandes.filter(c => c.statut === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Statistiques
  const enAttente = commandes.filter(c => c.statut === 'en_attente').length;
  const enPreparation = commandes.filter(c => c.statut === 'preparation').length;
  const enCours = commandes.filter(c => c.statut === 'en_cours' || c.statut === 'recuperation').length;
  const livrees = commandes.filter(c => c.statut === 'livree').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">📋 Commandes ({commandes.length})</h2>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-3 text-center border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{enAttente}</p>
          <p className="text-xs text-slate-500">En attente</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-purple-600">{enPreparation}</p>
          <p className="text-xs text-slate-500">En préparation</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 text-center border-l-4 border-orange-500">
          <p className="text-2xl font-bold text-orange-600">{enCours}</p>
          <p className="text-xs text-slate-500">En cours</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{livrees}</p>
          <p className="text-xs text-slate-500">Livrées</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {['toutes', 'en_attente', 'preparation', 'en_cours', 'livree', 'annulee'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filter === s
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
          >
            {s === 'toutes' ? 'Toutes' : getStatutLabel(s)}
          </button>
        ))}
      </div>

      {filteredCommandes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-slate-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-medium">Aucune commande</p>
          <p className="text-sm mt-1">Les commandes apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCommandes.map((cmd) => (
            <div key={cmd.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{cmd.client_nom}</span>
                    <span className="text-xs text-slate-400 font-mono">#{cmd.reference}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatutColor(cmd.statut)}`}>
                      {getStatutLabel(cmd.statut)}
                    </span>
                    <span className="text-xs text-slate-400">{getTypeLabel(cmd.type)}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <HiUser className="text-slate-400" />
                    {cmd.client_telephone} • 📍 {cmd.client_adresse}
                  </p>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>{new Date(cmd.date_commande).toLocaleString('fr-FR')}</span>
                    {cmd.livreur_nom && (
                      <span className="flex items-center gap-1">
                        <HiTruck className="text-blue-500" />
                        {cmd.livreur_nom}
                      </span>
                    )}
                  </div>
                  {/* Produits */}
                  {cmd.produits && cmd.produits.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cmd.produits.map((p: any, i: number) => (
                        <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                          {p.nom} × {p.quantite}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-purple-600">{cmd.total.toLocaleString()} FCFA</p>
                  {cmd.statut === 'en_attente' && (
                    <button
                      onClick={() => updateStatut(cmd.id, 'preparation')}
                      className="mt-2 px-4 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 transition-colors"
                    >
                      Démarrer la préparation
                    </button>
                  )}
                  {cmd.statut === 'preparation' && (
                    <button
                      onClick={() => updateStatut(cmd.id, 'recuperation')}
                      className="mt-2 px-4 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
                    >
                      Prêt pour récupération
                    </button>
                  )}
                  {cmd.statut === 'recuperation' && (
                    <button
                      onClick={() => updateStatut(cmd.id, 'en_cours')}
                      className="mt-2 px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                    >
                      Envoyer en livraison
                    </button>
                  )}
                  {cmd.statut === 'en_cours' && (
                    <button
                      onClick={() => updateStatut(cmd.id, 'livree')}
                      className="mt-2 px-4 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                    >
                      Marquer comme livrée
                    </button>
                  )}
                  {cmd.statut === 'livree' && (
                    <span className="mt-2 inline-block text-green-600 font-semibold text-sm">✅ Terminée</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}