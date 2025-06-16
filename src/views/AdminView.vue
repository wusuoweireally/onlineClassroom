<template>
  <div class="admin-view">
    <!-- 头部导航 -->
    <el-header class="admin-header">
      <div class="header-left">
        <el-icon><Setting /></el-icon>
        <h1>管理员后台</h1>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <el-button type="primary" class="user-button">
            <el-icon><User /></el-icon>
            {{ authStore.userName }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout" divided
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-container class="admin-container">
      <!-- 侧边栏 -->
      <el-aside class="admin-aside" width="250px">
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
          class="admin-menu"
        >
          <el-menu-item index="dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="questions">
            <el-icon><ChatLineSquare /></el-icon>
            <span>问题管理</span>
          </el-menu-item>
          <el-menu-item index="students">
            <el-icon><User /></el-icon>
            <span>学生管理</span>
          </el-menu-item>
          <el-menu-item index="teachers">
            <el-icon><UserFilled /></el-icon>
            <span>教师管理</span>
          </el-menu-item>
          <el-menu-item index="analytics">
            <el-icon><TrendCharts /></el-icon>
            <span>数据分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-main class="admin-main">
        <!-- 仪表盘 -->
        <div v-if="activeMenu === 'dashboard'" class="dashboard">
          <div class="stats-grid">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon student">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stats.totalStudents }}</div>
                  <div class="stat-label">学生总数</div>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon teacher">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stats.totalTeachers }}</div>
                  <div class="stat-label">教师总数</div>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon question">
                  <el-icon><ChatLineSquare /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stats.totalQuestions }}</div>
                  <div class="stat-label">问题总数</div>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon answer">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stats.answeredQuestions }}</div>
                  <div class="stat-label">已回复问题</div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 最近活动 -->
          <el-row :gutter="20" class="dashboard-content">
            <el-col :span="16">
              <el-card header="最近问题">
                <el-table :data="recentQuestions" style="width: 100%">
                  <el-table-column
                    prop="student_name"
                    label="学生"
                    width="120"
                  />
                  <el-table-column
                    prop="content"
                    label="问题内容"
                    show-overflow-tooltip
                  />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag
                        :type="
                          scope.row.status === 'answered'
                            ? 'success'
                            : 'warning'
                        "
                        size="small"
                      >
                        {{
                          scope.row.status === "answered" ? "已回复" : "待回复"
                        }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="created_at"
                    label="提交时间"
                    width="160"
                  >
                    <template #default="scope">
                      {{ formatDate(scope.row.created_at) }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card header="问题分类统计">
                <div class="category-stats">
                  <div
                    v-for="item in categoryStats"
                    :key="item.category"
                    class="category-item"
                  >
                    <span class="category-name">{{ item.category }}</span>
                    <span class="category-count">{{ item.count }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 问题管理 -->
        <div
          v-else-if="activeMenu === 'questions'"
          class="questions-management"
        >
          <div class="section-header">
            <h2>问题管理</h2>
            <div class="actions">
              <el-button type="primary" @click="classifyQuestions">
                <el-icon><MagicStick /></el-icon>
                智能分类
              </el-button>
            </div>
          </div>

          <!-- 筛选器 -->
          <el-card class="filters">
            <el-form :inline="true" :model="questionFilters">
              <el-form-item label="状态">
                <el-select
                  v-model="questionFilters.status"
                  clearable
                  placeholder="选择状态"
                >
                  <el-option label="待回复" value="pending" />
                  <el-option label="已回复" value="answered" />
                  <el-option label="已关闭" value="closed" />
                </el-select>
              </el-form-item>
              <el-form-item label="分类">
                <el-select
                  v-model="questionFilters.category"
                  clearable
                  placeholder="选择分类"
                >
                  <el-option
                    v-for="cat in categories"
                    :key="cat"
                    :label="cat"
                    :value="cat"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchQuestions"
                  >查询</el-button
                >
                <el-button @click="resetFilters">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 问题列表 -->
          <el-card>
            <el-table
              :data="questions"
              style="width: 100%"
              v-loading="questionsLoading"
            >
              <el-table-column prop="student_name" label="学生" width="120" />
              <el-table-column
                prop="content"
                label="问题内容"
                show-overflow-tooltip
              />
              <el-table-column prop="category" label="分类" width="140">
                <template #default="scope">
                  <el-tag v-if="scope.row.category" size="small">
                    {{ scope.row.category }}
                  </el-tag>
                  <span v-else class="text-muted">未分类</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="提交时间" width="160">
                <template #default="scope">
                  {{ formatDate(scope.row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewQuestion(scope.row)"
                  >
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 其他管理页面占位 -->
        <div v-else class="coming-soon">
          <el-empty description="功能开发中..." />
        </div>
      </el-main>
    </el-container>

    <!-- 问题详情对话框 -->
    <el-dialog v-model="questionDialogVisible" title="问题详情" width="60%">
      <div v-if="selectedQuestion" class="question-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生">{{
            selectedQuestion.student_name
          }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{
            selectedQuestion.student_id
          }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{
            formatDate(selectedQuestion.created_at)
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedQuestion.status)">
              {{ getStatusText(selectedQuestion.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分类" span="2">
            <el-tag v-if="selectedQuestion.category" size="small">
              {{ selectedQuestion.category }}
            </el-tag>
            <span v-else class="text-muted">未分类</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="question-content">
          <h4>问题内容：</h4>
          <p>{{ selectedQuestion.content }}</p>
        </div>

        <div v-if="selectedQuestion.teacher_reply" class="reply-content">
          <h4>教师回复：</h4>
          <p>{{ selectedQuestion.teacher_reply }}</p>
          <p class="reply-info">
            回复者：{{ selectedQuestion.replied_by }} | 回复时间：{{
              formatDate(selectedQuestion.replied_at)
            }}
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Setting,
  User,
  ArrowDown,
  DataBoard,
  ChatLineSquare,
  UserFilled,
  TrendCharts,
  Check,
  MagicStick,
} from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const activeMenu = ref("dashboard");
const stats = reactive({
  totalStudents: 0,
  totalTeachers: 0,
  totalQuestions: 0,
  answeredQuestions: 0,
});
const recentQuestions = ref([]);
const categoryStats = ref([]);
const questions = ref([]);
const questionsLoading = ref(false);
const questionDialogVisible = ref(false);
const selectedQuestion = ref(null);
const categories = ref([
  "知识点定义类问题",
  "知识点应用类问题",
  "知识点关联类问题",
  "实验操作类问题",
  "现象解释类问题",
  "计算方法类问题",
  "疑难困惑类问题",
  "其他类问题",
]);

const questionFilters = reactive({
  status: "",
  category: "",
});

// 初始化
onMounted(() => {
  fetchDashboardData();
});

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 获取统计数据
    const [studentsRes, questionsRes, statsRes] = await Promise.all([
      api.get("/api/students"),
      api.get("/api/questions"),
      api.get("/api/questions/stats"),
    ]);

    if (studentsRes.data.success) {
      stats.totalStudents = studentsRes.data.data.length;
    }

    if (questionsRes.data.success) {
      const questionsData = questionsRes.data.data;
      stats.totalQuestions = questionsData.length;
      stats.answeredQuestions = questionsData.filter(
        (q) => q.status === "answered"
      ).length;
      recentQuestions.value = questionsData.slice(0, 10);
    }

    if (statsRes.data.success) {
      categoryStats.value = statsRes.data.data;
    }

    // 获取教师总数（如果有权限）
    try {
      const teachersRes = await api.get("/api/teachers");
      if (teachersRes.data.success) {
        stats.totalTeachers = teachersRes.data.data.length;
      }
    } catch (error) {
      console.warn("无法获取教师数据");
    }
  } catch (error) {
    console.error("获取仪表盘数据失败:", error);
    ElMessage.error("获取数据失败");
  }
};

// 获取问题列表
const fetchQuestions = async () => {
  questionsLoading.value = true;
  try {
    const params = {};
    if (questionFilters.status) params.status = questionFilters.status;
    if (questionFilters.category) params.category = questionFilters.category;

    const response = await api.get("/api/questions", { params });
    if (response.data.success) {
      questions.value = response.data.data;
    }
  } catch (error) {
    console.error("获取问题列表失败:", error);
    ElMessage.error("获取问题列表失败");
  } finally {
    questionsLoading.value = false;
  }
};

// 智能分类
const classifyQuestions = async () => {
  try {
    const result = await ElMessageBox.confirm(
      "确定要对所有未分类的问题进行智能分类吗？",
      "确认操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    if (result === "confirm") {
      const response = await api.post("/api/questions/classify");
      if (response.data.success) {
        ElMessage.success(response.data.message);
        fetchQuestions();
        fetchDashboardData();
      }
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("智能分类失败:", error);
      ElMessage.error("智能分类失败");
    }
  }
};

// 查看问题详情
const viewQuestion = (question) => {
  selectedQuestion.value = question;
  questionDialogVisible.value = true;
};

// 重置筛选器
const resetFilters = () => {
  questionFilters.status = "";
  questionFilters.category = "";
  fetchQuestions();
};

// 菜单选择
const handleMenuSelect = (index) => {
  activeMenu.value = index;
  if (index === "questions") {
    fetchQuestions();
  }
};

// 用户菜单命令
const handleCommand = async (command) => {
  if (command === "logout") {
    try {
      await authStore.logout();
      ElMessage.success("退出登录成功");
      router.push("/login");
    } catch (error) {
      console.error("退出登录失败:", error);
    }
  } else if (command === "profile") {
    ElMessage.info("个人信息功能开发中");
  }
};

// 工具函数
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("zh-CN");
};

const getStatusType = (status) => {
  switch (status) {
    case "answered":
      return "success";
    case "pending":
      return "warning";
    case "closed":
      return "info";
    default:
      return "";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "answered":
      return "已回复";
    case "pending":
      return "待回复";
    case "closed":
      return "已关闭";
    default:
      return "未知";
  }
};
</script>

<style scoped>
.admin-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-left .el-icon {
  font-size: 24px;
  color: #409eff;
}

.user-button {
  height: 36px;
}

.admin-container {
  flex: 1;
  height: calc(100vh - 60px);
}

.admin-aside {
  background: #f5f7fa;
  border-right: 1px solid #e6e6e6;
}

.admin-menu {
  border: none;
  background: transparent;
}

.admin-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}

.admin-main {
  padding: 20px;
  background: #f0f2f5;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.student {
  background: #409eff;
}
.stat-icon.teacher {
  background: #67c23a;
}
.stat-icon.question {
  background: #e6a23c;
}
.stat-icon.answer {
  background: #f56c6c;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.dashboard-content {
  margin-top: 20px;
}

.category-stats {
  max-height: 300px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.category-name {
  font-size: 13px;
  color: #606266;
}

.category-count {
  font-weight: 600;
  color: #409eff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filters {
  margin-bottom: 20px;
}

.question-detail {
  margin-top: 16px;
}

.question-content,
.reply-content {
  margin-top: 20px;
}

.question-content h4,
.reply-content h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.question-content p,
.reply-content p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.reply-info {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.text-muted {
  color: #c0c4cc;
}

.coming-soon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}
</style>
