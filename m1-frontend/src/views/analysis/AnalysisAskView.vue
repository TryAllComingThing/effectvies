<template>
  <div class="ask-page">
    <aside class="chat-side">
      <div class="side-head">
        <el-button type="primary" plain class="new-btn" @click="createSession">+ 新对话</el-button>
      </div>
      <div class="session-list">
        <div
          v-for="item in sessions"
          :key="item.id"
          :class="['session-item', { active: item.id === activeSessionId }]"
          @click="activeSessionId = item.id"
        >
          {{ item.title }}
        </div>
      </div>
    </aside>

    <section class="chat-main">
      <div class="messages">
        <div v-for="msg in currentMessages" :key="msg.id" :class="['msg', msg.role]">
          <el-avatar :size="28" class="msg-avatar">{{ msg.role === 'assistant' ? 'AI' : '我' }}</el-avatar>
          <div class="bubble">
            <template v-if="msg.type === 'chart'">
              <div v-if="msg.reasoning" class="chart-thinking">
                <div class="thinking-label">思路说明</div>
                <div>{{ msg.reasoning }}</div>
              </div>
              <div class="chart-card">
                <div class="chart-title">近 7 日绩效趋势</div>
                <svg viewBox="0 0 360 190" class="line-chart" aria-label="line-chart">
                  <defs>
                    <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#3d7bff" stop-opacity="0.35" />
                      <stop offset="100%" stop-color="#3d7bff" stop-opacity="0.03" />
                    </linearGradient>
                  </defs>
                  <g stroke="#e7eef8" stroke-width="1">
                    <line x1="44" y1="30" x2="334" y2="30" />
                    <line x1="44" y1="58" x2="334" y2="58" />
                    <line x1="44" y1="86" x2="334" y2="86" />
                    <line x1="44" y1="114" x2="334" y2="114" />
                    <line x1="44" y1="142" x2="334" y2="142" />
                  </g>
                  <g stroke="#9bb2d6" stroke-width="1.2">
                    <line x1="44" y1="20" x2="44" y2="152" />
                    <line x1="44" y1="152" x2="334" y2="152" />
                  </g>
                  <g fill="#7f90ab" font-size="10">
                    <text x="20" y="34">100</text>
                    <text x="24" y="62">90</text>
                    <text x="24" y="90">80</text>
                    <text x="24" y="118">70</text>
                    <text x="24" y="146">60</text>
                    <text x="44" y="170">周一</text>
                    <text x="88" y="170">周二</text>
                    <text x="132" y="170">周三</text>
                    <text x="176" y="170">周四</text>
                    <text x="220" y="170">周五</text>
                    <text x="264" y="170">周六</text>
                    <text x="308" y="170">周日</text>
                  </g>
                  <polygon points="44,118 88,102 132,108 176,80 220,90 264,64 308,54 308,152 44,152" fill="url(#areaBlue)" />
                  <polyline points="44,118 88,102 132,108 176,80 220,90 264,64 308,54" fill="none" stroke="#2d6bff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
                  <g fill="#fff" stroke="#2d6bff" stroke-width="2">
                    <circle cx="44" cy="118" r="3.2" />
                    <circle cx="88" cy="102" r="3.2" />
                    <circle cx="132" cy="108" r="3.2" />
                    <circle cx="176" cy="80" r="3.2" />
                    <circle cx="220" cy="90" r="3.2" />
                    <circle cx="264" cy="64" r="3.2" />
                    <circle cx="308" cy="54" r="3.2" />
                  </g>
                </svg>
                <div class="chart-explain">
                  <div>数据解读：</div>
                  <div>1. 本周整体趋势向上，周四后提升更明显。</div>
                  <div>2. 周三有一次小幅回落，可能与当日样本量变化相关。</div>
                  <div>3. 周日达到峰值，可复用周末策略到高峰工作日。</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div>{{ msg.content }}</div>
              <el-collapse v-if="msg.reasoning" class="reasoning-box">
                <el-collapse-item name="reason">
                  <template #title>思维过程</template>
                  <div class="reasoning-text">{{ msg.reasoning }}</div>
                </el-collapse-item>
              </el-collapse>
            </template>
          </div>
        </div>
      </div>
      <div class="composer">
        <el-input
          v-model="inputText"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="输入问题，例如：统计本周各科室绩效总分"
          @keydown.enter.prevent="sendMessage"
        />
        <el-button type="primary" @click="sendMessage">发送</el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; type?: 'text' | 'chart'; reasoning?: string };
type Session = { id: string; title: string; messages: ChatMessage[] };

const sessions = ref<Session[]>([
  {
    id: 's1',
    title: '昨日值班汇总上报',
    messages: [
      { id: 'm1', role: 'assistant', content: '有什么我可以帮你的？' },
      { id: 'm2', role: 'user', content: '帮我统计昨天各科室的绩效分布。' },
      {
        id: 'm5',
        role: 'assistant',
        content: '图表如下',
        type: 'chart',
        reasoning: '先按日汇总近 7 天绩效均值，再进行趋势对比，重点观察拐点与连续增长区间。',
      },
    ],
  },
  {
    id: 's2',
    title: '事件处置方案',
    messages: [
      {
        id: 'm4',
        role: 'assistant',
        content: '请描述事件类型，我可以给出处置建议。',
        reasoning: '先明确事件类型和影响范围，再匹配历史方案，最后生成分步处置建议。',
      },
    ],
  },
]);
const activeSessionId = ref('s1');
const inputText = ref('');

const currentSession = computed(() => sessions.value.find((i) => i.id === activeSessionId.value) || sessions.value[0]);
const currentMessages = computed(() => currentSession.value.messages);

const createSession = () => {
  const id = `s${Date.now()}`;
  sessions.value.unshift({
    id,
    title: '新对话',
    messages: [{ id: `m${Date.now()}`, role: 'assistant', content: '你好，我可以帮你做数据问答。' }],
  });
  activeSessionId.value = id;
};

const sendMessage = () => {
  const text = inputText.value.trim();
  if (!text) {
    ElMessage.warning('请输入问题');
    return;
  }
  const now = Date.now();
  currentSession.value.messages.push({ id: `u${now}`, role: 'user', content: text });
  currentSession.value.messages.push({
    id: `a${now + 1}`,
    role: 'assistant',
    content: `已收到你的问题：“${text}”，正在生成分析结果（模拟）。`,
    reasoning: '我会先解析问题意图，再匹配指标口径，最后输出结果并附带解释。',
  });
  currentSession.value.title = currentSession.value.title === '新对话' ? text.slice(0, 12) : currentSession.value.title;
  inputText.value = '';
};
</script>

<style scoped lang="scss">
.ask-page {
  height: calc(100vh - 74px);
  display: flex;
  border: 1px solid #e5e9f2;
  border-radius: 4px;
  overflow: hidden;
  background: #f3f6fb;
}

.chat-side {
  width: 200px;
  background: #f6f8fc;
  border-right: 1px solid #e5e9f2;
  display: flex;
  flex-direction: column;
}

.side-head {
  padding: 16px 14px;
  border-bottom: 1px solid #e5e9f2;
}

.new-btn {
  width: 100%;
  height: 36px;
  border-radius: 4px;
}

.session-list {
  padding: 10px;
  overflow: auto;
}

.session-item {
  padding: 8px 10px;
  border-radius: 4px;
  color: #46536a;
  cursor: pointer;
  margin-bottom: 6px;
  background: transparent;
  font-size: 13px;
  font-weight: 400;
}

.session-item.active {
  background: #e8f0ff;
  color: #2d6bff;
  font-weight: 500;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #eef2f8;
}

.messages {
  flex: 1;
  overflow: auto;
  padding: 18px 22px;
}

.msg {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
  gap: 8px;
}

.msg.user {
  justify-content: flex-end;
}

.msg.user .msg-avatar {
  order: 2;
}

.bubble {
  max-width: 70%;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  background: #fff;
  color: #2f3a4f;
  border: 1px solid #e5e9f2;
}

.msg.user .bubble {
  background: #2d6bff;
  color: #fff;
  border-color: #2d6bff;
}

.composer {
  border-top: 1px solid #e5e9f2;
  background: #fff;
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.composer :deep(.el-textarea__inner) {
  border-radius: 4px;
}

.composer .el-button {
  height: 36px;
  border-radius: 4px;
  font-weight: 400;
}

.chart-card {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border: 1px solid #e8eef8;
  border-radius: 4px;
  padding: 10px 10px 8px;
  box-shadow: 0 2px 8px rgba(44, 95, 180, 0.08);
}

.chart-title {
  font-size: 13px;
  margin-bottom: 4px;
  color: #30435f;
  font-weight: 600;
}

.chart-thinking {
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #4a5f7c;
  background: #f8fbff;
  border: 1px solid #e6edf8;
  border-radius: 4px;
  padding: 8px 10px;
}

.thinking-label {
  font-weight: 600;
  color: #3f5678;
  margin-bottom: 2px;
}

.line-chart {
  width: 100%;
  height: 190px;
  display: block;
}

.chart-explain {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: #4a5f7c;
}

.reasoning-box {
  margin-top: 8px;
  border: 1px solid #e6edf8;
  border-radius: 4px;
  background: #f8fbff;
}

.reasoning-box :deep(.el-collapse-item__header) {
  height: 32px;
  font-size: 12px;
  color: #3d5676;
  padding: 0 10px;
  background: transparent;
  border: 0;
}

.reasoning-box :deep(.el-collapse-item__wrap) {
  border-top: 1px solid #e6edf8;
}

.reasoning-text {
  padding: 8px 10px 10px;
  font-size: 12px;
  line-height: 1.6;
  color: #4a5f7c;
}
</style>
