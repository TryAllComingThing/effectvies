import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  createDict,
  deleteDict,
  getDictList,
  toggleDictStatus,
  updateDict,
  type DictItem,
} from '@/api/modules/system/dict';

type DictPayload = {
  dictType: string;
  dictLabel: string;
  dictValue: string;
  status: 'enabled' | 'disabled';
  remark?: string;
};

export const useSystemDicts = () => {
  const dictsLoading = ref(false);
  const dicts = ref<DictItem[]>([]);
  const dictTotal = ref(0);
  const selectedDictIds = ref<string[]>([]);
  const dictQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    dictType: '',
    dictLabel: '',
    status: '',
  });

  const loadDicts = async () => {
    dictsLoading.value = true;
    try {
      const response = await getDictList(dictQuery);
      dicts.value = response.data.list;
      dictTotal.value = response.data.total;
    } finally {
      dictsLoading.value = false;
    }
  };

  const resetDicts = () => {
    Object.assign(dictQuery, {
      pageNum: 1,
      pageSize: 10,
      dictType: '',
      dictLabel: '',
      status: '',
    });
    loadDicts();
  };

  const toggleDict = async (id: string) => {
    const response = await toggleDictStatus(id);
    if (response.code === 0) {
      ElMessage.success('字典状态已更新');
      loadDicts();
    }
  };

  const saveDict = async (payload: DictPayload, id?: string) => {
    if (id) {
      await updateDict(id, payload);
      ElMessage.success('保存成功');
    } else {
      await createDict(payload);
      ElMessage.success('新增成功');
    }
    loadDicts();
  };

  const removeDict = async (id: string) => {
    await deleteDict(id);
    ElMessage.success('删除成功');
    loadDicts();
  };

  const onDictSelect = (items: DictItem[]) => {
    selectedDictIds.value = items.map((item) => item.id);
  };

  return {
    dictsLoading,
    dicts,
    dictTotal,
    selectedDictIds,
    dictQuery,
    loadDicts,
    resetDicts,
    toggleDict,
    saveDict,
    removeDict,
    onDictSelect,
  };
};
