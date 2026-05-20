import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { deleteRole, getRoleList, type RoleItem } from '@/api/modules/system/role';

export const useSystemRoles = () => {
  const rolesLoading = ref(false);
  const roles = ref<RoleItem[]>([]);
  const roleTotal = ref(0);
  const selectedRoleIds = ref<string[]>([]);
  const roleQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    roleCode: '',
    roleName: '',
    deptName: '',
  });

  const loadRoles = async () => {
    rolesLoading.value = true;
    try {
      const response = await getRoleList(roleQuery);
      roles.value = response.data.list;
      roleTotal.value = response.data.total;
    } finally {
      rolesLoading.value = false;
    }
  };

  const resetRoles = () => {
    Object.assign(roleQuery, {
      pageNum: 1,
      pageSize: 10,
      roleCode: '',
      roleName: '',
      deptName: '',
    });
    loadRoles();
  };

  const removeRole = async (id: string) => {
    const response = await deleteRole(id);
    if (response.code === 0) {
      ElMessage.success('角色删除成功');
      loadRoles();
      return;
    }

    ElMessage.warning(response.message);
  };

  const onRoleSelect = (items: RoleItem[]) => {
    selectedRoleIds.value = items.map((item) => item.id);
  };

  return {
    rolesLoading,
    roles,
    roleTotal,
    selectedRoleIds,
    roleQuery,
    loadRoles,
    resetRoles,
    removeRole,
    onRoleSelect,
  };
};
