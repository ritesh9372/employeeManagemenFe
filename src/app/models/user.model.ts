export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  is_active?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
