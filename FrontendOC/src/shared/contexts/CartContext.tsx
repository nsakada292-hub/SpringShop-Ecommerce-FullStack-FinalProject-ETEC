import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Cart, CartItem } from '@/shared/types'
import { cartApi } from '@/shared/api/cart.api'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Cart | null
  items: CartItem[]
  totalAmount: number
  itemCount: number
  isLoading: boolean
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }
    try {
      setIsLoading(true)
      const { data } = await cartApi.get()
      setCart(data)
    } catch {
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addItem = async (productId: number, quantity = 1) => {
    const { data } = await cartApi.addItem(productId, quantity)
    setCart(data)
  }

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    const { data } = await cartApi.updateQuantity(cartItemId, quantity)
    setCart(data)
  }

  const removeItem = async (cartItemId: number) => {
    const { data } = await cartApi.removeItem(cartItemId)
    setCart(data)
  }

  const clearCart = async () => {
    await cartApi.clear()
    setCart(null)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items ?? [],
        totalAmount: cart?.totalAmount ?? 0,
        itemCount: cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
