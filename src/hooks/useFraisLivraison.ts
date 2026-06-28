import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface FraisLivraison {
    standard: number
    express: number
    group: number
    type: 'standard' | 'express' | 'group'
}

export function useFraisLivraison() {
    const [frais, setFrais] = useState<FraisLivraison>({
        standard: 500,
        express: 1000,
        group: 700,
        type: 'standard'
    })
    const [loading, setLoading] = useState(false)

    const getFraisLivraison = (type: 'standard' | 'express' | 'group' = 'standard'): number => {
        const tarifs = {
            standard: 500,
            express: 1000,
            group: 700
        }
        return tarifs[type] || 500
    }

    const getFraisAvecDistance = (distance?: number): number => {
        // À Gagnoa, tarif unique de 500 FCFA
        return 500
    }

    return {
        frais,
        loading,
        getFraisLivraison,
        getFraisAvecDistance,
        tarifStandard: 500,
        tarifExpress: 1000
    }
}