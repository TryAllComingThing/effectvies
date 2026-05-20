import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { batchDeleteLogs, getLogList, type LogItem } from '@/api/modules/system/log';

export const useSystemLogs = () => {
  const logsLoading = ref(false);
  const logs = ref<LogItem[]>([]);
  const logTotal = ref(0);
  const selectedLogIds = ref<string[]>([]);
  const logQuery = reactive({
    pageNum: 1,
    pageSize: 10,
  });
  const logQueryForm = reactive({
    operator: '',
    module: '',
    deptName: '',
  });
  const logType = ref<'all' | 'login' | 'operation'>('all');

  const loadLogs = async () => {
    logsLoading.value = true;
    try {
      const response = await getLogList({
        ...logQuery,
        ...logQueryForm,
        logType: logType.value === 'all' ? undefined : logType.value,
      });
      logs.value = response.data.list;
      logTotal.value = response.data.total;
    } finally {
      logsLoading.value = false;
    }
  };

  const resetLogs = () => {
    Object.assign(logQuery, {
      pageNum: 1,
      pageSize: 10,
    });
    Object.assign(logQueryForm, {
      operator: '',
      module: '',
      deptName: '',
    });
    logType.value = 'all';
    loadLogs();
  };

  const deleteSelectedLogs = async () => {
    if (!selectedLogIds.value.length) {
      return;
    }

    await batchDeleteLogs(selectedLogIds.value);
    ElMessage.success('日志已删除');
    loadLogs();
  };

  const onLogSelect = (items: LogItem[]) => {
    selectedLogIds.value = items.map((item) => item.id);
  };

  return {
    logsLoading,
    logs,
    logTotal,
    selectedLogIds,
    logQuery,
    logQueryForm,
    logType,
    loadLogs,
    resetLogs,
    deleteSelectedLogs,
    onLogSelect,
  };
};
