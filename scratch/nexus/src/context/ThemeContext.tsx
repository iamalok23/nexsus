import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = (localStorage.getItem('theme') || localStorage.getItem('nexus_theme')) as Theme
      if (saved === 'dark' || saved === 'light') return saved
    }
    return 'dark' // default to tactical dark command mode
  })

  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      body.classList.add('dark')
      body.classList.remove('light')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      body.classList.remove('dark')
      body.classList.add('light')
      root.setAttribute('data-theme', 'light')
    }

    try {
      localStorage.setItem('theme', theme)
      localStorage.setItem('nexus_theme', theme)
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
