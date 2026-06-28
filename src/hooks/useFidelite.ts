import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Points {
    total: number
    utilisés: number
    disponibles: number
    historique: {
        id: string
        type: 'gagne' | 'utilise'
        points: number
        description: string
        date: string
    }[]
}

export function useFidelite(userId: string | null) {
    const [points, setPoints] = useState<Points>({
        total: 0,
        utilisés: 0,
        disponibles: 0,
        historique: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (userId) {
            loadPoints()
        }
    }, [userId])

    const loadPoints = async () => {
        if (!userId) return

        // Récupérer les points
        const { data: pointsData } = await supabase
            .from('points_fidelite')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (pointsData) {
            setPoints({
                total: pointsData.total || 0,
                utilisés: pointsData.utilises || 0,
                disponibles: (pointsData.total || 0) - (pointsData.utilises || 0),
                historique: pointsData.historique || []
            })
        }

        setLoading(false)
    }

    const ajouterPoints = async (commandeId: string, montant: number) => {
        if (!userId) return

        // 1 point = 1000 FCFA
        const pointsGagnes = Math.floor(montant / 1000)
        if (pointsGagnes === 0) return

        const { data: current } = await supabase
            .from('points_fidelite')
            .select('*')
            .eq('user_id', userId)
            .single()

        const nouveauTotal = (current?.total || 0) + pointsGagnes
        const historique = [
            ...(current?.historique || []),
            {
                type: 'gagne',
                points: pointsGagnes,
                description: `Commande #${commandeId}`,
                date: new Date().toISOString()
            }
        ]

        await supabase
            .from('points_fidelite')
            .upsert({
                user_id: userId,
                total: nouveauTotal,
                utilises: current?.utilises || 0,
                historique
            })

        await loadPoints()
        return pointsGagnes
    }

    const utiliserPoints = async (pointsUtilises: number) => {
        if (!userId) return

        const { data: current } = await supabase
            .from('points_fidelite')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (!current || current.total - current.utilises < pointsUtilises) {
            throw new Error('Points insuffisants')
        }

        const historique = [
            ...(current.historique || []),
            {
                type: 'utilise',
                points: pointsUtilises,
                description: 'Réduction sur commande',
                date: new Date().toISOString()
            }
        ]

        await supabase
            .from('points_fidelite')
            .upsert({
                user_id: userId,
                total: current.total,
                utilises: (current.utilises || 0) + pointsUtilises,
                historique
            })

        await loadPoints()
        return pointsUtilises * 100 // 1 point = 100 FCFA de réduction
    }

    return { points, loading, ajouterPoints, utiliserPoints }
}