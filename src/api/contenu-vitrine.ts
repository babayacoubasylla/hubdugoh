import { supabase, getErrorMessage } from '@/lib/supabase'
import type { PharmacieGarde, Promo, ActuVille } from '@/types'

// ==========================================
// API PHARMACIES DE GARDE
// ==========================================

export const apiPharmacies = {
    async getAll(): Promise<PharmacieGarde[]> {
        const { data, error } = await supabase
            .from('pharmacies_garde')
            .select('*')
            .eq('actif', true)
            .order('date_debut', { ascending: true })

        if (error) {
            console.error('Erreur chargement pharmacies:', error)
            throw new Error(getErrorMessage(error))
        }

        return data || []
    },

    async getActive(): Promise<PharmacieGarde | null> {
        const aujourdhui = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('pharmacies_garde')
            .select('*')
            .eq('actif', true)
            .lte('date_debut', aujourdhui)
            .gte('date_fin', aujourdhui)
            .order('date_debut', { ascending: false })
            .limit(1)

        if (error) {
            console.error('Erreur chargement pharmacie active:', error)
            return null
        }

        return data?.[0] || null
    },

    async getPharmacieDuJour(): Promise<PharmacieGarde | null> {
        return this.getActive()
    },

    async create(data: Omit<PharmacieGarde, 'id' | 'created_at' | 'updated_at'>): Promise<PharmacieGarde> {
        const { data: result, error } = await supabase
            .from('pharmacies_garde')
            .insert(data)
            .select()
            .single()

        if (error) {
            console.error('Erreur création pharmacie:', error)
            throw new Error(getErrorMessage(error))
        }

        return result
    },

    async update(id: string, data: Partial<PharmacieGarde>): Promise<PharmacieGarde> {
        const { data: result, error } = await supabase
            .from('pharmacies_garde')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erreur mise à jour pharmacie:', error)
            throw new Error(getErrorMessage(error))
        }

        return result
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('pharmacies_garde')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Erreur suppression pharmacie:', error)
            throw new Error(getErrorMessage(error))
        }
    },

    async toggleActif(id: string, actif: boolean): Promise<void> {
        const { error } = await supabase
            .from('pharmacies_garde')
            .update({ actif, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            console.error('Erreur basculement statut:', error)
            throw new Error(getErrorMessage(error))
        }
    }
}

// ==========================================
// API PROMOTIONS
// ==========================================

export const apiPromos = {
    async getAll(): Promise<Promo[]> {
        const { data, error } = await supabase
            .from('promos')
            .select(`
                *,
                commercant:commercants(
                    nom_commerce,
                    banniere_url
                )
            `)
            .eq('actif', true)
            .order('date_debut', { ascending: false })

        if (error) {
            console.error('Erreur chargement promos:', error)
            throw new Error(getErrorMessage(error))
        }

        return data || []
    },

    async getActive(): Promise<Promo[]> {
        const aujourdhui = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('promos')
            .select(`
                *,
                commercant:commercants(
                    nom_commerce,
                    banniere_url
                )
            `)
            .eq('actif', true)
            .lte('date_debut', aujourdhui)
            .or(`date_fin.is.null,date_fin.gte.${aujourdhui}`)
            .order('date_debut', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Erreur chargement promos actives:', error)
            return []
        }

        return data || []
    },

    async create(data: Omit<Promo, 'id' | 'created_at' | 'updated_at' | 'commercant'>): Promise<Promo> {
        const { data: result, error } = await supabase
            .from('promos')
            .insert(data)
            .select()
            .single()

        if (error) {
            console.error('Erreur création promo:', error)
            throw new Error(getErrorMessage(error))
        }

        return result
    },

    async update(id: string, data: Partial<Promo>): Promise<Promo> {
        const { data: result, error } = await supabase
            .from('promos')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erreur mise à jour promo:', error)
            throw new Error(getErrorMessage(error))
        }

        return result
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('promos')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Erreur suppression promo:', error)
            throw new Error(getErrorMessage(error))
        }
    }
}

// ==========================================
// API ACTUS DE LA VILLE
// ==========================================

export const apiActus = {
    async getAll(): Promise<ActuVille[]> {
        const { data, error } = await supabase
            .from('actus_ville')
            .select('*')
            .eq('actif', true)
            .order('date_publication', { ascending: false })

        if (error) {
            console.error('Erreur chargement actus:', error)
            throw new Error(getErrorMessage(error))
        }

        return data || []
    },

    async getActive(): Promise<ActuVille[]> {
        const { data, error } = await supabase
            .from('actus_ville')
            .select('*')
            .eq('actif', true)
            .order('date_publication', { ascending: false })
            .limit(6)

        if (error) {
            console.error('Erreur chargement actus actives:', error)
            return []
        }

        return data || []
    },

    async getRecentes(limit: number = 6): Promise<ActuVille[]> {
        const { data, error } = await supabase
            .from('actus_ville')
            .select('*')
            .eq('actif', true)
            .order('date_publication', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Erreur chargement actus récentes:', error)
            return []
        }

        return data || []
    },

    async create(data: Omit<ActuVille, 'id' | 'created_at' | 'updated_at'>): Promise<ActuVille> {
        const { data: result, error } = await supabase
            .from('actus_ville')
            .insert(data)
            .select()
            .single()

        if (error) {
            console.error('Erreur création actu:', error)
            throw new Error(getErrorMessage(error))
        }

        return result
    },

    async update(id: string, data: Partial<ActuVille>): Promise<ActuVille> {
        const { data: result, error } = await supabase
            .from('actus_ville')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erreur mise à jour actu:', error)
            throw new Error(getErrorMessage(error))
        }

        return result
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('actus_ville')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Erreur suppression actu:', error)
            throw new Error(getErrorMessage(error))
        }
    }
}