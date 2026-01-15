// Session management utilities using sessionStorage (tab-specific)
// Each tab has its own session, allowing multiple tabs with different users

export interface UserSession {
  userId: number
  email: string
  fullName: string
  role: string
}

export const sessionUtils = {
  // Store user session in sessionStorage
  setUser: (user: UserSession): void => {
    sessionStorage.setItem('user', JSON.stringify(user))
    sessionStorage.setItem('sessionTime', Date.now().toString())
    window.dispatchEvent(new Event('userLoginStatusChange'))
  },

  // Get user session from sessionStorage
  getUser: (): UserSession | null => {
    try {
      const userStr = sessionStorage.getItem('user')
      if (!userStr) return null
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Error parsing user session:', error)
      return null
    }
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return sessionStorage.getItem('user') !== null
  },

  // Clear user session
  clearSession: (): void => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('sessionTime')
    window.dispatchEvent(new Event('userLoginStatusChange'))
  },

  // Get session timestamp
  getSessionTime: (): number | null => {
    const sessionTime = sessionStorage.getItem('sessionTime')
    return sessionTime ? parseInt(sessionTime) : null
  },

  // Check if session is valid (not expired)
  isSessionValid: (timeout: number = 24 * 60 * 60 * 1000): boolean => {
    const sessionTime = sessionStorage.getItem('sessionTime')
    if (!sessionTime) return false

    const sessionAge = Date.now() - parseInt(sessionTime)
    return sessionAge <= timeout
  }
}
