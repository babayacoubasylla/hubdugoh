import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { HiStar, HiArrowLeft } from "react-icons/hi2";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const FRAIS_LIVRAISON = 500;

interface Boutique {
  id: string;
  nom_commerce: string;
  description: string;
  image_url: string | null;
  banniere_url: string | null;
  photo_profil_url: string | null;
  note_moyenne: number;
  quartier: string;
  adresse: string;
  vendeur_nom: string;
  produits: any[];
}

export default function Commerce() {
  const { addToCart } = useCart();
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [selected, setSelected] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoutiques();
  }, []);

  const loadBoutiques = async () => {
    try {
      const { data, error } = await supabase
        .from('commercants')
        .select(`
          *,
          produits:produits(*),
          profil:profils(nom)
        `)
        .eq('type_commerce', 'boutique')
        .eq('ouvert', true);

      if (error) throw error;
      setBoutiques(data || []);
    } catch (error) {
      console.error('Erreur chargement boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const add = (produit: any, boutique: Boutique) => {
    const prixTotal = produit.prix + FRAIS_LIVRAISON;
    addToCart({
      kind: "produit",
      item: {
        id: produit.id,
        nom: produit.nom,
        prix: prixTotal,
        description: produit.description,
        image: produit.image_url,
        categorie: produit.categorie
      },
      boutiqueId: boutique.id,
      boutiqueNom: boutique.nom_commerce,
      qty: 1
    });
    toast.success(`✅ ${produit.nom} ajouté (${prixTotal.toLocaleString()} FCFA livraison incluse)`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Bannière */}
        <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64 mx-4 mt-4">
          {selected.banniere_url ? (
            <img
              src={selected.banniere_url}
              alt={selected.nom_commerce}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : selected.image_url ? (
            <img
              src={selected.image_url}
              alt={selected.nom_commerce}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
              <div className="text-center">
                <span className="text-6xl block mb-2">🛍️</span>
                <p className="font-bold text-xl">{selected.nom_commerce}</p>
              </div>
            </div>
          )}

          {/* Photo de profil flottante */}
          <div className="absolute -bottom-8 left-4 sm:left-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              {selected.photo_profil_url ? (
                <img
                  src={selected.photo_profil_url}
                  alt={selected.nom_commerce}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-3xl">
                  🏪
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Espace pour la photo de profil */}
        <div className="h-10 sm:h-12" />

        {/* Informations */}
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{selected.nom_commerce}</h1>
              <p className="text-sm text-slate-500">{selected.quartier} · {selected.adresse}</p>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <span className="flex items-center gap-0.5">
                  <HiStar className="text-yellow-500" /> {selected.note_moyenne || 4.0}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">{selected.profil?.nom || selected.vendeur_nom || 'Vendeur'}</span>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              <HiArrowLeft /> Retour
            </button>
          </div>

          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="text-slate-500">Livraison :</span>
            <span className="font-bold text-purple-500">{FRAIS_LIVRAISON} FCFA</span>
            <span className="text-xs text-green-600">(fixe)</span>
          </div>

          <h2 className="text-lg font-bold text-slate-800 mb-4">🛍️ Produits ({selected.produits?.length || 0})</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {selected.produits?.map((p) => {
              const prixTotal = p.prix + FRAIS_LIVRAISON;
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-slate-100">
                  <div className="h-40 bg-gradient-to-br from-purple-200 to-pink-300 flex items-center justify-center text-4xl">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.nom}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '📦';
                        }}
                      />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm">{p.nom}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{p.description}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${p.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.disponible ? "En stock" : "Rupture"}
                    </span>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="font-bold text-purple-600">{prixTotal.toLocaleString()} FCFA</span>
                        <span className="text-[10px] text-green-600 ml-1">dont {FRAIS_LIVRAISON}F livraison</span>
                      </div>
                      <button
                        onClick={() => add(p, selected)}
                        disabled={!p.disponible}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:bg-slate-300 active:scale-[0.97] transition-all"
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">🛍️ Boutiques locales</h1>
          <p className="text-white/80 text-sm mt-1">Achetez et faites-vous livrer</p>
          <p className="text-white/60 text-xs mt-1">🛵 Livraison {FRAIS_LIVRAISON} FCFA (fixe)</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {boutiques.map((b) => (
            <motion.button
              key={b.id}
              onClick={() => setSelected(b)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-left overflow-hidden active:scale-[0.98]"
            >
              <div className="h-44 relative">
                {b.banniere_url ? (
                  <img
                    src={b.banniere_url}
                    alt={b.nom_commerce}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : b.image_url ? (
                  <img
                    src={b.image_url}
                    alt={b.nom_commerce}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-300 to-pink-400 flex items-center justify-center text-5xl">
                    🛍️
                  </div>
                )}

                {/* Photo de profil miniature */}
                <div className="absolute -bottom-4 left-4">
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-white overflow-hidden shadow-md">
                    {b.photo_profil_url ? (
                      <img
                        src={b.photo_profil_url}
                        alt={b.nom_commerce}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-100 text-lg">
                        🏪
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-6">
                <h3 className="font-bold text-slate-800">{b.nom_commerce}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-0.5"><HiStar className="text-yellow-500 text-xs" /> {b.note_moyenne || 4.0}</span>
                  <span>{b.produits?.length || 0} produits</span>
                  <span>{b.quartier}</span>
                  <span className="text-green-600 font-medium">Livr. {FRAIS_LIVRAISON}F</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}