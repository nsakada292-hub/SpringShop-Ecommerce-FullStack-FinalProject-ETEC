import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getInitialTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('ss_theme')
  const theme: 'light' | 'dark' =
    saved === 'light' || saved === 'dark'
      ? saved
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
  applyTheme(theme)
  return theme
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  const toggleTheme = () => {
    setTheme((prev) => {
      const resolved = prev === 'dark' ? 'light' : 'dark'
      applyTheme(resolved)
      localStorage.setItem('ss_theme', resolved)
      return resolved
    })
  }

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('ss_theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
