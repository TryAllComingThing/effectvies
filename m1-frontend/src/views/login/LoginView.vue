<template>
  <div class="login-wrap">
    <div class="login-shell">
      <section class="visual-pane">
        <img class="visual-image" src="@/assets/login/u193.png" alt="visual" />
      </section>
      <section class="form-pane">
        <div class="brand">
          <img class="brand-mark-img" src="@/assets/login/u190.svg" alt="logo" />
          <h1>智能仓储信息管理系统</h1>
        </div>

        <div class="title-row">
          <span class="cn">用户登录</span>
          <span class="en">USER LOGIN</span>
        </div>

        <el-form :model="form" class="login-form">
          <el-form-item>
            <el-input v-model="form.account" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" show-password placeholder="请输入登录密码" />
          </el-form-item>

          <div class="captcha-row">
            <el-input v-model="form.captcha" placeholder="请输入右侧验证码" />
            <div class="captcha-code"><img src="@/assets/login/captcha.svg" alt="captcha" /></div>
          </div>

          <div class="helper-row">
            <el-checkbox v-model="form.remember">记住密码</el-checkbox>
            <a href="javascript:void(0)" class="forget">忘记密码?</a>
          </div>

          <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';

const router = useRouter();
const userStore = useUserStore();
const form = reactive({
  account: 'admin',
  password: '123456',
  role: 'admin' as 'admin' | 'user',
  captcha: '',
  remember: true,
});

const handleLogin = () => {
  if (!form.account || !form.password) {
    ElMessage.warning('请填写完整账号密码');
    return;
  }
  userStore.setLogin(`token_${Date.now()}`, {
    id: String(Date.now()),
    account: form.account,
    name: form.role === 'admin' ? '系统管理员' : '普通用户',
    roleCode: form.role,
  });
  ElMessage.success('登录成功');
  router.replace('/dashboard');
};
</script>

<style scoped lang="scss">
.login-wrap {
  min-height: 100vh;
  background: linear-gradient(180deg, #d7d9e3 0%, #d3d6e2 70%, #c7c7ed 100%);
  display: grid;
  place-items: center;
  padding: 0;
}

.login-shell {
  width: 1306px;
  height: 700px;
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(43, 54, 84, 0.11);
  display: flex;
}

.visual-pane {
  width: 614px;
  background: #eef0f8;
  display: grid;
  place-items: center;
}

.visual-image {
  width: 508px;
  object-fit: contain;
  opacity: 0.9;
}

.form-pane {
  width: 692px;
  padding: 68px 56px 52px;
  background: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 54px;
}

.brand-mark {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #5971ea;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 25px;
  font-weight: 700;
}
.brand-mark-img { width: 56px; height: 56px; display: block; }

.brand h1 {
  margin: 0;
  color: #2e3138;
  font-size: 58px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: 0;
}

.title-row {
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.title-row .cn {
  color: #32353a;
  font-size: 44px;
  line-height: 1.1;
  font-weight: 700;
}

.title-row .en {
  color: #a0a3ab;
  font-size: 40px;
  line-height: 1.1;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 72px;
  background: #f2f2f2;
  border-radius: 8px;
  box-shadow: none;
}

.login-form :deep(.el-input__inner) {
  font-size: 19px;
  color: #333;
}

.captcha-row {
  display: grid;
  grid-template-columns: 1fr 146px;
  gap: 14px;
  margin-bottom: 14px;
}

.captcha-code {
  height: 72px;
  border: 1px solid #e9e9ee;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #fafafa;
  color: #414654;
  font-size: 28px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 1px;
}
.captcha-code img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }

.helper-row {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.helper-row :deep(.el-checkbox__label) {
  color: #8f95a3;
  font-size: 14px;
}

.forget {
  color: #4f67ef;
  text-decoration: none;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  height: 70px;
  border-radius: 8px;
  font-size: 24px;
  line-height: 1;
  font-weight: 600;
  margin-top: 0;
}

@media (max-width: 1080px) {
  .login-shell {
    width: 96vw;
    height: auto;
    display: block;
  }
  .visual-pane {
    display: none;
  }
  .form-pane {
    padding: 26px 18px 20px;
  }
  .brand {
    margin-bottom: 20px;
  }
  .brand h1 {
    transform: none;
    margin-left: 0;
    width: auto;
    font-size: 30px;
  }
  .title-row .cn,
  .title-row .en {
    transform: none;
    width: auto;
    margin-left: 0;
    font-size: 24px;
  }
  .title-row .en {
    font-size: 20px;
  }
  .login-form :deep(.el-input__wrapper) {
    min-height: 44px;
  }
  .captcha-code,
  .login-btn {
    height: 44px;
  }
  .login-btn {
    font-size: 18px;
  }
}
</style>
