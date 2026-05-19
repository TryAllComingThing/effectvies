<template>
  <div class="layout-root">
    <aside :class="['sidebar', { collapsed }]">
      <div class="brand">
        <span class="brand-mark">PM</span>
        <span v-show="!collapsed" class="brand-text">绩效管理平台</span>
      </div>

      <el-menu :default-active="route.path" :default-openeds="defaultOpeneds" :collapse="collapsed" class="menu" @select="onSelect">
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
        </div>
        <div class="header-right">
          <el-select v-model="language" size="small" class="header-lang"><el-option label="中文" value="zh-CN" /><el-option label="English" value="en-US" /></el-select>
          <el-switch v-model="isBlueTheme" inline-prompt active-text="蓝" inactive-text="灰" />
          <el-badge :value="unreadCount" class="header-msg"><el-button text @click="messageVisible=true"><el-icon><component :is="LucideIcons.Bell" /></el-icon><span>消息</span></el-button></el-badge>
          <el-dropdown>
            <span class="user-trigger"><el-avatar :size="28" class="user-avatar">{{ (userStore.profile?.name || '访').slice(0, 1) }}</el-avatar><span>{{ userStore.profile?.name || '访客' }}</span><el-icon><component :is="LucideIcons.ChevronDown" /></el-icon></span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="profileVisible=true"><el-icon><component :is="LucideIcons.User" /></el-icon><span>个人资料</span></el-dropdown-item>
                <el-dropdown-item @click="passwordVisible=true"><el-icon><component :is="LucideIcons.KeyRound" /></el-icon><span>修改密码</span></el-dropdown-item>
                <el-dropdown-item @click="logout"><el-icon><component :is="LucideIcons.LogOut" /></el-icon><span>退出系统</span></el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <section class="content"><RouterView /></section>
    </main>

    <el-dialog v-model="profileVisible" title="个人资料" width="520px">
      <el-form :model="profileForm" label-width="88px">
        <el-form-item label="姓名"><el-input v-model="profileForm.name" /></el-form-item>
        <el-form-item label="账号"><el-input v-model="profileForm.account" disabled /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="profileForm.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="profileForm.email" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="profileVisible=false">取消</el-button><el-button type="primary" @click="saveProfile">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="passwordVisible" title="修改密码" width="520px">
      <el-form :model="passwordForm" label-width="88px">
        <el-form-item label="原密码"><el-input v-model="passwordForm.oldPassword" show-password /></el-form-item>
        <el-form-item label="新密码"><el-input v-model="passwordForm.newPassword" show-password /></el-form-item>
        <el-form-item label="确认密码"><el-input v-model="passwordForm.confirmPassword" show-password /></el-form-item>
      </el-form>
      <template #footer><el-button @click="passwordVisible=false">取消</el-button><el-button type="primary" @click="savePassword">确认</el-button></template>
    </el-dialog>

    <el-drawer v-model="messageVisible" :with-header="false" size="320px" class="msg-drawer">
      <div class="msg-head">
        <div class="msg-title"><el-icon><component :is="LucideIcons.Bell" /></el-icon><span>消息中心</span></div>
        <el-button text type="primary" @click="markAllRead">全部标记已读</el-button>
      </div>
      <div class="msg-list">
        <div v-for="item in messages" :key="item.id" class="msg-item">
          <div class="msg-row1"><span class="dot" :class="{ read: item.read }" /><span class="msg-main">{{ item.title }}</span><span class="msg-tag">系统通知</span></div>
          <div class="msg-row3"><el-icon><component :is="LucideIcons.Clock3" /></el-icon><span>{{ item.time }}</span></div>
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
import { useUserStore } from '@/store/modules/user';

interface MenuGroup { index: string; title: string; icon: string; children: Array<{ path: string; title: string; icon: string }>; }

const collapsed = ref(false);
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const language = ref('zh-CN');
const isBlueTheme = ref(true);
const profileVisible = ref(false);
const passwordVisible = ref(false);
const messageVisible = ref(false);
const profileForm = ref({ name: userStore.profile?.name || '访客', account: userStore.profile?.account || 'guest', phone: '13800000000', email: 'guest@example.com' });
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });
const messages = ref([
  { id: 'm1', title: '绩效审核任务已处理完成', code: 'REV20260517001', result: '通过', time: '2026-05-17 09:12:31', read: false },
  { id: 'm2', title: '文件解析任务执行成功', code: 'FILE20260517012', result: '成功', time: '2026-05-17 09:03:18', read: false },
  { id: 'm3', title: '规则管理配置已发布', code: 'RULE20260516008', result: '生效', time: '2026-05-16 18:21:07', read: false },
  { id: 'm4', title: '语义管理词条已更新', code: 'SEM20260516015', result: '完成', time: '2026-05-16 16:44:22', read: true },
  { id: 'm5', title: '字典管理条目状态已变更', code: 'DICT20260516003', result: '禁用', time: '2026-05-16 15:09:56', read: true },
  { id: 'm6', title: '用户管理账号状态已调整', code: 'USER20260515019', result: '启用', time: '2026-05-15 11:35:40', read: true },
]);
const unreadCount = computed(() => messages.value.filter((i) => !i.read).length);

watch(isBlueTheme, (value) => {
  document.documentElement.style.setProperty('--color-primary', value ? '#409eff' : '#606266');
  document.documentElement.style.setProperty('--color-sidebar-active-bg', value ? '#409eff' : '#dfe9ff');
});

const routeMap = computed(() => {
  const allowed = appRoutes.filter((item) => !item.meta.roles || item.meta.roles.includes(userStore.roleCode));
  return new Map(allowed.map((item) => [item.path, item.meta.title]));
});

const menuGroups = computed<MenuGroup[]>(() => {
  const groups: MenuGroup[] = [
    { index: 'group_perf_file', title: '绩效文件管理', icon: 'FolderKanban', children: [ { path: '/perf-files', title: '文件管理', icon: 'FileSpreadsheet' }, { path: '/perf-tasks', title: '任务管理', icon: 'ListChecks' } ] },
    { index: 'group_perf', title: '绩效管理', icon: 'ClipboardList', children: [ { path: '/perf-review', title: '绩效审核', icon: 'ClipboardCheck' }, { path: '/performance', title: '绩效管理', icon: 'BarChart3' } ] },
    { index: 'group_analysis', title: '数据分析', icon: 'ChartNoAxesCombined', children: [ { path: '/analysis/ask', title: '智能问数', icon: 'MessageCircleQuestion' }, { path: '/analysis/table', title: '绩效报表', icon: 'Table2' }, { path: '/analysis/report', title: '绩效报告', icon: 'FileText' }, { path: '/analysis/template', title: '报告模板', icon: 'FileCog' } ] },
    { index: 'group_system', title: '系统管理', icon: 'Settings', children: [ { path: '/system/users', title: '用户管理', icon: 'Users' }, { path: '/system/depts', title: '科室管理', icon: 'Building2' }, { path: '/system/roles', title: '角色管理', icon: 'ShieldCheck' }, { path: '/system/rules', title: '规则管理', icon: 'FileCode2' }, { path: '/system/semantic', title: '语义管理', icon: 'BookOpenText' }, { path: '/system/dicts', title: '字典管理', icon: 'Database' }, { path: '/system/logs', title: '日志管理', icon: 'ScrollText' } ] },
  ];

  return groups.map((group) => ({ ...group, children: group.children.filter((child) => routeMap.value.has(child.path)) })).filter((group) => group.children.length > 0);
});

const defaultOpeneds = computed(() => menuGroups.value.map((item) => item.index));
const resolveIcon = (iconName?: string) => ((LucideIcons as Record<string, unknown>)[iconName || 'File'] || LucideIcons.File);
const onSelect = (index: string) => router.push(index);
const logout = async () => {
  try {
    await ElMessageBox.confirm('确认退出系统吗？', '退出确认', { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' });
    userStore.logout();
    router.replace('/login');
  } catch {
    // cancel
  }
};
const saveProfile = () => { ElMessage.success('个人资料已保存（模拟）'); profileVisible.value = false; };
const savePassword = () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) { ElMessage.warning('请填写完整密码信息'); return; }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) { ElMessage.warning('两次输入的新密码不一致'); return; }
  ElMessage.success('密码修改成功（模拟）');
  passwordVisible.value = false;
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
};
const markAllRead = () => { messages.value = messages.value.map((i) => ({ ...i, read: true })); };
</script>

<style scoped lang="scss">
.layout-root { display: flex; min-height: 100vh; }
.sidebar { width: 220px; background: #fff; color: #303133; transition: width .2s ease; border-right: 1px solid var(--color-border);
  .brand { height: 56px; padding: 0 14px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--color-border); background: #fff; }
  .brand-mark { width: 28px; height: 28px; border-radius: 6px; background: var(--color-primary); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 12px; }
  .brand-text { color: #303133; font-size: var(--font-size-md); font-weight: 600; }
  .menu { border: 0; background: #fff; --el-menu-bg-color:#fff; --el-menu-text-color:#606266; --el-menu-active-color:#1f5fff; --el-menu-hover-bg-color:#f5f7fa;
    :deep(.el-sub-menu__title),:deep(.el-menu-item){height:42px;line-height:42px;margin:6px 10px;border-radius:6px;font-size:var(--font-size-sm);color:#606266;}
    :deep(.el-menu-item.is-active){background:#ecf5ff;color:#1f5fff;font-weight:600;}
    :deep(.el-sub-menu .el-menu-item){margin-left:18px;}
  }
  .menu-icon { color: #409eff; font-size: 16px; }
  .level-1-icon,.level-2-icon{ margin-right:8px; }
}
.sidebar.collapsed { width: 64px; }
.main { flex: 1; display: flex; flex-direction: column; }
.header { height: 56px; padding: 0 14px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
.header-left :deep(.el-button) { color: var(--color-text-secondary); }
.collapse-btn { width: 32px; height: 32px; border-radius: 6px; }
.collapse-btn :deep(.el-icon) { font-size: 18px; }
.header-right { display: flex; gap: 10px; align-items: center; }
.header-lang { width: 96px; }
.header-msg :deep(.el-button) { font-size: var(--font-size-sm); }
.header-msg :deep(.el-button){display:flex;align-items:center;gap:4px;}
.user-trigger { cursor: pointer; color: var(--color-text); font-size: var(--font-size-sm); display:flex; align-items:center; gap:6px; }
.user-avatar { background: #409eff; color: #fff; font-size: 12px; }
:deep(.el-dropdown-menu__item){display:flex;align-items:center;gap:6px;}
.content { padding: 12px; }
.msg-head{display:flex;justify-content:space-between;align-items:center;padding:6px 2px 10px;border-bottom:1px solid #ebeef5;}
.msg-title{display:flex;align-items:center;gap:6px;font-size:16px;font-weight:600;color:#303133;}
.msg-list{padding:10px 0;display:flex;flex-direction:column;gap:8px;}
.msg-item{border:1px solid #ebeef5;border-radius:8px;padding:10px 12px;background:#fff;}
.msg-row1{display:flex;align-items:center;gap:8px;}
.dot{width:7px;height:7px;border-radius:50%;background:#f56c6c;display:inline-block;}
.dot.read{background:#c0c4cc;}
.msg-main{font-size:14px;font-weight:600;color:#303133;flex:1;line-height:1.4;}
.msg-tag{font-size:12px;color:#909399;border:1px solid #dcdfe6;border-radius:8px;padding:2px 8px;}
.msg-row2{margin-top:6px;font-size:13px;color:#606266;line-height:1.4;}
.msg-row3{margin-top:6px;display:flex;align-items:center;gap:5px;color:#909399;font-size:12px;}
:deep(.msg-drawer .el-drawer__body){padding:14px 16px;}
:deep(.msg-drawer .el-button--text){font-size:13px;font-weight:400;padding:4px 6px;}
</style>
