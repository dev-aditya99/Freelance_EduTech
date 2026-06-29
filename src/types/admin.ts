export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  admin: AdminUser;
  requiresApproval?: boolean;
  requestId?: string;
}
