import { createContext, useContext, useReducer, ReactNode } from 'react'
import toast from 'react-hot-toast'

export interface CartItem {
  id: string
  nom: string
  prix: number
  quantite: number
  total: number
  image_url?: string
  commercant_id?: string
  commercant_nom?: string
  type: 'restaurant' | 'boutique' | 'course'
  description?: string
}

interface CartState {
  items: CartItem[]
  total: number
  count: number
}

type CartAction =
  | { type: 'ADD'; payload: CartItem }
  | { type: 'REMOVE'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantite: number } }
  | { type: 'CLEAR' }

const initialState: CartState = {
  items: [],
  total: 0,
  count: 0
}

function generateId(item: Omit<CartItem, 'id' | 'total'>): string {
  return `${item.type}-${item.nom}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existingIndex = state.items.findIndex(item =>
        item.type === action.payload.type &&
        item.nom === action.payload.nom &&
        item.commercant_id === action.payload.commercant_id
      )

      let newItems: CartItem[]

      if (existingIndex !== -1) {
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantite: item.quantite + action.payload.quantite, total: (item.quantite + action.payload.quantite) * item.prix }
            : item
        )
      } else {
        newItems = [...state.items, action.payload]
      }

      const total = newItems.reduce((sum, item) => sum + item.total, 0)
      const count = newItems.reduce((sum, item) => sum + item.quantite, 0)

      return { items: newItems, total, count }
    }

    case 'REMOVE': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.total, 0)
      const count = newItems.reduce((sum, item) => sum + item.quantite, 0)
      return { items: newItems, total, count }
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantite: Math.max(1, action.payload.quantite), total: Math.max(1, action.payload.quantite) * item.prix }
          : item
      )
      const total = newItems.reduce((sum, item) => sum + item.total, 0)
      const count = newItems.reduce((sum, item) => sum + item.quantite, 0)
      return { items: newItems, total, count }
    }

    case 'CLEAR':
      return initialState

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addToCart: (item: Omit<CartItem, 'id' | 'total'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantite: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addToCart = (item: Omit<CartItem, 'id' | 'total'>) => {
    const newItem: CartItem = {
      ...item,
      id: generateId(item),
      quantite: item.quantite || 1,
      total: (item.quantite || 1) * item.prix
    }
    dispatch({ type: 'ADD', payload: newItem })
    toast.success(`✅ ${item.nom} ajouté au panier`)
  }

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE', payload: id })
  }

  const updateQuantity = (id: string, quantite: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantite } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR' })
    toast.success('Panier vidé')
  }

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}