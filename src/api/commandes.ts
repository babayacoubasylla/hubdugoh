import { supabase, getErrorMessage } from '@/lib/supabase'
import type { Commande, CommandeForm, StatsLivreur, StatsCommercant } from '@/types'

export const apiCommandes = {
    // Créer une commande
    async create(data: CommandeForm & { client_id: string }) {
        // Générer une référence unique
        const reference = `CMD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        // Calculer les totaux
        const sous_total = data.produits.reduce((sum, p) => sum + p.total, 0)
        const frais_livraison = 500 // À configurer
        const commission = Math.round((sous_total + frais_livraison) * 0.05) // 5%
        const total = sous_total + frais_livraison + commission

        // Récupérer les infos du commerce
        const { data: commercant } = await supabase
            .from('commercants')
            .select('nom_commerce, adresse')
            .eq('id', data.commerce_id)
            .single()

        const commande: Partial<Commande> = {
            reference,
            client_id: data.client_id,
            commercant_id: data.commerce_id,
            type: data.type,
            statut: 'en_attente',

            client_nom: data.client_nom,
            client_telephone: data.client_telephone,
            client_adresse: data.client_adresse,
            client_quartier: data.client_quartier,

            commerce_nom: commercant?.nom_commerce || '',
            commerce_adresse: commercant?.adresse || '',

            produits: data.produits,
            sous_total,
            frais_livraison,
            commission_plateforme: commission,
            total,

            mode_paiement: data.mode_paiement || 'especes',
            paiement_effectue: false,

            etapes: [
                { nom: 'Commande confirmée', complete: true, horodatage: new Date().toLocaleTimeString() },
                { nom: 'En préparation', complete: false },
                { nom: 'Récupération par le livreur', complete: false },
                { nom: 'En cours de livraison', complete: false },
                { nom: 'Livrée', complete: false }
            ],

            date_commande: new Date().toISOString()
        }

        const { data: result, error } = await supabase
            .from('commandes')
            .insert(commande)
            .select()
            .single()

        if (error) throw new Error(getErrorMessage(error))

        // Créer une mission associée
        await supabase
            .from('missions')
            .insert({
                commande_id: result.id,
                statut: 'disponible'
            })

        // Créer une notification pour le commerçant
        await supabase
            .from('notifications')
            .insert({
                user_id: data.client_id, // À remplacer par le commerçant
                titre: 'Nouvelle commande',
                message: `Commande ${reference} reçue`,
                type: 'commande'
            })

        return result as Commande
    },

    // Récupérer les commandes d'un client
    async getClientCommandes(clientId: string) {
        const { data, error } = await supabase
            .from('commandes')
            .select(`
        *,
        commercant:commercants(nom_commerce, image_url),
        livreur:livreurs(profil:profils(nom))
      `)
            .eq('client_id', clientId)
            .order('date_commande', { ascending: false })

        if (error) throw new Error(getErrorMessage(error))
        return data as Commande[]
    },

    // Récupérer les commandes d'un commerçant
    async getCommercantCommandes(commercantId: string) {
        const { data, error } = await supabase
            .from('commandes')
            .select(`
        *,
        livreur:livreurs(profil:profils(nom, telephone))
      `)
            .eq('commercant_id', commercantId)
            .order('date_commande', { ascending: false })

        if (error) throw new Error(getErrorMessage(error))
        return data as Commande[]
    },

    // Récupérer les missions d'un livreur
    async getLivreurMissions(livreurId: string) {
        const { data, error } = await supabase
            .from('missions')
            .select(`
        *,
        commande:commandes(*)
      `)
            .eq('livreur_id', livreurId)
            .order('created_at', { ascending: false })

        if (error) throw new Error(getErrorMessage(error))
        return data
    },

    // Accepter une mission
    async accepterMission(missionId: string, livreurId: string) {
        const { data, error } = await supabase
            .from('missions')
            .update({
                livreur_id: livreurId,
                statut: 'acceptee',
                date_acceptation: new Date().toISOString()
            })
            .eq('id', missionId)
            .select()
            .single()

        if (error) throw new Error(getErrorMessage(error))

        // Mettre à jour la commande
        await supabase
            .from('commandes')
            .update({
                livreur_id: livreurId,
                statut: 'acceptee'
            })
            .eq('id', data.commande_id)

        return data
    },

    // Mettre à jour le statut d'une commande
    async updateStatut(commandeId: string, statut: string) {
        const { data, error } = await supabase
            .from('commandes')
            .update({ statut, updated_at: new Date().toISOString() })
            .eq('id', commandeId)
            .select()
            .single()

        if (error) throw new Error(getErrorMessage(error))

        // Si commande livrée
        if (statut === 'livree') {
            await supabase
                .from('commandes')
                .update({
                    date_livraison: new Date().toISOString(),
                    paiement_effectue: true
                })
                .eq('id', commandeId)

            // Mettre à jour les stats du livreur
            const { data: commande } = await supabase
                .from('commandes')
                .select('livreur_id, total')
                .eq('id', commandeId)
                .single()

            if (commande?.livreur_id) {
                // Incrémenter missions du livreur
                await supabase.rpc('incrementer_missions_livreur', {
                    p_livreur_id: commande.livreur_id
                })

                // Créer la commission du livreur (80% du total)
                const gainLivreur = Math.round(commande.total * 0.8)
                await supabase
                    .from('commissions')
                    .insert({
                        commande_id: commandeId,
                        montant: gainLivreur,
                        pourcentage: 80,
                        type: 'livreur'
                    })
            }
        }

        return data as Commande
    },

    // Statistiques livreur
    async getStatsLivreur(livreurId: string): Promise<StatsLivreur> {
        const missions = await this.getLivreurMissions(livreurId)

        const missionsTotal = missions?.length || 0
        const missionsTerminees = missions?.filter(m => m.statut === 'terminee') || []

        const maintenant = new Date()
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
        const missionsMois = missions?.filter(m =>
            new Date(m.created_at) >= debutMois
        ) || []

        const gainsTotal = missionsTerminees.reduce((sum, m) => sum + (m.gain_livreur || 0), 0)
        const gainsMois = missionsMois.filter(m => m.statut === 'terminee')
            .reduce((sum, m) => sum + (m.gain_livreur || 0), 0)

        // Note moyenne
        const { data: avis } = await supabase
            .from('avis')
            .select('note')
            .eq('livreur_id', livreurId)

        const noteMoyenne = avis?.length
            ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
            : 0

        return {
            missions_total: missionsTotal,
            missions_mois: missionsMois.length,
            gains_total: gainsTotal,
            gains_mois: gainsMois,
            note_moyenne: Math.round(noteMoyenne * 10) / 10,
            temps_moyen_livraison: 35, // À calculer
            missions_par_statut: missions?.reduce((acc, m) => ({
                ...acc,
                [m.statut]: (acc[m.statut] || 0) + 1
            }), {} as Record<string, number>) || {}
        }
    },

    // Statistiques commerçant
    async getStatsCommercant(commercantId: string): Promise<StatsCommercant> {
        const commandes = await this.getCommercantCommandes(commercantId)

        const maintenant = new Date()
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)

        const commandesTotal = commandes?.length || 0
        const commandesMois = commandes?.filter(c =>
            new Date(c.date_commande) >= debutMois
        ) || []

        const commandesLivrees = commandes?.filter(c => c.statut === 'livree') || []
        const revenusTotal = commandesLivrees.reduce((sum, c) => sum + c.total, 0)
        const revenusMois = commandesMois.filter(c => c.statut === 'livree')
            .reduce((sum, c) => sum + c.total, 0)

        // Produits populaires
        const produitsPopulaires: Record<string, { nom: string; quantite: number }> = {}
        commandesLivrees.forEach(c => {
            c.produits?.forEach(p => {
                if (!produitsPopulaires[p.id]) {
                    produitsPopulaires[p.id] = { nom: p.nom, quantite: 0 }
                }
                produitsPopulaires[p.id].quantite += p.quantite
            })
        })

        return {
            commandes_total: commandesTotal,
            commandes_mois: commandesMois.length,
            revenus_total: revenusTotal,
            revenus_mois: revenusMois,
            note_moyenne: 4.2, // À calculer
            produits_populaires: Object.values(produitsPopulaires)
                .sort((a, b) => b.quantite - a.quantite)
                .slice(0, 5),
            commandes_par_statut: commandes?.reduce((acc, c) => ({
                ...acc,
                [c.statut]: (acc[c.statut] || 0) + 1
            }), {} as Record<string, number>) || {}
        }
    },

    // Ajouter un avis
    async ajouterAvis(commandeId: string, data: { note: number; commentaire?: string }) {
        // Récupérer la commande
        const { data: commande } = await supabase
            .from('commandes')
            .select('client_id, livreur_id, commercant_id')
            .eq('id', commandeId)
            .single()

        if (!commande) throw new Error('Commande non trouvée')

        const avis = {
            commande_id: commandeId,
            client_id: commande.client_id,
            livreur_id: commande.livreur_id,
            commercant_id: commande.commercant_id,
            note: data.note,
            commentaire: data.commentaire || null
        }

        const { error } = await supabase
            .from('avis')
            .insert(avis)

        if (error) throw new Error(getErrorMessage(error))

        // Mettre à jour la note du livreur
        if (commande.livreur_id) {
            const { data: avisLivreur } = await supabase
                .from('avis')
                .select('note')
                .eq('livreur_id', commande.livreur_id)

            const moyenne = avisLivreur?.reduce((sum, a) => sum + a.note, 0) / (avisLivreur?.length || 1)

            await supabase
                .from('livreurs')
                .update({ note_moyenne: Math.round(moyenne * 10) / 10 })
                .eq('id', commande.livreur_id)
        }

        return { success: true }
    }
}