import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useAuthContext();
  return {
    ...context,
    isParent: context.profile?.role === 'parent',
    isChild: context.profile?.role === 'child',
    isAuthenticated: !!context.session,
  };
}
