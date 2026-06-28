import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Coordinates {
    lat: number
    lng: number
    accuracy?: number
}

export function useRealtimeLocation(livreurId: string) {
    const [position, setPosition] = useState<Coordinates | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [watchId, setWatchId] = useState<number | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported')
            setLoading(false)
            return
        }

        // Démarrer le suivi
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                }
                setPosition(coords)
                setLoading(false)

                // Mettre à jour dans Supabase
                updateLivreurPosition(livreurId, coords)
            },
            (err) => {
                setError(err.message)
                setLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )

        setWatchId(id)

        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [livreurId])

    const updateLivreurPosition = async (id: string, coords: Coordinates) => {
        await supabase
            .from('livreurs')
            .update({
                coordonnees: coords,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
    }

    return { position, error, loading }
}