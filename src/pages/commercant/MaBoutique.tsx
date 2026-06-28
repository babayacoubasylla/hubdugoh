import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/shared/ImageUploader";
import { HiPlus, HiPencil, HiTrash, HiCheckCircle, HiXCircle, HiCamera } from "react-icons/hi2";
import toast from "react-hot-toast";

interface Produit {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  categorie: string | null;
  image_url: string | null;
  disponible: boolean;
  est_recommande: boolean;
  created_at: string;
}

export default function MaBoutique() {
  const { user, commercant } = useAuth();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [banniereUrl, setBanniereUrl] = useState<string>("");
  const [photoProfilUrl, setPhotoProfilUrl] = useState<string>("");
  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    categorie: "",
    image_url: "",
    disponible: true,
    est_recommande: false
  });

  useEffect(() => {
    if (commercant) {
      loadProduits();
      loadCommerceInfo();
    }
  }, [commercant]);

  const loadProduits = async () => {
    if (!commercant) return;

    try {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('commercant_id', commercant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProduits(data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const loadCommerceInfo = async () => {
    if (!commercant) return;

    try {
      const { data, error } = await supabase
        .from('commercants')
        .select('banniere_url, photo_profil_url')
        .eq('id', commercant.id)
        .single();

      if (error) throw error;
      if (data) {
        setBanniereUrl(data.banniere_url || "");
        setPhotoProfilUrl(data.photo_profil_url || "");
      }
    } catch (error) {
      console.error('Erreur chargement infos:', error);
    }
  };

  // ✅ VERSION AVEC LOGS DE DEBUG AUTH + FIX toast.warning -> toast.error
  const updateBanniere = async (url: string) => {
    console.log("========== [updateBanniere] DÉBUT ==========");
    console.log("📌 URL reçue:", url);
    console.log("📌 Commercant:", commercant);

    if (!commercant) {
      console.error("❌ [updateBanniere] Aucun commerçant trouvé !");
      toast.error("Erreur: Aucun commerçant trouvé");
      return;
    }

    if (!url) {
      console.error("❌ [updateBanniere] URL vide !");
      toast.error("Erreur: URL de l'image vide");
      return;
    }

    try {
      console.log("🔄 [updateBanniere] Tentative de mise à jour...");
      console.log("📌 ID commerçant:", commercant.id);

      // 🔑 DEBUG : vérifier la correspondance auth.uid() <-> profil_id (RLS)
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log("🔑 auth.uid():", authData?.user?.id, authError);
      console.log("🔑 commercant.profil_id:", commercant.profil_id);
      console.log("🔑 Correspondance ?", authData?.user?.id === commercant.profil_id);

      const { data, error } = await supabase
        .from('commercants')
        .update({ banniere_url: url })
        .eq('id', commercant.id)
        .select();

      if (error) {
        console.error("❌ [updateBanniere] Erreur Supabase:", error);
        console.error("❌ Détails:", error.message, error.code);
        toast.error("Erreur: " + error.message);
        return;
      }

      console.log("✅ [updateBanniere] Réponse Supabase:", data);

      if (data && data.length > 0) {
        console.log("✅ [updateBanniere] Mise à jour réussie !");
        setBanniereUrl(url);
        toast.success('✅ Bannière mise à jour avec succès');
      } else {
        console.warn("⚠️ [updateBanniere] Aucune ligne mise à jour");
        toast.error("La bannière n'a pas été enregistrée");
      }
    } catch (error) {
      console.error("❌ [updateBanniere] Erreur générale:", error);
      toast.error('Erreur lors de la mise à jour');
    }
    console.log("========== [updateBanniere] FIN ==========");
  };

  // ✅ VERSION AVEC LOGS DE DEBUG AUTH
  const updatePhotoProfil = async (url: string) => {
    console.log("========== [updatePhotoProfil] DÉBUT ==========");
    console.log("📌 URL reçue:", url);

    if (!commercant) {
      console.error("❌ [updatePhotoProfil] Aucun commerçant !");
      toast.error("Erreur: Aucun commerçant trouvé");
      return;
    }

    if (!url) {
      console.error("❌ [updatePhotoProfil] URL vide !");
      toast.error("Erreur: URL de l'image vide");
      return;
    }

    try {
      console.log("🔄 [updatePhotoProfil] Tentative de mise à jour...");

      // 🔑 DEBUG : vérifier la correspondance auth.uid() <-> profil_id (RLS)
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log("🔑 auth.uid():", authData?.user?.id, authError);
      console.log("🔑 commercant.profil_id:", commercant.profil_id);
      console.log("🔑 Correspondance ?", authData?.user?.id === commercant.profil_id);

      const { data, error } = await supabase
        .from('commercants')
        .update({ photo_profil_url: url })
        .eq('id', commercant.id)
        .select();

      if (error) {
        console.error("❌ [updatePhotoProfil] Erreur Supabase:", error);
        toast.error("Erreur: " + error.message);
        return;
      }

      console.log("✅ [updatePhotoProfil] Réponse:", data);

      if (data && data.length > 0) {
        setPhotoProfilUrl(url);
        toast.success('✅ Photo de profil mise à jour');
      } else {
        console.warn("⚠️ [updatePhotoProfil] Aucune ligne mise à jour");
        toast.error("La photo de profil n'a pas été enregistrée");
      }
    } catch (error) {
      console.error("❌ [updatePhotoProfil] Erreur:", error);
      toast.error('Erreur lors de la mise à jour');
    }
    console.log("========== [updatePhotoProfil] FIN ==========");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commercant) return;
    setLoading(true);

    console.log("========== [handleSubmit] DÉBUT ==========");
    console.log("📌 editingId:", editingId);
    console.log("📌 form complet:", form);
    console.log("📌 form.image_url:", form.image_url);

    try {
      const produitData = {
        commercant_id: commercant.id,
        nom: form.nom,
        description: form.description || null,
        prix: parseInt(form.prix),
        categorie: form.categorie || null,
        image_url: form.image_url || null,
        disponible: form.disponible,
        est_recommande: form.est_recommande
      };

      console.log("📌 produitData à envoyer:", produitData);

      if (editingId) {
        const { data, error } = await supabase
          .from('produits')
          .update({
            ...produitData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .select();

        console.log("✅ [handleSubmit] Réponse UPDATE Supabase:", data, error);

        if (error) throw error;

        if (!data || data.length === 0) {
          console.warn("⚠️ [handleSubmit] Aucune ligne mise à jour (UPDATE)");
          toast.error("Le produit n'a pas été mis à jour");
          return;
        }

        toast.success('✅ Produit mis à jour avec succès');
      } else {
        const { data, error } = await supabase
          .from('produits')
          .insert(produitData)
          .select();

        console.log("✅ [handleSubmit] Réponse INSERT Supabase:", data, error);

        if (error) throw error;
        toast.success('✅ Produit ajouté avec succès');
      }

      resetForm();
      loadProduits();
    } catch (error) {
      console.error('❌ [handleSubmit] Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
      console.log("========== [handleSubmit] FIN ==========");
    }
  };

  const handleImageUploaded = (url: string) => {
    console.log("📌 [handleImageUploaded] URL reçue:", url);
    console.log("📌 [handleImageUploaded] form AVANT:", form);
    setForm((prev) => {
      const updated = { ...prev, image_url: url };
      console.log("📌 [handleImageUploaded] form APRÈS (sera appliqué au prochain rendu):", updated);
      return updated;
    });
  };

  const toggleDisponible = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('produits')
        .update({ disponible: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Produit ${!currentStatus ? 'disponible' : 'indisponible'}`);
      loadProduits();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const supprimerProduit = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const produit = produits.find(p => p.id === id);
      if (produit?.image_url) {
        const urlParts = produit.image_url.split('/');
        const bucketIndex = urlParts.indexOf('produits');
        if (bucketIndex !== -1) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/');
          await supabase.storage.from('produits').remove([filePath]);
        }
      }

      const { error } = await supabase
        .from('produits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('🗑️ Produit supprimé');
      loadProduits();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const editProduit = (produit: Produit) => {
    setEditingId(produit.id);
    setForm({
      nom: produit.nom,
      description: produit.description || "",
      prix: produit.prix.toString(),
      categorie: produit.categorie || "",
      image_url: produit.image_url || "",
      disponible: produit.disponible,
      est_recommande: produit.est_recommande
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      nom: "",
      description: "",
      prix: "",
      categorie: "",
      image_url: "",
      disponible: true,
      est_recommande: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading && produits.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Bannière */}
      <div className="relative mb-6 rounded-2xl overflow-hidden bg-slate-100 h-48 sm:h-64">
        {banniereUrl ? (
          <img
            src={banniereUrl}
            alt="Bannière du commerce"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("❌ Erreur chargement bannière:", banniereUrl);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-500">
            <div className="text-center text-white">
              <span className="text-6xl block mb-2">🪄</span>
              <p className="font-bold text-xl">Ajoutez une bannière</p>
              <p className="text-sm opacity-80">Mettez en valeur votre boutique</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4">
          <ImageUploader
            currentImage={banniereUrl}
            onImageUploaded={updateBanniere}
            bucket="produits"
            folder={`bannieres/${commercant?.id}`}
            label="Modifier la bannière"
            className="inline-block"
          />
        </div>

        {/* Photo de profil */}
        <div className="absolute -bottom-8 left-4 sm:left-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              {photoProfilUrl ? (
                <img
                  src={photoProfilUrl}
                  alt="Photo du commerce"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("❌ Erreur chargement photo profil:", photoProfilUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-3xl">
                  🏪
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <ImageUploader
                currentImage={photoProfilUrl}
                onImageUploaded={updatePhotoProfil}
                bucket="produits"
                folder={`profils/${commercant?.id}`}
                label=""
                className="inline-block"
              >
                <button className="p-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors">
                  <HiCamera className="text-sm" />
                </button>
              </ImageUploader>
            </div>
          </div>
        </div>
      </div>

      <div className="h-10 sm:h-12" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">🪄 Ma boutique</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <HiPlus className="text-lg" />
            {showForm ? 'Annuler' : 'Ajouter un produit'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-purple-100">
          <h3 className="font-bold text-slate-800 mb-4">
            {editingId ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom du produit *</label>
                <input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Nom du produit"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prix (FCFA) *</label>
                <input
                  type="number"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="1000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
                placeholder="Description du produit"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Catégorie</label>
                <input
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Ex: Vêtements, Nourriture"
                />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.disponible}
                    onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                    className="w-4 h-4 accent-purple-500"
                  />
                  Disponible
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.est_recommande}
                    onChange={(e) => setForm({ ...form, est_recommande: e.target.checked })}
                    className="w-4 h-4 accent-purple-500"
                  />
                  Recommandé
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Image du produit</label>
              <ImageUploader
                currentImage={form.image_url}
                onImageUploaded={handleImageUploaded}
                bucket="produits"
                folder={commercant?.id || ''}
                label="Cliquez pour ajouter une image"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-500 text-white rounded-xl font-semibold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : editingId ? '💾 Mettre à jour' : '➕ Ajouter'}
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
        {produits.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-medium">Aucun produit</p>
            <p className="text-sm mt-1">Ajoutez votre premier produit en cliquant sur "Ajouter un produit"</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {produits.map((p) => (
              <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.nom}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("❌ Erreur chargement image produit:", p.image_url);
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '📷';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-slate-300">📷</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{p.nom}</span>
                      {p.est_recommande && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⭐ Recommandé</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.disponible ? '✅ Disponible' : '❌ Indisponible'}
                      </span>
                    </div>
                    {p.description && <p className="text-sm text-slate-500 mt-1">{p.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="font-bold text-purple-600">{p.prix.toLocaleString()} FCFA</span>
                      {p.categorie && <span className="text-slate-400 text-xs">{p.categorie}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleDisponible(p.id, p.disponible)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title={p.disponible ? 'Rendre indisponible' : 'Rendre disponible'}>
                      {p.disponible ? <HiXCircle className="text-red-400 text-xl" /> : <HiCheckCircle className="text-green-400 text-xl" />}
                    </button>
                    <button onClick={() => editProduit(p)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Modifier">
                      <HiPencil className="text-blue-400 text-xl" />
                    </button>
                    <button onClick={() => supprimerProduit(p.id)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Supprimer">
                      <HiTrash className="text-red-400 text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {produits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{produits.length}</p>
            <p className="text-xs text-slate-500">Total produits</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{produits.filter(p => p.disponible).length}</p>
            <p className="text-xs text-slate-500">Disponibles</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{produits.filter(p => p.est_recommande).length}</p>
            <p className="text-xs text-slate-500">Recommandés</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{produits.filter(p => !p.disponible).length}</p>
            <p className="text-xs text-slate-500">Rupture</p>
          </div>
        </div>
      )}
    </div>
  );
}