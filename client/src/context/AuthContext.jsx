import { createContext, useContext } from 'react';

// Holds the logged-in user + login/logout actions once Phase 3 wires up
// real authentication. Exported now so other files can import { useAuth }
// without changes later.
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}
