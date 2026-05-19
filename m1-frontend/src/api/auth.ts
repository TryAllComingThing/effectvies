import request from '@/utils/request';

export interface LoginPayload {
  account: string;
  password: string;
  role: 'admin' | 'user';
}

export const loginApi = (payload: LoginPayload) => request.post('/auth/login', payload);
