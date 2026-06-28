import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const FRAIS_BASE = 500;

interface Course {
  id: string;
  titre: string;
  description: string;
  prix: number;
  icon: string;
  actif: boolean;
}

interface Supplement {
  id: string;
  nom: string;
  description: string;
  prix: number;
  type: string;
  actif: boolean;
}

interface CourseOption {
  poids: number;
  description: string;
  prixAchats: number;
  supplementIds: string[];
}

export default function Courses() {
  const { addToCart, state } = useCart();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<Record<string, CourseOption>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('actif', true)
        .order('created_at', { ascending: true });

      if (coursesError) throw coursesError;

      // Charger les suppléments
      const { data: suppData, error: suppError } = await supabase
        .from('supplements_course')
        .select('*')
        .eq('actif', true);

      if (suppError) throw suppError;

      // Si pas de données, utiliser les valeurs par défaut
      const defaultCourses = [
        { id: 'c1', titre: 'Récupérer un colis à la gare', description: 'Un livreur récupère votre colis à la gare UTB et vous le livre.', prix: 0, icon: '📦', actif: true },
        { id: 'c2', titre: 'Achat au marché', description: 'Décrivez ce que vous voulez, un livreur l\'achète pour vous au marché central.', prix: 0, icon: '🛒', actif: true },
        { id: 'c3', titre: 'Livraison de documents', description: 'Faites livrer des documents importants en toute sécurité.', prix: 0, icon: '📄', actif: true },
        { id: 'c4', titre: 'Course en pharmacie', description: 'Un livreur va chercher vos médicaments et vous les apporte.', prix: 0, icon: '💊', actif: true },
        { id: 'c5', titre: 'Remise de clés', description: 'Faites remettre des clés ou petits objets à un proche.', prix: 0, icon: '🔑', actif: true },
        { id: 'c6', titre: 'Achat en boulangerie', description: 'Faites-vous livrer du pain frais et viennoiseries.', prix: 0, icon: '🍞', actif: true }
      ];

      setCourses(coursesData && coursesData.length > 0 ? coursesData : defaultCourses);
      setSupplements(suppData || []);

      // Initialiser les options
      const initialOptions: Record<string, CourseOption> = {};
      (coursesData && coursesData.length > 0 ? coursesData : defaultCourses).forEach((c: Course) => {
        initialOptions[c.id] = {
          poids: 1,
          description: '',
          prixAchats: 0,
          supplementIds: []
        };
      });
      setOptions(initialOptions);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Calculer le prix total
  const calculerPrixTotal = (course: Course, option: CourseOption): number => {
    let prixCourse = FRAIS_BASE;

    // Ajouter le prix des suppléments sélectionnés
    const suppsPrix = option.supplementIds.reduce((total, suppId) => {
      const supp = supplements.find(s => s.id === suppId);
      return total + (supp?.prix || 0);
    }, 0);

    prixCourse += suppsPrix;

    return prixCourse;
  };

  // Ajouter au panier
  const ajouterCourse = (course: Course) => {
    const option = options[course.id] || {
      poids: 1,
      description: '',
      prixAchats: 0,
      supplementIds: []
    };

    const prixTotal = calculerPrixTotal(course, option);

    let descriptionDetail = course.titre;
    if (option.description) {
      descriptionDetail += ` - ${option.description}`;
    }
    if (option.poids > 0) {
      descriptionDetail += ` (${option.poids}kg)`;
    }

    // Ajouter les suppléments à la description
    const suppsNoms = option.supplementIds
      .map(id => supplements.find(s => s.id === id)?.nom)
      .filter(Boolean)
      .join(', ');

    if (suppsNoms) {
      descriptionDetail += ` [${suppsNoms}]`;
    }

    addToCart({
      nom: descriptionDetail,
      prix: prixTotal,
      quantite: 1,
      type: 'course',
      description: descriptionDetail
    });

    toast.success(`✅ ${course.titre} ajoutée (${prixTotal.toLocaleString()} FCFA)`);
  };

  const updateOption = (courseId: string, field: keyof CourseOption, value: any) => {
    setOptions(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: value
      }
    }));
  };

  const toggleSupplement = (courseId: string, suppId: string) => {
    setOptions(prev => {
      const current = prev[courseId] || { poids: 1, description: '', prixAchats: 0, supplementIds: [] };
      const newSuppIds = current.supplementIds.includes(suppId)
        ? current.supplementIds.filter(id => id !== suppId)
        : [...current.supplementIds, suppId];

      return {
        ...prev,
        [courseId]: {
          ...current,
          supplementIds: newSuppIds
        }
      };
    });
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
      {/* En-tête */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">🚚 Courses & Services</h1>
          <p className="text-white/80 text-sm mt-1">Choisissez une course et personnalisez-la</p>
          <p className="text-white/60 text-xs mt-1">🛵 Base {FRAIS_BASE} FCFA + suppléments</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => {
            const option = options[course.id] || {
              poids: 1,
              description: '',
              prixAchats: 0,
              supplementIds: []
            };
            const prixTotal = calculerPrixTotal(course, option);

            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{course.icon || '📦'}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm">{course.titre}</h3>
                    <p className="text-xs text-slate-500 mt-1">{course.description}</p>

                    <div className="mt-3 space-y-2">
                      {/* Description */}
                      <div>
                        <input
                          type="text"
                          placeholder="Ajoutez une description (optionnel)"
                          value={option.description}
                          onChange={(e) => updateOption(course.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                        />
                      </div>

                      {/* Poids pour colis */}
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-slate-500 font-medium">Poids (kg):</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={option.poids}
                          onChange={(e) => updateOption(course.id, 'poids', parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                        />
                        <span className="text-xs text-slate-400">
                          +{Math.round(option.poids * 100).toLocaleString()} FCFA
                        </span>
                      </div>

                      {/* Suppléments */}
                      <div className="mt-2">
                        <label className="text-xs text-slate-500 font-medium block mb-1">Suppléments:</label>
                        <div className="flex flex-wrap gap-2">
                          {supplements.map((supp) => (
                            <button
                              key={supp.id}
                              onClick={() => toggleSupplement(course.id, supp.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${option.supplementIds.includes(supp.id)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                              {supp.nom} {supp.prix > 0 ? `+${supp.prix}` : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Prix total */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="font-bold text-blue-600 text-lg">
                          {prixTotal.toLocaleString()} FCFA
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          dont {FRAIS_BASE} FCFA base
                        </span>
                      </div>
                      <button
                        onClick={() => ajouterCourse(course)}
                        className="px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors active:scale-[0.97]"
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panier */}
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