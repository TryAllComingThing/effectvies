<template>
  <PageContainer :title="moduleTitle">
    <template #actions v-if="activeModule !== 'logs'">
      <el-space>
        <el-button type="primary" v-permission="['admin']" @click="openCreateDialog">新增</el-button>
        <el-button
          type="danger"
          plain
          :disabled="currentSelectionCount === 0"
          v-permission="['admin']"
          @click="confirmDelete()"
        >
          删除
        </el-button>
      </el-space>
    </template>

    <template v-if="activeModule === 'users'">
      <el-form inline :model="userQuery" class="query-row">
        <el-form-item label="账号"><el-input v-model="userQuery.account" clearable /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="userQuery.name" clearable /></el-form-item>
        <el-form-item label="科室"><el-input v-model="userQuery.deptName" clearable /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userQuery.roleName" clearable style="width: 120px">
            <el-option label="系统管理员" value="系统管理员" />
            <el-option label="普通用户" value="普通用户" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userQuery.userStatus" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadUsers">查询</el-button>
          <el-button @click="resetUsers">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="users" size="small" v-loading="usersLoading" @selection-change="onUserSelect">
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="account" label="账号" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="deptName" label="科室" min-width="100" />
        <el-table-column prop="roleName" label="角色" min-width="100" />
        <el-table-column prop="phone" label="电话" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><StatusTag :status="scope.row.userStatus" /></template>
        </el-table-column>
        <el-table-column label="操作" min-width="280" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button text type="primary" size="small" @click="openViewDialog(scope.row)">
                <ActionIcon name="Eye" />查看
              </el-button>
              <el-button text type="primary" size="small" @click="openEditDialog(scope.row)">
                <ActionIcon name="Pencil" />编辑
              </el-button>
              <el-button text type="warning" size="small" @click="confirmResetPassword(scope.row)">
                <ActionIcon name="KeyRound" />重置密码
              </el-button>
              <el-button text type="primary" size="small" @click="toggleUser(scope.row.id)">
                <ActionIcon name="Power" />{{ scope.row.userStatus === 'enabled' ? '停用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="userQuery.pageNum"
          v-model:page-size="userQuery.pageSize"
          :total="userTotal"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="loadUsers"
          @size-change="loadUsers"
        />
      </div>
    </template>

    <template v-else-if="activeModule === 'roles'">
      <el-form inline :model="roleQuery" class="query-row">
        <el-form-item label="角色编码"><el-input v-model="roleQuery.roleCode" clearable /></el-form-item>
        <el-form-item label="角色名称"><el-input v-model="roleQuery.roleName" clearable /></el-form-item>
        <el-form-item label="科室"><el-input v-model="roleQuery.deptName" clearable /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRoles">查询</el-button>
          <el-button @click="resetRoles">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="roles" size="small" v-loading="rolesLoading" @selection-change="onRoleSelect">
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="roleCode" label="角色编码" min-width="120" />
        <el-table-column prop="roleName" label="角色名称" min-width="120" />
        <el-table-column prop="deptName" label="科室" min-width="120" />
        <el-table-column prop="userCount" label="关联人数" width="100" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button text type="primary" size="small" @click="openViewDialog(scope.row)">
                <ActionIcon name="Eye" />查看
              </el-button>
              <el-button text type="primary" size="small" @click="openEditDialog(scope.row)">
                <ActionIcon name="Pencil" />编辑
              </el-button>
              <el-button text type="danger" size="small" @click="confirmDelete(scope.row.id, 'role')">
                <ActionIcon name="Trash2" />删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="roleQuery.pageNum"
          v-model:page-size="roleQuery.pageSize"
          :total="roleTotal"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="loadRoles"
          @size-change="loadRoles"
        />
      </div>
    </template>

    <template v-else-if="activeModule === 'depts'">
      <el-form inline :model="deptQuery" class="query-row">
        <el-form-item label="科室编码"><el-input v-model="deptQuery.code" clearable /></el-form-item>
        <el-form-item label="科室名称"><el-input v-model="deptQuery.name" clearable /></el-form-item>
        <el-form-item label="上级科室">
          <el-select v-model="deptQuery.parentName" clearable style="width: 140px">
            <el-option v-for="item in deptParentOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="deptQuery.status" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadDepts">查询</el-button>
          <el-button @click="resetDepts">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="depts" size="small" v-loading="deptsLoading" @selection-change="onDeptSelect">
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="code" label="科室编码" min-width="120" />
        <el-table-column prop="name" label="科室名称" min-width="130" />
        <el-table-column prop="parentName" label="上级科室" min-width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><StatusTag :status="scope.row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" min-width="280" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button text type="primary" size="small" @click="openDeptCreateChildDialog(scope.row)">
                <ActionIcon name="Plus" />新增下级
              </el-button>
              <el-button text type="primary" size="small" @click="openEditDialog(scope.row)">
                <ActionIcon name="Pencil" />编辑
              </el-button>
              <el-button text type="primary" size="small" @click="toggleDept(scope.row.id)">
                <ActionIcon name="Power" />{{ scope.row.status === 'enabled' ? '停用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="deptQuery.pageNum"
          v-model:page-size="deptQuery.pageSize"
          :total="deptTotal"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="loadDepts"
          @size-change="loadDepts"
        />
      </div>
    </template>

    <template v-else-if="activeModule === 'rules'">
      <el-form inline :model="ruleQuery" class="query-row">
        <el-form-item label="规则名称"><el-input v-model="ruleQuery.name" clearable /></el-form-item>
        <el-form-item label="标签"><el-input v-model="ruleQuery.tag" clearable /></el-form-item>
        <el-form-item label="规则内容"><el-input v-model="ruleQuery.content" clearable /></el-form-item>
        <el-form-item label="科室"><el-input v-model="ruleQuery.deptName" clearable /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="ruleQuery.status" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRules">查询</el-button>
          <el-button @click="resetRules">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="rules" size="small" v-loading="rulesLoading" @selection-change="onRuleSelect">
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="name" label="规则名称" min-width="130" />
        <el-table-column prop="tag" label="标签" width="100" />
        <el-table-column prop="content" label="规则内容" min-width="160" />
        <el-table-column prop="deptName" label="科室" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><StatusTag :status="scope.row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" min-width="240" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button text type="primary" size="small" @click="openViewDialog(scope.row)">
                <ActionIcon name="Eye" />查看
              </el-button>
              <el-button text type="primary" size="small" @click="openEditDialog(scope.row)">
                <ActionIcon name="Pencil" />编辑
              </el-button>
              <el-button text type="primary" size="small" @click="toggleRule(scope.row.id)">
                <ActionIcon name="Power" />{{ scope.row.status === 'enabled' ? '停用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="ruleQuery.pageNum"
          v-model:page-size="ruleQuery.pageSize"
          :total="ruleTotal"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="loadRules"
          @size-change="loadRules"
        />
      </div>
    </template>

    <template v-else-if="activeModule === 'semantic'">
      <el-tabs v-model="semanticTab">
        <el-tab-pane label="业务语义定义" name="biz">
          <el-form inline :model="semanticQuery" class="query-row">
            <el-form-item label="语义名称"><el-input v-model="semanticQuery.name" clearable /></el-form-item>
            <el-form-item label="关键词"><el-input v-model="semanticQuery.keyword" clearable /></el-form-item>
            <el-form-item label="科室"><el-input v-model="semanticQuery.deptName" clearable /></el-form-item>
            <el-form-item label="状态">
              <el-select v-model="semanticQuery.status" clearable style="width: 120px">
                <el-option label="启用" value="enabled" />
                <el-option label="停用" value="disabled" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadSemantics">查询</el-button>
              <el-button @click="resetSemantics">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="semantics" size="small" v-loading="semanticsLoading" @selection-change="onSemanticSelect">
            <el-table-column type="selection" width="45" />
            <el-table-column type="index" width="56" label="#" />
            <el-table-column prop="code" label="语义编码" min-width="120" />
            <el-table-column prop="name" label="语义名称" min-width="130" />
            <el-table-column prop="keyword" label="关键词" min-width="120" />
            <el-table-column prop="deptName" label="科室" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="scope"><StatusTag :status="scope.row.status" /></template>
            </el-table-column>
            <el-table-column label="操作" min-width="220" fixed="right">
              <template #default="scope">
                <el-space>
                  <el-button text type="primary" size="small" @click="openEditDialog(scope.row)">
                    <ActionIcon name="Pencil" />编辑
                  </el-button>
                  <el-button text type="primary" size="small" @click="toggleSemantic(scope.row.id)">
                    <ActionIcon name="Power" />{{ scope.row.status === 'enabled' ? '停用' : '启用' }}
                  </el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
          <div class="pager">
            <el-pagination
              v-model:current-page="semanticQuery.pageNum"
              v-model:page-size="semanticQuery.pageSize"
              :total="semanticTotal"
              layout="total, sizes, prev, pager, next"
              :page-sizes="[10, 20, 50]"
              @current-change="loadSemantics"
              @size-change="loadSemantics"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="SQL 模板定义" name="sql">
          <el-form inline :model="sqlQuery" class="query-row">
            <el-form-item label="模板编码"><el-input v-model="sqlQuery.code" clearable /></el-form-item>
            <el-form-item label="模板名称"><el-input v-model="sqlQuery.name" clearable /></el-form-item>
            <el-form-item label="SQL 摘要"><el-input v-model="sqlQuery.sqlBrief" clearable /></el-form-item>
            <el-form-item label="科室"><el-input v-model="sqlQuery.deptName" clearable /></el-form-item>
            <el-form-item label="状态">
              <el-select v-model="sqlQuery.status" clearable style="width: 120px">
                <el-option label="启用" value="enabled" />
                <el-option label="停用" value="disabled" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadSqlTemplates">查询</el-button>
              <el-button @click="resetSqlTemplates">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="sqlTemplates" size="small" v-loading="sqlLoading" @selection-change="onSqlSelect">
            <el-table-column type="selection" width="45" />
            <el-table-column type="index" width="56" label="#" />
            <el-table-column prop="code" label="模板编码" min-width="120" />
            <el-table-column prop="name" label="模板名称" min-width="130" />
            <el-table-column prop="sqlBrief" label="SQL 摘要" min-width="180" />
            <el-table-column prop="deptName" label="科室" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="scope"><StatusTag :status="scope.row.status" /></template>
            </el-table-column>
            <el-table-column label="操作" min-width="260" fixed="right">
              <template #default="scope">
                <el-space>
                  <el-button text type="primary" size="small" @click="openEditDialog(scope.row)">
                    <ActionIcon name="Pencil" />编辑
                  </el-button>
                  <el-button text type="success" size="small" @click="testSql(scope.row)">测试 SQL</el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
          <div class="pager">
            <el-pagination
              v-model:current-page="sqlQuery.pageNum"
              v-model:page-size="sqlQuery.pageSize"
              :total="sqlTotal"
              layout="total, sizes, prev, pager, next"
              :page-sizes="[10, 20, 50]"
              @current-change="loadSqlTemplates"
              @size-change="loadSqlTemplates"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>

    <template v-else-if="activeModule === 'dicts'">
      <el-form inline :model="dictQuery" class="query-row">
        <el-form-item label="字典类型"><el-input v-model="dictQuery.dictType" clearable /></el-form-item>
        <el-form-item label="字典名称"><el-input v-model="dictQuery.dictLabel" clearable /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="dictQuery.status" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadDicts">查询</el-button>
          <el-button @click="resetDicts">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="dicts" size="small" v-loading="dictsLoading" @selection-change="onDictSelect">
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="dictType" label="字典类型" min-width="180" />
        <el-table-column prop="dictLabel" label="字典名称" min-width="220" />
        <el-table-column prop="dictValue" label="字典值" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><StatusTag :status="scope.row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" min-width="300" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button text type="primary" size="small" @click="openEditDialog(scope.row)">
                <ActionIcon name="Pencil" />编辑
              </el-button>
              <el-button text type="primary" size="small" @click="openDictData(scope.row)">
                <ActionIcon name="List" />查看
              </el-button>
              <el-button text type="primary" size="small" @click="toggleDict(scope.row.id)">
                <ActionIcon name="Power" />{{ scope.row.status === 'enabled' ? '停用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="dictQuery.pageNum"
          v-model:page-size="dictQuery.pageSize"
          :total="dictTotal"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="loadDicts"
          @size-change="loadDicts"
        />
      </div>
    </template>

    <template v-else-if="activeModule === 'logs'">
      <el-form inline :model="logQueryForm" class="query-row">
        <el-form-item label="操作人"><el-input v-model="logQueryForm.operator" clearable /></el-form-item>
        <el-form-item label="模块"><el-input v-model="logQueryForm.module" clearable /></el-form-item>
        <el-form-item label="科室"><el-input v-model="logQueryForm.deptName" clearable /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="logType" clearable style="width: 140px">
            <el-option label="全部" value="all" />
            <el-option label="登录日志" value="login" />
            <el-option label="操作日志" value="operation" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadLogs">查询</el-button>
          <el-button @click="resetLogs">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="logs" size="small" v-loading="logsLoading" @selection-change="onLogSelect">
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="logType" label="类型" width="90" />
        <el-table-column prop="module" label="模块" min-width="120" />
        <el-table-column prop="operator" label="操作人" min-width="100" />
        <el-table-column prop="deptName" label="科室" min-width="100" />
        <el-table-column prop="ip" label="IP" min-width="120" />
        <el-table-column prop="content" label="描述" min-width="180" />
        <el-table-column prop="createdAt" label="时间" min-width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default>
            <el-button text type="danger" size="small" @click="confirmDelete()">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="logQuery.pageNum"
          v-model:page-size="logQuery.pageSize"
          :total="logTotal"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="loadLogs"
          @size-change="loadLogs"
        />
      </div>
    </template>

    <el-dialog v-model="viewVisible" :title="`${moduleTitle}详情`" width="560px">
      <el-descriptions :column="1" border>
        <el-descriptions-item v-for="item in viewData" :key="item.label" :label="item.label">
          {{ item.value }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" :title="editMode === 'create' ? `新增${moduleTitle}` : `编辑${moduleTitle}`" width="620px">
      <el-form :model="editForm" label-width="96px">
        <el-form-item v-for="field in editFields" :key="field.key" :label="field.label">
          <el-select v-if="field.type === 'select'" v-model="editForm[field.key]" style="width: 100%">
            <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
          <el-input v-else v-model="editForm[field.key]" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteVisible" title="删除确认" width="420px">
      <div>确认删除当前记录吗？</div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="primary" @click="runDelete">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dictDataVisible" :title="`字典条目 - ${dictDataTitle}`" width="86%" class="dict-data-dialog">
      <template #header>
        <div class="dict-data-head">
          <span>字典条目 - {{ dictDataTitle }}</span>
          <el-space>
            <el-button type="primary" @click="openDictDataCreate"><ActionIcon name="Plus" />新增条目</el-button>
            <el-button type="danger" plain @click="confirmDelete()">删除</el-button>
          </el-space>
        </div>
      </template>
      <el-table :data="dictDataRows" size="small" class="dict-data-table">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="dictCode" label="字典编码" width="120" />
        <el-table-column prop="dictLabel" label="字典标签" min-width="140" />
        <el-table-column prop="dictValue" label="字典值" width="120" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><StatusTag :status="scope.row.status" /></template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button text type="primary" size="small" @click="openDictDataEdit(scope.row)">
                <ActionIcon name="Pencil" />编辑
              </el-button>
              <el-button text type="danger" size="small" @click="confirmDelete()">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager dict-data-pager">
        <el-pagination :total="dictDataRows.length" layout="total, sizes, prev, pager, next" :page-sizes="[10, 20, 50]" />
      </div>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import ActionIcon from '@/components/common/ActionIcon.vue';
import {
  batchDeleteLogs,
  createDict,
  deleteDict,
  deleteRole,
  getDictList,
  getLogList,
  getRoleList,
  getUserList,
  toggleDictStatus,
  toggleUserStatus,
  updateDict,
  type DictItem,
  type LogItem,
  type RoleItem,
  type UserItem,
} from '@/api/system';
import {
  getDeptList,
  getRuleList,
  getSemanticList,
  getSqlTemplateList,
  testSqlTemplate,
  toggleDeptStatus,
  toggleRuleStatus,
  toggleSemanticStatus,
  type DeptItem,
  type RuleItem,
  type SemanticItem,
  type SqlTemplateItem,
} from '@/api/system-advanced';

type EditField = {
  key: string;
  label: string;
  type?: 'input' | 'select';
  options?: Array<{ label: string; value: string }>;
};

type DictDataRow = {
  id: string;
  dictCode: string;
  dictLabel: string;
  dictValue: string;
  sort: number;
  status: 'enabled' | 'disabled';
  remark: string;
  createdAt: string;
};

const route = useRoute();
const semanticTab = ref<'biz' | 'sql'>('biz');

const activeModule = computed(() => {
  if (route.path.includes('/system/users')) return 'users';
  if (route.path.includes('/system/depts')) return 'depts';
  if (route.path.includes('/system/roles')) return 'roles';
  if (route.path.includes('/system/rules')) return 'rules';
  if (route.path.includes('/system/semantic')) return 'semantic';
  if (route.path.includes('/system/dicts')) return 'dicts';
  if (route.path.includes('/system/logs')) return 'logs';
  return 'users';
});

const moduleTitle = computed(
  () =>
    ({
      users: '用户管理',
      roles: '角色管理',
      depts: '科室管理',
      rules: '规则管理',
      semantic: '语义管理',
      dicts: '字典管理',
      logs: '日志管理',
    } as Record<string, string>)[activeModule.value]
);

const selectedUserIds = ref<string[]>([]);
const selectedRoleIds = ref<string[]>([]);
const selectedDeptIds = ref<string[]>([]);
const selectedRuleIds = ref<string[]>([]);
const selectedSemanticIds = ref<string[]>([]);
const selectedSqlIds = ref<string[]>([]);
const selectedDictIds = ref<string[]>([]);
const selectedLogIds = ref<string[]>([]);

const currentSelectionCount = computed(() => {
  const countMap: Record<string, number> = {
    users: selectedUserIds.value.length,
    roles: selectedRoleIds.value.length,
    depts: selectedDeptIds.value.length,
    rules: selectedRuleIds.value.length,
    semantic: semanticTab.value === 'biz' ? selectedSemanticIds.value.length : selectedSqlIds.value.length,
    dicts: selectedDictIds.value.length,
    logs: selectedLogIds.value.length,
  };
  return countMap[activeModule.value] || 0;
});

const usersLoading = ref(false);
const users = ref<UserItem[]>([]);
const userTotal = ref(0);
const userQuery = reactive({ pageNum: 1, pageSize: 10, account: '', name: '', deptName: '', roleName: '', userStatus: '' });

const rolesLoading = ref(false);
const roles = ref<RoleItem[]>([]);
const roleTotal = ref(0);
const roleQuery = reactive({ pageNum: 1, pageSize: 10, roleCode: '', roleName: '', deptName: '' });

const deptsLoading = ref(false);
const depts = ref<DeptItem[]>([]);
const deptTotal = ref(0);
const deptQuery = reactive({ pageNum: 1, pageSize: 10, code: '', name: '', parentName: '', status: '' });
const deptParentOptions = computed(() => Array.from(new Set(depts.value.map((item) => item.name).filter(Boolean))));

const rulesLoading = ref(false);
const rules = ref<RuleItem[]>([]);
const ruleTotal = ref(0);
const ruleQuery = reactive({ pageNum: 1, pageSize: 10, name: '', tag: '', content: '', deptName: '', status: '' });

const semanticsLoading = ref(false);
const semantics = ref<SemanticItem[]>([]);
const semanticTotal = ref(0);
const semanticQuery = reactive({ pageNum: 1, pageSize: 10, name: '', keyword: '', deptName: '', status: '' });

const sqlLoading = ref(false);
const sqlTemplates = ref<SqlTemplateItem[]>([]);
const sqlTotal = ref(0);
const sqlQuery = reactive({ pageNum: 1, pageSize: 10, code: '', name: '', sqlBrief: '', deptName: '', status: '' });

const dictsLoading = ref(false);
const dicts = ref<DictItem[]>([]);
const dictTotal = ref(0);
const dictQuery = reactive({ pageNum: 1, pageSize: 10, dictType: '', dictLabel: '', status: '' });

const logsLoading = ref(false);
const logs = ref<LogItem[]>([]);
const logTotal = ref(0);
const logQuery = reactive({ pageNum: 1, pageSize: 10 });
const logQueryForm = reactive({ operator: '', module: '', deptName: '' });
const logType = ref<'all' | 'login' | 'operation'>('all');

const viewVisible = ref(false);
const editVisible = ref(false);
const deleteVisible = ref(false);
const editMode = ref<'create' | 'edit'>('create');
const viewData = ref<Array<{ label: string; value: string }>>([]);
const editForm = reactive<Record<string, string>>({});
const editFields = ref<EditField[]>([]);
const deleteTarget = ref<{ id?: string; type?: 'role' }>({});

const dictDataVisible = ref(false);
const dictDataTitle = ref('');
const dictDataRows = ref<DictDataRow[]>([]);

const dictDataMap: Record<string, DictDataRow[]> = {
  route: [
    {
      id: 'r1',
      dictCode: '1',
      dictLabel: '一号线',
      dictValue: 'line_1',
      sort: 1,
      status: 'enabled',
      remark: '线路字典',
      createdAt: '2026-01-18 10:58:21',
    },
    {
      id: 'r2',
      dictCode: '2',
      dictLabel: '二号线',
      dictValue: 'line_2',
      sort: 2,
      status: 'enabled',
      remark: '线路字典',
      createdAt: '2026-01-18 10:58:21',
    },
  ],
  type: [
    {
      id: 't1',
      dictCode: '1',
      dictLabel: '通知',
      dictValue: 'notice',
      sort: 1,
      status: 'enabled',
      remark: '消息类型',
      createdAt: '2026-01-18 10:58:21',
    },
    {
      id: 't2',
      dictCode: '2',
      dictLabel: '预警',
      dictValue: 'warning',
      sort: 2,
      status: 'enabled',
      remark: '消息类型',
      createdAt: '2026-01-18 10:58:21',
    },
    {
      id: 't3',
      dictCode: '3',
      dictLabel: '审批',
      dictValue: 'approval',
      sort: 3,
      status: 'enabled',
      remark: '消息类型',
      createdAt: '2026-01-18 10:58:21',
    },
  ],
};

const FIELD_LABELS: Record<string, string> = {
  id: '编号',
  account: '账号',
  name: '名称',
  roleName: '角色',
  roleCode: '角色编码',
  deptName: '科室',
  phone: '电话',
  lastLoginAt: '最后登录时间',
  userStatus: '用户状态',
  status: '状态',
  code: '编码',
  parentName: '上级科室',
  sort: '排序',
  tag: '标签',
  content: '内容',
  dictType: '字典类型',
  dictLabel: '字典标签',
  dictValue: '字典值',
  keyword: '关键词',
  sqlBrief: 'SQL 摘要',
  module: '模块',
  operator: '操作人',
  ip: 'IP',
  createdAt: '创建时间',
  userCount: '关联人数',
};

const BASE_STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

const getSemanticEditFields = (): EditField[] =>
  semanticTab.value === 'biz'
    ? [
        { key: 'code', label: '语义编码' },
        { key: 'name', label: '语义名称' },
        { key: 'keyword', label: '关键词' },
        { key: 'deptName', label: '科室' },
        { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
      ]
    : [
        { key: 'code', label: '模板编码' },
        { key: 'name', label: '模板名称' },
        { key: 'sqlBrief', label: 'SQL 摘要' },
        { key: 'deptName', label: '科室' },
        { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
      ];

const MODULE_EDIT_FIELDS: Record<string, EditField[]> = {
  users: [
    { key: 'account', label: '账号' },
    { key: 'name', label: '姓名' },
    { key: 'deptName', label: '科室' },
    { key: 'roleName', label: '角色' },
    { key: 'phone', label: '电话' },
    { key: 'userStatus', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
  ],
  roles: [
    { key: 'roleCode', label: '角色编码' },
    { key: 'roleName', label: '角色名称' },
    { key: 'deptName', label: '科室' },
  ],
  depts: [
    { key: 'code', label: '科室编码' },
    { key: 'name', label: '科室名称' },
    { key: 'parentName', label: '上级科室' },
    { key: 'sort', label: '排序' },
    { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
  ],
  rules: [
    { key: 'name', label: '规则名称' },
    { key: 'tag', label: '标签' },
    { key: 'content', label: '规则内容' },
    { key: 'deptName', label: '科室' },
    { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
  ],
  dicts: [
    { key: 'dictType', label: '字典类型' },
    { key: 'dictLabel', label: '字典标签' },
    { key: 'dictValue', label: '字典值' },
    { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
    { key: 'remark', label: '备注' },
  ],
  logs: [
    { key: 'logType', label: '类型' },
    { key: 'module', label: '模块' },
    { key: 'deptName', label: '科室' },
    { key: 'ip', label: 'IP' },
    { key: 'content', label: '描述' },
  ],
};

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
  Object.assign(userQuery, { pageNum: 1, pageSize: 10, account: '', name: '', deptName: '', roleName: '', userStatus: '' });
  loadUsers();
};

const toggleUser = async (id: string) => {
  const response = await toggleUserStatus(id);
  if (response.code === 0) {
    ElMessage.success('用户状态已更新');
    loadUsers();
  }
};

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
  Object.assign(roleQuery, { pageNum: 1, pageSize: 10, roleCode: '', roleName: '', deptName: '' });
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
  Object.assign(deptQuery, { pageNum: 1, pageSize: 10, code: '', name: '', parentName: '', status: '' });
  loadDepts();
};

const toggleDept = async (id: string) => {
  const response = await toggleDeptStatus(id);
  if (response.code === 0) {
    ElMessage.success('科室状态已更新');
    loadDepts();
  }
};

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
  Object.assign(ruleQuery, { pageNum: 1, pageSize: 10, name: '', tag: '', content: '', deptName: '', status: '' });
  loadRules();
};

const toggleRule = async (id: string) => {
  const response = await toggleRuleStatus(id);
  if (response.code === 0) {
    ElMessage.success('规则状态已更新');
    loadRules();
  }
};

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
  Object.assign(semanticQuery, { pageNum: 1, pageSize: 10, name: '', keyword: '', deptName: '', status: '' });
  loadSemantics();
};

const toggleSemantic = async (id: string) => {
  const response = await toggleSemanticStatus(id);
  if (response.code === 0) {
    ElMessage.success('语义状态已更新');
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
  Object.assign(sqlQuery, { pageNum: 1, pageSize: 10, code: '', name: '', sqlBrief: '', deptName: '', status: '' });
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
  Object.assign(dictQuery, { pageNum: 1, pageSize: 10, dictType: '', dictLabel: '', status: '' });
  loadDicts();
};

const toggleDict = async (id: string) => {
  const response = await toggleDictStatus(id);
  if (response.code === 0) {
    ElMessage.success('字典状态已更新');
    loadDicts();
  }
};

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
  Object.assign(logQuery, { pageNum: 1, pageSize: 10 });
  Object.assign(logQueryForm, { operator: '', module: '', deptName: '' });
  logType.value = 'all';
  loadLogs();
};

const openViewDialog = (row: Record<string, unknown>) => {
  const rowData = Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => !(activeModule.value === 'rules' && key === 'code'))
      .map(([key, value]) => [key, value === 'disabled' ? '停用' : value === 'enabled' ? '启用' : value])
  );

  viewData.value = Object.entries(rowData)
    .slice(0, 10)
    .map(([key, value]) => ({ label: FIELD_LABELS[key] || key, value: String(value ?? '') }));
  viewVisible.value = true;
};

const openEditDialog = (row: Record<string, unknown>) => {
  editMode.value = 'edit';
  editFields.value = activeModule.value === 'semantic' ? getSemanticEditFields() : MODULE_EDIT_FIELDS[activeModule.value] || [{ key: 'name', label: '名称' }];
  editFields.value.forEach((field) => {
    editForm[field.key] = String(row[field.key] ?? '');
  });
  editVisible.value = true;
};

const openCreateDialog = () => {
  editMode.value = 'create';
  editFields.value = activeModule.value === 'semantic' ? getSemanticEditFields() : MODULE_EDIT_FIELDS[activeModule.value] || [{ key: 'name', label: '名称' }];

  if (activeModule.value === 'depts') {
    editFields.value = [
      { key: 'code', label: '科室编码' },
      { key: 'name', label: '科室名称' },
      { key: 'parentName', label: '上级科室', type: 'select', options: deptParentOptions.value.map((item) => ({ label: item, value: item })) },
      { key: 'sort', label: '排序' },
      { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
    ];
  }

  Object.keys(editForm).forEach((key) => {
    editForm[key] = '';
  });
  editFields.value.forEach((field) => {
    editForm[field.key] = '';
  });
  editVisible.value = true;
};

const openDeptCreateChildDialog = (row: Record<string, unknown>) => {
  editMode.value = 'create';
  editFields.value = [
    { key: 'code', label: '科室编码' },
    { key: 'name', label: '科室名称' },
    { key: 'sort', label: '排序' },
    { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
  ];
  editFields.value.forEach((field) => {
    editForm[field.key] = '';
  });
  editForm.parentName = String(row.name ?? '');
  editVisible.value = true;
};

const submitEdit = async () => {
  if (activeModule.value === 'dicts') {
    const payload = {
      dictType: editForm.dictType || '',
      dictLabel: editForm.dictLabel || '',
      dictValue: editForm.dictValue || '',
      status: (editForm.status as 'enabled' | 'disabled') || 'enabled',
      remark: editForm.remark || '',
    };

    if (editMode.value === 'create') {
      await createDict(payload);
      ElMessage.success('新增成功');
    } else if (editForm.id) {
      await updateDict(editForm.id, payload);
      ElMessage.success('保存成功');
    } else {
      ElMessage.success('保存成功');
    }

    editVisible.value = false;
    loadDicts();
    return;
  }

  ElMessage.success(editMode.value === 'create' ? '新增成功（模拟）' : '保存成功（模拟）');
  editVisible.value = false;
};

const confirmDelete = (id?: string, type?: 'role') => {
  deleteTarget.value = { id, type };
  deleteVisible.value = true;
};

const runDelete = async () => {
  deleteVisible.value = false;

  if (deleteTarget.value.type === 'role' && deleteTarget.value.id) {
    await removeRole(deleteTarget.value.id);
    deleteTarget.value = {};
    return;
  }

  if (activeModule.value === 'dicts' && editForm.id) {
    await deleteDict(editForm.id);
    ElMessage.success('删除成功');
    loadDicts();
    return;
  }

  if (activeModule.value === 'logs' && selectedLogIds.value.length) {
    await batchDeleteLogs(selectedLogIds.value);
    ElMessage.success('日志已删除');
    loadLogs();
    return;
  }

  ElMessage.success('删除成功（模拟）');
};

const confirmResetPassword = async (row: Record<string, unknown>) => {
  try {
    await ElMessageBox.confirm(`确认重置 ${String(row.name || row.account || '该用户')} 的密码吗？`, '重置密码确认', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    });
    ElMessage.success('密码重置成功（模拟）');
  } catch {
    // cancel
  }
};

const openDictData = (row: Record<string, unknown>) => {
  dictDataTitle.value = String(row.dictLabel || row.dictType || '字典');
  const key = String(row.dictType || 'type');
  dictDataRows.value = (dictDataMap[key] || [
    {
      id: 'd1',
      dictCode: '1',
      dictLabel: '默认项 A',
      dictValue: 'A',
      sort: 1,
      status: 'enabled',
      remark: '默认字典项',
      createdAt: '2026-01-18 10:58:21',
    },
    {
      id: 'd2',
      dictCode: '2',
      dictLabel: '默认项 B',
      dictValue: 'B',
      sort: 2,
      status: 'enabled',
      remark: '默认字典项',
      createdAt: '2026-01-18 10:58:21',
    },
  ]).map((item) => ({ ...item }));
  dictDataVisible.value = true;
};

const openDictDataCreate = () => {
  editMode.value = 'create';
  editFields.value = [
    { key: 'dictCode', label: '字典编码' },
    { key: 'dictLabel', label: '字典标签' },
    { key: 'dictValue', label: '字典值' },
    { key: 'sort', label: '排序' },
    { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
    { key: 'remark', label: '备注' },
  ];
  editFields.value.forEach((field) => {
    editForm[field.key] = '';
  });
  editVisible.value = true;
};

const openDictDataEdit = (row: Record<string, unknown>) => {
  editMode.value = 'edit';
  editFields.value = [
    { key: 'dictCode', label: '字典编码' },
    { key: 'dictLabel', label: '字典标签' },
    { key: 'dictValue', label: '字典值' },
    { key: 'sort', label: '排序' },
    { key: 'status', label: '状态', type: 'select', options: BASE_STATUS_OPTIONS },
    { key: 'remark', label: '备注' },
  ];
  editFields.value.forEach((field) => {
    editForm[field.key] = String(row[field.key] ?? '');
  });
  editVisible.value = true;
};

const onUserSelect = (items: UserItem[]) => {
  selectedUserIds.value = items.map((item) => item.id);
};

const onRoleSelect = (items: RoleItem[]) => {
  selectedRoleIds.value = items.map((item) => item.id);
};

const onDeptSelect = (items: DeptItem[]) => {
  selectedDeptIds.value = items.map((item) => item.id);
};

const onRuleSelect = (items: RuleItem[]) => {
  selectedRuleIds.value = items.map((item) => item.id);
};

const onSemanticSelect = (items: SemanticItem[]) => {
  selectedSemanticIds.value = items.map((item) => item.id);
};

const onSqlSelect = (items: SqlTemplateItem[]) => {
  selectedSqlIds.value = items.map((item) => item.id);
};

const onDictSelect = (items: DictItem[]) => {
  selectedDictIds.value = items.map((item) => item.id);
};

const onLogSelect = (items: LogItem[]) => {
  selectedLogIds.value = items.map((item) => item.id);
};

const loadByModule = (module: string) => {
  if (module === 'users') loadUsers();
  if (module === 'roles') loadRoles();
  if (module === 'depts') loadDepts();
  if (module === 'rules') loadRules();
  if (module === 'semantic') {
    loadSemantics();
    loadSqlTemplates();
  }
  if (module === 'dicts') loadDicts();
  if (module === 'logs') loadLogs();
};

watch(
  activeModule,
  (module) => {
    loadByModule(module);
  },
  { immediate: true }
);
</script>

<style scoped>
.query-row {
  margin-bottom: 0.7rem;
}

.pager {
  margin-top: 0.8rem;
  display: flex;
  justify-content: flex-end;
}

.query-row :deep(.el-input) {
  min-width: 88px;
}

.dict-data-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.dict-data-dialog :deep(.el-dialog) {
  overflow: hidden;
}

.dict-data-dialog :deep(.el-dialog__header) {
  padding: 14px 16px;
  border-bottom: 1px solid #eef1f6;
  background: #fafcff;
}

.dict-data-dialog :deep(.el-dialog__body) {
  padding: 12px 16px 14px;
}

.dict-data-dialog :deep(.el-button) {
  height: 30px;
  font-size: 13px;
  padding: 0 12px;
  font-weight: 400;
}

.dict-data-table :deep(.el-table__header th) {
  font-size: 13px;
  color: #4b5565;
  background: #f8faff;
}

.dict-data-table :deep(.el-table__row td) {
  font-size: 13px;
}

.dict-data-pager {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}
</style>
