import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { HiPaperAirplane, HiUser, HiXMark } from 'react-icons/hi2'  // ← Changé HiX → HiXMark

interface Message {
    id: string
    commande_id: string
    sender_id: string
    sender_nom: string
    sender_role: string
    message: string
    created_at: string
}

interface ChatProps {
    commandeId: string
    onClose?: () => void
}

export default function Chat({ commandeId, onClose }: ChatProps) {
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadMessages()
        subscribeToMessages()
    }, [commandeId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadMessages = async () => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('commande_id', commandeId)
            .order('created_at', { ascending: true })

        if (data) {
            setMessages(data)
        }
        setLoading(false)
    }

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`chat:${commandeId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `commande_id=eq.${commandeId}`
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new as Message])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !user) return

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                commande_id: commandeId,
                sender_id: user.id,
                sender_nom: user.nom,
                sender_role: user.role,
                message: newMessage.trim()
            })

        if (!error) {
            setNewMessage('')
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg flex flex-col h-[500px]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="font-semibold text-slate-800">💬 Chat</span>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                        <HiXMark className="text-slate-400 text-xl" />  {/* ← Changé HiX → HiXMark */}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        <p>Aucun message</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl p-3 ${isOwn ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium opacity-75">{msg.sender_nom}</span>
                                        <span className="text-[10px] opacity-50">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm break-words">{msg.message}</p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez un message..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        <HiPaperAirplane className="text-lg" />
                    </button>
                </div>
            </form>
        </div>
    )
}