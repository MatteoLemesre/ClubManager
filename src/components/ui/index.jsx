import { useNavigate } from 'react-router-dom'
import { getInitials } from '../../data/mock'

// ─── Avatar ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

function colorFor(id = '') {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function Avatar({ user, size = 'md', className = '' }) {
  const initials = getInitials(user)
  const color = colorFor(user?.id ?? initials)
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0 ${sizeMap[size]} ${color} ${className}`}
    >
      {initials}
    </span>
  )
}

// ─── Badge ─────────────────────────────────────────────────────────────────
const badgeVariants = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-emerald-100 text-emerald-700',
  orange: 'bg-orange-100 text-orange-700',
  red:    'bg-red-100 text-red-700',
  purple: 'bg-violet-100 text-violet-700',
  gray:   'bg-surface-100 text-surface-600',
  brand:  'bg-brand-100 text-brand-700',
  yellow: 'bg-yellow-100 text-yellow-700',
}

export function Badge({ variant = 'gray', children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// ─── LicenseBadge ──────────────────────────────────────────────────────────
export function LicenseBadge({ status }) {
  const config = {
    active:   { label: 'Active',    variant: 'green' },
    expiring: { label: 'Expire bientôt', variant: 'orange' },
    expired:  { label: 'Expirée',   variant: 'red' },
  }
  const { label, variant } = config[status] ?? { label: 'N/A', variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

// ─── RoleBadge ─────────────────────────────────────────────────────────────
const roleConfig = {
  president: { label: 'Président', variant: 'brand' },
  coach:     { label: 'Coach',     variant: 'purple' },
  player:    { label: 'Joueur',    variant: 'blue' },
  supporter: { label: 'Supporter', variant: 'orange' },
  parent:    { label: 'Parent',    variant: 'green' },
}

export function RoleBadge({ role }) {
  const { label, variant } = roleConfig[role] ?? { label: role, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

// ─── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-surface-200 shadow-sm ${onClick ? 'cursor-pointer hover:bg-surface-50 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ─── EmptyState ────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-surface-300 mb-4 text-5xl">{icon}</div>}
      <h3 className="font-display font-semibold text-surface-700 text-lg mb-1">{title}</h3>
      {description && <p className="text-surface-500 text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// ─── StatCard ──────────────────────────────────────────────────────────────
const statColors = {
  brand:  'bg-brand-50 border-brand-100 text-brand-600',
  green:  'bg-emerald-50 border-emerald-100 text-emerald-600',
  orange: 'bg-orange-50 border-orange-100 text-orange-600',
  red:    'bg-red-50 border-red-100 text-red-600',
  purple: 'bg-violet-50 border-violet-100 text-violet-600',
  gray:   'bg-surface-50 border-surface-200 text-surface-600',
}

export function StatCard({ value, label, sub, color = 'gray', icon }) {
  return (
    <div className={`rounded-2xl border p-5 ${statColors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-display font-bold">{value}</p>
          <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
          {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
        {icon && <div className="opacity-50 mt-1">{icon}</div>}
      </div>
    </div>
  )
}

// ─── SectionHeader ─────────────────────────────────────────────────────────
export function SectionHeader({ title, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h2 className="font-display font-semibold text-surface-800 text-lg">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── ClickableName ──────────────────────────────────────────────────────────
// Composant helper : clic sur un nom navigue vers /app/profile/:id

export function ClickableName({ user, className = '' }) {
  const navigate = useNavigate()
  if (!user) return null
  const fn = user.firstName ?? user.first_name ?? ''
  const ln = user.lastName  ?? user.last_name  ?? ''
  if (!user.id) return <span className={className}>{fn} {ln}</span>
  return (
    <button
      onClick={e => { e.stopPropagation(); navigate(`/app/profile/${user.id}`) }}
      className={`hover:text-brand-600 transition-colors ${className}`}
    >
      {fn} {ln}
    </button>
  )
}
