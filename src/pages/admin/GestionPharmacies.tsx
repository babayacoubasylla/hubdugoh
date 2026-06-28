import { useState, useEffect } from "react";
import { apiPharmacies } from "@/api/contenu-vitrine";
import type { PharmacieGarde } from "@/types";
import { HiPlus, HiPencil, HiTrash, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function GestionPharmacies() {
    const [pharmacies, setPharmacies] = useState<PharmacieGarde[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        nom: "",
        adresse: "",
        telephone: "",
        date_debut: new Date().toISOString().split("T")[0],
        date_fin: new Date().toISOString().split("T")[0],
        actif: true
    });

    useEffect(() => {
        loadPharmacies();
    }, []);

    const loadPharmacies = async () => {
        try {
            setLoading(true);
            const data = await apiPharmacies.getAll();
            setPharmacies(data || []);
        } catch (error) {
            console.error("Erreur chargement pharmacies:", error);
            toast.error("Erreur lors du chargement des pharmacies");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await apiPharmacies.update(editingId, form);
                toast.success("✅ Pharmacie mise à jour");
            } else {
                await apiPharmacies.create(form);
                toast.success("✅ Pharmacie ajoutée");
            }
            resetForm();
            loadPharmacies();
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setLoading(false);
        }
    };

    const toggleActif = async (id: string, currentStatus: boolean) => {
        try {
            await apiPharmacies.update(id, { actif: !currentStatus });
            toast.success(`Pharmacie ${!currentStatus ? "activée" : "désactivée"}`);
            loadPharmacies();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const supprimerPharmacie = async (id: string) => {
        if (!confirm("Supprimer cette pharmacie de garde ?")) return;
        try {
            await apiPharmacies.delete(id);
            toast.success("🗑️ Pharmacie supprimée");
            loadPharmacies();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const editPharmacie = (p: PharmacieGarde) => {
        setEditingId(p.id);
        setForm({
            nom: p.nom,
            adresse: p.adresse,
            telephone: p.telephone,
            date_debut: p.date_debut,
            date_fin: p.date_fin,
            actif: p.actif
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({
            nom: "",
            adresse: "",
            telephone: "",
            date_debut: new Date().toISOString().split("T")[0],
            date_fin: new Date().toISOString().split("T")[0],
            actif: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading && pharmacies.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800">💊 Pharmacies de garde</h2>
                <button
                    onClick={() => (showForm ? resetForm() : setShowForm(true))}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                    <HiPlus className="text-lg" />
                    {showForm ? "Annuler" : "Ajouter une pharmacie"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-orange-100">
                    <h3 className="font-bold text-slate-800 mb-4">
                        {editingId ? "✏️ Modifier la pharmacie" : "➕ Ajouter une pharmacie"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Nom de la pharmacie *</label>
                            <input
                                value={form.nom}
                                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                placeholder="Pharmacie Centrale"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Adresse *</label>
                            <input
                                value={form.adresse}
                                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                placeholder="Avenue de la République, Gagnoa Centre"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone *</label>
                            <input
                                type="tel"
                                value={form.telephone}
                                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                placeholder="07 00 00 00 00"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Début de garde *</label>
                                <input
                                    type="date"
                                    value={form.date_debut}
                                    onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Fin de garde *</label>
                                <input
                                    type="date"
                                    value={form.date_fin}
                                    onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    required
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.actif}
                                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                                className="w-4 h-4 accent-orange-500"
                            />
                            Active (visible sur la page d'accueil)
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Enregistrement..." : editingId ? "💾 Mettre à jour" : "➕ Ajouter"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {pharmacies.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <div className="text-5xl mb-3">💊</div>
                        <p className="font-medium">Aucune pharmacie enregistrée</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {pharmacies.map((p) => (
                            <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-slate-800">{p.nom}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {p.actif ? "✅ Active" : "❌ Inactive"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{p.adresse}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            <span>📞 {p.telephone}</span>
                                            <span>
                                                📅 {new Date(p.date_debut).toLocaleDateString("fr-FR")} → {new Date(p.date_fin).toLocaleDateString("fr-FR")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleActif(p.id, p.actif)}
                                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                            title={p.actif ? "Désactiver" : "Activer"}
                                        >
                                            {p.actif ? <HiXCircle className="text-red-400 text-xl" /> : <HiCheckCircle className="text-green-400 text-xl" />}
                                        </button>
                                        <button onClick={() => editPharmacie(p)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Modifier">
                                            <HiPencil className="text-blue-400 text-xl" />
                                        </button>
                                        <button onClick={() => supprimerPharmacie(p.id)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Supprimer">
                                            <HiTrash className="text-red-400 text-xl" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}