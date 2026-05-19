import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export type RoleCode = 'admin' | 'user';

interface UserProfile {
  id: string;
  account: string;
  name: string;
  roleCode: RoleCode;
}

const TOKEN_KEY = 'm1_token';
const USER_KEY = 'm1_user';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '');
  const profile = ref<UserProfile | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));

  const isLoggedIn = computed(() => Boolean(token.value));
  const roleCode = computed<RoleCode>(() => profile.value?.roleCode || 'user');

  const setLogin = (nextToken: string, nextProfile: UserProfile) => {
    token.value = nextToken;
    profile.value = nextProfile;
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextProfile));
  };

  const logout = () => {
    token.value = '';
    profile.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return { token, profile, isLoggedIn, roleCode, setLogin, logout };
});
