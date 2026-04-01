import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/authContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "doctor" | "patient" | "receptionist" | string[]
  requireAuth?: boolean
}


export default function ProtectedRoute({
  children,
  requiredRole,
  requireAuth = true,
}: ProtectedRouteProps) {
  try {
    const { user, isAuthenticated, loading } = useAuth()
    const location = useLocation()
    
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    
    const hasRefreshToken = localStorage.getItem('refreshToken')
    if (requireAuth && !isAuthenticated && hasRefreshToken && !user) {
      
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    
    if (requireAuth && !isAuthenticated && !hasRefreshToken) {
      
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    
    if (requiredRole && user) {
    const userRole = getUserRole(user)
    
    const allowedRoles = Array.isArray(requiredRole) 
      ? requiredRole.map(r => typeof r === 'string' ? r : String(r))
      : [typeof requiredRole === 'string' ? requiredRole : String(requiredRole)]
    
    
    
    const roleMap: Record<string, string[]> = {
      admin: ["admin", "1", "administrator"],
      receptionist: ["receptionist", "2", "staff"],
      patient: ["patient", "3"],
      doctor: ["doctor", "4"],
    }
    
    const hasAccess = allowedRoles.some((role) => {
      
      const roleStr = typeof role === 'string' ? role : String(role)
      const roleVariants = roleMap[roleStr] || [roleStr]
      try {
        
        const userRoleStr = typeof userRole === 'string' ? userRole : String(userRole)
        const userRoleLower = userRoleStr.toLowerCase()
        return roleVariants.includes(userRoleLower)
      } catch (error: any) {
        return false
      }
    })

    if (!hasAccess) {
      
      const dashboardPath = getDashboardPath(userRole)
      return <Navigate to={dashboardPath} replace />
    }
  }

    return <>{children}</>
  } catch (error: any) {
    console.error('ProtectedRoute error:', error)
    
    return <Navigate to="/login" replace />
  }
}


function getUserRole(user: any): string {
  
  if (user.roleId !== undefined && user.roleId !== null) {
    const roleIdStr = String(user.roleId)
    return roleIdStr
  }
  if (user.role !== undefined && user.role !== null) {
    const roleStr = String(user.role)
    return roleStr
  }
  return "patient" 
}


function getDashboardPath(role: string): string {
  const roleLower = role.toLowerCase()
  if (roleLower === "admin" || roleLower === "1" || roleLower === "administrator") {
    return "/admin/dashboard"
  }
  if (roleLower === "receptionist" || roleLower === "2" || roleLower === "staff") {
    return "/receptionist/dashboard"
  }
  if (roleLower === "patient" || roleLower === "3") {
    return "/patient/dashboard"
  }
  if (roleLower === "doctor" || roleLower === "4") {
    return "/doctor/dashboard"
  }
  return "/" 
}
