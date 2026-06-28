import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProfilCommercant() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    nom: user?.nom || "",
    telephone: user?.telephone || "",
    adresse: user?.adresse || "",
    quartier: user?.quartier || "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(form);
    toast.success("✅ Profil mis à jour !");
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">👤 Mon profil</h2>
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">🏪</div>
          <div>
            <h3 className="font-bold text-lg">{user?.boutique || user?.nom}</h3>
            <p className="text-sm text-slate-500">{user?.telephone}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${user?.verifie ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {user?.verifie ? "✅ Vérifié" : "⏳ En attente"}
            </span>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400" placeholder="Nom" />
          <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400" placeholder="Téléphone" />
          <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400" placeholder="Adresse" />
          <select value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-purple-400">
            <option value="">Quartier</option>
            <option>Sokoura</option><option>Commerce</option><option>Résidentiel</option><option>Garçons</option><option>Lakota</option>
          </select>
          <button type="submit" className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 active:scale-[0.98]">💾 Enregistrer</button>
        </form>
      </div>
    </div>
  );
}
