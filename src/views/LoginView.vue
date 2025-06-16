<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <el-icon class="login-icon"><User /></el-icon>
          <h1 class="login-title">课堂互动系统</h1>
          <p class="login-subtitle">请选择身份登录</p>
        </div>

        <!-- 身份选择 -->
        <div class="role-selector">
          <el-radio-group v-model="selectedRole" class="role-group">
            <el-radio-button label="student">学生</el-radio-button>
            <el-radio-button label="teacher">教师</el-radio-button>
            <el-radio-button label="admin">管理员</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              :placeholder="usernamePlaceholder"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              :loading="authStore.loading"
              @click="handleLogin"
            >
              {{ authStore.loading ? "登录中..." : "登录" }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 默认账号提示 -->
        <div class="default-accounts">
          <el-divider>默认测试账号</el-divider>
          <div class="account-tips">
            <div class="tip-item">
              <el-tag type="success" size="small">学生</el-tag>
              <span>ST001-ST025 / 密码: 123456</span>
            </div>
            <div class="tip-item">
              <el-tag type="warning" size="small">教师</el-tag>
              <span>T001-T003 / 密码: 123456</span>
            </div>
            <div class="tip-item">
              <el-tag type="danger" size="small">管理员</el-tag>
              <span>admin / 密码: admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const selectedRole = ref("student");
const loginFormRef = ref(null);
const loginForm = ref({
  username: "",
  password: "",
});

// 计算属性
const usernamePlaceholder = computed(() => {
  switch (selectedRole.value) {
    case "student":
      return "请输入学号";
    case "teacher":
      return "请输入教工号";
    case "admin":
      return "请输入管理员账号";
    default:
      return "请输入账号";
  }
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 2, max: 20, message: "账号长度在 2 到 20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
  ],
};

// 登录处理
const handleLogin = async () => {
  try {
    // 表单验证
    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    const credentials = {
      [`${selectedRole.value}_id`]: loginForm.value.username,
      password: loginForm.value.password,
    };

    let result;
    switch (selectedRole.value) {
      case "student":
        result = await authStore.loginStudent(credentials);
        break;
      case "teacher":
        result = await authStore.loginTeacher(credentials);
        break;
      case "admin":
        result = await authStore.loginAdmin(credentials);
        break;
    }

    if (result.success) {
      ElMessage.success("登录成功");

      // 根据角色跳转到对应页面
      switch (selectedRole.value) {
        case "student":
          router.push("/student");
          break;
        case "teacher":
          router.push("/teacher");
          break;
        case "admin":
          router.push("/admin");
          break;
        default:
          router.push("/");
      }
    } else {
      ElMessage.error(result.error || "登录失败");
    }
  } catch (error) {
    console.error("登录错误:", error);
    ElMessage.error("登录过程中出现错误");
  }
};

// 快速填充测试账号
const fillTestAccount = (role, username, password) => {
  selectedRole.value = role;
  loginForm.value.username = username;
  loginForm.value.password = password;
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-icon {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 16px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.login-subtitle {
  color: #7f8c8d;
  margin: 0 0 20px 0;
  font-size: 14px;
}

.role-selector {
  margin-bottom: 30px;
}

.role-group {
  width: 100%;
  display: flex;
}

.role-group .el-radio-button {
  flex: 1;
}

.role-group .el-radio-button__inner {
  width: 100%;
  border-radius: 8px !important;
  border: 1px solid #dcdfe6;
  margin: 0 4px;
}

.role-group .el-radio-button:first-child .el-radio-button__inner {
  margin-left: 0;
}

.role-group .el-radio-button:last-child .el-radio-button__inner {
  margin-right: 0;
}

.login-form {
  margin-bottom: 20px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-form .el-input__inner {
  border-radius: 8px;
  height: 48px;
  line-height: 48px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.login-button:hover {
  opacity: 0.9;
}

.default-accounts {
  margin-top: 30px;
}

.account-tips {
  font-size: 12px;
  color: #909399;
}

.tip-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tip-item:hover {
  background: #e9ecef;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item span {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .role-group .el-radio-button__inner {
    font-size: 12px;
    padding: 8px 4px;
  }
}
</style>
