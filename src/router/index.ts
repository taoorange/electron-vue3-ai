import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { ReaderOutline, DocumentTextOutline, CogOutline, PeopleOutline } from "@vicons/ionicons5";
// Route definitions
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    redirect: "/home",
    children: [
      {
        path: '/home',
        name: 'Home',
        meta: { title: '大模型助手',icon: ReaderOutline },
        component: () => import('@/views/home/index.vue'),
      },
      {
        path: '/jobs/:jobId',
        name: 'JobDetail',
        meta: { title: '任务详情', icon: DocumentTextOutline, hideInMenu: true },
        component: () => import('@/views/job-detail/index.vue'),
      },
      {
        path: '/prompt-studio',
        name: 'PromptStudio',
        meta: { title: 'Prompt设置', icon: CogOutline, hideInMenu: true },
        component: () => import('@/views/prompt-studio/index.vue'),
      },
      {
        path: '/user-admin',
        name: 'UserAdmin',
        meta: { title: '用户管理', icon: PeopleOutline, hideInMenu: true, requiresAdmin: true },
        component: () => import('@/views/user-admin/index.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    meta: { title: '登录' },
    component: () => import('@/views/login/index.vue'),
  },
]

// Use hash history for Electron compatibility (file:// protocol)
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Global guards (scaffold)
router.beforeEach((to, from) => {
  // Example: set page title from meta, add auth checks here
  if (to.meta && typeof to.meta.title === 'string') {
    document.title = to.meta.title
  }
  // 当前版本不做登录校验拦截，允许直接访问业务页面。
  return true
})

router.afterEach((to, from) => {
  // Example: stop progress bar, analytics, etc.
})

export default router
