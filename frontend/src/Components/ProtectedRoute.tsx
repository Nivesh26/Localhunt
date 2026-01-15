import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

// Session timeout: 24 hours
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) => {
  const location = useLocation()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('user')
        
        if (!userStr) {
          setIsAuthorized(false)
          return
        }

        const user = JSON.parse(userStr)
        
        // Check if user has required role
        if (!allowedRoles.includes(user.role)) {
          setIsAuthorized(false)
          toast.error('Access denied. You do not have permission to access this page.')
          return
        }

        // Check session expiry
        const sessionTime = localStorage.getItem('sessionTime')
        if (sessionTime) {
          const sessionAge = Date.now() - parseInt(sessionTime)
          
          if (sessionAge > SESSION_TIMEOUT) {
            // Session expired
            localStorage.removeItem('user')
            localStorage.removeItem('sessionTime')
            window.dispatchEvent(new Event('userLoginStatusChange'))
            setIsAuthorized(false)
            toast.error('Your session has expired. Please login again.')
            return
          }
          
          // Refresh session time on activity (optional - extend session on use)
          // localStorage.setItem('sessionTime', Date.now().toString())
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthorized(false)
      }
    }

    checkAuth()
  }, [location, allowedRoles])

  // Show loading state while checking
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    // Redirect to appropriate login page based on the route they tried to access
    if (allowedRoles.includes('SUPERADMIN')) {
      return <Navigate to="/login" state={{ from: location }} replace />
    } else if (allowedRoles.includes('VENDOR')) {
      return <Navigate to="/sellerlogin" state={{ from: location }} replace />
    } else {
      return <Navigate to={redirectTo} state={{ from: location }} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
