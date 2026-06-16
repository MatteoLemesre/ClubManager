// Hiérarchie : quels rôles peut inviter un rôle donné
export const INVITE_PERMISSIONS = {
  president: ['president', 'staff', 'coach', 'player'],
  staff:     ['coach', 'player'],
  coach:     ['player'],
  player:    [],
  community: [],
}

export const ROLE_LABELS_INV = {
  president: 'Président',
  staff:     'Intendant',
  coach:     'Coach',
  player:    'Joueur',
}

/**
 * Vérifie si l'inviteur (avec inviterRole) peut inviter le rôle targetRole
 */
export function canInvite(inviterRole, targetRole) {
  return (INVITE_PERMISSIONS[inviterRole] ?? []).includes(targetRole)
}

/**
 * Retourne les rôles que l'inviteur peut inviter
 */
export function getInvitableRoles(inviterRole) {
  return INVITE_PERMISSIONS[inviterRole] ?? []
}

/**
 * Vérifie si l'utilisateur peut quitter le club
 * Un président ne peut partir que s'il existe un autre président
 */
export function canLeaveClub(user, clubId, clubPresidentIds = []) {
  const roleInClub = (user.roles ?? []).find(r => r.club_id === clubId)?.role
  if (roleInClub !== 'president') return true
  const otherPresidents = clubPresidentIds.filter(id => id !== user.id)
  return otherPresidents.length > 0
}

/**
 * Valide le format d'un email
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
