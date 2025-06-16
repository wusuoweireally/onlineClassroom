#!/usr/bin/env node

// 课堂互动系统测试脚本
import axios from "axios";

const API_BASE = "http://localhost:3001/api";

console.log("🚀 开始测试课堂互动系统...\n");

// 测试服务器状态
async function testServerStatus() {
  try {
    console.log("📡 测试服务器连接...");
    const response = await axios.get("http://localhost:3001");
    console.log("✅ 服务器连接正常");
    console.log(`   版本: ${response.data.version}`);
    return true;
  } catch (error) {
    console.log("❌ 服务器连接失败:", error.message);
    return false;
  }
}

// 测试学生登录
async function testStudentLogin() {
  try {
    console.log("\n👨‍🎓 测试学生登录...");
    const response = await axios.post(`${API_BASE}/auth/student/login`, {
      student_id: "ST001",
      password: "123456",
    });

    if (response.data.success) {
      console.log("✅ 学生登录成功");
      console.log(
        `   学生: ${response.data.data.user.name} (${response.data.data.user.student_id})`
      );
      return response.data.data.token;
    } else {
      console.log("❌ 学生登录失败:", response.data.error);
      return null;
    }
  } catch (error) {
    console.log("❌ 学生登录失败:", error.message);
    return null;
  }
}

// 测试教师登录
async function testTeacherLogin() {
  try {
    console.log("\n👩‍🏫 测试教师登录...");
    const response = await axios.post(`${API_BASE}/auth/teacher/login`, {
      teacher_id: "T001",
      password: "123456",
    });

    if (response.data.success) {
      console.log("✅ 教师登录成功");
      console.log(
        `   教师: ${response.data.data.user.name} (${response.data.data.user.teacher_id})`
      );
      return response.data.data.token;
    } else {
      console.log("❌ 教师登录失败:", response.data.error);
      return null;
    }
  } catch (error) {
    console.log("❌ 教师登录失败:", error.message);
    return null;
  }
}

// 测试提交问题
async function testSubmitQuestion(studentToken) {
  try {
    console.log("\n📝 测试提交问题...");
    const response = await axios.post(
      `${API_BASE}/questions`,
      {
        content: "什么是牛顿第一定律？它的物理意义是什么？",
      },
      {
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
      }
    );

    if (response.data.success) {
      console.log("✅ 问题提交成功");
      console.log(`   问题ID: ${response.data.data.questionId}`);
      return response.data.data.questionId;
    } else {
      console.log("❌ 问题提交失败:", response.data.error);
      return null;
    }
  } catch (error) {
    console.log("❌ 问题提交失败:", error.message);
    return null;
  }
}

// 测试获取问题列表
async function testGetQuestions(teacherToken) {
  try {
    console.log("\n📋 测试获取问题列表...");
    const response = await axios.get(`${API_BASE}/questions`, {
      headers: {
        Authorization: `Bearer ${teacherToken}`,
      },
    });

    if (response.data.success) {
      console.log("✅ 获取问题列表成功");
      console.log(`   问题总数: ${response.data.data.length}`);

      // 显示最近的5个问题
      const recentQuestions = response.data.data.slice(0, 5);
      recentQuestions.forEach((q, index) => {
        console.log(`   ${index + 1}. ${q.content.substring(0, 30)}...`);
        console.log(
          `      学生: ${q.student_name} | 分类: ${q.category || "未分类"}`
        );
      });

      return response.data.data;
    } else {
      console.log("❌ 获取问题列表失败:", response.data.error);
      return [];
    }
  } catch (error) {
    console.log("❌ 获取问题列表失败:", error.message);
    return [];
  }
}

// 测试DeepSeek状态
async function testDeepSeekStatus(teacherToken) {
  try {
    console.log("\n🤖 测试 DeepSeek AI 状态...");
    const response = await axios.get(`${API_BASE}/deepseek/status`, {
      headers: {
        Authorization: `Bearer ${teacherToken}`,
      },
    });

    if (response.data.success) {
      const status = response.data.data;
      console.log(
        `${status.status === "connected" ? "✅" : "⚠️"} DeepSeek API 状态: ${
          status.status
        }`
      );
      console.log(`   信息: ${status.message}`);
      console.log(`   模型: ${status.model}`);
      return status.status === "connected";
    } else {
      console.log("❌ 检查 DeepSeek 状态失败:", response.data.error);
      return false;
    }
  } catch (error) {
    console.log("⚠️ 检查 DeepSeek 状态失败:", error.message);
    console.log("   提示: 可能需要配置 DEEPSEEK_API_KEY 环境变量");
    return false;
  }
}

// 测试AI分类
async function testAIClassification(teacherToken, hasDeepSeek) {
  try {
    console.log("\n🎯 测试 AI 问题分类...");
    const response = await axios.post(
      `${API_BASE}/questions/classify`,
      {
        useDeepSeek: hasDeepSeek,
      },
      {
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      }
    );

    if (response.data.success) {
      console.log("✅ AI 分类成功");
      console.log(`   ${response.data.message}`);
      console.log(`   分类方法: ${hasDeepSeek ? "DeepSeek AI" : "关键词匹配"}`);

      if (response.data.data.length > 0) {
        console.log("   分类结果样例:");
        response.data.data.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.content.substring(0, 40)}...`);
          console.log(`      → ${item.category}`);
        });
      }

      return true;
    } else {
      console.log("❌ AI 分类失败:", response.data.error);
      return false;
    }
  } catch (error) {
    console.log("❌ AI 分类失败:", error.message);
    return false;
  }
}

// 测试统计数据
async function testStatistics() {
  try {
    console.log("\n📊 测试统计数据...");
    const response = await axios.get(`${API_BASE}/questions/stats`);

    if (response.data.success) {
      console.log("✅ 获取统计数据成功");

      if (response.data.data.length > 0) {
        console.log("   分类统计:");
        response.data.data.forEach((stat) => {
          console.log(`   • ${stat.category}: ${stat.count}个`);
        });
      } else {
        console.log("   暂无分类统计数据");
      }

      return true;
    } else {
      console.log("❌ 获取统计数据失败:", response.data.error);
      return false;
    }
  } catch (error) {
    console.log("❌ 获取统计数据失败:", error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log("🔍 课堂互动系统功能测试");
  console.log("================================\n");

  // 1. 测试服务器状态
  const serverOk = await testServerStatus();
  if (!serverOk) {
    console.log("\n❌ 服务器未运行，请先启动后端服务器");
    console.log("   运行命令: npm run server");
    return;
  }

  // 2. 测试学生登录
  const studentToken = await testStudentLogin();
  if (!studentToken) {
    console.log("\n❌ 学生登录失败，跳过相关测试");
    return;
  }

  // 3. 测试教师登录
  const teacherToken = await testTeacherLogin();
  if (!teacherToken) {
    console.log("\n❌ 教师登录失败，跳过相关测试");
    return;
  }

  // 4. 测试提交问题
  await testSubmitQuestion(studentToken);

  // 5. 测试获取问题列表
  await testGetQuestions(teacherToken);

  // 6. 测试DeepSeek状态
  const hasDeepSeek = await testDeepSeekStatus(teacherToken);

  // 7. 测试AI分类
  await testAIClassification(teacherToken, hasDeepSeek);

  // 8. 测试统计数据
  await testStatistics();

  // 测试总结
  console.log("\n🎉 测试完成!");
  console.log("================================");
  console.log("访问前端: http://localhost:5174");
  console.log("访问后端: http://localhost:3001");
  console.log("\n默认测试账号:");
  console.log("学生: ST001 / 123456");
  console.log("教师: T001 / 123456");
  console.log("管理员: admin / admin123");

  if (!hasDeepSeek) {
    console.log("\n💡 提示: 要使用 DeepSeek AI 功能，请:");
    console.log("1. 在 https://platform.deepseek.com/ 注册账号");
    console.log("2. 获取 API Key");
    console.log("3. 创建 .env 文件并设置 DEEPSEEK_API_KEY");
  }
}

// 运行测试
runTests().catch(console.error);
