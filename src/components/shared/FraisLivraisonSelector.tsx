import { useState } from 'react'
import { HiTruck, HiClock, HiInformationCircle } from 'react-icons/hi2'

interface FraisLivraisonSelectorProps {
    onChange: (type: 'standard' | 'express' | 'group', frais: number) => void
    defaultType?: 'standard' | 'express' | 'group'
    className?: string
}

export default function FraisLivraisonSelector({
    onChange,
    defaultType = 'standard',
    className = ''
}: FraisLivraisonSelectorProps) {
    const [selectedType, setSelectedType] = useState<'standard' | 'express' | 'group'>(defaultType)

    const options = [
        {
            type: 'standard' as const,
            label: '📦 Standard',
            prix: '500 FCFA',
            description: 'Livraison standard',
            delai: '30-45 min'
        },
        {
            type: 'express' as const,
            label: '⚡ Express',
            prix: '1000 FCFA',
            description: 'Livraison prioritaire',
            delai: '15-25 min'
        },
        {
            type: 'group' as const,
            label: '🔄 Groupée',
            prix: '700 FCFA',
            description: '2+ commerces ou colis',
            delai: '45-60 min'
        }
    ]

    const handleSelect = (type: 'standard' | 'express' | 'group') => {
        setSelectedType(type)
        const prix = type === 'standard' ? 500 : type === 'express' ? 1000 : 700
        onChange(type, prix)
    }

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                🛵 Type de livraison
            </label>

            <div className="grid grid-cols-3 gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.type}
                        onClick={() => handleSelect(opt.type)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${selectedType === opt.type
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-slate-200 hover:border-orange-300'
                            }`}
                    >
                        <div className="text-xl">{opt.label.split(' ')[0]}</div>
                        <p className="text-xs font-semibold text-slate-800">{opt.label.split(' ')[1]}</p>
                        <p className="text-lg font-bold text-orange-500">{opt.prix}</p>
                        <p className="text-xs text-slate-400">{opt.delai}</p>
                    </button>
                ))}
            </div>

            <div className="mt-2 flex items-start gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">
                <HiInformationCircle className="text-slate-300 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-medium text-slate-600">📍 Tarifs motos à Gagnoa</p>
                    <p>500 FCFA pour une livraison standard, 1000 FCFA pour une livraison express.</p>
                </div>
            </div>
        </div>
    )
}