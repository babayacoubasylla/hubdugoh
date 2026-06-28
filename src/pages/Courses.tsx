import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const FRAIS_LIVRAISON = 500;

interface Course {
  id: string;
  titre: string;
  description: string;
  icon: string;
  actif: boolean;
}

export default function Courses() {
  const { addToCart, state } = useCart();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [montants, setMontants] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('actif', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCourses(data);
        const initMontants: Record<string, number> = {};
        data.forEach((c: Course) => {
          initMontants[c.id] = 0;
        });
        setMontants(initMontants);
      } else {
        const defaultCourses = [
          { id: 'c1', titre: 'Récupérer un colis à la gare', description: 'Un livreur récupère votre colis à la gare UTB et vous le livre.', icon: '📦', actif: true },
          { id: 'c2', titre: 'Achat au marché', description: 'Décrivez ce que vous voulez, un livreur l\'achète pour vous au marché central.', icon: '🛒', actif: true },
          { id: 'c3', titre: 'Livraison de documents', description: 'Faites livrer des documents importants en toute sécurité.', icon: '📄', actif: true },
          { id: 'c4', titre: 'Course en pharmacie', description: 'Un livreur va chercher vos médicaments et vous les apporte.', icon: '💊', actif: true },
          { id: 'c5', titre: 'Remise de clés', description: 'Faites remettre des clés ou petits objets à un proche.', icon: '🔑', actif: true },
          { id: 'c6', titre: 'Achat en boulangerie', description: 'Faites-vous livrer du pain frais et viennoiseries.', icon: '🍞', actif: true }
        ];
        setCourses(defaultCourses);
        const initMontants: Record<string, number> = {};
        defaultCourses.forEach((c) => {
          initMontants[c.id] = 0;
        });
        setMontants(initMontants);
      }
    } catch (error) {
      console.error('Erreur chargement courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMontant = (courseId: string, value: number) => {
    setMontants(prev => ({
      ...prev,
      [courseId]: value
    }));
  };

  const ajouterCourse = (titre: string, courseId: string) => {
    const montant = montants[courseId] || 0;

    if (montant <= 0) {
      toast.error('Veuillez entrer le montant de votre course');
      return;
    }

    const prixTotal = montant + FRAIS_LIVRAISON;

    addToCart({
      nom: `${titre} (${montant.toLocaleString()} FCFA + livraison)`,
      prix: prixTotal,
      quantite: 1,
      type: 'course',
      description: titre
    });

    toast.success(`✅ ${titre} ajoutée (${prixTotal.toLocaleString()} FCFA)`);
    updateMontant(courseId, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">🚚 Courses & Services</h1>
          <p className="text-white/80 text-sm mt-1">Choisissez une course</p>
          <p className="text-white/60 text-xs mt-1">🛵 Frais de livraison : {FRAIS_LIVRAISON} FCFA</p>
          <p className="text-white/40 text-xs mt-1">💰 Entrez le montant de votre course</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-4">
          {courses.map((s) => {
            const montant = montants[s.id] || 0;
            const prixTotal = montant + FRAIS_LIVRAISON;

            return (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{s.icon || '📦'}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm">{s.titre}</h3>
                    <p className="text-xs text-slate-500 mt-1">{s.description}</p>

                    <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Montant :</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={montant || ''}
                            onChange={(e) => updateMontant(s.id, parseInt(e.target.value) || 0)}
                            placeholder="Ex: 2000"
                            className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                          />
                          <span className="text-sm text-slate-500">FCFA</span>
                        </div>
                        <span className="text-xs text-slate-400 hidden sm:block">|</span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600">Livraison :</span>
                          <span className="font-semibold text-blue-600">{FRAIS_LIVRAISON} FCFA</span>
                        </div>
                      </div>

                      {montant > 0 && (
                        <div className="flex justify-between items-center text-base font-bold border-t border-slate-200 pt-2 mt-2">
                          <span className="text-slate-700">Total</span>
                          <span className="text-green-600">{prixTotal.toLocaleString()} FCFA</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => ajouterCourse(s.titre, s.id)}
                      className="mt-3 w-full px-4 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors active:scale-[0.97]"
                    >
                      + Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {state.count > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/checkout")}
              className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg hover:bg-blue-600 shadow-lg active:scale-[0.98] transition-all"
            >
              🛒 Voir le panier ({state.count}) — {state.total.toLocaleString()} FCFA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}