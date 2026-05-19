import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export type RoleCode = 'admin' | 'user';

export interface UserProfile {
  id: string;
  account: string;
  name: string;
  roleCode: RoleCode;
}

const TOKEN_KEY = 'm1_token';
const USER_KEY = 'm1_user';

const readStoredProfile = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile> | null;
    if (!parsed?.id || !parsed.account || !parsed.name || !parsed.roleCode) {
      localStorage.removeItem(USER_KEY);
      return null;
    }

    if (parsed.roleCode !== 'admin' && parsed.roleCode !== 'user') {
      localStorage.removeItem(USER_KEY);
      return null;
    }

    return parsed as UserProfile;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '');
  const profile = ref<UserProfile | null>(readStoredProfile());

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

  const updateProfile = (payload: Partial<UserProfile>) => {
    if (!profile.value) return;

    profile.value = {
      ...profile.value,
      ...payload,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(profile.value));
  };

  return { token, profile, isLoggedIn, roleCode, setLogin, logout, updateProfile };
});
