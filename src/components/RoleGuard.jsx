export function RoleGuard({ allowedRoles, userRole, children, fallback }) {
  if (!allowedRoles.includes(userRole)) {
    return fallback ? <>{fallback}</> : null
  }
  return <>{children}</>
}
