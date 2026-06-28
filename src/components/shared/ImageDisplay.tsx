import { useState } from 'react'

interface ImageDisplayProps {
    src: string | null | undefined
    alt: string
    className?: string
    fallbackIcon?: string
    fallbackColor?: string
}

export default function ImageDisplay({
    src,
    alt,
    className = "w-full h-full object-cover",
    fallbackIcon = "📦",
    fallbackColor = "bg-gradient-to-br from-slate-200 to-slate-300"
}: ImageDisplayProps) {
    const [error, setError] = useState(false)

    // Si pas d'image ou erreur, afficher le fallback
    if (!src || error) {
        return (
            <div className={`flex items-center justify-center ${fallbackColor} ${className}`}>
                <span className="text-4xl">{fallbackIcon}</span>
            </div>
        )
    }

    // Vérifier si l'URL est valide
    const isValidUrl = src.startsWith('http') || src.startsWith('/')

    if (!isValidUrl) {
        return (
            <div className={`flex items-center justify-center ${fallbackColor} ${className}`}>
                <span className="text-4xl">{fallbackIcon}</span>
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            loading="lazy"
        />
    )
}