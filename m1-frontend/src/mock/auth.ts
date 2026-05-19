import type { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: { account: string; role: 'admin' | 'user' } }) => ({
      code: 0,
      message: 'success',
      traceId: `trace_${Date.now()}`,
      data: {
        token: `token_${Date.now()}`,
        profile: {
          id: String(Date.now()),
          account: body.account,
          name: body.role === 'admin' ? '系统管理员' : '普通用户',
          roleCode: body.role,
        },
      },
    }),
  },
] as MockMethod[];
