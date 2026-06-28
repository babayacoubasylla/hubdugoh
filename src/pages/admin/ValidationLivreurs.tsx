import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { HiCheckBadge, HiXCircle, HiMagnifyingGlass, HiUser, HiTruck } from "react-icons/hi2";
import toast from "react-hot-toast";

interface LivreurAValider {
  id: string;
  profil_id: string;
  moto: string;
  plaque: string | null;
  zone_couverture: string[];
  disponible: boolean;
  profil: {
    id: string;
    nom: string;
    telephone: string;
    email: string | null;
    verifie: boolean;
    date_inscription: string;
  };
}

export default function ValidationLivreurs() {
  const [livreurs, setLivreurs] = useState<LivreurAValider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLivreurs();
  }, []);

  const loadLivreurs = async () => {
    try {
      // Charger les livreurs
      const { data: livreursData, error: livreursError } = await supabase
        .from('livreurs')
        .select('*');

      if (livreursError) throw livreursError;

      if (!livreursData || livreursData.length === 0) {
        setLivreurs([]);
        return;
      }

      // Charger les profils séparément
      const profilIds = livreursData.map(l => l.profil_id).filter(Boolean);

      const { data: profilsData, error: profilsError } = await supabase
        .from('profils')
        .select('*')
        .in('id', profilIds);

      if (profilsError) throw profilsError;

      // Fusionner livreurs + profils
      const merged = livreursData.map(l => ({
        ...l,
        profil: profilsData?.find(p => p.id === l.profil_id) || null
      }));

      setLivreurs(merged);
    } catch (error) {
      console.error('Erreur chargement livreurs:', error);
      toast.error('Erreur lors du chargement des livreurs');
    } finally {
      setLoading(false);
    }
  };

  const validerLivreur = async (livreurId: string, profilId: string) => {
    try {
      const { error: livreurError } = await supabase
        .from('livreurs')
        .update({ disponible: true })
        .eq('id', livreurId);

      if (livreurError) throw livreurError;

      const { error: profilError } = await supabase
        .from('profils')
        .update({ verifie: true })
        .eq('id', profilId);

      if (profilError) throw profilError;

      toast.success('✅ Livreur validé avec succès');
      loadLivreurs();
    } catch (error) {
      console.error('Erreur validation:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  const rejeterLivreur = async (livreurId: string, profilId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter ce livreur ?')) return;

    try {
      const { error: livreurError } = await supabase
        .from('livreurs')
        .delete()
        .eq('id', livreurId);

      if (livreurError) throw livreurError;

      const { error: profilError } = await supabase
        .from('profils')
        .delete()
        .eq('id', profilId);

      if (profilError) throw profilError;

      toast.success('❌ Livreur rejeté');
      loadLivreurs();
    } catch (error) {
      console.error('Erreur rejet:', error);
      toast.error('Erreur lors du rejet');
    }
  };

  const filtered = search
    ? livreurs.filter(l =>
      l.profil?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      l.profil?.telephone?.includes(search)
    )
    : livreurs;

  const enAttente = filtered.filter(l => !l.profil?.verifie);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        📋 Validation des livreurs ({enAttente.length} en attente)
      </h2>

      <div className="relative mb-4">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un livreur..."
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-red-400 outline-none"
        />
      </div>

      {enAttente.length === 0 && !search ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-bold text-slate-800">Tous les livreurs sont validés</h3>
          <p className="text-sm text-slate-400 mt-2">Aucun livreur en attente de validation</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-2 p-3 bg-slate-50 text-xs font-medium text-slate-500">
            <div className="col-span-3">Livreur</div>
            <div className="col-span-2">Téléphone</div>
            <div className="col-span-2">Moto</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-3">Action</div>
          </div>

          {enAttente.length === 0 && search ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aucun résultat pour "{search}"
            </div>
          ) : (
            enAttente.map((l) => (
              <div key={l.id} className="sm:grid grid-cols-12 gap-2 p-3 sm:p-4 border-b border-slate-100 last:border-0 items-center text-sm hover:bg-slate-50 transition-colors">
                <div className="col-span-3 font-medium text-slate-800 flex items-center gap-2">
                  <HiUser className="text-blue-500" />
                  <span>{l.profil?.nom || 'Nom inconnu'}</span>
                </div>
                <div className="col-span-2 text-slate-500 text-xs sm:text-sm">
                  {l.profil?.telephone || 'Téléphone inconnu'}
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <HiTruck className="text-slate-400" />
                    <span className="text-slate-600 text-xs">{l.moto || 'Non spécifiée'}</span>
                  </div>
                  {l.zone_couverture && l.zone_couverture.length > 0 && (
                    <span className="text-xs text-slate-400">{l.zone_couverture.join(', ')}</span>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    ⏳ En attente
                  </span>
                </div>
                <div className="col-span-3 flex gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => validerLivreur(l.id, l.profil_id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 active:scale-[0.97] transition-all"
                  >
                    <HiCheckBadge /> Valider
                  </button>
                  <button
                    onClick={() => rejeterLivreur(l.id, l.profil_id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 active:scale-[0.97] transition-all"
                  >
                    <HiXCircle /> Rejeter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}