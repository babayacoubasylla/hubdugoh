import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { HiUser, HiTruck, HiMapPin, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ProfilLivreur() {
  const { user, livreur, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [disponible, setDisponible] = useState(livreur?.disponible || true);
  const [form, setForm] = useState({
    moto: livreur?.moto || "",
    plaque: livreur?.plaque || "",
    zone: livreur?.zone_couverture?.join(", ") || "",
  });

  const toggleDisponibilite = async () => {
    if (!livreur) return;
    setLoading(true);

    try {
      const newStatus = !disponible;
      const { error } = await supabase
        .from('livreurs')
        .update({ disponible: newStatus })
        .eq('id', livreur.id);

      if (error) throw error;

      setDisponible(newStatus);
      toast.success(newStatus ? '🟢 Vous êtes maintenant disponible' : '🔴 Vous êtes maintenant indisponible');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!livreur) return;
    setLoading(true);

    try {
      const zones = form.zone.split(",").map(z => z.trim()).filter(z => z);
      const { error } = await supabase
        .from('livreurs')
        .update({
          moto: form.moto,
          plaque: form.plaque || null,
          zone_couverture: zones.length > 0 ? zones : ['Gagnoa Centre'],
          updated_at: new Date().toISOString()
        })
        .eq('id', livreur.id);

      if (error) throw error;

      toast.success("✅ Profil mis à jour avec succès !");
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!livreur) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <p className="text-slate-500">Informations du livreur non disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">👤 Mon profil livreur</h2>

      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 max-w-2xl">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
            {user?.photo_url ? (
              <img src={user.photo_url} alt={user.nom} className="w-full h-full rounded-full object-cover" />
            ) : (
              <HiUser className="text-blue-500 text-3xl" />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-slate-800">{user?.nom}</h3>
            <p className="text-sm text-slate-500">{user?.telephone}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {disponible ? '🟢 Disponible' : '🔴 Indisponible'}
              </span>
              <span className="text-xs text-slate-400">
                {livreur.missions_realisees || 0} missions réalisées
              </span>
            </div>
          </div>
          <button
            onClick={toggleDisponibilite}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${disponible
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:opacity-50`}
          >
            {loading ? 'Chargement...' : disponible ? 'Se rendre indisponible' : 'Devenir disponible'}
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">{livreur.missions_realisees || 0}</p>
            <p className="text-xs text-slate-500">Missions</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">{livreur.note_moyenne || 0}⭐</p>
            <p className="text-xs text-slate-500">Note moyenne</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-orange-600">{livreur.zone_couverture?.length || 1}</p>
            <p className="text-xs text-slate-500">Zones</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-600">{livreur.moto || '—'}</p>
            <p className="text-xs text-slate-500">Moto</p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSave} className="space-y-4 border-t border-slate-100 pt-6">
          <h4 className="font-semibold text-slate-800">✏️ Modifier mes informations</h4>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Moto</label>
            <input
              value={form.moto}
              onChange={(e) => setForm({ ...form, moto: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Modèle de moto (ex: Yamaha Jog 125)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Plaque d'immatriculation</label>
            <input
              value={form.plaque}
              onChange={(e) => setForm({ ...form, plaque: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Plaque (ex: CI-1234-AB)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Zone de couverture</label>
            <input
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Séparez par des virgules (ex: Gagnoa Centre, Sokoura)"
            />
            <p className="text-xs text-slate-400 mt-1">Séparez les zones par des virgules</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
}