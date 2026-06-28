import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Notification {
    id: string
    titre: string
    message: string
    type: 'commande' | 'mission' | 'alerte' | 'promotion' | 'systeme'
    lu: boolean
    lien?: string
    date_envoi: string
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    sendNotification: (userId: string, titre: string, message: string, type: Notification['type']) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('gagnoa_digital_user')
        if (stored) {
            try {
                const { profil } = JSON.parse(stored)
                setUserId(profil.id)
                loadNotifications(profil.id)
            } catch (e) {
                console.error('Erreur chargement notifications:', e)
            }
        }
    }, [])

    const loadNotifications = async (id: string) => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', id)
            .order('date_envoi', { ascending: false })
            .limit(50)

        if (data) {
            setNotifications(data)
        }
    }

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ lu: true })
            .eq('id', id)

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, lu: true } : n)
        )
    }

    const markAllAsRead = async () => {
        if (!userId) return

        await supabase
            .from('notifications')
            .update({ lu: true })
            .eq('user_id', userId)
            .eq('lu', false)

        setNotifications(prev =>
            prev.map(n => ({ ...n, lu: true }))
        )
    }

    const sendNotification = async (
        userId: string,
        titre: string,
        message: string,
        type: Notification['type']
    ) => {
        const { data } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                titre,
                message,
                type,
                lu: false,
                date_envoi: new Date().toISOString()
            })
            .select()
            .single()

        if (data) {
            setNotifications(prev => [data, ...prev])

            // Afficher un toast
            const icons = {
                commande: '📦',
                mission: '🛵',
                alerte: '⚠️',
                promotion: '🎉',
                systeme: '🔔'
            }

            toast.custom((t) => (
                <div className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${type === 'commande' ? 'border-orange-500' :
                        type === 'mission' ? 'border-blue-500' :
                            type === 'alerte' ? 'border-red-500' :
                                type === 'promotion' ? 'border-green-500' :
                                    'border-purple-500'
                    } max-w-sm`}>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-xl">{icons[type] || '🔔'}</div>
                        <div>
                            <p className="font-semibold text-sm text-slate-800">{titre}</p>
                            <p className="text-sm text-slate-600">{message}</p>
                        </div>
                    </div>
                </div>
            ), { duration: 5000 })
        }
    }

    const unreadCount = notifications.filter(n => !n.lu).length

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            sendNotification
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const ctx = useContext(NotificationContext)
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
    return ctx
}