import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getRuleList, toggleRuleStatus, type RuleItem } from '@/api/modules/system/rule';

export const useSystemRules = () => {
  const rulesLoading = ref(false);
  const rules = ref<RuleItem[]>([]);
  const ruleTotal = ref(0);
  const selectedRuleIds = ref<string[]>([]);
  const ruleQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    name: '',
    type: '',
    tag: '',
    content: '',
    deptName: '',
    status: '',
  });

  const loadRules = async () => {
    rulesLoading.value = true;
    try {
      const response = await getRuleList(ruleQuery);
      rules.value = response.data.list;
      ruleTotal.value = response.data.total;
    } finally {
      rulesLoading.value = false;
    }
  };

  const resetRules = () => {
    Object.assign(ruleQuery, {
      pageNum: 1,
      pageSize: 10,
      name: '',
      type: '',
      tag: '',
      content: '',
      deptName: '',
      status: '',
    });
    loadRules();
  };

  const toggleRule = async (id: string) => {
    const response = await toggleRuleStatus(id);
    if (response.code === 0) {
      ElMessage.success('规则状态已更新');
      loadRules();
    }
  };

  const onRuleSelect = (items: RuleItem[]) => {
    selectedRuleIds.value = items.map((item) => item.id);
  };

  return {
    rulesLoading,
    rules,
    ruleTotal,
    selectedRuleIds,
    ruleQuery,
    loadRules,
    resetRules,
    toggleRule,
    onRuleSelect,
  };
};
