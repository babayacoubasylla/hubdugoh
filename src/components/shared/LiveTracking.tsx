import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Icônes personnalisées
const clientIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})

const livreurIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iI2VhNTgwYyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxNiIgeT0iMjAiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjZmZmIj7wn5C1PC90ZXh0Pjwvc3ZnPg==',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

interface LiveTrackingProps {
    clientPosition: { lat: number; lng: number }
    livreurId: string | null
    commandeId: string
    isActive: boolean
}

export default function LiveTracking({
    clientPosition,
    livreurId,
    commandeId,
    isActive
}: LiveTrackingProps) {
    const [livreurPosition, setLivreurPosition] = useState(clientPosition)
    const [distance, setDistance] = useState<number | null>(null)

    useEffect(() => {
        if (!livreurId || !isActive) return

        // Écouter les changements de position du livreur
        const channel = supabase
            .channel(`livreur:${livreurId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'livreurs',
                    filter: `id=eq.${livreurId}`
                },
                (payload) => {
                    if (payload.new.coordonnees) {
                        setLivreurPosition(payload.new.coordonnees)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [livreurId, isActive])

    // Calculer la distance
    useEffect(() => {
        if (livreurPosition && clientPosition) {
            const d = calculateDistance(
                clientPosition.lat, clientPosition.lng,
                livreurPosition.lat, livreurPosition.lng
            )
            setDistance(d)
        }
    }, [livreurPosition, clientPosition])

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371 // km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    const center = isActive && livreurPosition
        ? [
            (clientPosition.lat + livreurPosition.lat) / 2,
            (clientPosition.lng + livreurPosition.lng) / 2
        ]
        : [clientPosition.lat, clientPosition.lng]

    return (
        <div className="space-y-3">
            {/* Carte */}
            <div className="rounded-xl overflow-hidden shadow-lg h-96">
                <MapContainer
                    center={center as [number, number]}
                    zoom={isActive ? 14 : 15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Client */}
                    <Marker position={[clientPosition.lat, clientPosition.lng]} icon={clientIcon}>
                        <Popup>📍 <strong>Vous êtes ici</strong></Popup>
                    </Marker>

                    {/* Livreur (si actif) */}
                    {isActive && livreurPosition && (
                        <>
                            <Marker position={[livreurPosition.lat, livreurPosition.lng]} icon={livreurIcon}>
                                <Popup>🛵 <strong>Livreur en route</strong></Popup>
                            </Marker>

                            {/* Trajet */}
                            <Polyline
                                positions={[
                                    [livreurPosition.lat, livreurPosition.lng],
                                    [clientPosition.lat, clientPosition.lng]
                                ]}
                                color="#ea580c"
                                weight={4}
                                dashArray="8, 6"
                                opacity={0.8}
                            />
                        </>
                    )}
                </MapContainer>
            </div>

            {/* Informations */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-sm font-medium text-slate-700">
                        {isActive ? '🟢 Livreur en route' : '⏳ En attente de livreur'}
                    </span>
                </div>
                {distance !== null && isActive && (
                    <span className="text-sm font-bold text-orange-500">
                        {distance.toFixed(1)} km
                    </span>
                )}
            </div>
        </div>
    )
}