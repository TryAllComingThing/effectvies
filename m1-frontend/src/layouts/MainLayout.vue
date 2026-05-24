<template>
  <div class="layout-root">
    <aside :class="['sidebar', { collapsed }]">
      <div class="brand">
        <div class="brand-mark">
          <img
            v-if="!brandLogoBroken"
            class="brand-logo"
            :src="brandLogoSrc"
            alt="平台标识"
            @error="handleBrandLogoError"
            @load="brandLogoBroken = false"
          />
          <span v-else class="brand-icon-text">{{ brandIconText }}</span>
        </div>
        <div v-show="!collapsed" class="brand-meta">
          <span class="brand-text">{{ platformStore.platformName }}</span>
        </div>
      </div>

      <el-menu
        :default-active="route.path"
        :default-openeds="defaultOpeneds"
        :collapse="collapsed"
        class="menu"
        @select="onSelect"
      >
        <el-sub-menu v-for="group in menuGroups" :key="group.index" :index="group.index">
          <template #title>
            <el-icon class="menu-icon level-1-icon"><component :is="resolveIcon(group.icon)" /></el-icon>
            <span>{{ group.title }}</span>
          </template>
          <el-menu-item v-for="item in group.children" :key="item.path" :index="item.path">
            <el-icon class="menu-icon level-2-icon"><component :is="resolveIcon(item.icon)" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <main class="main">
      <header class="header">
        <div class="header-left">
          <el-button text class="collapse-btn" @click="collapsed = !collapsed">
            <el-icon><component :is="collapsed ? LucideIcons.ChevronsRight : LucideIcons.ChevronsLeft" /></el-icon>
          </el-button>

          <div class="page-context">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>{{ currentModuleTitle }}</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="page-title-row">
              <h1>{{ currentPageTitle }}</h1>
            </div>
          </div>
        </div>

        <div class="header-right">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="header-msg">
            <el-button text class="header-plain-btn" @click="messageVisible = true">
              <el-icon><component :is="LucideIcons.Bell" /></el-icon>
              <span>消息中心</span>
            </el-button>
          </el-badge>

          <el-dropdown popper-class="user-dropdown-menu">
            <button type="button" class="user-trigger">
              <el-avatar :size="30" class="user-avatar">{{ userInitial }}</el-avatar>
              <span class="user-meta">
                <strong>{{ userStore.profile?.name || '访客' }}</strong>
              </span>
              <el-icon class="user-arrow"><component :is="LucideIcons.ChevronDown" /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="profileVisible = true">
                  <el-icon><component :is="LucideIcons.User" /></el-icon>
                  <span>个人资料</span>
                </el-dropdown-item>
                <el-dropdown-item @click="passwordVisible = true">
                  <el-icon><component :is="LucideIcons.KeyRound" /></el-icon>
                  <span>修改密码</span>
                </el-dropdown-item>
                <el-dropdown-item @click="logout">
                  <el-icon><component :is="LucideIcons.LogOut" /></el-icon>
                  <span>退出系统</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <section class="content">
        <RouterView />
      </section>
    </main>

    <el-dialog v-model="profileVisible" title="个人资料" width="520px">
      <el-form :model="profileForm" label-width="88px">
        <el-form-item label="姓名"><el-input v-model="profileForm.name" /></el-form-item>
        <el-form-item label="账号"><el-input v-model="profileForm.account" disabled /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="profileForm.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="profileForm.email" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordVisible" title="修改密码" width="520px">
      <el-form :model="passwordForm" label-width="88px">
        <el-form-item label="原密码"><el-input v-model="passwordForm.oldPassword" show-password /></el-form-item>
        <el-form-item label="新密码"><el-input v-model="passwordForm.newPassword" show-password /></el-form-item>
        <el-form-item label="确认密码"><el-input v-model="passwordForm.confirmPassword" show-password /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" @click="savePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="messageVisible" :with-header="false" size="360px" class="msg-drawer">
      <div class="msg-head">
        <div class="msg-title">
          <el-icon><component :is="LucideIcons.Bell" /></el-icon>
          <span>消息中心</span>
        </div>
        <el-button text type="primary" @click="markAllRead">全部标记已读</el-button>
      </div>
      <div class="msg-list">
        <div v-for="item in messages" :key="item.id" class="msg-item">
          <div class="msg-row1">
            <span class="dot" :class="{ read: item.read }" />
            <span class="msg-main">{{ item.title }}</span>
            <span class="msg-tag">系统通知</span>
          </div>
          <div class="msg-row2">{{ item.description }}</div>
          <div class="msg-row3">
            <el-icon><component :is="LucideIcons.Clock3" /></el-icon>
            <span>{{ item.time }}</span>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as LucideIcons from 'lucide-vue-next';
import { appRoutes } from '@/router/routes';
import { useAuthStore } from '@/store/modules/auth';
import { useUserStore } from '@/store/modules/user';
import { usePlatformStore } from '@/store/modules/platform';

interface MenuGroup {
  index: string;
  title: string;
  icon: string;
  children: Array<{ path: string; title: string; icon: string }>;
}

const collapsed = ref(false);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const platformStore = usePlatformStore();

const brandLogoBroken = ref(false);
const brandLogoUseFallback = ref(false);
const profileVisible = ref(false);
const passwordVisible = ref(false);
const messageVisible = ref(false);
const profileForm = ref({
  name: userStore.profile?.name || '访客',
  account: userStore.profile?.account || 'guest',
  phone: '13800000000',
  email: 'guest@example.com',
});
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });
const messages = ref([
  {
    id: 'm1',
    title: '绩效审核任务已处理完成',
    description: '任务单 REV20260517001 已处理完成，请及时查看最新结果。',
    time: '2026-05-17 09:12:31',
    read: false,
  },
  {
    id: 'm2',
    title: '文件解析任务执行成功',
    description: '本次导入文件已解析完成，相关数据已完成同步。',
    time: '2026-05-17 09:03:18',
    read: false,
  },
  {
    id: 'm3',
    title: '规则配置已发布',
    description: '规则版本 RULE20260516008 已发布并开始生效。',
    time: '2026-05-16 18:21:07',
    read: false,
  },
  {
    id: 'm4',
    title: '语义词条已更新',
    description: '分析词库已完成一次更新，请核对关联配置。',
    time: '2026-05-16 16:44:22',
    read: true,
  },
  {
    id: 'm5',
    title: '字典条目状态已变更',
    description: '字典条目状态已调整，请关注相关依赖配置。',
    time: '2026-05-16 15:09:56',
    read: true,
  },
]);

const unreadCount = computed(() => messages.value.filter((item) => !item.read).length);
const userInitial = computed(() => (userStore.profile?.name || '访客').slice(0, 1));
const brandIconText = computed(() => {
  const normalizedName = platformStore.platformName.replace(/\s+/g, '').trim();
  return normalizedName.slice(0, 2) || '绩效';
});
const brandLogoSrc = computed(() =>
  brandLogoUseFallback.value ? platformStore.defaultLogoUrl : platformStore.logoUrl || platformStore.defaultLogoUrl
);
const currentPageTitle = computed(() => String(route.meta.title || '工作台'));
const currentModuleTitle = computed(() => {
  if (route.path.startsWith('/analysis')) return '数据分析';
  if (route.path.startsWith('/system')) return '系统管理';
  if (route.path.startsWith('/perf-files') || route.path.startsWith('/perf-tasks')) return '任务管理';
  if (route.path.startsWith('/perf-review') || route.path.startsWith('/performance')) return '绩效管理';
  return '首页';
});

watch(
  () => platformStore.logoUrl,
  () => {
    brandLogoUseFallback.value = false;
    brandLogoBroken.value = false;
  }
);

const handleBrandLogoError = () => {
  if (!brandLogoUseFallback.value && platformStore.logoUrl && platformStore.logoUrl !== platformStore.defaultLogoUrl) {
    brandLogoUseFallback.value = true;
    return;
  }

  brandLogoBroken.value = true;
};

const routeMap = computed(() => {
  const allowed = appRoutes.filter((item) => authStore.canAccessRoute(item, userStore.roleCode));
  return new Map(allowed.map((item) => [item.path, item.meta.title]));
});

const menuGroups = computed<MenuGroup[]>(() => {
  const groups: MenuGroup[] = [
    {
      index: 'group_dashboard',
      title: '首页总览',
      icon: 'LayoutDashboard',
      children: [{ path: '/dashboard', title: '工作台', icon: 'LayoutDashboard' }],
    },
    {
      index: 'group_perf_file',
      title: '绩效任务',
      icon: 'FolderKanban',
      children: [
        { path: '/perf-files', title: '文件管理', icon: 'FileSpreadsheet' },
        { path: '/perf-tasks', title: '任务管理', icon: 'ListChecks' },
      ],
    },
    {
      index: 'group_perf',
      title: '绩效管理',
      icon: 'ClipboardList',
      children: [
        { path: '/perf-review', title: '绩效审核管理', icon: 'ClipboardCheck' },
        { path: '/performance', title: '绩效数据台账', icon: 'BarChart3' },
      ],
    },
    {
      index: 'group_analysis',
      title: '数据分析',
      icon: 'ChartNoAxesCombined',
      children: [
        { path: '/analysis/ask', title: '智能问数', icon: 'MessageCircleQuestion' },
        { path: '/analysis/table', title: '绩效报表', icon: 'Table2' },
        { path: '/analysis/report', title: '智能报告', icon: 'FileText' },
        { path: '/analysis/performance-report', title: '绩效报告', icon: 'FileStack' },
        { path: '/analysis/template', title: '报告模板', icon: 'FileCog' },
      ],
    },
    {
      index: 'group_system',
      title: '系统管理',
      icon: 'Settings',
      children: [
        { path: '/system/users', title: '用户管理', icon: 'Users' },
        { path: '/system/depts', title: '科室管理', icon: 'Building2' },
        { path: '/system/roles', title: '角色管理', icon: 'ShieldCheck' },
        { path: '/system/rules', title: '规则管理', icon: 'FileCode2' },
        { path: '/system/semantic', title: '语义管理', icon: 'BookOpenText' },
        { path: '/system/score-model', title: '评分模型', icon: 'Scale' },
        { path: '/system/dicts', title: '字典管理', icon: 'Database' },
        { path: '/system/logs', title: '日志管理', icon: 'ScrollText' },
        { path: '/system/platform', title: '平台配置', icon: 'PanelsTopLeft' },
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      children: group.children.filter((child) => routeMap.value.has(child.path)),
    }))
    .filter((group) => group.children.length > 0);
});

const defaultOpeneds = computed(() => menuGroups.value.map((item) => item.index));
const resolveIcon = (iconName?: string) => ((LucideIcons as Record<string, unknown>)[iconName || 'File'] || LucideIcons.File);
const onSelect = (index: string) => router.push(index);

const logout = async () => {
  try {
    await ElMessageBox.confirm('确认退出当前系统吗？', '退出确认', {
      type: 'warning',
      confirmButtonText: '确认退出',
      cancelButtonText: '取消',
    });
    authStore.clearAuthorization();
    userStore.logout();
    router.replace('/login');
  } catch {
    // cancel
  }
};

const saveProfile = () => {
  const nextName = profileForm.value.name.trim();
  if (!nextName) {
    ElMessage.warning('请输入姓名');
    return;
  }

  userStore.updateProfile({
    name: nextName,
    account: profileForm.value.account.trim() || userStore.profile?.account || 'guest',
  });
  ElMessage.success('个人资料已保存');
  profileVisible.value = false;
};

const savePassword = () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    ElMessage.warning('请填写完整的密码信息');
    return;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致');
    return;
  }

  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.warning('新密码长度不能少于 6 位');
    return;
  }

  ElMessage.success('密码修改成功');
  passwordVisible.value = false;
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
};

const markAllRead = () => {
  messages.value = messages.value.map((item) => ({ ...item, read: true }));
};
</script>

<style scoped lang="scss">
.layout-root {
  display: flex;
  min-height: 100vh;
  background: #f3f6fb;
}

.sidebar {
  width: 248px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  color: #303133;
  transition: width 0.2s ease;
  border-right: 1px solid #e6ebf2;

  .brand {
    height: 78px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #edf1f6;
    background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  }

  .brand-mark {
    width: 46px;
    height: 46px;
    border-radius: 6px;
    background: linear-gradient(180deg, #eef4ff 0%, #e6efff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    box-shadow: inset 0 0 0 1px rgba(64, 104, 196, 0.16);
  }

  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    object-fit: contain;
    display: block;
  }

  .brand-icon-text {
    font-size: 15px;
    font-weight: 700;
    color: #1f5fff;
    line-height: 1;
    letter-spacing: 1px;
  }

  .brand-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .brand-text {
    color: #21324b;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .menu {
    border: 0;
    background: transparent;
    --el-menu-bg-color: transparent;
    --el-menu-text-color: #5e6b81;
    --el-menu-active-color: #1f5fff;
    --el-menu-hover-bg-color: #f3f7ff;
    padding-top: 10px;

    :deep(.el-sub-menu__title),
    :deep(.el-menu-item) {
      height: 42px;
      line-height: 42px;
      margin: 4px 12px;
      border-radius: 4px;
      font-size: 14px;
      color: #5e6b81;
    }

    :deep(.el-sub-menu__title:hover),
    :deep(.el-menu-item:hover) {
      color: #21324b;
      background: #f3f7ff;
    }

    :deep(.el-menu-item.is-active) {
      background: linear-gradient(90deg, #edf4ff 0%, #f6f9ff 100%);
      color: #1f5fff;
      font-weight: 600;
    }

    :deep(.el-sub-menu .el-menu-item) {
      margin-left: 24px;
    }
  }

  .menu-icon {
    color: #6b85c7;
    font-size: 16px;
  }

  .level-1-icon,
  .level-2-icon {
    margin-right: 8px;
  }
}

.sidebar.collapsed {
  width: 80px;

  .brand {
    padding: 0;
    justify-content: center;
  }
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 78px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e8edf4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(12px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.header-left :deep(.el-button) {
  color: #6e7b91;
}

.collapse-btn {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #f6f8fc;
}

.collapse-btn :deep(.el-icon) {
  font-size: 18px;
}

.page-context {
  min-width: 0;
}

.page-context :deep(.el-breadcrumb__inner) {
  color: #8d98a9;
  font-size: 12px;
  font-weight: 400;
}

.page-title-row {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  min-width: 0;
}

.page-title-row h1 {
  margin: 0;
  color: #1f2d3d;
  font-size: 22px;
  line-height: 1.1;
  font-weight: 700;
}

.header-right {
  display: flex;
  gap: 14px;
  align-items: center;
}

.header-msg :deep(.el-badge__content) {
  top: 8px;
  right: 12px;
}

.header-plain-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  border-radius: 4px;
  color: #435066;
  background: #f7f9fc;
}

.user-trigger {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  color: #2f3b4f;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: #f7f9fc;
  box-shadow: none;
  outline: none;
  text-align: left;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.user-trigger:hover {
  background: #eef4ff;
  border-color: #d6e2ff;
  box-shadow: none;
}

.user-trigger:focus,
.user-trigger:focus-visible,
.header-right :deep(.el-tooltip__trigger:focus),
.header-right :deep(.el-tooltip__trigger:focus-visible) {
  outline: none;
  box-shadow: none;
}

.user-avatar {
  background: linear-gradient(180deg, #4f8dff 0%, #2f6ae8 100%);
  color: #fff;
  font-size: 12px;
}

.user-meta strong {
  font-size: 13px;
  font-weight: 600;
}

.user-arrow {
  color: #7c8aa0;
}

:deep(.user-dropdown-menu) {
  border-radius: 4px;
  padding: 6px;
  border: 1px solid #e2e8f3;
  box-shadow: 0 16px 32px rgba(31, 50, 85, 0.12);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
}

.content {
  padding: 20px 24px 24px;
}

.msg-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 2px 12px;
  border-bottom: 1px solid #ebeef5;
}

.msg-head :deep(.el-button) {
  height: 30px;
  padding: 0 10px;
  border: 1px solid #d7dfeb;
  border-radius: 4px;
  background: #f7f9fc;
  color: #5e6b81;
  font-size: 12px;
  font-weight: 500;
}

.msg-head :deep(.el-button:hover) {
  border-color: #bfd0ea;
  background: #eef4ff;
  color: #315487;
}

.msg-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.msg-list {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px 14px;
  background: #fff;
}

.msg-row1 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f56c6c;
  display: inline-block;
}

.dot.read {
  background: #c0c4cc;
}

.msg-main {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  line-height: 1.4;
}

.msg-tag {
  font-size: 12px;
  color: #909399;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 2px 8px;
}

.msg-row2 {
  margin-top: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.msg-row3 {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 12px;
}

:deep(.msg-drawer .el-drawer__body) {
  padding: 14px 16px;
}

:deep(.msg-drawer .el-button--text) {
  font-size: 13px;
  font-weight: 400;
  padding: 4px 6px;
}

@media (max-width: 1080px) {
  .sidebar {
    width: 84px;
  }

  .sidebar .brand {
    padding: 0;
    justify-content: center;
  }

  .header {
    height: auto;
    padding: 16px;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .header-left,
  .header-right {
    width: 100%;
  }

  .page-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .content {
    padding: 16px;
  }
}
</style>
