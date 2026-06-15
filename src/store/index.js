import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Auth Store ──────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
        localStorage.removeItem('auth-storage')
      },
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken, isAuthenticated: state.isAuthenticated }) }
  )
)

// ── Theme Store ─────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
      },
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
    }),
    { name: 'theme-storage' }
  )
)

// ── Language Store ──────────────────────────────────────────
export const useLangStore = create(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'lang-storage' }
  )
)

// ── UI Store ────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  searchOpen: false,
  sidebarOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
