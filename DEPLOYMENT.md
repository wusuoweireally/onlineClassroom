# 课堂互动系统部署和使用说明

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- pnpm 包管理器

### 安装步骤

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd onlineClassroom
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **配置数据库**

   ```bash
   # 创建数据库
   mysql -u root -p -e "CREATE DATABASE classroom_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

4. **环境配置（可选）**

   ```bash
   # 复制环境变量模板
   cp .env.example .env

   # 编辑 .env 文件，配置数据库和 DeepSeek API
   nano .env
   ```

5. **启动应用**

   ```bash
   # 同时启动前端和后端
   npm run dev:full

   # 或分别启动
   npm run server  # 启动后端服务器 (端口 3001)
   npm run dev     # 启动前端开发服务器 (端口 5174)
   ```

## 📱 系统访问

- **前端地址**: http://localhost:5174
- **后端 API**: http://localhost:3001

## 👥 默认账号

### 学生账号

- 学号: ST001-ST025
- 密码: 123456

### 教师账号

- 工号: T001-T003
- 密码: 123456

### 管理员账号

- 用户名: admin
- 密码: admin123

## 🎯 功能说明

### 学生端功能

- ✅ 用户登录/登出
- ✅ 提交问题
- ✅ 查看提问历史
- ✅ 查看教师回复
- ✅ 问题状态跟踪

### 教师端功能

- ✅ 用户登录/登出
- ✅ 查看所有学生问题
- ✅ AI 智能分类（支持 DeepSeek 和关键词匹配）
- ✅ 问题筛选和搜索
- ✅ 分类统计图表
- ✅ 回复学生问题（功能已预留）

### 管理员功能

- ✅ 用户登录/登出
- ✅ 系统数据统计
- ✅ 用户管理
- ✅ 问题管理
- ✅ AI 分类管理

## 🤖 AI 功能配置

### DeepSeek AI 配置

1. **获取 API Key**

   - 访问 https://platform.deepseek.com/
   - 注册账号并获取 API Key

2. **配置环境变量**

   ```bash
   # 在 .env 文件中添加
   DEEPSEEK_API_KEY=your-deepseek-api-key-here
   ```

3. **验证配置**
   ```bash
   # 测试 DeepSeek API 状态
   curl -H "Authorization: Bearer <teacher-token>" http://localhost:3001/api/deepseek/status
   ```

### 关键词分类

- 无需配置，系统默认支持
- 支持 8 种问题分类
- 基于中文关键词匹配

## 🛠️ 开发和测试

### 运行测试

```bash
npm test
```

### 添加演示数据

```bash
npm run demo
```

### 数据库操作

```bash
# 查看问题统计
mysql -u root -p classroom_system -e "SELECT category, COUNT(*) FROM questions GROUP BY category;"

# 重置学生密码
mysql -u root -p classroom_system -e "UPDATE students SET password = '\$2b\$10\$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG';"
```

## 📊 系统架构

### 技术栈

- **前端**: Vue 3 + Element Plus + Pinia + Vue Router
- **后端**: Node.js + Express + MySQL2
- **认证**: JWT + bcryptjs
- **AI**: DeepSeek API + 关键词匹配

### 数据库表结构

- `students` - 学生信息
- `teachers` - 教师信息
- `admins` - 管理员信息
- `questions` - 问题数据
- `user_sessions` - 用户会话

### API 端点

```
POST /api/auth/student/login   - 学生登录
POST /api/auth/teacher/login   - 教师登录
POST /api/auth/admin/login     - 管理员登录
GET  /api/questions            - 获取问题列表
POST /api/questions            - 提交问题
POST /api/questions/classify   - AI分类
GET  /api/questions/stats      - 统计数据
GET  /api/deepseek/status      - DeepSeek状态
```

## 🚀 生产部署

### 环境变量

```bash
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=classroom_system
JWT_SECRET=your-secret-key
DEEPSEEK_API_KEY=your-deepseek-key
```

### 构建和启动

```bash
# 构建前端
npm run build

# 生产环境启动后端
NODE_ENV=production npm run server
```

### 反向代理（Nginx 示例）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**

   - 检查 MySQL 服务是否启动
   - 验证数据库配置信息
   - 确认数据库用户权限

2. **登录失败**

   - 检查密码字段是否存在
   - 运行测试脚本验证账号

3. **DeepSeek API 错误**

   - 检查 API Key 是否正确
   - 验证网络连接
   - 查看 API 余额和限制

4. **端口冲突**
   - 修改 `package.json` 中的端口配置
   - 或使用环境变量 `PORT`

### 调试模式

```bash
# 查看详细日志
DEBUG=* npm run server

# 数据库调试
mysql -u root -p classroom_system -e "SHOW TABLES;"
```

## 📞 支持

如有问题，请查看：

- 系统日志：浏览器控制台和服务器终端
- 测试脚本：`npm test`
- 数据库状态：检查表结构和数据

## 🎓 演示说明

1. 打开 http://localhost:5174
2. 使用默认账号登录
3. 学生端：提交问题，查看回复
4. 教师端：查看问题，进行 AI 分类
5. 管理员：查看系统统计，管理用户
