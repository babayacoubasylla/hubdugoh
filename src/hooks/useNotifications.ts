import { useState, useEffect } from 'react'
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

export function useNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        if (!userId) return

        // Charger les notifications
        loadNotifications()

        // Écouter les nouvelles notifications en temps réel
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const notif = payload.new as Notification
                    setNotifications(prev => [notif, ...prev])
                    setUnreadCount(prev => prev + 1)

                    // Afficher un toast
                    const icons = {
                        commande: '📦',
                        mission: '🛵',
                        alerte: '⚠️',
                        promotion: '🎉',
                        systeme: '🔔'
                    }

                    toast.custom((t) => (
                        <div className= {`bg-white rounded-lg shadow-lg p-4 border-l-4 ${notif.type === 'commande' ? 'border-orange-500' :
                                notif.type === 'mission' ? 'border-blue-500' :
                                    notif.type === 'alerte' ? 'border-red-500' :
                                        'border-purple-500'
                            } max-w-sm`}>
            <div className="flex items-start gap-3" >
            <div className="text-xl" > { icons[notif.type] || '🔔' } </div>
            < div >
            <p className="font-semibold text-sm text-slate-800" > { notif.titre } </p>
            < p className = "text-sm text-slate-600" > { notif.message } </p>
            < p className = "text-xs text-slate-400 mt-1" >
            { new Date(notif.date_envoi).toLocaleString() }
            </p>
            </div>
            </div>
            </div>
            ), { duration: 5000 })
}
      )
      .subscribe((status) => {
    setIsConnected(status === 'SUBSCRIBED')
})

return () => {
    supabase.removeChannel(channel)
}
  }, [userId])

const loadNotifications = async () => {
    if (!userId) return

    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('date_envoi', { ascending: false })
        .limit(50)

    if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.lu).length)
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
    setUnreadCount(prev => Math.max(0, prev - 1))
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
    setUnreadCount(0)
}

const sendNotification = async (
    userId: string,
    titre: string,
    message: string,
    type: Notification['type']
) => {
    await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            titre,
            message,
            type,
            lu: false,
            date_envoi: new Date().toISOString()
        })
}

return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    isConnected
}
}