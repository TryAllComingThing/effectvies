import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { store } from '@/store';
import { useAuthStore } from '@/store/modules/auth';
import { useUserStore } from '@/store/modules/user';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('m1_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || '请求失败，请稍后重试';

    if (status === 401 || status === 403) {
      const userStore = useUserStore(store);
      const authStore = useAuthStore(store);
      if (userStore.isLoggedIn) {
        userStore.logout();
        authStore.clearAuthorization();
        ElMessage.error(status === 401 ? '登录已失效，请重新登录' : '当前账号无权限，请重新登录');
        if (router.currentRoute.value.path !== '/login') {
          router.replace('/login');
        }
      }
      return Promise.reject(error);
    }

    ElMessage.error(message);
    return Promise.reject(error);
  },
);

export default request;
