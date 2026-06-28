import { supabase, getErrorMessage } from '@/lib/supabase'
import type { Produit } from '@/types'

export const apiProduits = {
    // Récupérer les produits d'un commerçant
    async getCommercantProduits(commercantId: string) {
        const { data, error } = await supabase
            .from('produits')
            .select('*')
            .eq('commercant_id', commercantId)
            .order('est_recommande', { ascending: false })

        if (error) throw new Error(getErrorMessage(error))
        return data as Produit[]
    },

    // Créer un produit
    async create(produit: Omit<Produit, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('produits')
            .insert(produit)
            .select()
            .single()

        if (error) throw new Error(getErrorMessage(error))
        return data as Produit
    },

    // Mettre à jour un produit
    async update(id: string, updates: Partial<Produit>) {
        const { data, error } = await supabase
            .from('produits')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(getErrorMessage(error))
        return data as Produit
    },

    // Supprimer un produit
    async delete(id: string) {
        const { error } = await supabase
            .from('produits')
            .delete()
            .eq('id', id)

        if (error) throw new Error(getErrorMessage(error))
        return { success: true }
    },

    // Rechercher des produits
    async search(query: string) {
        const { data, error } = await supabase
            .from('produits')
            .select(`
                *,
                commercant:commercants(
                    id,
                    nom_commerce, 
                    image_url,
                    banniere_url,
                    photo_profil_url,
                    description,
                    quartier,
                    note_moyenne,
                    frais_livraison,
                    delai_livraison
                )
            `)
            .ilike('nom', `%${query}%`)
            .limit(20)

        if (error) throw new Error(getErrorMessage(error))
        return data
    },

    // ✅ Récupérer tous les restaurants
    async getRestaurants() {
        console.log("🔄 Chargement des restaurants...");
        const { data, error } = await supabase
            .from('commercants')
            .select(`
                id,
                nom_commerce,
                description,
                image_url,
                banniere_url,
                photo_profil_url,
                note_moyenne,
                quartier,
                adresse,
                ouvert,
                horaires,
                frais_livraison,
                delai_livraison,
                type_commerce,
                produits:produits(*)
            `)
            .eq('type_commerce', 'restaurant')
            .eq('ouvert', true)
            .order('note_moyenne', { ascending: false })

        if (error) {
            console.error('❌ Erreur getRestaurants:', error)
            throw new Error(getErrorMessage(error))
        }
        console.log("✅ Restaurants chargés:", data?.length || 0);
        return data || []
    },

    // ✅ Récupérer toutes les boutiques
    async getBoutiques() {
        console.log("🔄 Chargement des boutiques...");
        const { data, error } = await supabase
            .from('commercants')
            .select(`
                id,
                nom_commerce,
                description,
                image_url,
                banniere_url,
                photo_profil_url,
                note_moyenne,
                quartier,
                adresse,
                ouvert,
                frais_livraison,
                type_commerce,
                produits:produits(*)
            `)
            .eq('type_commerce', 'boutique')
            .eq('ouvert', true)
            .order('note_moyenne', { ascending: false })

        if (error) {
            console.error('❌ Erreur getBoutiques:', error)
            throw new Error(getErrorMessage(error))
        }
        console.log("✅ Boutiques chargées:", data?.length || 0);
        return data || []
    },

    // Récupérer un commerçant spécifique
    async getCommercant(id: string) {
        const { data, error } = await supabase
            .from('commercants')
            .select(`
                *,
                produits:produits(*)
            `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('❌ Erreur getCommercant:', error)
            throw new Error(getErrorMessage(error))
        }
        return data
    },

    // Récupérer les commerçants par type
    async getByType(type: 'restaurant' | 'boutique') {
        const { data, error } = await supabase
            .from('commercants')
            .select(`
                *,
                produits:produits(*)
            `)
            .eq('type_commerce', type)
            .eq('ouvert', true)
            .order('note_moyenne', { ascending: false })

        if (error) {
            console.error(`❌ Erreur getByType(${type}):`, error)
            throw new Error(getErrorMessage(error))
        }
        return data || []
    },

    // Récupérer les produits recommandés
    async getRecommandes(limit: number = 10) {
        const { data, error } = await supabase
            .from('produits')
            .select(`
                *,
                commercant:commercants(
                    id,
                    nom_commerce,
                    image_url,
                    banniere_url,
                    photo_profil_url,
                    description,
                    quartier,
                    note_moyenne,
                    frais_livraison
                )
            `)
            .eq('disponible', true)
            .eq('est_recommande', true)
            .limit(limit)

        if (error) {
            console.error('❌ Erreur getRecommandes:', error)
            throw new Error(getErrorMessage(error))
        }
        return data || []
    }
}