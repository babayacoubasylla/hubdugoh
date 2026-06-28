import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { HiMinus, HiPlus, HiArrowLeft, HiTrash } from "react-icons/hi2";
import toast from "react-hot-toast";
import FraisLivraisonSelector from "@/components/shared/FraisLivraisonSelector";

export default function Checkout() {
  const { state, addToCart, removeFromCart, updateQuantity, clearCart } = useCart(); // ← Changé: cart → state
  const { user, register } = useAuth();
  const [form, setForm] = useState({
    nom: user?.nom || "",
    telephone: user?.telephone || "",
    adresse: user?.adresse || "",
    quartier: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fraisLivraison, setFraisLivraison] = useState(500);
  const [typeLivraison, setTypeLivraison] = useState<'standard' | 'express' | 'group'>('standard');

  const handleFraisChange = (type: 'standard' | 'express' | 'group', frais: number) => {
    setTypeLivraison(type);
    setFraisLivraison(frais);
  };

  const totalFinal = state.total + fraisLivraison;

  if (state.count === 0 && !submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Panier vide</h2>
          <p className="text-slate-500 mb-6">Ajoutez des articles depuis les restaurants, boutiques ou courses.</p>
          <Link to="/" className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors">
            Voir les restaurants
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      try {
        await register({
          nom: form.nom,
          telephone: form.telephone,
          role: "client",
          password: "client123",
          adresse: form.adresse,
          quartier: form.quartier
        });
      } catch (error) {
        setLoading(false);
        toast.error("Erreur lors de la création du compte");
        return;
      }
    }

    // TODO: Envoyer la commande à Supabase
    setTimeout(() => {
      setSubmitted(true);
      clearCart();
      setLoading(false);
      toast.success("✅ Commande confirmée ! Un livreur va vous contacter.");
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-5">✅</div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">Commande confirmée !</h2>
          <p className="text-slate-500 text-sm mb-2">Votre commande a été envoyée aux livreurs disponibles.</p>
          <p className="text-slate-400 text-xs mb-6">Un livreur vous contactera au <strong>{form.telephone}</strong></p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/suivi" className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors">Suivre ma commande</Link>
            <Link to="/" className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-colors">Accueil</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-8">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm touch-target">
            <HiArrowLeft /> Continuer les achats
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">🛒 Votre panier</h1>
          <p className="text-white/80 text-sm mt-1">{state.count} article{state.count > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panier */}
          <div className="lg:col-span-2 space-y-3">
            {state.items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{item.nom}</p>
                  <p className="text-xs text-slate-400">
                    {item.type === 'restaurant' ? '🍴 Restaurant' :
                      item.type === 'boutique' ? '🛍️ Boutique' : '🚚 Course'}
                  </p>
                  <p className="font-bold text-orange-600 text-sm mt-1">{item.total.toLocaleString()} FCFA</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantite - 1)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <HiMinus className="text-xs" />
                  </button>
                  <span className="w-6 text-center font-medium text-sm">{item.quantite}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantite + 1)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <HiPlus className="text-xs" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-slate-400 hover:text-red-500 transition-colors touch-target"
                >
                  <HiTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-20 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Résumé</h3>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-slate-500">Sous-total</span>
                  <span className="font-semibold">{state.total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between mt-1 text-sm">
                  <span className="text-slate-500">Livraison</span>
                  <span className="font-semibold">{fraisLivraison.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">{totalFinal.toLocaleString()} FCFA</span>
                </div>
              </div>

              <FraisLivraisonSelector
                onChange={handleFraisChange}
                defaultType="standard"
                className="border-t pt-3"
              />

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">📍 Où vous livrer ?</p>
                  <input
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400"
                    placeholder="Votre nom complet *"
                  />
                  <input
                    required
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 mt-2"
                    placeholder="Téléphone *"
                  />
                  <textarea
                    required
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 mt-2 resize-none"
                    placeholder="Adresse de livraison *"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 disabled:bg-slate-300 active:scale-[0.98] transition-all"
                >
                  {loading ? "Confirmation..." : `Confirmer la commande • ${totalFinal.toLocaleString()} FCFA`}
                </button>
                {!user && (
                  <p className="text-xs text-slate-400 text-center">Un compte sera créé automatiquement avec votre téléphone.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}