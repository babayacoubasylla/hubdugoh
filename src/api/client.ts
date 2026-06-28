import { supabase, getErrorMessage } from '@/lib/supabase'
import type { Profil, Livreur, Commercant, Commande, Avis, Notification } from '@/types'

// ==========================================
// CLIENTS - GESTION DES UTILISATEURS
// ==========================================

export const apiClient = {
    // Récupérer un profil
    async getProfil(id: string) {
        const { data, error } = await supabase
            .from('profils')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new Error(getErrorMessage(error))
        return data as Profil
    },

    // Mettre à jour un profil
    async updateProfil(id: string, updates: Partial<Profil>) {
        const { data, error } = await supabase
            .from('profils')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(getErrorMessage(error))
        return data as Profil
    },

    // Récupérer tous les livreurs
    async getLivreurs() {
        const { data, error } = await supabase
            .from('livreurs')
            .select(`
        *,
        profil:profils(*)
      `)
            .order('note_moyenne', { ascending: false })

        if (error) throw new Error(getErrorMessage(error))
        return data as (Livreur & { profil: Profil })[]
    },

    // Récupérer un livreur
    async getLivreur(id: string) {
        const { data, error } = await supabase
            .from('livreurs')
            .select(`
        *,
        profil:profils(*)
      `)
            .eq('id', id)
            .single()

        if (error) throw new Error(getErrorMessage(error))
        return data as Livreur & { profil: Profil }
    },

    // Mettre à jour disponibilité livreur
    async updateDisponibilite(livreurId: string, disponible: boolean) {
        const { data, error } = await supabase
            .from('livreurs')
            .update({ disponible, updated_at: new Date().toISOString() })
            .eq('id', livreurId)
            .select()
            .single()

        if (error) throw new Error(getErrorMessage(error))
        return data as Livreur
    },

    // Récupérer tous les commerçants
    async getCommercants() {
        const { data, error } = await supabase
            .from('commercants')
            .select(`
        *,
        profil:profils(*)
      `)
            .order('note_moyenne', { ascending: false })

        if (error) throw new Error(getErrorMessage(error))
        return data as (Commercant & { profil: Profil })[]
    },

    // Récupérer un commerçant
    async getCommercant(id: string) {
        const { data, error } = await supabase
            .from('commercants')
            .select(`
        *,
        profil:profils(*),
        produits:produits(*)
      `)
            .eq('id', id)
            .single()

        if (error) throw new Error(getErrorMessage(error))
        return data as Commercant & { profil: Profil; produits: any[] }
    },

    // Récupérer les statistiques admin
    async getStatsAdmin() {
        // Commandes totales
        const { count: totalCommandes } = await supabase
            .from('commandes')
            .select('*', { count: 'exact', head: true })

        // Utilisateurs total
        const { count: totalUtilisateurs } = await supabase
            .from('profils')
            .select('*', { count: 'exact', head: true })

        // Livreurs total
        const { count: totalLivreurs } = await supabase
            .from('livreurs')
            .select('*', { count: 'exact', head: true })

        // Commerçants total
        const { count: totalCommercants } = await supabase
            .from('commercants')
            .select('*', { count: 'exact', head: true })

        // Commandes aujourd'hui
        const today = new Date().toISOString().split('T')[0]
        const { count: commandesAujourdhui } = await supabase
            .from('commandes')
            .select('*', { count: 'exact', head: true })
            .gte('date_commande', today)

        // Livreurs actifs
        const { count: livreursActifs } = await supabase
            .from('livreurs')
            .select('*', { count: 'exact', head: true })
            .eq('disponible', true)

        // Chiffre d'affaires total
        const { data: commandes } = await supabase
            .from('commandes')
            .select('total')
            .eq('statut', 'livree')

        const totalChiffreAffaires = commandes?.reduce((sum, c) => sum + c.total, 0) || 0

        // Commissions totales
        const { data: commissions } = await supabase
            .from('commissions')
            .select('montant')
            .eq('type', 'plateforme')

        const totalCommissions = commissions?.reduce((sum, c) => sum + c.montant, 0) || 0

        // Commandes par statut
        const { data: statsStatut } = await supabase
            .from('commandes')
            .select('statut, count')

        return {
            total_utilisateurs: totalUtilisateurs || 0,
            total_commandes: totalCommandes || 0,
            total_livreurs: totalLivreurs || 0,
            total_commercants: totalCommercants || 0,
            total_chiffre_affaires: totalChiffreAffaires,
            commissions_plateforme: totalCommissions,
            commandes_aujourdhui: commandesAujourdhui || 0,
            livreurs_actifs: livreursActifs || 0,
            commandes_par_statut: statsStatut?.reduce((acc, { statut, count }) => ({ ...acc, [statut]: count }), {}) || {}
        }
    }
}