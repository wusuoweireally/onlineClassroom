// 演示数据生成脚本
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "12345678", // 请根据实际情况修改
  database: "classroom_system",
};

const demoQuestions = [
  { student_id: "ST001", content: "向心加速度的定义式是怎么推导出来的？" },
  { student_id: "ST002", content: "牛顿第二定律怎么用在斜面滑块问题上？" },
  { student_id: "ST003", content: "动能定理和机械能守恒定律有什么区别？" },
  { student_id: "ST004", content: "为什么物体会有惯性？" },
  { student_id: "ST005", content: "这个物理实验的具体操作步骤是什么？" },
  { student_id: "ST006", content: "这道力学题应该用什么公式计算？" },
  { student_id: "ST007", content: "我不理解这个概念，能详细解释一下吗？" },
  { student_id: "ST008", content: "怎么才能学好物理？" },
  { student_id: "ST009", content: "电流的概念是什么？" },
  { student_id: "ST010", content: "如何用欧姆定律解决这类题目？" },
  { student_id: "ST011", content: "电压和电流有什么关系？" },
  { student_id: "ST012", content: "为什么会产生电磁感应？" },
  { student_id: "ST013", content: "如何测量物体的密度？" },
  { student_id: "ST014", content: "怎么算出物体的速度？" },
  { student_id: "ST015", content: "这个地方我有些困惑" },
  { student_id: "ST016", content: "有什么记忆公式的技巧？" },
  { student_id: "ST017", content: "功的定义是什么？" },
  { student_id: "ST018", content: "能量守恒定律在机械运动中怎么应用？" },
  { student_id: "ST019", content: "动量和冲量的区别是什么？" },
  { student_id: "ST020", content: "为什么会发生共振现象？" },
];

async function addDemoQuestions() {
  let pool;
  try {
    pool = mysql.createPool(dbConfig);

    console.log("开始添加演示问题...");

    for (let question of demoQuestions) {
      // 获取学生姓名
      const [studentRows] = await pool.execute(
        "SELECT name FROM students WHERE student_id = ?",
        [question.student_id]
      );

      if (studentRows.length > 0) {
        const student_name = studentRows[0].name;

        // 检查问题是否已存在
        const [existingQuestions] = await pool.execute(
          "SELECT id FROM questions WHERE student_id = ? AND content = ?",
          [question.student_id, question.content]
        );

        if (existingQuestions.length === 0) {
          await pool.execute(
            "INSERT INTO questions (student_id, student_name, content) VALUES (?, ?, ?)",
            [question.student_id, student_name, question.content]
          );
          console.log(`✅ 添加问题: ${question.content}`);
        } else {
          console.log(`⚠️  问题已存在: ${question.content}`);
        }
      }
    }

    console.log("演示问题添加完成！");
  } catch (error) {
    console.error("添加演示问题失败:", error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

addDemoQuestions();
