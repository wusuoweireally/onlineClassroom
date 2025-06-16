import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import crypto from "crypto";
import dotenv from "dotenv";

import {
  enhancedClassifyQuestion,
  getQuestionExamples,
} from "./aiClassifier.js";
import {
  classifyQuestionWithDeepSeek,
  batchClassifyQuestions,
  checkDeepSeekStatus,
  generateRandomQuestionWithDeepSeek,
  getFallbackRandomQuestion,
} from "./deepseekClassifier.js";
import {
  generateToken,
  hashPassword,
  verifyPassword,
  authenticateToken,
  requireRole,
} from "./auth.js";

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345678",
  database: process.env.DB_NAME || "classroom_system",
};

// 创建数据库连接池
let pool;

// 初始化数据库
async function initDatabase() {
  try {
    // 先连接MySQL服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // 创建数据库（如果不存在）
    await connection.execute("CREATE DATABASE IF NOT EXISTS classroom_system");
    await connection.end();

    // 创建连接池
    pool = mysql.createPool(dbConfig);

    // 创建表
    await createTables();

    console.log("数据库初始化成功");
  } catch (error) {
    console.error("数据库初始化失败:", error);
  }
}

// 创建数据表
async function createTables() {
  const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20),
      class_name VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const createTeachersTable = `
    CREATE TABLE IF NOT EXISTS teachers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      teacher_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20),
      department VARCHAR(50),
      title VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const createQuestionsTable = `
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20) NOT NULL,
      student_name VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending',
      teacher_reply TEXT,
      replied_by VARCHAR(20),
      replied_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    )
  `;

  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(20) NOT NULL,
      user_type ENUM('student', 'teacher', 'admin') NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id_type (user_id, user_type),
      INDEX idx_token_hash (token_hash)
    )
  `;

  await pool.execute(createStudentsTable);
  await pool.execute(createTeachersTable);
  await pool.execute(createAdminsTable);
  await pool.execute(createQuestionsTable);
  await pool.execute(createSessionsTable);
}

// 初始化学生数据
async function initStudents() {
  try {
    // 检查是否已有学生数据
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM students");
    if (rows[0].count > 0) {
      console.log("学生数据已存在");
      return;
    }

    // 默认密码（应该在实际使用时要求用户修改）
    const defaultPassword = await hashPassword("123456");

    // 创建20-30个学生
    const students = [];
    for (let i = 1; i <= 25; i++) {
      students.push({
        student_id: `ST${i.toString().padStart(3, "0")}`,
        name: `学生${i}`,
        password: defaultPassword,
        email: `student${i}@school.edu`,
        class_name: `班级${Math.ceil(i / 5)}`,
      });
    }

    // 插入学生数据
    for (let student of students) {
      await pool.execute(
        "INSERT INTO students (student_id, name, password, email, class_name) VALUES (?, ?, ?, ?, ?)",
        [
          student.student_id,
          student.name,
          student.password,
          student.email,
          student.class_name,
        ]
      );
    }

    console.log("学生数据初始化完成");
  } catch (error) {
    console.error("学生数据初始化失败:", error);
  }
}

// 初始化教师数据
async function initTeachers() {
  try {
    // 检查是否已有教师数据
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM teachers");
    if (rows[0].count > 0) {
      console.log("教师数据已存在");
      return;
    }

    // 默认密码
    const defaultPassword = await hashPassword("123456");

    // 创建几个教师账号
    const teachers = [
      {
        teacher_id: "T001",
        name: "张老师",
        password: defaultPassword,
        email: "zhang@school.edu",
        department: "数学系",
        title: "教授",
      },
      {
        teacher_id: "T002",
        name: "李老师",
        password: defaultPassword,
        email: "li@school.edu",
        department: "物理系",
        title: "副教授",
      },
      {
        teacher_id: "T003",
        name: "王老师",
        password: defaultPassword,
        email: "wang@school.edu",
        department: "化学系",
        title: "讲师",
      },
    ];

    // 插入教师数据
    for (let teacher of teachers) {
      await pool.execute(
        "INSERT INTO teachers (teacher_id, name, password, email, department, title) VALUES (?, ?, ?, ?, ?, ?)",
        [
          teacher.teacher_id,
          teacher.name,
          teacher.password,
          teacher.email,
          teacher.department,
          teacher.title,
        ]
      );
    }

    console.log("教师数据初始化完成");
  } catch (error) {
    console.error("教师数据初始化失败:", error);
  }
}

// 初始化管理员数据
async function initAdmins() {
  try {
    // 检查是否已有管理员数据
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM admins");
    if (rows[0].count > 0) {
      console.log("管理员数据已存在");
      return;
    }

    // 默认密码
    const defaultPassword = await hashPassword("admin123");

    // 创建管理员账号
    await pool.execute(
      "INSERT INTO admins (admin_id, name, password, email, role) VALUES (?, ?, ?, ?, ?)",
      ["admin", "系统管理员", defaultPassword, "admin@school.edu", "admin"]
    );

    console.log("管理员数据初始化完成");
  } catch (error) {
    console.error("管理员数据初始化失败:", error);
  }
}

// API路由

// 根路径
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "课堂互动系统后端API服务器",
    version: "2.0.0",
    endpoints: {
      // 认证相关
      auth: {
        studentLogin: "POST /api/auth/student/login",
        teacherLogin: "POST /api/auth/teacher/login",
        adminLogin: "POST /api/auth/admin/login",
        logout: "POST /api/auth/logout",
        refresh: "POST /api/auth/refresh",
        profile: "GET /api/auth/profile",
      },
      // 数据相关
      students: "/api/students",
      teachers: "/api/teachers",
      questions: "/api/questions",
      classify: "/api/questions/classify",
      stats: "/api/questions/stats",
      examples: "/api/questions/examples",
    },
  });
});

// ========== 认证相关API ==========

// 学生登录
app.post("/api/auth/student/login", async (req, res) => {
  try {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
      return res.status(400).json({
        success: false,
        error: "学号和密码不能为空",
      });
    }

    // 查找学生
    const [rows] = await pool.execute(
      "SELECT * FROM students WHERE student_id = ?",
      [student_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "学号或密码错误",
      });
    }

    const student = rows[0];

    // 验证密码
    const isPasswordValid = await verifyPassword(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "学号或密码错误",
      });
    }

    // 生成JWT token
    const token = generateToken({
      id: student.id,
      user_id: student.student_id,
      name: student.name,
      role: "student",
      type: "student",
    });

    // 保存会话
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    await pool.execute(
      "INSERT INTO user_sessions (user_id, user_type, token_hash, expires_at) VALUES (?, ?, ?, ?)",
      [student.student_id, "student", tokenHash, expiresAt]
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          class_name: student.class_name,
          role: "student",
        },
      },
    });
  } catch (error) {
    console.error("学生登录错误:", error);
    res.status(500).json({
      success: false,
      error: "服务器内部错误",
    });
  }
});

// 教师登录
app.post("/api/auth/teacher/login", async (req, res) => {
  try {
    const { teacher_id, password } = req.body;

    if (!teacher_id || !password) {
      return res.status(400).json({
        success: false,
        error: "教工号和密码不能为空",
      });
    }

    // 查找教师
    const [rows] = await pool.execute(
      "SELECT * FROM teachers WHERE teacher_id = ?",
      [teacher_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "教工号或密码错误",
      });
    }

    const teacher = rows[0];

    // 验证密码
    const isPasswordValid = await verifyPassword(password, teacher.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "教工号或密码错误",
      });
    }

    // 生成JWT token
    const token = generateToken({
      id: teacher.id,
      user_id: teacher.teacher_id,
      name: teacher.name,
      role: "teacher",
      type: "teacher",
    });

    // 保存会话
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.execute(
      "INSERT INTO user_sessions (user_id, user_type, token_hash, expires_at) VALUES (?, ?, ?, ?)",
      [teacher.teacher_id, "teacher", tokenHash, expiresAt]
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: teacher.id,
          teacher_id: teacher.teacher_id,
          name: teacher.name,
          email: teacher.email,
          department: teacher.department,
          title: teacher.title,
          role: "teacher",
        },
      },
    });
  } catch (error) {
    console.error("教师登录错误:", error);
    res.status(500).json({
      success: false,
      error: "服务器内部错误",
    });
  }
});

// 管理员登录
app.post("/api/auth/admin/login", async (req, res) => {
  try {
    const { admin_id, password } = req.body;

    if (!admin_id || !password) {
      return res.status(400).json({
        success: false,
        error: "管理员账号和密码不能为空",
      });
    }

    // 查找管理员
    const [rows] = await pool.execute(
      "SELECT * FROM admins WHERE admin_id = ?",
      [admin_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "账号或密码错误",
      });
    }

    const admin = rows[0];

    // 验证密码
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "账号或密码错误",
      });
    }

    // 生成JWT token
    const token = generateToken({
      id: admin.id,
      user_id: admin.admin_id,
      name: admin.name,
      role: "admin",
      type: "admin",
    });

    // 保存会话
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.execute(
      "INSERT INTO user_sessions (user_id, user_type, token_hash, expires_at) VALUES (?, ?, ?, ?)",
      [admin.admin_id, "admin", tokenHash, expiresAt]
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: admin.id,
          admin_id: admin.admin_id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("管理员登录错误:", error);
    res.status(500).json({
      success: false,
      error: "服务器内部错误",
    });
  }
});

// 退出登录
app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 删除会话记录
    await pool.execute("DELETE FROM user_sessions WHERE token_hash = ?", [
      tokenHash,
    ]);

    res.json({
      success: true,
      message: "退出登录成功",
    });
  } catch (error) {
    console.error("退出登录错误:", error);
    res.status(500).json({
      success: false,
      error: "服务器内部错误",
    });
  }
});

// 获取用户信息
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { user_id, type } = req.user;
    let userInfo = {};

    if (type === "student") {
      const [rows] = await pool.execute(
        "SELECT id, student_id, name, email, class_name FROM students WHERE student_id = ?",
        [user_id]
      );
      if (rows.length > 0) {
        userInfo = { ...rows[0], role: "student" };
      }
    } else if (type === "teacher") {
      const [rows] = await pool.execute(
        "SELECT id, teacher_id, name, email, department, title FROM teachers WHERE teacher_id = ?",
        [user_id]
      );
      if (rows.length > 0) {
        userInfo = { ...rows[0], role: "teacher" };
      }
    } else if (type === "admin") {
      const [rows] = await pool.execute(
        "SELECT id, admin_id, name, email, role FROM admins WHERE admin_id = ?",
        [user_id]
      );
      if (rows.length > 0) {
        userInfo = rows[0];
      }
    }

    res.json({
      success: true,
      data: userInfo,
    });
  } catch (error) {
    console.error("获取用户信息错误:", error);
    res.status(500).json({
      success: false,
      error: "服务器内部错误",
    });
  }
});

// 刷新token
app.post("/api/auth/refresh", authenticateToken, async (req, res) => {
  try {
    const { user_id, type, name, role } = req.user;

    // 生成新的token
    const newToken = generateToken({
      id: req.user.id,
      user_id,
      name,
      role,
      type,
    });

    // 更新会话记录
    const oldTokenHash = crypto
      .createHash("sha256")
      .update(req.headers["authorization"].split(" ")[1])
      .digest("hex");
    const newTokenHash = crypto
      .createHash("sha256")
      .update(newToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.execute(
      "UPDATE user_sessions SET token_hash = ?, expires_at = ? WHERE token_hash = ?",
      [newTokenHash, expiresAt, oldTokenHash]
    );

    res.json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error("刷新token错误:", error);
    res.status(500).json({
      success: false,
      error: "服务器内部错误",
    });
  }
});

// ========== 数据相关API ==========

// 获取所有学生（公开接口，用于登录页面）
app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT student_id, name, class_name FROM students ORDER BY student_id"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有教师（需要管理员权限）
app.get(
  "/api/teachers",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT teacher_id, name, email, department, title, created_at FROM teachers ORDER BY teacher_id"
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// 学生提交问题（需要学生身份认证）
app.post(
  "/api/questions",
  authenticateToken,
  requireRole("student"),
  async (req, res) => {
    try {
      const { content } = req.body;
      const { user_id: student_id, name: student_name } = req.user;

      if (!content || content.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "问题内容不能为空",
        });
      }

      // 插入问题
      const [result] = await pool.execute(
        "INSERT INTO questions (student_id, student_name, content, status) VALUES (?, ?, ?, ?)",
        [student_id, student_name, content.trim(), "pending"]
      );

      res.json({
        success: true,
        data: {
          id: result.insertId,
          student_id,
          student_name,
          content: content.trim(),
          status: "pending",
        },
      });
    } catch (error) {
      console.error("提交问题错误:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// 获取所有问题（教师和管理员可查看）
app.get("/api/questions", authenticateToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;
    const { status, category, student_id } = req.query;

    let query = "SELECT * FROM questions";
    let params = [];
    let conditions = [];

    // 学生只能查看自己的问题
    if (role === "student") {
      conditions.push("student_id = ?");
      params.push(user_id);
    }

    // 添加筛选条件
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    if (student_id && (role === "teacher" || role === "admin")) {
      conditions.push("student_id = ?");
      params.push(student_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 教师回复问题
app.post(
  "/api/questions/:id/reply",
  authenticateToken,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const { user_id: teacher_id } = req.user;

      if (!reply || reply.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "回复内容不能为空",
        });
      }

      // 检查问题是否存在
      const [questionRows] = await pool.execute(
        "SELECT * FROM questions WHERE id = ?",
        [id]
      );

      if (questionRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "问题不存在",
        });
      }

      // 更新问题状态和回复
      await pool.execute(
        "UPDATE questions SET teacher_reply = ?, replied_by = ?, replied_at = NOW(), status = 'answered' WHERE id = ?",
        [reply.trim(), teacher_id, id]
      );

      res.json({
        success: true,
        message: "回复成功",
      });
    } catch (error) {
      console.error("回复问题错误:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// AI分类问题（教师和管理员权限）
app.post("/api/questions/classify", authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    const { useDeepSeek = true } = req.body; // 默认使用 DeepSeek

    if (role !== "teacher" && role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "权限不足",
      });
    }

    // 获取所有未分类的问题
    const [rows] = await pool.execute(
      'SELECT * FROM questions WHERE category IS NULL OR category = ""'
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "没有需要分类的问题",
      });
    }

    const classifications = [];

    if (useDeepSeek) {
      // 使用 DeepSeek API 进行分类
      try {
        console.log(`开始使用 DeepSeek API 分类 ${rows.length} 个问题...`);

        for (let question of rows) {
          const category = await classifyQuestionWithDeepSeek(question.content);

          // 更新数据库中的分类
          await pool.execute("UPDATE questions SET category = ? WHERE id = ?", [
            category,
            question.id,
          ]);

          classifications.push({
            id: question.id,
            content: question.content,
            category: category,
          });

          // 添加小延迟避免 API 频率限制
          if (classifications.length < rows.length) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        }

        res.json({
          success: true,
          data: classifications,
          message: `DeepSeek AI 成功分类 ${classifications.length} 个问题`,
        });
      } catch (deepSeekError) {
        console.error(
          "DeepSeek API 分类失败，回退到关键词分类:",
          deepSeekError
        );

        // DeepSeek 失败时回退到关键词分类
        for (let question of rows) {
          const category = enhancedClassifyQuestion(question.content);

          // 更新数据库中的分类
          await pool.execute("UPDATE questions SET category = ? WHERE id = ?", [
            category,
            question.id,
          ]);

          classifications.push({
            id: question.id,
            content: question.content,
            category: category,
          });
        }

        res.json({
          success: true,
          data: classifications,
          message: `关键词匹配成功分类 ${classifications.length} 个问题（DeepSeek API 不可用）`,
        });
      }
    } else {
      // 使用传统关键词匹配
      for (let question of rows) {
        const category = enhancedClassifyQuestion(question.content);

        // 更新数据库中的分类
        await pool.execute("UPDATE questions SET category = ? WHERE id = ?", [
          category,
          question.id,
        ]);

        classifications.push({
          id: question.id,
          content: question.content,
          category: category,
        });
      }

      res.json({
        success: true,
        data: classifications,
        message: `关键词匹配成功分类 ${classifications.length} 个问题`,
      });
    }
  } catch (error) {
    console.error("分类问题时出错:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取分类统计
app.get("/api/questions/stats", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as count
      FROM questions 
      WHERE category IS NOT NULL AND category != ""
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取问题示例
app.get("/api/questions/examples", async (req, res) => {
  try {
    const examples = getQuestionExamples();
    res.json({ success: true, data: examples });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 检查 DeepSeek API 状态（教师和管理员权限）
app.get("/api/deepseek/status", authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "teacher" && role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "权限不足",
      });
    }

    const status = await checkDeepSeekStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("检查 DeepSeek 状态失败:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        status: "error",
        message: "检查状态时发生错误",
        model: "deepseek-chat",
      },
    });
  }
});

// AI随机提问（学生权限）
app.get("/api/ai/random-question", authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    const { subject = "通用", difficulty = "中等" } = req.query;

    if (role !== "student") {
      return res.status(403).json({
        success: false,
        error: "只有学生可以使用此功能",
      });
    }

    try {
      // 使用 DeepSeek API 生成随机问题
      const randomQuestion = await generateRandomQuestionWithDeepSeek(
        subject,
        difficulty
      );

      res.json({
        success: true,
        data: {
          question: randomQuestion,
          subject: subject,
          difficulty: difficulty,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (deepSeekError) {
      console.error("DeepSeek API 生成问题失败，使用预设问题:", deepSeekError);

      // DeepSeek 失败时回退到预设问题
      const fallbackQuestion = getFallbackRandomQuestion(subject, difficulty);

      res.json({
        success: true,
        data: {
          question: fallbackQuestion,
          subject: subject,
          difficulty: difficulty,
          timestamp: new Date().toISOString(),
          fallback: true,
        },
        message: "AI暂时不可用，返回预设问题",
      });
    }
  } catch (error) {
    console.error("生成随机问题失败:", error);
    res.status(500).json({
      success: false,
      error: "生成问题失败，请重试",
    });
  }
});

// 启动服务器
async function startServer() {
  await initDatabase();
  await initStudents();
  await initTeachers();
  await initAdmins();

  app.listen(port, () => {
    console.log(`课堂互动系统后端服务器运行在 http://localhost:${port}`);
    console.log("默认账号信息:");
    console.log("学生账号: ST001-ST025, 密码: 123456");
    console.log("教师账号: T001-T003, 密码: 123456");
    console.log("管理员账号: admin, 密码: admin123");
  });
}

startServer().catch(console.error);
