import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Product, WishlistItem } from '@/shared/types'
import { wishlistApi } from '@/shared/api/wishlist.api'
import { useAuth } from './AuthContext'

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  isInWishlist: (productId: number) => boolean
  toggleWishlist: (product: Product) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  clearWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      return
    }
    try {
      const { data } = await wishlistApi.get()
      setItems(data)
    } catch {
      setItems([])
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const isInWishlist = useCallback(
    (productId: number) => items.some((item) => item.product.id === productId),
    [items]
  )

  const removeItem = useCallback(async (productId: number) => {
    const { data } = await wishlistApi.remove(productId)
    setItems(data)
  }, [])

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (isInWishlist(product.id)) {
        await removeItem(product.id)
      } else {
        const { data } = await wishlistApi.add(product.id)
        setItems(data)
      }
    },
    [isInWishlist, removeItem]
  )

  const clearWishlist = useCallback(async () => {
    setItems([])
  }, [])

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isInWishlist,
        toggleWishlist,
        removeItem,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}