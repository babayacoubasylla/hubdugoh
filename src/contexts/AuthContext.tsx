import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiAuth } from '@/api/auth'
import { apiClient } from '@/api/client'
import toast from 'react-hot-toast'
import type { Profil, Livreur, Commercant, LoginForm, InscriptionForm } from '@/types'

interface AuthContextType {
  user: Profil | null
  livreur: Livreur | null
  commercant: Commercant | null
  loading: boolean
  login: (data: LoginForm) => Promise<void>
  register: (data: InscriptionForm) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<Profil>) => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'gagnoa_digital_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profil | null>(null)
  const [livreur, setLivreur] = useState<Livreur | null>(null)
  const [commercant, setCommercant] = useState<Commercant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setUser(data.profil)
        if (data.livreur) setLivreur(data.livreur)
        if (data.commercant) setCommercant(data.commercant)
      } catch (error) {
        console.error('Erreur chargement session:', error)
      }
    }
    setLoading(false)
  }, [])

  const login = async (data: LoginForm) => {
    try {
      setLoading(true)
      const result = await apiAuth.login(data)

      if (result.profil) {
        setUser(result.profil)
        if (result.livreur) setLivreur(result.livreur as Livreur)
        if (result.commercant) setCommercant(result.commercant as Commercant)

        localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
        toast.success(`Bienvenue ${result.profil.nom} !`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: InscriptionForm) => {
    try {
      setLoading(true)
      const profil = await apiAuth.register(data)

      if (profil) {
        setUser(profil)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ profil }))
        toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur d\'inscription')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiAuth.logout()
      setUser(null)
      setLivreur(null)
      setCommercant(null)
      localStorage.removeItem(STORAGE_KEY)
      toast.success('Déconnexion réussie')
    } catch (error: any) {
      toast.error(error.message || 'Erreur de déconnexion')
    }
  }

  const updateUser = async (updates: Partial<Profil>) => {
    if (!user) return

    try {
      const updated = await apiClient.updateProfil(user.id, updates)
      setUser(updated)

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      stored.profil = updated
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

      toast.success('Profil mis à jour')
    } catch (error: any) {
      toast.error(error.message || 'Erreur de mise à jour')
      throw error
    }
  }

  const isAuthenticated = !!user
  const hasRole = (role: string) => user?.role === role

  return (
    <AuthContext.Provider value={{
      user,
      livreur,
      commercant,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}