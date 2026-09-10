import { supabase } from './supabaseClient'
import type { AuthenticatedUser } from '../types/editorial'

export interface EditorialAuthProvider {
  getCurrentUser(): AuthenticatedUser | null
  isAuthenticated(): boolean
  hasRole(role: AuthenticatedUser['roles'][number]): boolean
  signIn(email: string, password: string): Promise<AuthenticatedUser | null>
  signOut(): Promise<void>
}

let currentUser: AuthenticatedUser | null = null

async function syncUser(supabaseUser: { id: string; email?: string } | null): Promise<AuthenticatedUser | null> {
  currentUser = null
  if (!supabaseUser) return null

  const { data, error } = await supabase.rpc('current_editorial_role')
  if (error || data === null) return null

  currentUser = {
    id: supabaseUser.id,
    displayName: supabaseUser.email ?? 'Editor',
    roles: [data as AuthenticatedUser['roles'][number]],
  }
  return currentUser
}

export const authProvider: EditorialAuthProvider = {
  getCurrentUser: () => currentUser,
  isAuthenticated: () => currentUser !== null,
  hasRole: (role) => currentUser?.roles.includes(role) ?? false,
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return null
    return syncUser(data.user)
  },
  signOut: async () => {
    await supabase.auth.signOut()
    currentUser = null
  },
}

supabase.auth.onAuthStateChange(async (_event, session) => {
  await syncUser(session?.user ?? null)
})
