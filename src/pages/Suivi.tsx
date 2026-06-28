import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { HiCheckCircle, HiClock, HiTruck, HiArrowLeft } from 'react-icons/hi2'

interface Etape {
  nom: string
  complete: boolean
  horodatage?: string
}

interface Commande {
  id: string
  reference: string
  statut: string
  total: number
  client_nom: string
  client_telephone: string
  client_adresse: string
  commerce_nom: string
  commerce_adresse: string
  livreur_nom: string | null
  livreur_id: string | null
  date_commande: string
  etapes: Etape[]
}

export default function Suivi() {
  const { id } = useParams<{ id: string }>()
  const [commande, setCommande] = useState<Commande | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchId, setSearchId] = useState('')

  useEffect(() => {
    if (id) {
      loadCommande(id)
    } else {
      setLoading(false)
    }
  }, [id])

  const loadCommande = async (commandeId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('commandes')
        .select(`
          *,
          commercant:commercants(nom_commerce, image_url),
          livreur:livreurs(profil:profils(nom, telephone))
        `)
        .eq('id', commandeId)
        .single()

      if (error) throw error

      if (data) {
        setCommande({
          ...data,
          livreur_nom: data.livreur?.profil?.nom || null,
          livreur_id: data.livreur_id
        })
      } else {
        setError('Commande non trouvée')
      }
    } catch (err) {
      console.error('Erreur chargement commande:', err)
      setError('Impossible de charger la commande. Vérifiez l\'ID.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchId.trim()) {
      loadCommande(searchId.trim())
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'en_attente': 'bg-yellow-100 text-yellow-700',
      'acceptee': 'bg-blue-100 text-blue-700',
      'preparation': 'bg-purple-100 text-purple-700',
      'recuperation': 'bg-indigo-100 text-indigo-700',
      'en_cours': 'bg-orange-100 text-orange-700',
      'livree': 'bg-green-100 text-green-700',
      'annulee': 'bg-red-100 text-red-700'
    }
    return colors[statut] || 'bg-slate-100 text-slate-700'
  }

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'en_attente': '⏳ En attente',
      'acceptee': '✅ Acceptée',
      'preparation': '👨‍🍳 En préparation',
      'recuperation': '📦 Récupération',
      'en_cours': '🚚 En cours de livraison',
      'livree': '🎉 Livrée !',
      'annulee': '❌ Annulée'
    }
    return labels[statut] || statut
  }

  const getEtapeIcon = (nom: string, complete: boolean) => {
    if (complete) return <HiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
    if (nom.toLowerCase().includes('livreur') || nom.toLowerCase().includes('récup'))
      return <HiTruck className="text-orange-500 text-xl flex-shrink-0" />
    return <HiClock className="text-slate-400 text-xl flex-shrink-0" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Chargement de la commande...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">
              <HiArrowLeft className="text-2xl" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">📍 Suivi de commande</h1>
              <p className="text-white/80 text-sm">Suivez votre livraison en temps réel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Barre de recherche */}
        {!id && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Entrez l'ID de la commande"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
              >
                🔍 Suivre
              </button>
            </form>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600">{error}</p>
            <Link to="/" className="text-orange-500 text-sm hover:underline">
              Retourner à l'accueil
            </Link>
          </div>
        )}

        {/* Détails de la commande */}
        {commande && (
          <div className="space-y-6">
            {/* En-tête commande */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Commande #{commande.reference}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {new Date(commande.date_commande).toLocaleString('fr-FR')}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatutColor(commande.statut)}`}>
                  {getStatutLabel(commande.statut)}
                </span>
              </div>
            </div>

            {/* Informations */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">📋 Détails</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="font-semibold">{commande.client_nom}</p>
                  <p className="text-sm text-slate-500">{commande.client_telephone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Adresse de livraison</p>
                  <p className="font-semibold">{commande.client_adresse}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Commerce</p>
                  <p className="font-semibold">{commande.commerce_nom}</p>
                  <p className="text-sm text-slate-500">{commande.commerce_adresse}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Livreur</p>
                  <p className="font-semibold">{commande.livreur_nom || 'En attente d\'assignation'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Montant total</p>
                  <p className="font-bold text-orange-500 text-lg">
                    {commande.total.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>

            {/* Étapes */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">📍 Progression</h3>
              <div className="space-y-0">
                {commande.etapes && commande.etapes.length > 0 ? (
                  commande.etapes.map((etape, index) => (
                    <div key={index} className="flex items-start gap-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        {getEtapeIcon(etape.nom, etape.complete)}
                        {index < commande.etapes.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 ${etape.complete ? 'bg-green-500' : 'bg-slate-200'
                            }`} />
                        )}
                      </div>
                      <div className={`flex-1 pb-4 ${!etape.complete ? 'opacity-50' : ''}`}>
                        <p className={`font-medium ${etape.complete ? 'text-slate-800' : 'text-slate-400'}`}>
                          {etape.nom}
                        </p>
                        {etape.horodatage && (
                          <p className="text-xs text-slate-400">{etape.horodatage}</p>
                        )}
                        {!etape.complete && index === commande.etapes.findIndex(e => !e.complete) && (
                          <span className="inline-block mt-1 text-xs text-orange-600 animate-pulse">
                            ● En cours...
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">Aucune étape enregistrée</p>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Link
                to="/"
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold text-center hover:bg-orange-600 transition-colors"
              >
                🍴 Nouvelle commande
              </Link>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                🖨️ Imprimer
              </button>
            </div>
          </div>
        )}

        {/* Si pas de commande et pas d'ID */}
        {!id && !commande && !error && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-slate-800">Rechercher une commande</h2>
            <p className="text-slate-500 text-sm mt-2">
              Entrez l'ID de votre commande ci-dessus pour suivre sa progression
            </p>
          </div>
        )}
      </div>
    </div>
  )
}