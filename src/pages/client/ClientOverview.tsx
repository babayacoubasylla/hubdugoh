import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ClientOverview() {
  const { user } = useAuth();
  const [recentCommandes, setRecentCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentCommandes();
    }
  }, [user]);

  const loadRecentCommandes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('commandes')
      .select(`
        id,
        reference,
        statut,
        total,
        commerce_nom,
        date_commande,
        commercant:commercants(nom_commerce)
      `)
      .eq('client_id', user.id)
      .order('date_commande', { ascending: false })
      .limit(4);

    if (data) {
      setRecentCommandes(data);
    }
    setLoading(false);
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

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Chargement...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link to="/restauration" className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all active:scale-[0.98] text-left">
          <div className="text-3xl mb-2">🍴</div>
          <h3 className="font-bold text-slate-800 text-sm">Commander à manger</h3>
          <p className="text-xs text-slate-500 mt-1">Restaurants de Gagnoa</p>
        </Link>
        <Link to="/commerces" className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all active:scale-[0.98] text-left">
          <div className="text-3xl mb-2">🛍️</div>
          <h3 className="font-bold text-slate-800 text-sm">Acheter en ligne</h3>
          <p className="text-xs text-slate-500 mt-1">Boutiques locales</p>
        </Link>
        <Link to="/courses" className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all active:scale-[0.98] text-left">
          <div className="text-3xl mb-2">🚚</div>
          <h3 className="font-bold text-slate-800 text-sm">Demander une course</h3>
          <p className="text-xs text-slate-500 mt-1">Colis, achats, services</p>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-slate-800 mb-3">📋 Mes dernières commandes</h3>
        {recentCommandes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Vous n'avez pas encore de commandes</p>
        ) : (
          <div className="space-y-3">
            {recentCommandes.map((cmd) => (
              <div key={cmd.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-slate-800">{cmd.commerce_nom}</p>
                  <p className="text-xs text-slate-400 font-mono">#{cmd.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-600">{getStatutLabel(cmd.statut)}</p>
                  <p className="text-sm font-bold text-orange-500">{cmd.total.toLocaleString()} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}