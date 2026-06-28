import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { HiStar, HiMapPin, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface Livreur {
  id: string;
  profil_id: string;
  moto: string;
  zone_couverture: string[];
  disponible: boolean;
  note_moyenne: number;
  missions_realisees: number;
  // Informations du profil
  nom: string;
  telephone: string;
  photo_url: string | null;
}

export default function Livreurs() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLivreurs();
  }, []);

  const loadLivreurs = async () => {
    try {
      setLoading(true);

      // 1. Récupérer les livreurs
      const { data: livreursData, error: livreursError } = await supabase
        .from('livreurs')
        .select('*')
        .order('note_moyenne', { ascending: false });

      if (livreursError) throw livreursError;

      if (!livreursData || livreursData.length === 0) {
        setLivreurs([]);
        setLoading(false);
        return;
      }

      // 2. Récupérer les profils
      const profilIds = livreursData.map(l => l.profil_id).filter(Boolean);

      let profilsData: any[] = [];
      if (profilIds.length > 0) {
        const { data, error } = await supabase
          .from('profils')
          .select('id, nom, telephone, photo_url')
          .in('id', profilIds);

        if (!error && data) {
          profilsData = data;
        }
      }

      // 3. Fusionner les données
      const mergedData = livreursData.map((livreur) => {
        const profil = profilsData.find(p => p.id === livreur.profil_id);
        return {
          ...livreur,
          nom: profil?.nom || 'Livreur',
          telephone: profil?.telephone || '',
          photo_url: profil?.photo_url || null
        };
      });

      setLivreurs(mergedData);
    } catch (error) {
      console.error('Erreur chargement livreurs:', error);
      toast.error('Erreur lors du chargement des livreurs');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: livreurs.length,
    disponibles: livreurs.filter(l => l.disponible).length,
    verifies: livreurs.filter(l => l.photo_url || l.missions_realisees > 0).length,
    noteMoyenne: livreurs.length > 0
      ? (livreurs.reduce((acc, l) => acc + (l.note_moyenne || 0), 0) / livreurs.length).toFixed(1)
      : '0'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">🛵 Livreurs</h1>
          <p className="text-white/80 text-sm mt-1">Notre réseau de livreurs à Gagnoa</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.total}</p>
            <p className="text-xs text-slate-500">Livreurs</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.disponibles}</p>
            <p className="text-xs text-slate-500">Disponibles</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.verifies}</p>
            <p className="text-xs text-slate-500">Vérifiés</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">⭐ {stats.noteMoyenne}</p>
            <p className="text-xs text-slate-500">Note moy.</p>
          </div>
        </div>

        {livreurs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-slate-400">
            <div className="text-5xl mb-3">🛵</div>
            <p className="font-medium">Aucun livreur inscrit pour le moment</p>
            <p className="text-sm mt-1">Soyez le premier à rejoindre notre réseau !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {livreurs.map((l) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                    {l.photo_url ? (
                      <img src={l.photo_url} alt={l.nom} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      '🛵'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{l.nom || 'Livreur'}</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-0.5 text-yellow-500">
                        <HiStar className="text-xs" /> {l.note_moyenne || 0}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{l.missions_realisees || 0} missions</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  {l.disponible ? (
                    <span className="flex items-center gap-1 text-green-600"><HiCheckCircle /> Disponible</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600"><HiXCircle /> Indisponible</span>
                  )}
                </div>

                <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                  <HiMapPin className="text-green-500" />
                  <span>{l.zone_couverture?.join(', ') || 'Gagnoa Centre'}</span>
                </div>

                <div className="mt-3 text-xs text-slate-400">
                  <span>{l.moto}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}