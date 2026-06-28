import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { HiClock, HiCheckCircle, HiXCircle, HiArrowRight } from 'react-icons/hi2'

interface Commande {
  id: string
  reference: string
  statut: string
  total: number
  commerce_nom: string
  date_commande: string
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    en_cours: 0,
    livrees: 0
  })

  useEffect(() => {
    if (user) {
      loadCommandes()
    }
  }, [user])

  const loadCommandes = async () => {
    if (!user) return

    const { data } = await supabase
      .from('commandes')
      .select('*')
      .eq('client_id', user.id)
      .order('date_commande', { ascending: false })

    if (data) {
      setCommandes(data)
      setStats({
        total: data.length,
        en_cours: data.filter(c => !['livree', 'annulee'].includes(c.statut)).length,
        livrees: data.filter(c => c.statut === 'livree').length
      })
    }
    setLoading(false)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'en_attente': 'text-yellow-600 bg-yellow-50',
      'acceptee': 'text-blue-600 bg-blue-50',
      'preparation': 'text-purple-600 bg-purple-50',
      'recuperation': 'text-indigo-600 bg-indigo-50',
      'en_cours': 'text-orange-600 bg-orange-50',
      'livree': 'text-green-600 bg-green-50',
      'annulee': 'text-red-600 bg-red-50'
    }
    return colors[statut] || 'text-slate-600 bg-slate-50'
  }

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'acceptee': 'Acceptée',
      'preparation': 'En préparation',
      'recuperation': 'Récupération',
      'en_cours': 'En cours de livraison',
      'livree': 'Livrée ✅',
      'annulee': 'Annulée ❌'
    }
    return labels[statut] || statut
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">👋 Bonjour {user?.nom}</h1>
            <p className="text-slate-500 text-sm">
              Client depuis {new Date(user?.date_inscription || '').toLocaleDateString('fr-FR')}
            </p>
          </div>
          <Link
            to="/"
            className="bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            🍴 Commander <HiArrowRight />
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{stats.total}</p>
            <p className="text-sm text-slate-500">Commandes</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.en_cours}</p>
            <p className="text-sm text-slate-500">En cours</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.livrees}</p>
            <p className="text-sm text-slate-500">Livrées</p>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">📋 Mes commandes</h2>
            {commandes.length > 5 && (
              <Link to="/client/commandes" className="text-sm text-orange-500 hover:underline">
                Voir tout →
              </Link>
            )}
          </div>

          {commandes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-3xl mb-2">📭</p>
              <p>Vous n'avez pas encore de commandes</p>
              <Link to="/" className="text-orange-500 hover:underline text-sm">
                Découvrir les restaurants
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {commandes.slice(0, 5).map((cmd) => (
                <Link
                  key={cmd.id}
                  to={`/client/suivi/${cmd.id}`}
                  className="block p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{cmd.commerce_nom}</p>
                      <p className="text-xs text-slate-400 font-mono">#{cmd.reference}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(cmd.date_commande).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(cmd.statut)}`}>
                        {getStatutLabel(cmd.statut)}
                      </span>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {cmd.total.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Link
            to="/restauration"
            className="bg-orange-500 text-white p-4 rounded-xl text-center font-semibold hover:bg-orange-600 transition-colors"
          >
            🍴 Commander
          </Link>
          <Link
            to="/client/commandes"
            className="bg-white text-slate-700 p-4 rounded-xl text-center font-semibold border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            📋 Historique
          </Link>
        </div>
      </div>
    </div>
  )
}