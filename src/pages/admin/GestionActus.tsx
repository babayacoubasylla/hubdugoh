import { useState, useEffect } from "react";
import { apiActus } from "@/api/contenu-vitrine";
import type { ActuVille } from "@/types";
import ImageUploader from "@/components/shared/ImageUploader";
import { HiPlus, HiPencil, HiTrash, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function GestionActus() {
    const [actus, setActus] = useState<ActuVille[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        titre: "",
        contenu: "",
        image_url: "",
        date_publication: new Date().toISOString().split("T")[0],
        actif: true
    });

    useEffect(() => {
        loadActus();
    }, []);

    const loadActus = async () => {
        try {
            setLoading(true);
            const data = await apiActus.getAll();
            setActus(data || []);
        } catch (error) {
            console.error("Erreur chargement actus:", error);
            toast.error("Erreur lors du chargement des actualités");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUploaded = (url: string) => {
        setForm((prev) => ({ ...prev, image_url: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const actuData = {
                titre: form.titre,
                contenu: form.contenu,
                image_url: form.image_url || null,
                date_publication: form.date_publication,
                actif: form.actif
            };

            if (editingId) {
                await apiActus.update(editingId, actuData as any);
                toast.success("✅ Actualité mise à jour");
            } else {
                await apiActus.create(actuData as any);
                toast.success("✅ Actualité publiée");
            }
            resetForm();
            loadActus();
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setLoading(false);
        }
    };

    const toggleActif = async (id: string, currentStatus: boolean) => {
        try {
            await apiActus.update(id, { actif: !currentStatus });
            toast.success(`Actualité ${!currentStatus ? "publiée" : "masquée"}`);
            loadActus();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const supprimerActu = async (id: string) => {
        if (!confirm("Supprimer cette actualité ?")) return;
        try {
            await apiActus.delete(id);
            toast.success("🗑️ Actualité supprimée");
            loadActus();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const editActu = (a: ActuVille) => {
        setEditingId(a.id);
        setForm({
            titre: a.titre,
            contenu: a.contenu,
            image_url: a.image_url || "",
            date_publication: a.date_publication,
            actif: a.actif
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({
            titre: "",
            contenu: "",
            image_url: "",
            date_publication: new Date().toISOString().split("T")[0],
            actif: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading && actus.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800">📰 Actualités de la ville</h2>
                <button
                    onClick={() => (showForm ? resetForm() : setShowForm(true))}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <HiPlus className="text-lg" />
                    {showForm ? "Annuler" : "Publier une actualité"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-blue-100">
                    <h3 className="font-bold text-slate-800 mb-4">
                        {editingId ? "✏️ Modifier l'actualité" : "➕ Publier une actualité"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Titre *</label>
                            <input
                                value={form.titre}
                                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                placeholder="Ex: Travaux sur l'avenue principale"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Contenu *</label>
                            <textarea
                                value={form.contenu}
                                onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                                rows={4}
                                placeholder="Détails de l'actualité"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Image (optionnel)</label>
                            <ImageUploader
                                currentImage={form.image_url}
                                onImageUploaded={handleImageUploaded}
                                bucket="produits"
                                folder="actus"
                                label="Cliquez pour ajouter une image"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Date de publication *</label>
                            <input
                                type="date"
                                value={form.date_publication}
                                onChange={(e) => setForm({ ...form, date_publication: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.actif}
                                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                                className="w-4 h-4 accent-blue-500"
                            />
                            Publiée (visible sur la page d'accueil)
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Enregistrement..." : editingId ? "💾 Mettre à jour" : "➕ Publier"}
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
                {actus.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <div className="text-5xl mb-3">📰</div>
                        <p className="font-medium">Aucune actualité publiée</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {actus.map((a) => (
                            <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                        {a.image_url ? (
                                            <img src={a.image_url} alt={a.titre} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl text-slate-300">📰</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-slate-800">{a.titre}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {a.actif ? "✅ Publiée" : "❌ Masquée"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{a.contenu}</p>
                                        <span className="text-xs text-slate-400">
                                            📅 {new Date(a.date_publication).toLocaleDateString("fr-FR")}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleActif(a.id, a.actif)}
                                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                            title={a.actif ? "Masquer" : "Publier"}
                                        >
                                            {a.actif ? <HiXCircle className="text-red-400 text-xl" /> : <HiCheckCircle className="text-green-400 text-xl" />}
                                        </button>
                                        <button onClick={() => editActu(a)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Modifier">
                                            <HiPencil className="text-blue-400 text-xl" />
                                        </button>
                                        <button onClick={() => supprimerActu(a.id)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Supprimer">
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