# System Module Refactor Notes

## Current Step

The original `SystemView.vue` was acting as both:

- page entry
- business container
- dialog host
- data state manager
- module switch controller

This has now been split at the first boundary:

- `src/views/system/SystemView.vue`
  - thin page shell
- `src/components/business/system/SystemModuleContent.vue`
  - current business container

This is the first structural step to stop complex business logic from continuing to accumulate inside `views/`.

## New Supporting Files

- `src/types/system-module.ts`
  - shared system module types
- `src/composables/modules/system/useSystemModuleMeta.ts`
  - system module identification and title mapping
- `src/components/business/system/SystemModuleDialogs.vue`
  - reusable system dialogs foundation for the next split step

## Next Refactor Sequence

### Step 1

Move module identity and title logic into composables:

- module key resolution
- module title mapping

### Step 2

Move shared dialog rendering into business components:

- detail dialog
- edit dialog
- delete confirm dialog
- dictionary item dialog

### Step 3

Split module data logic by domain:

- `useSystemUsers`
- `useSystemRoles`
- `useSystemDepts`
- `useSystemRules`
- `useSystemSemantic`
- `useSystemDicts`
- `useSystemLogs`

### Step 4

Split reusable business components:

- `UserTable`
- `RoleTable`
- `DeptTable`
- `RuleTable`
- `SemanticTabs`
- `DictTable`
- `LogTable`

### Step 5

Split API files by business domain:

```text
src/api/system/
├── user.ts
├── role.ts
├── dept.ts
├── rule.ts
├── semantic.ts
├── dict.ts
└── log.ts
```

## Refactor Rule

Further work on system management should follow these rules:

- No new complex logic added to `views/system/*.vue`
- New UI complexity goes to `components/business/system/`
- New state orchestration goes to `composables/modules/system/`
- Shared types go to `types/`
- Shared constants go to `utils/constants/`

## Why This Order

This order is intentionally conservative:

- It reduces risk of breaking the existing mocked management pages
- It creates the correct long-term structure now
- It allows incremental migration rather than a risky full rewrite

## Progress

Completed:

- `useSystemUsers`
- `useSystemRoles`
- `useSystemDepts`
- `useSystemSemantic`
- `useSystemDicts`
- `useSystemRules`
- `useSystemLogs`
- `useSystemModuleDialogs`
- `SystemSemanticTabs`
- `SystemDictsTable`
- `SystemLogsTable`
- `SystemUsersTable`
- `SystemRolesTable`
- `SystemDeptsTable`
- `SystemRulesTable`
- `src/constants/system-module.ts`
- `src/api/modules/system/`
- system module create/edit/reset-password mock actions
- system module delete actions for users/depts/rules/semantic/sql templates

In progress:

- `SystemModuleContent.vue` now consumes composables, business subviews, and shared dialog configuration for all main module domains.
- Remaining work should focus on dictionary item APIs, remaining dialog action granularity, and legacy encoding cleanup in older mock/view files.
