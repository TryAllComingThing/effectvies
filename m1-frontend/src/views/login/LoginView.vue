<template>
  <div class="login-wrap">
    <div class="login-shell">
      <section class="visual-pane">
        <div class="visual-copy">
          <h2>让绩效数据真正成为可追踪、可分析、可执行的管理资产。</h2>
        </div>
        <img class="visual-image" src="@/assets/login/u193.png" alt="visual" />
      </section>

      <section class="form-pane">
        <div class="brand">
          <div class="brand-mark-shell">
            <img class="brand-mark-img" :src="platformStore.logoUrl" alt="logo" />
          </div>
          <div class="brand-copy">
            <h1>{{ platformStore.platformName }}</h1>
          </div>
        </div>

        <div class="title-row">
          <span class="cn">欢迎登录</span>
        </div>

        <el-form :model="form" class="login-form" @submit.prevent>
          <el-form-item label="账号" label-position="top">
            <el-input v-model="form.account" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码" label-position="top">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入登录密码" />
          </el-form-item>

          <el-form-item label="验证码" label-position="top">
            <div class="captcha-row">
              <el-input v-model="form.captcha" placeholder="请输入右侧验证码" />
              <button type="button" class="captcha-code" @click="refreshCaptcha">
                <img :src="captchaDataUrl" alt="captcha" />
              </button>
            </div>
            <div class="captcha-tip">看不清验证码时，可点击右侧图片刷新。</div>
          </el-form-item>

          <div class="helper-row">
            <el-checkbox v-model="form.remember">记住密码</el-checkbox>
            <a href="javascript:void(0)" class="forget">忘记密码？</a>
          </div>

          <el-button type="primary" class="login-btn" @click="handleLogin">登录系统</el-button>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/modules/auth';
import { useUserStore } from '@/store/modules/user';
import { usePlatformStore } from '@/store/modules/platform';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const platformStore = usePlatformStore();
const captchaValue = ref('');
const form = reactive({
  account: 'admin',
  password: '123456',
  role: 'admin' as 'admin' | 'user',
  captcha: '',
  remember: true,
});

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const createCaptcha = () =>
  Array.from({ length: 4 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');

const captchaDataUrl = computed(() => {
  const chars = captchaValue.value.split('');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="112" height="48" viewBox="0 0 112 48">
      <rect width="112" height="48" rx="4" fill="#f4f7ff" />
      <path d="M10 14h92M8 34h96" stroke="#d8e2f8" stroke-width="1" stroke-dasharray="4 4" />
      ${chars
        .map(
          (char, index) => `
            <text
              x="${14 + index * 22}"
              y="${30 + (index % 2 === 0 ? -1 : 2)}"
              fill="#334155"
              font-size="20"
              font-family="Arial"
              font-weight="700"
              transform="rotate(${index % 2 === 0 ? -10 : 8} ${14 + index * 22} ${22 + (index % 2 === 0 ? -1 : 2)})"
            >${char}</text>
          `
        )
        .join('')}
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
});

const refreshCaptcha = () => {
  captchaValue.value = createCaptcha();
};

refreshCaptcha();

const handleLogin = () => {
  if (!form.account || !form.password) {
    ElMessage.warning('请填写完整的账号和密码');
    return;
  }

  if (!form.captcha || form.captcha.trim().toUpperCase() !== captchaValue.value) {
    ElMessage.warning('验证码输入错误');
    form.captcha = '';
    refreshCaptcha();
    return;
  }

  userStore.setLogin(`token_${Date.now()}`, {
    id: String(Date.now()),
    account: form.account,
    name: form.role === 'admin' ? '系统管理员' : '普通用户',
    roleCode: form.role,
  });
  ElMessage.success('登录成功');
  authStore.setAuthorizationByRole(form.role);
  router.replace('/dashboard');
};
</script>

<style scoped lang="scss">
.login-wrap {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(120, 154, 255, 0.18), transparent 32%),
    linear-gradient(180deg, #edf2fb 0%, #e6edf9 60%, #dde4f1 100%);
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-shell {
  width: min(1080px, 100%);
  min-height: 640px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 22px 60px rgba(36, 55, 89, 0.14);
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
}

.visual-pane {
  position: relative;
  padding: 56px 52px 40px;
  background: linear-gradient(180deg, rgba(245, 249, 255, 0.92) 0%, rgba(233, 240, 252, 0.98) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.visual-copy {
  max-width: 420px;
}

.visual-copy h2 {
  margin: 0;
  color: #21324b;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
}

.visual-image {
  width: min(100%, 420px);
  align-self: center;
  object-fit: contain;
  opacity: 0.94;
}

.form-pane {
  padding: 56px 52px 48px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 38px;
}

.brand-mark-shell {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  background: linear-gradient(180deg, #f2f6fd 0%, #ebf1fb 100%);
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 0 1px rgba(58, 92, 165, 0.1);
}

.brand-mark-img {
  width: 34px;
  height: 34px;
  display: block;
}

.brand-copy h1 {
  margin: 0;
  color: #223047;
  font-size: 30px;
  line-height: 1.15;
  font-weight: 700;
}

.title-row {
  margin-bottom: 24px;
}

.title-row .cn {
  color: #27364d;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 700;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-form-item__label) {
  color: #4a5668;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 8px;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 48px;
  background: #f5f7fb;
  border-radius: 4px;
  box-shadow: 0 0 0 1px transparent;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 104, 196, 0.16);
}

.login-form :deep(.el-input__inner) {
  font-size: 14px;
  color: #333;
}

.captcha-row {
  display: grid;
  grid-template-columns: 1fr 112px;
  gap: 10px;
}

.captcha-code {
  height: 48px;
  border: 1px solid #e4eaf3;
  border-radius: 4px;
  display: grid;
  place-items: center;
  background: #fafcff;
  padding: 0;
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.captcha-code:hover {
  border-color: #bfd0ef;
  transform: translateY(-1px);
}

.captcha-code img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.captcha-tip {
  margin-top: 8px;
  color: #8c97a8;
  font-size: 12px;
}

.helper-row {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 18px;
}

.helper-row :deep(.el-checkbox__label) {
  color: #667387;
  font-size: 12px;
}

.forget {
  color: #4f67ef;
  text-decoration: none;
  font-size: 12px;
}

.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 4px;
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
  margin-top: 4px;
}

@media (max-width: 1080px) {
  .login-wrap {
    padding: 16px;
  }

  .login-shell {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .visual-pane {
    padding: 28px 24px 0;
  }

  .visual-copy h2 {
    font-size: 26px;
  }

  .visual-image {
    width: min(100%, 320px);
    margin-top: 24px;
  }

  .form-pane {
    padding: 32px 24px 28px;
  }

  .brand-copy h1 {
    font-size: 24px;
  }

  .title-row .cn {
    font-size: 24px;
  }
}
</style>
