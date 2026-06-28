import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import { HiBell, HiXMark } from 'react-icons/hi2'

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getIcon = (type: string) => {
        const icons: Record<string, string> = {
            commande: '📦',
            mission: '🛵',
            alerte: '⚠️',
            promotion: '🎉',
            systeme: '🔔'
        }
        return icons[type] || '🔔'
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Notifications"
            >
                <HiBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 max-h-[500px] overflow-y-auto z-50">
                    <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-orange-500 hover:underline"
                                >
                                    Tout marquer lu
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-100 rounded-full"
                            >
                                <HiXMark className="text-slate-400 text-lg" />
                            </button>
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <p className="text-3xl mb-2">🔕</p>
                            <p>Aucune notification</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.lu ? 'bg-orange-50' : ''
                                        }`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 text-xl">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-800">{notif.titre}</p>
                                            <p className="text-sm text-slate-600 truncate">{notif.message}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(notif.date_envoi).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notif.lu && (
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}