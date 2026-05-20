import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getDeptList, toggleDeptStatus, type DeptItem } from '@/api/modules/system/dept';

export const useSystemDepts = () => {
  const deptsLoading = ref(false);
  const depts = ref<DeptItem[]>([]);
  const deptTotal = ref(0);
  const selectedDeptIds = ref<string[]>([]);
  const deptQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    code: '',
    name: '',
    parentName: '',
    status: '',
  });

  const deptParentOptions = computed(() => Array.from(new Set(depts.value.map((item) => item.name).filter(Boolean))));

  const loadDepts = async () => {
    deptsLoading.value = true;
    try {
      const response = await getDeptList(deptQuery);
      depts.value = response.data.list;
      deptTotal.value = response.data.total;
    } finally {
      deptsLoading.value = false;
    }
  };

  const resetDepts = () => {
    Object.assign(deptQuery, {
      pageNum: 1,
      pageSize: 10,
      code: '',
      name: '',
      parentName: '',
      status: '',
    });
    loadDepts();
  };

  const toggleDept = async (id: string) => {
    const response = await toggleDeptStatus(id);
    if (response.code === 0) {
      ElMessage.success('科室状态已更新');
      loadDepts();
    }
  };

  const onDeptSelect = (items: DeptItem[]) => {
    selectedDeptIds.value = items.map((item) => item.id);
  };

  return {
    deptsLoading,
    depts,
    deptTotal,
    selectedDeptIds,
    deptQuery,
    deptParentOptions,
    loadDepts,
    resetDepts,
    toggleDept,
    onDeptSelect,
  };
};
