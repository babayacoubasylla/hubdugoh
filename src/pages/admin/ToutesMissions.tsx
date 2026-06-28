import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { HiMagnifyingGlass } from "react-icons/hi2";
import toast from "react-hot-toast";

const statuts = ["tous", "en_attente", "acceptee", "preparation", "recuperation", "en_cours", "livree", "annulee"] as const;

interface Mission {
  id: string;
  commande_id: string;
  livreur_id: string | null;
  statut: string;
  date_acceptation: string | null;
  date_debut: string | null;
  date_fin: string | null;
  gain_livreur: number | null;
  created_at: string;
  commande: {
    reference: string;
    description: string;
    client_nom: string;
    client_telephone: string;
    client_adresse: string;
    commerce_nom: string;
    total: number;
    date_commande: string;
  };
  livreur: {
    profil: {
      nom: string;
    };
  } | null;
}

export default function ToutesMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<string>("tous");

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          commande:commandes(
            reference,
            client_nom,
            client_telephone,
            client_adresse,
            commerce_nom,
            total,
            date_commande
          ),
          livreur:livreurs(
            profil:profils(
              nom
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
      toast.error('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  };

  const statutLabel = (s: string) => {
    const map: Record<string, string> = {
      en_attente: "⏳ En attente",
      acceptee: "✅ Acceptée",
      preparation: "👨‍🍳 Préparation",
      recuperation: "📦 Récupération",
      en_cours: "🛵 En cours",
      livree: "🏠 Livrée",
      annulee: "❌ Annulée",
    };
    return map[s] || s;
  };

  const statutColor = (s: string) => {
    const map: Record<string, string> = {
      en_attente: "bg-yellow-100 text-yellow-700",
      preparation: "bg-purple-100 text-purple-700",
      en_cours: "bg-blue-100 text-blue-700",
      livree: "bg-green-100 text-green-700",
      annulee: "bg-red-100 text-red-700",
      acceptee: "bg-indigo-100 text-indigo-700",
      recuperation: "bg-purple-100 text-purple-700",
    };
    return map[s] || "bg-slate-100 text-slate-700";
  };

  const filtered = missions.filter((m) => {
    const searchLower = search.toLowerCase();
    const matchSearch = !search ||
      m.commande?.client_nom?.toLowerCase().includes(searchLower) ||
      m.commande?.reference?.toLowerCase().includes(searchLower) ||
      m.livreur?.profil?.nom?.toLowerCase().includes(searchLower) ||
      m.commande?.commerce_nom?.toLowerCase().includes(searchLower);

    const matchStatut = filtreStatut === "tous" || m.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">📋 Toutes les missions ({missions.length})</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher client, livreur, commerce..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-red-400"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {statuts.map((s) => (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${filtreStatut === s ? "bg-red-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-red-50"
                }`}
            >
              {s === "tous" ? "Tous" : statutLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p>Aucune mission trouvée</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-12 gap-2 p-3 bg-slate-50 text-xs font-medium text-slate-500">
              <div className="col-span-1">Réf.</div>
              <div className="col-span-3">Commerce</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Livreur</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">Montant</div>
            </div>
            {filtered.map((m) => (
              <div key={m.id} className="sm:grid grid-cols-12 gap-2 p-3 sm:p-4 border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50">
                <div className="col-span-1 font-mono text-xs text-slate-500 truncate">
                  {m.commande?.reference ? m.commande.reference.slice(0, 8) : m.id.slice(0, 8)}
                </div>
                <div className="col-span-3 text-slate-800 truncate">
                  {m.commande?.commerce_nom || '—'}
                </div>
                <div className="col-span-2 text-slate-500 text-xs truncate">
                  {m.commande?.client_nom || '—'}
                </div>
                <div className="col-span-2 text-slate-500 text-xs truncate">
                  {m.livreur?.profil?.nom || '—'}
                </div>
                <div className="col-span-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statutColor(m.statut)}`}>
                    {statutLabel(m.statut)}
                  </span>
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-800">
                  {m.commande?.total ? m.commande.total.toLocaleString() : '0'} FCFA
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}