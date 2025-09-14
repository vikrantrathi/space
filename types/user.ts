export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  mfaEnabled: boolean;

  // Approval and status
  status?: 'active' | 'inactive' | 'pending_approval' | 'rejected';
  isApproved?: boolean;

  // Audit
  lastLoginAt?: Date;
  lastLoginIP?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
