export type UserRole = 'supervisor' | 'admin' | 'datamanagement';

export interface User {
  id: string;
  email: string;
  name: string;
  wing: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
