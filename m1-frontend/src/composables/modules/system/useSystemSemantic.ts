import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getSemanticList,
  getSqlTemplateList,
  testSqlTemplate,
  toggleSemanticStatus,
  type SemanticItem,
  type SqlTemplateItem,
} from '@/api/modules/system/semantic';

export const useSystemSemantic = () => {
  const semanticTab = ref<'biz' | 'sql'>('biz');

  const semanticsLoading = ref(false);
  const semantics = ref<SemanticItem[]>([]);
  const semanticTotal = ref(0);
  const semanticQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    name: '',
    keyword: '',
    deptName: '',
    status: '',
  });
  const selectedSemanticIds = ref<string[]>([]);

  const sqlLoading = ref(false);
  const sqlTemplates = ref<SqlTemplateItem[]>([]);
  const sqlTotal = ref(0);
  const sqlQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    code: '',
    name: '',
    sqlBrief: '',
    deptName: '',
    status: '',
  });
  const selectedSqlIds = ref<string[]>([]);

  const loadSemantics = async () => {
    semanticsLoading.value = true;
    try {
      const response = await getSemanticList(semanticQuery);
      semantics.value = response.data.list;
      semanticTotal.value = response.data.total;
    } finally {
      semanticsLoading.value = false;
    }
  };

  const resetSemantics = () => {
    Object.assign(semanticQuery, {
      pageNum: 1,
      pageSize: 10,
      name: '',
      keyword: '',
      deptName: '',
      status: '',
    });
    loadSemantics();
  };

  const toggleSemantic = async (id: string) => {
    const response = await toggleSemanticStatus(id);
    if (response.code === 0) {
      ElMessage.success('璇箟鐘舵€佸凡鏇存柊');
      loadSemantics();
    }
  };

  const loadSqlTemplates = async () => {
    sqlLoading.value = true;
    try {
      const response = await getSqlTemplateList(sqlQuery);
      sqlTemplates.value = response.data.list;
      sqlTotal.value = response.data.total;
    } finally {
      sqlLoading.value = false;
    }
  };

  const resetSqlTemplates = () => {
    Object.assign(sqlQuery, {
      pageNum: 1,
      pageSize: 10,
      code: '',
      name: '',
      sqlBrief: '',
      deptName: '',
      status: '',
    });
    loadSqlTemplates();
  };

  const testSql = async (row: SqlTemplateItem) => {
    const response = await testSqlTemplate(row.id, row.sqlContent);
    if (response.code === 0) {
      ElMessage.success(response.data.preview);
      return;
    }
    ElMessage.warning(response.message);
  };

  const onSemanticSelect = (items: SemanticItem[]) => {
    selectedSemanticIds.value = items.map((item) => item.id);
  };

  const onSqlSelect = (items: SqlTemplateItem[]) => {
    selectedSqlIds.value = items.map((item) => item.id);
  };

  return {
    semanticTab,
    semanticsLoading,
    semantics,
    semanticTotal,
    semanticQuery,
    selectedSemanticIds,
    sqlLoading,
    sqlTemplates,
    sqlTotal,
    sqlQuery,
    selectedSqlIds,
    loadSemantics,
    resetSemantics,
    toggleSemantic,
    loadSqlTemplates,
    resetSqlTemplates,
    testSql,
    onSemanticSelect,
    onSqlSelect,
  };
};
