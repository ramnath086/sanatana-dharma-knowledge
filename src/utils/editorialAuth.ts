import type { AuthenticatedUser } from '../types/editorial'

export interface EditorialAuthProvider { getCurrentUser(): AuthenticatedUser | null; isAuthenticated(): boolean; hasRole(role: AuthenticatedUser['roles'][number]): boolean; signIn(): Promise<AuthenticatedUser | null>; signOut(): Promise<void> }

// DEVELOPMENT ONLY - NOT PRODUCTION SECURITY. Replace with a server-backed provider before deployment.
export const developmentAuthProvider: EditorialAuthProvider = {
  getCurrentUser: () => ({ id: 'local-editor', displayName: 'Local editor', roles: ['ADMIN'] }),
  isAuthenticated: () => true,
  hasRole: (role) => ['EDITOR', 'SENIOR_EDITOR', 'TRADITIONAL_REVIEWER', 'ADMIN'].includes(role),
  signIn: async () => developmentAuthProvider.getCurrentUser(),
  signOut: async () => undefined,
}