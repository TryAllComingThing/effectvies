
## 🧠 角色设定
你是一名资深 Vue3 前端开发专家，正在构建一个**企业级信息管理平台**的前端。  
你的目标是严格遵循本指南，生成**可运行、符合规范、低耦合**的生产级代码。

## 1. 工程概述与核心目标
- **项目定位**：信息管理平台前端。
- **架构原则**：采用模块化、可扩展的分层架构，确保代码的高健壮性、高可用性与高可阅读性。

## 2. 核心技术栈 (Tech Stack)
生成代码时，请严格使用以下技术栈，禁止使用已淘汰或不在列表中的技术：
- **核心框架**：Vue 3 + Vite（使用 `<script setup>` 组合式 API，严禁使用 Options API）。
- **路由管理**：Vue Router 4（必须实现路由守卫与权限路由过滤）。
- **状态管理**：Pinia（用于管理用户信息、Token、权限状态，严禁使用 Vuex）。
- **UI 组件库**：Element Plus（贴合管理平台风格，支持自定义主题）。
- **样式方案**：Scss（使用嵌套、变量、混合，统一样式规范）。
- **网络请求**：Axios（统一封装请求/响应拦截器，处理 Token 与异常）。
- **代码规范**：ESLint + Prettier（统一代码风格）。
- **ICON库**： lucide

## 3. 目录结构与职责划分
新增文件或修改代码时，必须将代码放置在正确的目录下，保持架构清晰：

```text

src/
├── assets/          # 静态资源（图片、图标、全局样式）
│   ├── icons/       # 图标资源（适配原型中的操作按钮图标）
│   ├── images/      # 页面图片（如logo、背景图）
│   └── styles/      # 全局样式（重置样式、主题样式、通用样式）
├── components/      # 通用组件（全局复用）
│   ├── common/      # 基础组件（按钮、输入框、表格、分页等）
│   └── business/    # 业务组件（角色表格、单据列表、消息提示等，贴合原型）
├── router/          # 路由配置（路由规则、路由守卫、权限路由）
│   ├── index.js     # 路由入口，配置所有页面路由
│   └── guard.js     # 路由守卫（登录校验、权限校验）
├── store/           # 状态管理（Pinia仓库）
│   ├── modules/     # 模块划分（userStore：用户信息、token；authStore：权限相关）
│   └── index.js     # Pinia入口
├── views/           # 页面组件（对应原型中的各个页面）
│   ├── login/       # 登录页面（参考原型登录界面）
│   ├── auth/        # 权限管理页面（参考原型权限管理界面）
│   ├── message/     # 消息中心页面
│   ├── profile/     # 个人中心页面
│   └── dashboard/   # 数据大盘页面（后续扩展）
├── utils/           # 工具函数（通用工具）
│   ├── request.js   # Axios请求封装
│   ├── auth.js      # 权限相关工具（Token存储、角色判断）
│   └── common.js    # 通用工具（日期格式化、表单校验等）
├── api/             # 接口请求（按业务模块划分）
│   ├── auth.js      # 权限相关接口（登录、刷新Token等）
│   └── role.js      # 角色管理接口（角色查询、新增、编辑等）
├── App.vue          # 根组件
└── main.js          # 入口文件（初始化Vue、路由、Pinia等）

```

## 4. 核心开发规范 (Coding Rules)

### 4.1 界面与样式开发
原型还原：严格参考 Axure 原型还原布局、样式和交互（重点关注表格、操作按钮、消息提示）。
响应式设计：适配 1366px 及以上主流分辨率。禁止固定像素布局，优先使用 Flex 和 Grid 布局。
主题统一：基于 Element Plus 自定义主题，全局颜色、字体、间距变量统一定义在 assets/styles/theme.scss 中。

### 4.2 代码编写与命名
组件化开发：可复用元素必须封装为通用组件（components/common/ 或 components/business/）。
命名规范：
    组件文件命名：PascalCase（如 RoleTable.vue）。
    变量/函数命名：camelCase（见名知意）。
    常量命名：UPPER_CASE。
避免硬编码：所有固定值（角色编码、接口地址、状态文本）必须放入 utils/constant.js。
注释要求：复杂逻辑和接口调用必须添加清晰的注释。

### 4.3 权限与状态管理
路由权限：在 router/guard.js 中实现路由守卫，根据用户角色过滤无权限页面，防止越权访问。
按钮级权限：封装权限指令（如 v-permission），根据用户角色动态显隐页面内的按钮和操作项。
状态持久化：权限相关状态（用户角色、权限列表）存储在 Pinia 中，并配合本地存储（localStorage）防止页面刷新丢失。

### 4.4 性能与兼容性
路由懒加载：所有页面组件必须使用动态导入（如 component: () => import('@/views/login/Login.vue')）。
错误处理：接口异常必须有明确的消息提示（Message 组件），避免页面白屏；添加全局错误捕获。
浏览器兼容：适配 Chrome、Edge、Firefox 最新版本，避免使用浏览器专属 API。

## 5. 绝对禁止事项 (Never Rules)
严禁 在 Vue 3 项目中使用 Options API（data, methods, mounted 等）。
严禁 在组件中直接硬编码接口地址或状态文本，必须引用 utils/constant.js。
严禁 在 views/ 页面文件中编写过于臃肿的逻辑，复杂业务逻辑需抽离至 utils/ 或 components/business/。
严禁 绕过 Axios 封装直接使用原生 fetch 或 axios 发起请求。
严禁 在样式中使用固定像素导致页面无法适配不同屏幕尺寸。

## 6. 常用开发命令
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 生产环境打包
npm run lint         # 执行 ESLint 代码检查与修复

