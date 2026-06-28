import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Icônes personnalisées
const clientIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})

const livreurIcon = new L.Icon({
    iconUrl: '/icons/livreur-marker.png', // Créez cette image
    iconSize: [32, 32],
    iconAnchor: [16, 32]
})

interface LiveMapProps {
    clientPosition: { lat: number; lng: number }
    livreurPosition: { lat: number; lng: number }
    commandeId: string
}

export default function LiveMap({ clientPosition, livreurPosition, commandeId }: LiveMapProps) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simuler le chargement
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    if (isLoading) {
        return (
            <div className="h-96 bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-slate-500">Chargement de la carte...</div>
            </div>
        )
    }

    return (
        <div className="rounded-xl overflow-hidden shadow-lg h-96">
            <MapContainer
                center={[clientPosition.lat, clientPosition.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Position du client */}
                <Marker position={[clientPosition.lat, clientPosition.lng]} icon={clientIcon}>
                    <Popup>📍 Vous êtes ici</Popup>
                </Marker>

                {/* Position du livreur */}
                <Marker position={[livreurPosition.lat, livreurPosition.lng]} icon={livreurIcon}>
                    <Popup>🛵 Livreur en route</Popup>
                </Marker>

                {/* Ligne de trajet */}
                <Polyline
                    positions={[
                        [livreurPosition.lat, livreurPosition.lng],
                        [clientPosition.lat, clientPosition.lng]
                    ]}
                    color="#ea580c"
                    weight={4}
                    dashArray="5, 5"
                />
            </MapContainer>
        </div>
    )
}