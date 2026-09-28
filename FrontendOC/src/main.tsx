import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App'
import { ThemeProvider } from '@/shared/contexts/ThemeContext'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import { CartProvider } from '@/shared/contexts/CartContext'
import { WishlistProvider } from '@/shared/contexts/WishlistContext'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#171717',
                    color: '#fff',
                    borderRadius: '12px',
                  },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
