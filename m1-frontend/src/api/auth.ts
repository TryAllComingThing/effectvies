import request from '@/utils/request';
import type { ApiResult } from '@/types';
import type { RoleCode, UserProfile } from '@/store/modules/user';

export interface LoginPayload {
  account: string;
  password: string;
  role: 'admin' | 'user';
}

export interface LoginResponse {
  token: string;
  profile: UserProfile;
  roles: RoleCode[];
  permissions: string[];
  menuRouteNames: string[];
}

export const loginApi = (payload: LoginPayload) => request.post<unknown, ApiResult<LoginResponse>>('/auth/login', payload);
