<template>
  <div class="student-view">
    <!-- 页面头部 -->
    <el-header class="student-header">
      <div class="header-left">
        <el-icon style="font-size: 25px"><User /></el-icon>
        <h1>学生提问系统</h1>
      </div>
      <div class="header-right">
        <span class="welcome-text"
          >欢迎，{{ authStore.userName }} ({{ authStore.userId }})</span
        >
        <el-dropdown @command="handleCommand">
          <el-button type="primary" class="user-button">
            <el-icon><User /></el-icon>
            {{ authStore.userName }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <div class="student-content">
      <!-- 学生信息和提问表单 -->
      <el-row :gutter="24">
        <el-col>
          <el-card class="form-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><EditPen /></el-icon>
                <span>提交问题</span>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="8">
                <!-- 快速问题模板 -->
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <el-icon><Document /></el-icon>
                      <span>问题模板</span>
                    </div>
                  </template>
                  <div class="templates">
                    <el-button
                      v-for="template in questionTemplates"
                      :key="template.id"
                      type="text"
                      size="small"
                      @click="useTemplate(template.content)"
                    >
                      {{ template.title }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-form :model="formData" label-width="100px" size="small">
                  <el-form-item label="您的问题" required>
                    <el-input
                      v-model="questionContent"
                      type="textarea"
                      :rows="10"
                      placeholder="请在这里输入您的问题..."
                      maxlength="500"
                      show-word-limit
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-button
                      type="primary"
                      size="large"
                      @click="submitQuestion"
                      :loading="isSubmitting"
                      :disabled="!canSubmit"
                      style="width: 120px; margin-right: 10px"
                    >
                      {{ isSubmitting ? "提交中" : "提交问题" }}
                    </el-button>
                    <el-button size="large" @click="clearForm">清空</el-button>
                  </el-form-item>
                </el-form></el-col
              >
              <el-col :span="8">
                <!-- AI 随机提问 -->
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <el-icon><MagicStick /></el-icon>
                      <span>AI 随机提问</span>
                    </div>
                  </template>
                  <div class="ai-question-content">
                    <div class="ai-controls">
                      <el-select
                        v-model="aiSubject"
                        placeholder="选择学科"
                        size="small"
                        style="width: 120px"
                      >
                        <el-option label="通用" value="通用" />
                        <el-option label="数学" value="数学" />
                        <el-option label="物理" value="物理" />
                        <el-option label="化学" value="化学" />
                        <el-option label="生物" value="生物" />
                        <el-option label="语文" value="语文" />
                        <el-option label="英语" value="英语" />
                      </el-select>

                      <el-select
                        v-model="aiDifficulty"
                        placeholder="选择难度"
                        size="small"
                        style="width: 100px; margin-right: 10px"
                      >
                        <el-option label="简单" value="简单" />
                        <el-option label="中等" value="中等" />
                        <el-option label="困难" value="困难" />
                      </el-select>

                      <el-button
                        type="primary"
                        size="small"
                        @click="generateRandomQuestion"
                        :loading="aiQuestionLoading"
                        :icon="MagicStick"
                      >
                        {{ aiQuestionLoading ? "生成中..." : "获取问题" }}
                      </el-button>
                    </div>

                    <div v-if="randomQuestion" class="random-question-display">
                      <div class="question-label">
                        <el-icon><QuestionFilled /></el-icon>
                        <span>AI 为你生成的问题：</span>
                        <el-tag
                          v-if="randomQuestionData?.fallback"
                          type="warning"
                          size="small"
                        >
                          预设问题
                        </el-tag>
                        <el-tag v-else type="success" size="small">
                          AI 生成
                        </el-tag>
                      </div>
                      <div class="question-text">
                        {{ randomQuestion }}
                      </div>
                      <div class="question-actions">
                        <el-button
                          size="small"
                          type="text"
                          @click="useRandomQuestion"
                          :icon="EditPen"
                        >
                          用这个问题提问
                        </el-button>
                        <el-button
                          size="small"
                          type="text"
                          @click="copyRandomQuestion"
                          :icon="CopyDocument"
                        >
                          复制问题
                        </el-button>
                      </div>
                    </div>

                    <div
                      v-if="!randomQuestion && !aiQuestionLoading"
                      class="ai-question-placeholder"
                    >
                      <el-icon><MagicStick /></el-icon>
                      <p>点击"获取问题"让AI为你生成一个学习问题</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-card>

          <!-- 我的问题列表 -->
          <el-card
            class="questions-card"
            shadow="hover"
            style="margin-top: 20px"
          >
            <template #header>
              <div class="card-header">
                <el-icon><ChatLineSquare /></el-icon>
                <span>我的问题 ({{ myQuestions.length }})</span>
                <el-button
                  type="primary"
                  size="small"
                  @click="fetchMyQuestions"
                  :loading="questionsLoading"
                >
                  刷新
                </el-button>
              </div>
            </template>

            <div v-if="questionsLoading" class="loading-container">
              <el-skeleton :rows="3" animated />
            </div>

            <div v-else-if="myQuestions.length === 0" class="empty-state">
              <el-empty description="您还没有提交过问题" />
            </div>

            <div v-else class="questions-list">
              <div
                v-for="(question, index) in myQuestions"
                :key="question.id"
                class="question-item"
              >
                <div class="question-header">
                  <div class="question-meta">
                    <span class="question-number"
                      >#{{ myQuestions.length - index }}</span
                    >
                    <el-tag :type="getStatusType(question.status)" size="small">
                      {{ getStatusText(question.status) }}
                    </el-tag>
                    <span class="question-time">
                      {{ formatDate(question.created_at) }}
                    </span>
                  </div>
                  <el-tag
                    v-if="question.category"
                    type="info"
                    size="small"
                    class="category-tag"
                  >
                    {{ question.category }}
                  </el-tag>
                </div>

                <div class="question-content">
                  <p>{{ question.content }}</p>
                </div>

                <div v-if="question.teacher_reply" class="teacher-reply">
                  <div class="reply-header">
                    <el-icon><ChatDotSquare /></el-icon>
                    <span>教师回复：</span>
                  </div>
                  <div class="reply-content">
                    <p>{{ question.teacher_reply }}</p>
                    <div class="reply-meta">
                      回复者：{{ question.replied_by }} | 回复时间：{{
                        formatDate(question.replied_at)
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧信息面板 -->
        <el-col :xs="24" :lg="8">
          <!-- 使用说明 -->
          <el-card shadow="hover" class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>使用说明</span>
              </div>
            </template>
            <div class="instructions">
              <ol>
                <li>在文本框中详细描述您的问题</li>
                <li>点击"提交问题"按钮发送给老师</li>
                <li>在"我的问题"列表中查看提交历史</li>
                <li>等待老师回复您的问题</li>
              </ol>
            </div>
          </el-card>

          <!-- 问题提示 -->
          <el-card shadow="hover" class="tips-card" style="margin-top: 20px">
            <template #header>
              <div class="card-header">
                <el-icon><QuestionFilled /></el-icon>
                <span>提问技巧</span>
              </div>
            </template>
            <div class="tips">
              <div class="tip-item">
                <el-icon class="tip-icon"><Check /></el-icon>
                <span>问题表述要清晰具体</span>
              </div>
              <div class="tip-item">
                <el-icon class="tip-icon"><Check /></el-icon>
                <span>包含足够的背景信息</span>
              </div>
              <div class="tip-item">
                <el-icon class="tip-icon"><Check /></el-icon>
                <span>避免过于笼统的问题</span>
              </div>
              <div class="tip-item">
                <el-icon class="tip-icon"><Check /></el-icon>
                <span>尽量提供具体的例子</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  User,
  EditPen,
  ChatLineSquare,
  InfoFilled,
  QuestionFilled,
  Check,
  Document,
  ChatDotSquare,
  ArrowDown,
  MagicStick,
  CopyDocument,
} from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const formData = ref({});
const questionContent = ref("");
const isSubmitting = ref(false);
const showSuccess = ref(false);
const myQuestions = ref([]);
const questionsLoading = ref(false);

// AI 随机提问
const aiSubject = ref("通用");
const aiDifficulty = ref("中等");
const randomQuestion = ref("");
const randomQuestionData = ref(null);
const aiQuestionLoading = ref(false);

// 问题模板
const questionTemplates = ref([
  {
    id: 1,
    title: "概念理解",
    content: "我不理解[具体概念]的含义，能详细解释一下吗？",
  },
  {
    id: 2,
    title: "解题方法",
    content: "这道关于[主题]的题目应该用什么方法解决？",
  },
  { id: 3, title: "公式推导", content: "[公式名称]的推导过程是怎样的？" },
  {
    id: 4,
    title: "实验问题",
    content: "在[实验名称]实验中，[具体步骤]的原理是什么？",
  },
  {
    id: 5,
    title: "现象解释",
    content: "为什么会出现[具体现象]？背后的原理是什么？",
  },
]);

// 计算属性
const canSubmit = computed(() => {
  return questionContent.value.trim().length > 0 && !isSubmitting.value;
});

// 初始化
onMounted(() => {
  fetchMyQuestions();
});

// 获取我的问题列表
const fetchMyQuestions = async () => {
  questionsLoading.value = true;
  try {
    const response = await api.get("/api/questions");
    if (response.data.success) {
      myQuestions.value = response.data.data;
    }
  } catch (error) {
    console.error("获取问题列表失败:", error);
    ElMessage.error("获取问题列表失败");
  } finally {
    questionsLoading.value = false;
  }
};

// 提交问题
const submitQuestion = async () => {
  if (!canSubmit.value) {
    ElMessage.warning("请输入问题内容");
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await api.post("/api/questions", {
      content: questionContent.value.trim(),
    });

    if (response.data.success) {
      ElMessage.success("问题提交成功！");
      showSuccess.value = true;
      clearForm();
      fetchMyQuestions();

      // 3秒后隐藏成功提示
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
    }
  } catch (error) {
    console.error("提交问题失败:", error);
    const errorMessage = error.response?.data?.error || "提交失败，请重试";
    ElMessage.error(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};

// 清空表单
const clearForm = () => {
  questionContent.value = "";
  showSuccess.value = false;
};

// 使用问题模板
const useTemplate = (content) => {
  questionContent.value = content;
};

// AI 随机提问
const generateRandomQuestion = async () => {
  aiQuestionLoading.value = true;
  randomQuestion.value = "";

  try {
    const response = await api.get("/api/ai/random-question", {
      params: {
        subject: aiSubject.value,
        difficulty: aiDifficulty.value,
      },
    });

    if (response.data.success) {
      randomQuestion.value = response.data.data.question;
      randomQuestionData.value = response.data.data;

      if (response.data.data.fallback) {
        ElMessage.warning("AI暂时不可用，为您提供预设问题");
      } else {
        ElMessage.success("AI问题生成成功！");
      }
    } else {
      ElMessage.warning(response.data.message || "未能获取到问题");
    }
  } catch (error) {
    console.error("获取随机问题失败:", error);
    ElMessage.error("获取随机问题失败，请重试");
  } finally {
    aiQuestionLoading.value = false;
  }
};

// 使用随机问题
const useRandomQuestion = () => {
  if (randomQuestion.value) {
    questionContent.value = randomQuestion.value;
    ElMessage.success("问题已填入输入框");
  }
};

// 复制随机问题
const copyRandomQuestion = () => {
  if (randomQuestion.value) {
    navigator.clipboard.writeText(randomQuestion.value);
    ElMessage.success("问题已复制到剪贴板");
  }
};

// 用户命令处理
const handleCommand = async (command) => {
  if (command === "logout") {
    try {
      await authStore.logout();
      ElMessage.success("退出登录成功");
      router.push("/login");
    } catch (error) {
      console.error("退出登录失败:", error);
    }
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
.student-view {
  min-height: 100vh;
  background: #f0f2f5;
}

.student-header {
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
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-text {
  color: #606266;
  font-size: 14px;
}

.user-button {
  height: 36px;
}

.student-content {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.card-header .el-button {
  margin-left: auto;
}

.form-card,
.questions-card,
.info-card,
.tips-card,
.templates-card,
.ai-question-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.questions-list {
  max-height: 600px;
  overflow-y: auto;
}

.question-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.question-item:last-child {
  border-bottom: none;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-number {
  font-weight: 600;
  color: #409eff;
}

.question-time {
  font-size: 12px;
  color: #909399;
}

.category-tag {
  margin-left: auto;
}

.question-content p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.teacher-reply {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #67c23a;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #67c23a;
  font-size: 14px;
}

.reply-content p {
  margin: 0 0 8px 0;
  line-height: 1.6;
  color: #606266;
}

.reply-meta {
  font-size: 12px;
  color: #909399;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #606266;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.tip-icon {
  color: #67c23a;
  font-size: 16px;
}

.templates {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-button {
  text-align: left;
  padding: 8px 0;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.template-button:hover {
  background-color: #f5f7fa;
}

.loading-container,
.empty-state {
  padding: 20px;
  text-align: center;
}

/* AI随机提问样式 */
.ai-question-card {
  margin-top: 20px;
}

.ai-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.ai-controls .el-select {
  flex: 1;
  min-width: 100px;
}

.random-question-display {
  padding: 15px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f7ff 100%);
  border: 1px solid #d4ebf8;
  margin-top: 12px;
}

.question-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #409eff;
}

.question-text {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #409eff;
  margin-bottom: 12px;
  line-height: 1.6;
  color: #303133;
  font-size: 14px;
}

.question-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.question-actions .el-button {
  font-size: 12px;
}

.ai-question-placeholder {
  padding: 30px 20px;
  text-align: center;
  color: #909399;
  background: #fafafa;
  border-radius: 6px;
  border: 2px dashed #dcdfe6;
}

.ai-question-placeholder .el-icon {
  font-size: 32px;
  margin-bottom: 10px;
  color: #c0c4cc;
}

.ai-question-placeholder p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .student-content {
    padding: 10px;
  }

  .header-right .welcome-text {
    display: none;
  }

  .ai-controls {
    flex-direction: column;
  }

  .ai-controls .el-select {
    width: 100%;
  }

  .question-actions {
    justify-content: center;
  }
}
</style>
