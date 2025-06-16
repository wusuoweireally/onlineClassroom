import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/student",
      name: "student",
      component: () => import("../views/StudentView.vue"),
      meta: { requiresAuth: true, role: "student" },
    },
    {
      path: "/teacher",
      name: "teacher",
      component: () => import("../views/TeacherView.vue"),
      meta: { requiresAuth: true, role: "teacher" },
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminView.vue"),
      meta: { requiresAuth: true, role: "admin" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      redirect: "/",
    },
  ],
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next("/login");
      return;
    }

    // 检查角色权限
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      // 根据用户角色重定向到对应页面
      switch (authStore.user?.role) {
        case "student":
          next("/student");
          break;
        case "teacher":
          next("/teacher");
          break;
        case "admin":
          next("/admin");
          break;
        default:
          next("/login");
      }
      return;
    }
  }

  // 已登录用户访问登录页面，重定向到对应的主页
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    switch (authStore.user?.role) {
      case "student":
        next("/student");
        break;
      case "teacher":
        next("/teacher");
        break;
      case "admin":
        next("/admin");
        break;
      default:
        next("/");
    }
    return;
  }

  next();
});
// 路由守卫 在点击登录跳转页面前读初始认证状态
// 处理未匹配的路由
export default router;
