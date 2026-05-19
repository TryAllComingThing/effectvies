<template>
  <PageContainer title="平台配置">
    <section class="config-card">
      <div class="card-title">基础配置</div>
      <el-form :model="form" label-width="96px">
        <el-form-item label="平台名称">
          <el-input v-model="form.platformName" maxlength="24" show-word-limit placeholder="请输入平台名称" />
        </el-form-item>

        <el-form-item label="平台 Logo">
          <div class="logo-field">
            <div class="logo-preview">
              <img :src="form.logoUrl" alt="logo-preview" />
            </div>
            <div class="logo-actions">
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                class="hidden-input"
                @change="handleLogoUpload"
              />
              <el-space wrap>
                <el-button type="primary" @click="triggerUpload">上传 Logo</el-button>
                <el-button @click="useDefaultLogo">使用默认 Logo</el-button>
              </el-space>
              <div class="tip-text">
                建议使用透明背景的 `PNG` 或 `SVG`。
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-space wrap>
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
            <el-button @click="resetAll">恢复默认</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </section>
  </PageContainer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import { usePlatformStore } from '@/store/modules/platform';

const platformStore = usePlatformStore();
const fileInputRef = ref<HTMLInputElement | null>(null);
const form = reactive({
  platformName: platformStore.platformName,
  logoUrl: platformStore.logoUrl,
});

const triggerUpload = () => {
  fileInputRef.value?.click();
};

const useDefaultLogo = () => {
  form.logoUrl = platformStore.defaultLogoUrl;
};

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    form.logoUrl = String(reader.result || platformStore.defaultLogoUrl);
  };
  reader.readAsDataURL(file);
  target.value = '';
};

const saveConfig = () => {
  if (!form.platformName.trim()) {
    ElMessage.warning('请输入平台名称');
    return;
  }

  platformStore.setPlatformConfig({
    platformName: form.platformName.trim(),
    logoUrl: form.logoUrl,
  });
  form.logoUrl = platformStore.logoUrl;
  ElMessage.success('平台配置已生效');
};

const resetAll = () => {
  platformStore.resetPlatformConfig();
  form.platformName = platformStore.defaultPlatformName;
  form.logoUrl = platformStore.defaultLogoUrl;
  ElMessage.success('已恢复默认配置');
};
</script>

<style scoped lang="scss">
.config-card {
  border: 1px solid #dde5f2;
  border-radius: 6px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  padding: 20px;
}

.card-title {
  margin-bottom: 18px;
  font-size: 16px;
  font-weight: 600;
  color: #24344d;
}

.logo-field {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.logo-preview {
  width: 108px;
  height: 108px;
  border: 1px solid #dce4f0;
  border-radius: 6px;
  background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.logo-preview img {
  width: 76px;
  height: 76px;
  object-fit: contain;
}

.logo-actions {
  flex: 1;
}

.hidden-input {
  display: none;
}

.tip-text {
  margin-top: 12px;
  color: #6d7b90;
  font-size: 12px;
  line-height: 1.8;
}

@media (max-width: 980px) {
  .logo-field {
    flex-direction: column;
  }
}
</style>
