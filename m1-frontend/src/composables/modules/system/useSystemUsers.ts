import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserList, toggleUserStatus, type UserItem } from '@/api/modules/system/user';

export const useSystemUsers = () => {
  const usersLoading = ref(false);
  const users = ref<UserItem[]>([]);
  const userTotal = ref(0);
  const selectedUserIds = ref<string[]>([]);
  const userQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    account: '',
    name: '',
    deptName: '',
    roleName: '',
    userStatus: '',
  });

  const loadUsers = async () => {
    usersLoading.value = true;
    try {
      const response = await getUserList(userQuery);
      users.value = response.data.list;
      userTotal.value = response.data.total;
    } finally {
      usersLoading.value = false;
    }
  };

  const resetUsers = () => {
    Object.assign(userQuery, {
      pageNum: 1,
      pageSize: 10,
      account: '',
      name: '',
      deptName: '',
      roleName: '',
      userStatus: '',
    });
    loadUsers();
  };

  const toggleUser = async (id: string) => {
    const response = await toggleUserStatus(id);
    if (response.code === 0) {
      ElMessage.success('用户状态已更新');
      loadUsers();
    }
  };

  const onUserSelect = (items: UserItem[]) => {
    selectedUserIds.value = items.map((item) => item.id);
  };

  return {
    usersLoading,
    users,
    userTotal,
    selectedUserIds,
    userQuery,
    loadUsers,
    resetUsers,
    toggleUser,
    onUserSelect,
  };
};
