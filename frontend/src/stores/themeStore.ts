import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'high-contrast'

interface ThemeState {
  theme: Theme
  fontSize: number
  reduceMotion: boolean
  
  // Actions
  setTheme: (theme: Theme) => void
  setFontSize: (size: number) => void
  toggleReduceMotion: () => void
  loadTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      fontSize: 16,
      reduceMotion: false,

      setTheme: (theme: Theme) => {
        set({ theme })
        // Apply to document immediately
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('high-contrast')
        } else if (theme === 'high-contrast') {
          document.documentElement.classList.add('high-contrast')
          document.documentElement.classList.remove('dark')
        } else {
          document.documentElement.classList.remove('dark', 'high-contrast')
        }
      },

      setFontSize: (size: number) => {
        const clampedSize = Math.max(12, Math.min(24, size))
        set({ fontSize: clampedSize })
        document.documentElement.style.fontSize = `${clampedSize}px`
      },

      toggleReduceMotion: () => {
        const newValue = !get().reduceMotion
        set({ reduceMotion: newValue })
        if (newValue) {
          document.documentElement.classList.add('reduce-motion')
        } else {
          document.documentElement.classList.remove('reduce-motion')
        }
      },

      loadTheme: () => {
        const state = get()
        
        // Apply theme
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (state.theme === 'high-contrast') {
          document.documentElement.classList.add('high-contrast')
        }
        
        // Apply font size
        document.documentElement.style.fontSize = `${state.fontSize}px`
        
        // Apply reduced motion
        if (state.reduceMotion) {
          document.documentElement.classList.add('reduce-motion')
        }
        
        // Check system preference for dark mode
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        if (!state.theme && mediaQuery.matches) {
          set({ theme: 'dark' })
          document.documentElement.classList.add('dark')
        }
      }
    }),
    {
      name: 'theme-storage'
    }
  )
)