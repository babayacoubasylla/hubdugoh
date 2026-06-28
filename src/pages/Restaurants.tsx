import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { HiStar, HiArrowLeft } from "react-icons/hi2";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const FRAIS_LIVRAISON = 500;

interface Restaurant {
  id: string;
  nom_commerce: string;
  description: string;
  image_url: string | null;
  note_moyenne: number;
  quartier: string;
  adresse: string;
  ouvert: boolean;
  horaires: string;
  frais_livraison: number;
  delai_livraison: string;
  produits: any[];
}

export default function Restaurants() {
  const { addToCart } = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('commercants')
        .select(`
          *,
          produits:produits(*)
        `)
        .eq('type_commerce', 'restaurant')
        .eq('ouvert', true);

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const add = (produit: any, restau: Restaurant) => {
    const prixTotal = produit.prix + FRAIS_LIVRAISON;
    addToCart({
      kind: "menu",
      item: {
        id: produit.id,
        nom: produit.nom,
        prix: prixTotal,
        description: produit.description,
        image: produit.image_url
      },
      restaurantId: restau.id,
      restaurantNom: restau.nom_commerce,
      qty: 1
    });
    toast.success(`✅ ${produit.nom} ajouté (${prixTotal.toLocaleString()} FCFA livraison incluse)`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <div className="mx-auto max-w-4xl px-4 py-6">
            <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1.5 text-white/80 hover:text-white mb-4 text-sm touch-target">
              <HiArrowLeft /> Retour
            </button>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shrink-0 overflow-hidden">
                {selected.image_url ? <img src={selected.image_url} alt={selected.nom_commerce} className="w-full h-full object-cover" /> : "🍽️"}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{selected.nom_commerce}</h1>
                <p className="text-white/80 text-sm mt-0.5">{selected.quartier} · {selected.adresse}</p>
                <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                  <span className="flex items-center gap-0.5"><HiStar className="text-yellow-300" /> {selected.note_moyenne || 4.0}</span>
                  <span className={selected.ouvert ? "text-green-200" : "text-red-200"}>{selected.ouvert ? "🟢 Ouvert" : "🔴 Fermé"} · {selected.horaires || '08:00-22:00'}</span>
                  <span>🚀 {selected.delai_livraison || '30-45 min'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-slate-500">Livraison :</span>
            <span className="font-bold text-orange-500">{FRAIS_LIVRAISON} FCFA</span>
            <span className="text-xs text-green-600">(fixe)</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">📋 Menu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selected.produits?.map((m) => {
              const prixTotal = m.prix + FRAIS_LIVRAISON;
              return (
                <div key={m.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="h-40 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-4xl">
                    {m.image_url ? <img src={m.image_url} alt={m.nom} className="w-full h-full object-cover" /> : "🍽️"}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm">{m.nom}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{m.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="font-bold text-orange-600">{prixTotal.toLocaleString()} FCFA</span>
                        <span className="text-[10px] text-green-600 ml-1">dont {FRAIS_LIVRAISON}F livraison</span>
                      </div>
                      <button onClick={() => add(m, selected)} disabled={!m.disponible}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:bg-slate-300 active:scale-[0.97] transition-all">
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
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">🍴 Restaurants</h1>
          <p className="text-white/80 text-sm mt-1">Commandez et faites-vous livrer</p>
          <p className="text-white/60 text-xs mt-1">🛵 Livraison {FRAIS_LIVRAISON} FCFA (fixe)</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r) => (
            <motion.button key={r.id} onClick={() => setSelected(r)} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-left overflow-hidden active:scale-[0.98]">
              <div className="h-44 bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-5xl relative">
                {r.image_url ? <img src={r.image_url} alt={r.nom_commerce} className="w-full h-full object-cover" /> : "🍽️"}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <HiStar className="text-yellow-500 text-xs" /> {r.note_moyenne || 4.0}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800">{r.nom_commerce}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                  <span>{r.quartier}</span>
                  <span>🚀 {r.delai_livraison || '30-45 min'}</span>
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