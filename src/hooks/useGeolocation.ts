import { useState, useEffect } from 'react'

interface Coordinates {
    lat: number
    lng: number
}

export function useGeolocation() {
    const [position, setPosition] = useState<Coordinates | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('La géolocalisation n\'est pas supportée par votre navigateur')
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                })
                setLoading(false)
            },
            (err) => {
                setError('Impossible d\'obtenir votre position. Vérifiez vos paramètres de localisation.')
                setLoading(false)
                console.error('Erreur géolocalisation:', err)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        )
    }, [])

    return { position, error, loading }
}