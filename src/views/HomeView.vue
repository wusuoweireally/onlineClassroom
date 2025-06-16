<script setup>
import { useRouter } from "vue-router";
import {
  User,
  UserFilled,
  TrendCharts,
  ChatDotRound,
  Setting,
  Star,
  Lock,
} from "@element-plus/icons-vue";

const router = useRouter();

const goToLogin = () => {
  router.push("/login");
};
</script>

<template>
  <div>
    <!-- 英雄区域 -->
    <el-row class="hero-section">
      <el-col :span="24">
        <div class="hero-content">
          <h1 class="hero-title">课堂互动系统</h1>
          <p class="hero-subtitle">激发孩子在课堂上勇于提问的智能互动平台</p>

          <!-- 登录按钮 -->
          <div class="login-actions">
            <el-button
              type="primary"
              size="large"
              @click="goToLogin"
              class="login-button"
            >
              <el-icon><Lock /></el-icon>
              立即登录
            </el-button>
            <p class="login-tip">选择您的身份：学生、教师或管理员</p>
          </div>

          <el-row :gutter="20" class="feature-cards">
            <el-col :xs="24" :sm="12" :md="12">
              <el-card class="feature-card student-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <el-icon class="feature-icon"><User /></el-icon>
                    <h3>学生端</h3>
                  </div>
                </template>
                <p class="feature-desc">
                  学生可以在这里提出问题，与老师进行互动
                </p>
                <div class="card-actions">
                  <el-button
                    type="primary"
                    size="large"
                    @click="$router.push('/student')"
                  >
                    <el-icon><User /></el-icon>
                    进入学生端
                  </el-button>
                </div>
              </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :md="12">
              <el-card class="feature-card teacher-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <el-icon class="feature-icon"><UserFilled /></el-icon>
                    <h3>教师端</h3>
                  </div>
                </template>
                <p class="feature-desc">老师可以查看学生问题，AI智能分类管理</p>
                <div class="card-actions">
                  <el-button
                    type="success"
                    size="large"
                    @click="$router.push('/teacher')"
                  >
                    <el-icon><UserFilled /></el-icon>
                    进入教师端
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>

    <!-- 系统特点 -->
    <el-row class="features-section">
      <el-col :span="24">
        <div class="section-header">
          <h2 class="section-title">系统特点</h2>
          <p class="section-desc">智能化的课堂互动解决方案</p>
        </div>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="info-card" shadow="hover">
              <div class="info-content">
                <el-icon class="info-icon ai-icon"><Setting /></el-icon>
                <h4>AI智能分类</h4>
                <p>自动将学生问题分类为知识点定义、应用、关联等多种类型</p>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="info-card" shadow="hover">
              <div class="info-content">
                <el-icon class="info-icon chat-icon"><ChatDotRound /></el-icon>
                <h4>实时互动</h4>
                <p>学生和老师可以实时进行问答互动</p>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="info-card" shadow="hover">
              <div class="info-content">
                <el-icon class="info-icon stats-icon"><TrendCharts /></el-icon>
                <h4>数据统计</h4>
                <p>提供问题分类统计，帮助老师了解学生学习情况</p>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="info-card" shadow="hover">
              <div class="info-content">
                <el-icon class="info-icon target-icon"><Star /></el-icon>
                <h4>针对性教学</h4>
                <p>根据问题分类，老师可以进行针对性教学指导</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.hero-content {
  text-align: center;
  color: white;
  max-width: 1200px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.login-actions {
  margin: 2rem 0 3rem 0;
}

.login-button {
  height: 50px;
  padding: 0 40px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.login-tip {
  margin-top: 1rem;
  font-size: 14px;
  opacity: 0.8;
}

.feature-cards {
  margin-top: 3rem;
}

.feature-card {
  height: 100%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.feature-icon {
  font-size: 28px;
  padding: 12px;
  border-radius: 12px;
  color: white;
}

.student-card .feature-icon {
  background: #409eff;
}

.teacher-card .feature-icon {
  background: #67c23a;
}

.admin-card .feature-icon {
  background: #e6a23c;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.feature-desc {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.info-cards {
  margin-top: 4rem;
}

.info-card {
  height: 100%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  transition: all 0.3s ease;
  padding: 24px;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.info-content {
  text-align: center;
}

.info-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.smart-icon {
  color: #409eff;
}

.stats-icon {
  color: #67c23a;
}

.target-icon {
  color: #e6a23c;
}

.info-content h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-content p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .login-button {
    width: 100%;
    max-width: 300px;
  }

  .feature-cards {
    margin-top: 2rem;
  }

  .info-cards {
    margin-top: 2rem;
  }
}
</style>
