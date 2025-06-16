import mysql from "mysql2/promise";

// 数据库配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "12345678", // 修正为正确的密码
  database: "classroom_system", // 修正为正确的数据库名
};

// 示例问题数据
const sampleQuestions = [
  {
    student_id: "ST001",
    content: "什么是向心加速度？它的定义式是如何推导出来的？",
  },
  {
    student_id: "ST002",
    content: "牛顿第二定律在斜面滑块问题中应该怎么应用？",
  },
  {
    student_id: "ST003",
    content: "动能定理和机械能守恒定律之间有什么区别和联系？",
  },
  {
    student_id: "ST004",
    content: "为什么自由落体实验要在真空中进行？",
  },
  {
    student_id: "ST005",
    content: "如何用弹簧测力计测量物体的重力？具体步骤是什么？",
  },
  {
    student_id: "ST006",
    content: "这道关于圆周运动的题目应该用什么公式来计算？",
  },
  {
    student_id: "ST007",
    content: "我总是搞不清楚速度和加速度的区别，能解释一下吗？",
  },
  {
    student_id: "ST008",
    content: "学习物理有什么好的记忆公式的方法吗？",
  },
  {
    student_id: "ST009",
    content: "电场强度的定义是什么？",
  },
  {
    student_id: "ST010",
    content: "如何在电路分析中应用欧姆定律？",
  },
  {
    student_id: "ST011",
    content: "电场和磁场之间有什么关系？",
  },
  {
    student_id: "ST012",
    content: "为什么金属导体在通电时会发热？",
  },
  {
    student_id: "ST013",
    content: "用万用表测量电阻的正确操作步骤是什么？",
  },
  {
    student_id: "ST014",
    content: "这道电路功率计算题我不知道从哪里入手？",
  },
  {
    student_id: "ST015",
    content: "为什么并联电路中各支路电压相等？我总是理解不了。",
  },
  {
    student_id: "ST016",
    content: "怎样才能更好地理解电磁感应现象？",
  },
  {
    student_id: "ST017",
    content: "什么是波的干涉现象？",
  },
  {
    student_id: "ST018",
    content: "声波在空气中的传播速度如何计算？",
  },
  {
    student_id: "ST019",
    content: "光的波动性和粒子性之间是什么关系？",
  },
  {
    student_id: "ST020",
    content: "为什么会出现多普勒效应？",
  },
  {
    student_id: "ST021",
    content: "如何用示波器观察声波的波形？",
  },
  {
    student_id: "ST022",
    content: "关于波长、频率和波速的关系，这道题该怎么解？",
  },
  {
    student_id: "ST023",
    content: "我对波的反射和折射现象很困惑，能详细解释一下吗？",
  },
  {
    student_id: "ST024",
    content: "学习波动这一章有什么好的方法和技巧？",
  },
  {
    student_id: "ST025",
    content: "原子核的结构是怎样的？",
  },
];

async function addSampleQuestions() {
  let connection;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log("已连接到数据库");

    // 清空现有问题（可选）
    console.log("清空现有问题数据...");
    await connection.execute("DELETE FROM questions");

    // 插入示例问题
    console.log("开始插入示例问题...");

    for (const question of sampleQuestions) {
      try {
        // 先获取学生姓名
        const [studentRows] = await connection.execute(
          "SELECT name FROM students WHERE student_id = ?",
          [question.student_id]
        );

        const student_name =
          studentRows.length > 0
            ? studentRows[0].name
            : `学生${question.student_id.slice(2)}`;

        await connection.execute(
          "INSERT INTO questions (student_id, student_name, content) VALUES (?, ?, ?)",
          [question.student_id, student_name, question.content]
        );
        console.log(`✓ 已添加问题: ${question.content.substring(0, 30)}...`);
      } catch (error) {
        console.error(`✗ 添加问题失败: ${error.message}`);
      }
    }

    // 检查插入结果
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM questions"
    );
    console.log(`\n✅ 成功添加 ${rows[0].count} 个示例问题`);
  } catch (error) {
    console.error("操作失败:", error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("数据库连接已关闭");
    }
  }
}

// 运行脚本
addSampleQuestions().catch(console.error);

export { addSampleQuestions };
