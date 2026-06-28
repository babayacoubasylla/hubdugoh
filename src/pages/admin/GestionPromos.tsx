import { useState, useEffect } from "react";
import { apiPromos } from "@/api/contenu-vitrine";
import { apiProduits } from "@/api/produits";
import { supabase } from "@/lib/supabase";
import type { Promo } from "@/types";
import ImageUploader from "@/components/shared/ImageUploader";
import { HiPlus, HiPencil, HiTrash, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import toast from "react-hot-toast";

interface CommerceOption {
    id: string;
    nom_commerce: string;
}

export default function GestionPromos() {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [commerces, setCommerces] = useState<CommerceOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        titre: "",
        description: "",
        image_url: "",
        commercant_id: "",
        lien_externe: "",
        date_debut: new Date().toISOString().split("T")[0],
        date_fin: "",
        actif: true
    });

    useEffect(() => {
        loadPromos();
        loadCommerces();
    }, []);

    const loadPromos = async () => {
        try {
            setLoading(true);
            const data = await apiPromos.getAll();
            setPromos(data || []);
        } catch (error) {
            console.error("Erreur chargement promos:", error);
            toast.error("Erreur lors du chargement des promos");
        } finally {
            setLoading(false);
        }
    };

    const loadCommerces = async () => {
        try {
            const { data, error } = await supabase
                .from("commercants")
                .select("id, nom_commerce")
                .order("nom_commerce", { ascending: true });
            if (error) throw error;
            setCommerces(data || []);
        } catch (error) {
            console.error("Erreur chargement commerces:", error);
        }
    };

    const handleImageUploaded = (url: string) => {
        setForm((prev) => ({ ...prev, image_url: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const promoData = {
                titre: form.titre,
                description: form.description || null,
                image_url: form.image_url || null,
                commercant_id: form.commercant_id || null,
                lien_externe: form.lien_externe || null,
                date_debut: form.date_debut,
                date_fin: form.date_fin || null,
                actif: form.actif
            };

            if (editingId) {
                await apiPromos.update(editingId, promoData as any);
                toast.success("✅ Promo mise à jour");
            } else {
                await apiPromos.create(promoData as any);
                toast.success("✅ Promo ajoutée");
            }
            resetForm();
            loadPromos();
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setLoading(false);
        }
    };

    const toggleActif = async (id: string, currentStatus: boolean) => {
        try {
            await apiPromos.update(id, { actif: !currentStatus });
            toast.success(`Promo ${!currentStatus ? "activée" : "désactivée"}`);
            loadPromos();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const supprimerPromo = async (id: string) => {
        if (!confirm("Supprimer cette promo ?")) return;
        try {
            await apiPromos.delete(id);
            toast.success("🗑️ Promo supprimée");
            loadPromos();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const editPromo = (p: Promo) => {
        setEditingId(p.id);
        setForm({
            titre: p.titre,
            description: p.description || "",
            image_url: p.image_url || "",
            commercant_id: p.commercant_id || "",
            lien_externe: p.lien_externe || "",
            date_debut: p.date_debut,
            date_fin: p.date_fin || "",
            actif: p.actif
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({
            titre: "",
            description: "",
            image_url: "",
            commercant_id: "",
            lien_externe: "",
            date_debut: new Date().toISOString().split("T")[0],
            date_fin: "",
            actif: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading && promos.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800">🎁 Promotions</h2>
                <button
                    onClick={() => (showForm ? resetForm() : setShowForm(true))}
                    className="px-4 py-2 bg-pink-500 text-white rounded-xl font-semibold text-sm hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                    <HiPlus className="text-lg" />
                    {showForm ? "Annuler" : "Ajouter une promo"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-pink-100">
                    <h3 className="font-bold text-slate-800 mb-4">
                        {editingId ? "✏️ Modifier la promo" : "➕ Ajouter une promo"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Titre *</label>
                            <input
                                value={form.titre}
                                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                placeholder="Ex: -20% sur tous les plats ce weekend"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
                                rows={2}
                                placeholder="Détails de la promotion"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Image de la promo</label>
                            <ImageUploader
                                currentImage={form.image_url}
                                onImageUploaded={handleImageUploaded}
                                bucket="produits"
                                folder="promos"
                                label="Cliquez pour ajouter une image"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Commerce lié (optionnel)
                            </label>
                            <select
                                value={form.commercant_id}
                                onChange={(e) => setForm({ ...form, commercant_id: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                            >
                                <option value="">— Aucun commerce —</option>
                                {commerces.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nom_commerce}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Lien externe (optionnel, si pas de commerce lié)
                            </label>
                            <input
                                type="url"
                                value={form.lien_externe}
                                onChange={(e) => setForm({ ...form, lien_externe: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Date de début *</label>
                                <input
                                    type="date"
                                    value={form.date_debut}
                                    onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Date de fin (optionnel)</label>
                                <input
                                    type="date"
                                    value={form.date_fin}
                                    onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.actif}
                                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                                className="w-4 h-4 accent-pink-500"
                            />
                            Active (visible sur la page d'accueil)
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-pink-500 text-white rounded-xl font-semibold text-sm hover:bg-pink-600 transition-colors disabled:opacity-50"
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
                {promos.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <div className="text-5xl mb-3">🎁</div>
                        <p className="font-medium">Aucune promo enregistrée</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {promos.map((p) => (
                            <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.titre} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl text-slate-300">🎁</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-slate-800">{p.titre}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {p.actif ? "✅ Active" : "❌ Inactive"}
                                            </span>
                                        </div>
                                        {p.description && <p className="text-sm text-slate-500 mt-1">{p.description}</p>}
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            {p.commercant?.nom_commerce && <span>🏪 {p.commercant.nom_commerce}</span>}
                                            <span>
                                                📅 {new Date(p.date_debut).toLocaleDateString("fr-FR")}
                                                {p.date_fin && ` → ${new Date(p.date_fin).toLocaleDateString("fr-FR")}`}
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
                                        <button onClick={() => editPromo(p)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Modifier">
                                            <HiPencil className="text-blue-400 text-xl" />
                                        </button>
                                        <button onClick={() => supprimerPromo(p.id)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Supprimer">
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