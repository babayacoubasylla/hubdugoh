import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Commande {
  id: string;
  reference: string;
  statut: string;
  total: number;
  commerce_nom: string;
  date_commande: string;
  livreur_nom: string | null;
  etapes: { nom: string; complete: boolean; horodatage?: string }[];
}

export default function MesCommandes() {
  const { user } = useAuth();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCommandes();
    }
  }, [user]);

  const loadCommandes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('client_id', user.id)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">📋 Mes commandes</h2>

      {commandes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-slate-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-medium">Vous n'avez pas encore de commandes</p>
          <Link to="/" className="text-orange-500 hover:underline text-sm">
            Découvrir les restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {commandes.map((cmd) => (
            <Link
              key={cmd.id}
              to={`/client/suivi/${cmd.id}`}
              className="block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border border-slate-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{cmd.commerce_nom}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatutColor(cmd.statut)}`}>
                      {getStatutLabel(cmd.statut)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">#{cmd.reference}</p>
                  <p className="text-xs text-slate-500">{new Date(cmd.date_commande).toLocaleString()}</p>
                  {cmd.livreur_nom && (
                    <p className="text-xs text-slate-500">🛵 {cmd.livreur_nom}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-orange-500">{cmd.total.toLocaleString()} FCFA</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}