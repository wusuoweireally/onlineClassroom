<template>
  <div class="teacher-view">
    <div class="header">
      <div class="header-content">
        <div class="title-section">
          <h1>教师管理系统</h1>
          <p>查看学生提问情况并进行AI智能分类</p>
        </div>
        <div class="user-section">
          <div class="user-info">
            <span class="user-name">{{ userInfo.name }}</span>
            <span class="user-role">教师</span>
          </div>
          <button @click="logout" class="btn btn-logout">
            <i class="logout-icon">🚪</i>
            退出登录
          </button>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">{{ totalQuestions }}</div>
          <div class="stat-label">总问题数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ categorizedQuestions }}</div>
          <div class="stat-label">已分类</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ uncategorizedQuestions }}</div>
          <div class="stat-label">待分类</div>
        </div>
      </div>

      <div class="actions">
        <div class="ai-options">
          <label class="ai-mode-label">
            <input
              type="checkbox"
              v-model="useDeepSeek"
              @change="checkDeepSeekStatus"
            />
            使用 DeepSeek AI
            <span
              class="status-indicator"
              :class="deepSeekStatus.status"
              :title="deepSeekStatus.message"
            ></span>
          </label>
        </div>
        <button
          @click="classifyQuestions"
          :disabled="isClassifying || uncategorizedQuestions === 0"
          class="btn btn-primary"
        >
          {{
            isClassifying
              ? "AI分类中..."
              : useDeepSeek
              ? "DeepSeek AI分类"
              : "关键词分类"
          }}
        </button>
        <button @click="refreshData" class="btn btn-secondary">刷新数据</button>
        <button @click="checkDeepSeekStatus" class="btn btn-info">
          检查AI状态
        </button>
      </div>
    </div>

    <!-- 分类统计图表 -->
    <div v-if="categoryStats.length > 0" class="category-stats">
      <h3>问题分类统计</h3>
      <div class="stats-grid">
        <div
          v-for="stat in categoryStats"
          :key="stat.category"
          class="stat-card"
        >
          <div class="stat-category">{{ stat.category }}</div>
          <div class="stat-count">{{ stat.count }}个</div>
          <div class="stat-bar">
            <div
              class="stat-fill"
              :style="{ width: (stat.count / maxCategoryCount) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选选项 -->
    <div class="filters">
      <div class="filter-group">
        <label>按分类筛选：</label>
        <select v-model="selectedCategory" class="form-control">
          <option value="">全部分类</option>
          <option
            v-for="category in uniqueCategories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>按学生筛选：</label>
        <select v-model="selectedStudent" class="form-control">
          <option value="">全部学生</option>
          <option
            v-for="student in uniqueStudents"
            :key="student"
            :value="student"
          >
            {{ student }}
          </option>
        </select>
      </div>
    </div>

    <!-- 问题列表 -->
    <div class="questions-section">
      <h3>学生问题列表 ({{ filteredQuestions.length }}个)</h3>

      <div v-if="filteredQuestions.length === 0" class="no-data">
        <p>暂无问题数据</p>
      </div>

      <div v-else class="questions-list">
        <div
          v-for="question in filteredQuestions"
          :key="question.id"
          class="question-card"
          :class="{ uncategorized: !question.category }"
        >
          <div class="question-header">
            <div class="student-info">
              <span class="student-id">{{ question.student_id }}</span>
              <span class="student-name">{{ question.student_name }}</span>
            </div>
            <div class="question-meta">
              <span class="question-time">{{
                formatTime(question.created_at)
              }}</span>
              <span
                v-if="question.category"
                class="question-category"
                :class="getCategoryClass(question.category)"
              >
                {{ question.category }}
              </span>
              <span v-else class="question-category uncategorized">
                待分类
              </span>
            </div>
          </div>

          <div class="question-content">
            {{ question.content }}
          </div>

          <div class="question-actions">
            <button class="btn-small btn-info">回复</button>
            <button class="btn-small btn-warning">标记重要</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from "@/stores/auth.js";
import { useAuthStore } from "@/stores/auth.js";
import { ElMessage, ElMessageBox } from "element-plus";

const API_BASE = "http://localhost:3001/api";

export default {
  name: "TeacherView",
  data() {
    return {
      questions: [],
      categoryStats: [],
      isClassifying: false,
      selectedCategory: "",
      selectedStudent: "",
      useDeepSeek: true,
      deepSeekStatus: {
        status: "unknown",
        message: "未检查",
        model: "deepseek-chat",
      },
    };
  },
  computed: {
    totalQuestions() {
      return this.questions.length;
    },
    categorizedQuestions() {
      return this.questions.filter((q) => q.category && q.category.trim())
        .length;
    },
    uncategorizedQuestions() {
      return this.questions.filter((q) => !q.category || !q.category.trim())
        .length;
    },
    maxCategoryCount() {
      return Math.max(...this.categoryStats.map((s) => s.count), 1);
    },
    uniqueCategories() {
      const categories = this.questions
        .filter((q) => q.category && q.category.trim())
        .map((q) => q.category);
      return [...new Set(categories)].sort();
    },
    uniqueStudents() {
      const students = this.questions.map(
        (q) => `${q.student_id} - ${q.student_name}`
      );
      return [...new Set(students)].sort();
    },
    userInfo() {
      const authStore = useAuthStore();
      return authStore.user || { name: "教师" };
    },
    filteredQuestions() {
      let filtered = this.questions;

      if (this.selectedCategory) {
        filtered = filtered.filter((q) => q.category === this.selectedCategory);
      }

      if (this.selectedStudent) {
        const studentId = this.selectedStudent.split(" - ")[0];
        filtered = filtered.filter((q) => q.student_id === studentId);
      }

      return filtered.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    },
  },
  async mounted() {
    await this.loadData();
    // 静默检查AI状态，不显示通知
    await this.checkDeepSeekStatus(true);
  },
  methods: {
    async loadData() {
      await Promise.all([this.loadQuestions(), this.loadCategoryStats()]);
    },

    async loadQuestions() {
      try {
        const response = await api.get("/api/questions");
        if (response.data.success) {
          this.questions = response.data.data;
        }
      } catch (error) {
        console.error("加载问题列表失败:", error);
        ElMessage.error("加载问题列表失败，请检查登录状态");
      }
    },

    async loadCategoryStats() {
      try {
        const response = await api.get("/api/questions/stats");
        if (response.data.success) {
          this.categoryStats = response.data.data;
        }
      } catch (error) {
        console.error("加载分类统计失败:", error);
      }
    },

    async checkDeepSeekStatus(silent = false) {
      try {
        const response = await api.get("/api/deepseek/status");
        if (response.data.success) {
          this.deepSeekStatus = response.data.data;
          // 如果 DeepSeek 不可用，自动切换到关键词模式
          if (this.deepSeekStatus.status === "error") {
            this.useDeepSeek = false;
            if (!silent) {
              ElMessage.warning(
                "DeepSeek API 当前不可用，已自动切换到关键词分类模式"
              );
            }
          } else {
            if (!silent) {
              ElMessage.success(
                `AI状态检查成功：${
                  this.deepSeekStatus.message || "DeepSeek API 正常运行"
                }`
              );
            }
          }
        } else {
          this.deepSeekStatus = {
            status: "error",
            message: response.data.error || "检查状态失败",
            model: "deepseek-chat",
          };
          this.useDeepSeek = false;
          if (!silent) {
            ElMessage.error(
              `AI状态检查失败：${response.data.error || "未知错误"}`
            );
          }
        }
      } catch (error) {
        console.error("检查 DeepSeek 状态失败:", error);
        this.deepSeekStatus = {
          status: "error",
          message: "无法连接到 DeepSeek API",
          model: "deepseek-chat",
        };
        this.useDeepSeek = false;
        if (!silent) {
          ElMessage.error("无法检查AI状态，请检查网络连接或服务器状态");
        }
      }
    },

    async classifyQuestions() {
      if (this.uncategorizedQuestions === 0) return;

      this.isClassifying = true;
      try {
        const response = await api.post("/api/questions/classify", {
          useDeepSeek: this.useDeepSeek,
        });
        if (response.data.success) {
          ElMessage.success(
            `AI分类完成！成功分类了 ${response.data.data.length} 个问题`
          );
          await this.loadData();
        }
      } catch (error) {
        console.error("AI分类失败:", error);
        ElMessage.error("AI分类失败，请重试");
      } finally {
        this.isClassifying = false;
      }
    },

    async refreshData() {
      await this.loadData();
    },

    formatTime(timeString) {
      const date = new Date(timeString);
      return date.toLocaleString("zh-CN");
    },

    getCategoryClass(category) {
      const classes = {
        知识点定义类问题: "category-definition",
        知识点应用类问题: "category-application",
        知识点关联类问题: "category-relation",
        实验操作类问题: "category-experiment",
        现象解释类问题: "category-explanation",
        计算方法类问题: "category-calculation",
        疑难困惑类问题: "category-confusion",
        其他类问题: "category-other",
      };
      return classes[category] || "category-default";
    },

    async logout() {
      try {
        const confirmed = await ElMessageBox.confirm(
          "确定要退出登录吗？",
          "退出确认",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        if (confirmed) {
          const authStore = useAuthStore();
          await authStore.logout();
          this.$router.push("/login");
          ElMessage.success("已成功退出登录");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("退出登录失败:", error);
          ElMessage.error("退出登录失败，请重试");
        }
      }
    },
  },
};
</script>

<style scoped>
.teacher-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  flex: 1;
}

.title-section h1 {
  color: #409eff;
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.title-section p {
  color: #666;
  margin: 0;
  font-size: 16px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  color: #303133;
  font-weight: 600;
  font-size: 16px;
}

.user-role {
  color: #909399;
  font-size: 12px;
}

.btn-logout {
  background: #f56c6c;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-logout:hover {
  background: #e85454;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.logout-icon {
  font-size: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  text-align: left;
}

.title-section h1 {
  color: #409eff;
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.title-section p {
  color: #666;
  margin: 0;
  font-size: 16px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  text-align: right;
  color: #303133;
}

.user-info .user-name {
  font-weight: 600;
}

.user-info .user-role {
  font-size: 12px;
  color: #909399;
}

.btn-logout {
  background: #f56c6c;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-logout:hover {
  background: #cf4949;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  gap: 20px;
  flex-wrap: wrap;
}

.stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  min-width: 80px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-options {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.ai-mode-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  user-select: none;
}

.ai-mode-label input[type="checkbox"] {
  margin: 0;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 5px;
}

.status-indicator.connected {
  background-color: #67c23a;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.5);
}

.status-indicator.error {
  background-color: #f56c6c;
  box-shadow: 0 0 6px rgba(245, 108, 108, 0.5);
}

.status-indicator.unknown {
  background-color: #909399;
  box-shadow: 0 0 6px rgba(144, 147, 153, 0.5);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #409eff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #337ecc;
}

.btn-secondary {
  background: #e4e7ed;
  color: #606266;
}

.btn-secondary:hover {
  background: #d3d4d6;
}

.category-stats {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.category-stats h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.stat-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.stat-category {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  font-size: 14px;
}

.stat-count {
  color: #409eff;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-bar {
  height: 6px;
  background: #e4e7ed;
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s ease;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
}

.questions-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.questions-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.no-data p {
  margin: 0;
  font-size: 16px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
  transition: all 0.3s;
}

.question-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.question-card.uncategorized {
  border-left: 4px solid #f56c6c;
  background: #fef0f0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-id {
  background: #409eff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.student-name {
  color: #303133;
  font-weight: 500;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.question-time {
  color: #909399;
  font-size: 12px;
}

.question-category {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.question-category.uncategorized {
  background: #f56c6c;
}

.category-definition {
  background: #409eff;
}

.category-application {
  background: #67c23a;
}

.category-relation {
  background: #e6a23c;
}

.category-experiment {
  background: #f56c6c;
}

.category-explanation {
  background: #909399;
}

.category-calculation {
  background: #17a2b8;
}

.category-confusion {
  background: #6f42c1;
}

.category-other {
  background: #6c757d;
}

.category-default {
  background: #909399;
}

.question-content {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #409eff;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 15px;
  font-size: 15px;
}

.question-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-small {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-info {
  background: #909399;
  color: white;
}

.btn-info:hover {
  background: #73767a;
}

.btn-warning {
  background: #e6a23c;
  color: white;
}

.btn-warning:hover {
  background: #cf9236;
}

@media (max-width: 768px) {
  .teacher-view {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .title-section {
    text-align: center;
  }

  .user-section {
    width: 100%;
    justify-content: center;
  }

  .user-info {
    text-align: center;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .stats {
    justify-content: center;
  }

  .actions {
    justify-content: center;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .form-control {
    min-width: auto;
  }

  .question-header {
    flex-direction: column;
    align-items: stretch;
  }

  .question-meta {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
