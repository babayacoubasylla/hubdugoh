import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function CommercantOverview() {
  const { user, commercant } = useAuth();
  const [stats, setStats] = useState({
    totalVentes: 0,
    enCours: 0,
    livrees: 0,
    commandesEnCours: [] as any[],
    dernieresVentes: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si commercant existe
    if (!commercant) {
      console.log("❌ Aucun commerçant trouvé pour l'utilisateur:", user?.id);
      setError("Profil commerçant non trouvé. Veuillez contacter l'administrateur.");
      setLoading(false);
      return;
    }

    console.log("✅ Commerçant chargé:", commercant);
    loadStats();
  }, [commercant]);

  const loadStats = async () => {
    if (!commercant) {
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Chargement des stats pour commerçant:", commercant.id);

      const { data: commandes, error: commandesError } = await supabase
        .from('commandes')
        .select('*')
        .eq('commercant_id', commercant.id)
        .order('date_commande', { ascending: false });

      if (commandesError) {
        console.error("❌ Erreur chargement commandes:", commandesError);
        setError("Erreur lors du chargement des commandes");
        setLoading(false);
        return;
      }

      console.log("✅ Commandes chargées:", commandes?.length || 0);

      const enCours = commandes?.filter(c => !['livree', 'annulee'].includes(c.statut)) || [];
      const livrees = commandes?.filter(c => c.statut === 'livree') || [];
      const totalVentes = livrees.reduce((sum, c) => sum + (c.total || 0), 0);

      setStats({
        totalVentes,
        enCours: enCours.length,
        livrees: livrees.length,
        commandesEnCours: enCours.slice(0, 3),
        dernieresVentes: livrees.slice(0, 5)
      });
    } catch (error) {
      console.error('❌ Erreur loadStats:', error);
      setError("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm mt-4">Chargement de votre boutique...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-bold text-slate-800">Erreur</h3>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <p className="text-xs text-slate-400 mt-1">
          ID Utilisateur: {user?.id || 'Inconnu'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  // Si pas de commerçant
  if (!commercant) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4">🛒</div>
        <h3 className="text-lg font-bold text-slate-800">Aucune boutique trouvée</h3>
        <p className="text-sm text-slate-500 mt-2">
          Vous n'avez pas encore de boutique associée à votre compte.
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Veuillez contacter l'administrateur pour créer votre boutique.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          ID Utilisateur: {user?.id || 'Inconnu'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xl font-bold text-slate-800">{stats.totalVentes.toLocaleString()}</div>
          <div className="text-xs text-slate-500">FCFA ventes</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <div className="text-2xl mb-1">🛵</div>
          <div className="text-xl font-bold text-slate-800">{stats.enCours}</div>
          <div className="text-xs text-slate-500">En cours</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-xl font-bold text-slate-800">{stats.livrees}</div>
          <div className="text-xs text-slate-500">Livrées</div>
        </div>
      </div>

      {/* Commandes en cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-3">📦 Commandes en cours</h3>
          {stats.commandesEnCours.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune commande en cours.</p>
          ) : (
            <div className="space-y-2">
              {stats.commandesEnCours.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl text-sm">
                  <p className="font-medium">{c.commerce_nom || 'Boutique'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.client_nom || 'Client'} • {c.statut || 'En attente'}
                  </p>
                  <p className="text-xs font-bold text-purple-600 mt-1">
                    {(c.total || 0).toLocaleString()} FCFA
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dernières ventes */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-3">📊 Dernières ventes</h3>
          {stats.dernieresVentes.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune vente encore.</p>
          ) : (
            <div className="space-y-2">
              {stats.dernieresVentes.map((c) => (
                <div key={c.id} className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm">
                  <span className="truncate">{c.client_nom || 'Client'}</span>
                  <span className="font-bold text-purple-600 shrink-0 ml-2">
                    {(c.total || 0).toLocaleString()} FCFA
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}