import { createContext, useContext, useState, type ReactNode } from 'react'

interface DrawerContextType {
  isCartOpen: boolean
  isWishlistOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  openWishlist: () => void
  closeWishlist: () => void
  toggleWishlist: () => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)

  return (
    <DrawerContext.Provider
      value={{
        isCartOpen,
        isWishlistOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
        toggleWishlist: () => setIsWishlistOpen((prev) => !prev),
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (!context) throw new Error('useDrawer must be used within DrawerProvider')
  return context
}
