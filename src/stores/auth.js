import { defineStore } from "pinia";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

// 设置axios默认配置
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    initialized: false, // 添加初始化状态标记
  }),

  getters: {
    isStudent: (state) => state.user?.role === "student",
    isTeacher: (state) => state.user?.role === "teacher",
    isAdmin: (state) => state.user?.role === "admin",
    userName: (state) => state.user?.name || "",
    userId: (state) => {
      if (state.user?.role === "student") return state.user.student_id;
      if (state.user?.role === "teacher") return state.user.teacher_id;
      if (state.user?.role === "admin") return state.user.admin_id;
      return null;
    },
  },

  actions: {
    // 初始化 - 从localStorage恢复状态
    async initialize() {
      // 如果已经初始化过，直接返回
      if (this.initialized) {
        return;
      }

      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;

        // 验证token是否仍然有效
        try {
          await this.fetchProfile();
        } catch (error) {
          this.logout();
        }
      }
      
      // 标记已初始化
      this.initialized = true;
    },

    // 学生登录
    async loginStudent(credentials) {
      this.loading = true;
      try {
        const response = await api.post("/api/auth/student/login", credentials);

        if (response.data.success) {
          const { token, user } = response.data.data;
          this.setAuthData(token, user);
          return { success: true };
        } else {
          return { success: false, error: response.data.error };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || "登录失败";
        return { success: false, error: errorMessage };
      } finally {
        this.loading = false;
      }
    },

    // 教师登录
    async loginTeacher(credentials) {
      this.loading = true;
      try {
        const response = await api.post("/api/auth/teacher/login", credentials);

        if (response.data.success) {
          const { token, user } = response.data.data;
          this.setAuthData(token, user);
          return { success: true };
        } else {
          return { success: false, error: response.data.error };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || "登录失败";
        return { success: false, error: errorMessage };
      } finally {
        this.loading = false;
      }
    },

    // 管理员登录
    async loginAdmin(credentials) {
      this.loading = true;
      try {
        const response = await api.post("/api/auth/admin/login", credentials);

        if (response.data.success) {
          const { token, user } = response.data.data;
          this.setAuthData(token, user);
          return { success: true };
        } else {
          return { success: false, error: response.data.error };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || "登录失败";
        return { success: false, error: errorMessage };
      } finally {
        this.loading = false;
      }
    },

    // 退出登录
    async logout() {
      try {
        if (this.token) {
          await api.post("/api/auth/logout");
        }
      } catch (error) {
        console.error("退出登录请求失败:", error);
      } finally {
        this.clearAuthData();
      }
    },

    // 获取用户信息
    async fetchProfile() {
      try {
        const response = await api.get("/api/auth/profile");
        if (response.data.success) {
          this.user = response.data.data;
          localStorage.setItem("user", JSON.stringify(this.user));
        }
      } catch (error) {
        throw error;
      }
    },

    // 刷新token
    async refreshToken() {
      try {
        const response = await api.post("/api/auth/refresh");
        if (response.data.success) {
          const { token } = response.data.data;
          this.token = token;
          localStorage.setItem("token", token);
        }
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    // 设置认证数据
    setAuthData(token, user) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    // 清除认证数据
    clearAuthData() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      this.initialized = false; // 重置初始化状态

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

// 导出api实例供其他地方使用
export { api };
