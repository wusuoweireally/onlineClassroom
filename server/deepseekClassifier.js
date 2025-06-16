/**
 * DeepSeek AI 分类器
 *
 * 功能：使用 DeepSeek AI API 对学生问题进行智能分类
 * 作者：课堂互动系统
 *
 * 主要功能：
 * 1. 检查 DeepSeek API 连接状态
 * 2. 使用 AI 对单个问题进行分类
 * 3. 批量分类多个问题
 */
import axios from "axios";

// ==================== 配置部分 ====================

// DeepSeek API 基础配置
const API_CONFIG = {
  baseURL: "https://api.deepseek.com/v1",
  model: "deepseek-chat",
  maxTokens: 100, // 分类只需要简短回复，减少 token 消耗
  temperature: 0.1, // 低温度保证结果稳定
  timeout: 15000, // 15秒超时
};

// 预定义的8个问题分类
const CATEGORIES = [
  "知识点定义类问题",
  "知识点应用类问题",
  "知识点关联类问题",
  "实验操作类问题",
  "现象解释类问题",
  "计算方法类问题",
  "疑难困惑类问题",
  "其他类问题",
];

// AI 分类提示词模板
const CLASSIFICATION_PROMPT = `你是教育问题分类专家。请将学生问题分类到以下8个类别之一：

1. 知识点定义类问题 - 询问概念、定义、公式
2. 知识点应用类问题 - 询问如何应用、解题方法
3. 知识点关联类问题 - 询问知识点关系、区别
4. 实验操作类问题 - 询问实验步骤、操作方法
5. 现象解释类问题 - 询问现象原因、原理
6. 计算方法类问题 - 询问计算步骤、公式使用
7. 疑难困惑类问题 - 表达困惑、不理解
8. 其他类问题 - 其他类型

请只返回类别名称，如"知识点定义类问题"。

问题：`;

// AI 随机问题生成提示词模板
const RANDOM_QUESTION_PROMPT = `你是一位经验丰富的教师，需要为学生生成一个有价值的学习问题。

要求：
1. 问题要具有启发性和教育意义
2. 难度适中，适合学生思考
3. 问题表述清晰，易于理解
4. 涵盖核心知识点
5. 能够促进深度思考

学科：{subject}
难度：{difficulty}

请生成一个符合上述要求的问题，只返回问题本身，不要包含其他内容。`;

// ==================== 核心功能函数 ====================

/**
 * 检查 DeepSeek API 连接状态
 *
 * 工作流程：
 * 1. 检查是否配置了 API 密钥
 * 2. 发送测试请求到 DeepSeek API
 * 3. 根据响应判断连接状态
 *
 * @returns {Object} 状态对象 {status, message, model}
 */
export async function checkDeepSeekStatus() {
  console.log("🔍 检查 DeepSeek API 状态...");

  // 步骤1: 检查 API 密钥
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      status: "error",
      message: "DeepSeek API 密钥未配置",
      model: API_CONFIG.model,
    };
  }

  try {
    // 步骤2: 发送测试请求
    const response = await axios.post(
      `${API_CONFIG.baseURL}/chat/completions`,
      {
        model: API_CONFIG.model,
        messages: [{ role: "user", content: "测试连接" }],
        max_tokens: 5,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: API_CONFIG.timeout,
      }
    );

    // 步骤3: 检查响应状态
    return response.status === 200
      ? {
          status: "connected",
          message: "DeepSeek API 连接正常",
          model: API_CONFIG.model,
        }
      : {
          status: "error",
          message: "DeepSeek API 响应异常",
          model: API_CONFIG.model,
        };
  } catch (error) {
    console.error("❌ DeepSeek API 连接失败:", error.message);

    // 根据错误类型返回具体错误信息
    if (error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
      return {
        status: "error",
        message: "网络连接失败，无法访问 DeepSeek API",
        model: API_CONFIG.model,
      };
    } else if (error.response?.status === 401) {
      return {
        status: "error",
        message: "DeepSeek API 密钥无效",
        model: API_CONFIG.model,
      };
    } else {
      return {
        status: "error",
        message: `API 错误: ${error.message}`,
        model: API_CONFIG.model,
      };
    }
  }
}

/**
 * 使用 DeepSeek AI 对单个问题进行分类
 *
 * 工作原理：
 * 1. 构造包含分类指令和问题的提示词
 * 2. 调用 DeepSeek API 获取分类结果
 * 3. 验证并标准化分类结果
 * 4. 如果结果无效，使用智能匹配找到最合适的分类
 *
 * @param {string} questionContent - 要分类的问题内容
 * @returns {Promise<string>} 分类结果（8个预定义分类之一）
 */
export async function classifyQuestionWithDeepSeek(questionContent) {
  console.log("🤖 开始 AI 分类:", questionContent.substring(0, 50) + "...");

  // 步骤1: 检查 API 密钥
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API 密钥未配置");
  }

  try {
    // 步骤2: 调用 DeepSeek API
    const response = await axios.post(
      `${API_CONFIG.baseURL}/chat/completions`,
      {
        model: API_CONFIG.model,
        messages: [
          {
            role: "user",
            content: CLASSIFICATION_PROMPT + questionContent,
          },
        ],
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: API_CONFIG.timeout,
      }
    );

    // 步骤3: 提取 AI 的分类结果
    const aiResponse = response.data?.choices?.[0]?.message?.content?.trim();
    if (!aiResponse) {
      throw new Error("DeepSeek API 返回数据格式错误");
    }

    // 步骤4: 验证并标准化分类结果
    const category = validateAndNormalizeCategory(aiResponse);
    console.log("✅ 分类成功:", category);

    return category;
  } catch (error) {
    console.error("❌ DeepSeek 分类失败:", error.message);
    throw error;
  }
}

/**
 * 验证并标准化分类结果
 *
 * 这个函数解决 AI 返回结果不标准的问题：
 * - AI 可能返回"1. 知识点定义类问题"而不是"知识点定义类问题"
 * - AI 可能返回相似但不完全匹配的分类名称
 * - 通过精确匹配和模糊匹配确保返回有效分类
 *
 * @param {string} aiResponse - AI 返回的原始分类结果
 * @returns {string} 标准化的分类名称
 */
function validateAndNormalizeCategory(aiResponse) {
  console.log("🔍 验证分类结果:", aiResponse);

  // 精确匹配：检查是否包含完整的分类名称
  for (const category of CATEGORIES) {
    if (aiResponse.includes(category)) {
      return category;
    }
  }

  // 模糊匹配：根据关键词判断分类意图
  const lowerResponse = aiResponse.toLowerCase();

  if (lowerResponse.includes("定义") || lowerResponse.includes("概念")) {
    return "知识点定义类问题";
  }
  if (lowerResponse.includes("应用") || lowerResponse.includes("解题")) {
    return "知识点应用类问题";
  }
  if (
    lowerResponse.includes("关联") ||
    lowerResponse.includes("关系") ||
    lowerResponse.includes("区别")
  ) {
    return "知识点关联类问题";
  }
  if (lowerResponse.includes("实验") || lowerResponse.includes("操作")) {
    return "实验操作类问题";
  }
  if (
    lowerResponse.includes("现象") ||
    lowerResponse.includes("原理") ||
    lowerResponse.includes("为什么")
  ) {
    return "现象解释类问题";
  }
  if (lowerResponse.includes("计算") || lowerResponse.includes("公式")) {
    return "计算方法类问题";
  }
  if (
    lowerResponse.includes("困惑") ||
    lowerResponse.includes("不懂") ||
    lowerResponse.includes("疑问")
  ) {
    return "疑难困惑类问题";
  }

  // 如果都匹配不上，返回默认分类
  console.log("⚠️ 无法精确分类，使用默认分类");
  return "其他类问题";
}

/**
 * 批量分类多个问题
 *
 * 批量处理的优势：
 * - 减少单独调用的开销
 * - 提供进度反馈
 * - 自动失败重试（回退到关键词分类）
 * - 控制 API 调用频率避免限流
 *
 * @param {Array} questions - 问题列表，每个问题包含 {id, content}
 * @param {Function} onProgress - 进度回调函数 (current, total) => {}
 * @returns {Promise<Array>} 分类结果列表
 */
export async function batchClassifyQuestions(questions, onProgress) {
  console.log(`📝 开始批量分类 ${questions.length} 个问题`);
  const results = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`\n[${i + 1}/${questions.length}] 分类问题 ID: ${question.id}`);

    try {
      // 尝试使用 DeepSeek AI 分类
      const category = await classifyQuestionWithDeepSeek(question.content);

      results.push({
        id: question.id,
        content: question.content,
        category: category,
        method: "deepseek", // 标记分类方法
      });
    } catch (error) {
      console.error(`❌ 问题 ${question.id} DeepSeek 分类失败，使用备用方案`);

      // 如果 DeepSeek 失败，回退到关键词分类
      try {
        const { enhancedClassifyQuestion } = await import("./aiClassifier.js");
        const fallbackCategory = enhancedClassifyQuestion(question.content);

        results.push({
          id: question.id,
          content: question.content,
          category: fallbackCategory,
          method: "fallback", // 标记为备用方案
        });

        console.log(`🔄 备用分类成功: ${fallbackCategory}`);
      } catch (fallbackError) {
        console.error(`❌ 备用分类也失败:`, fallbackError.message);

        // 如果备用分类也失败，使用默认分类
        results.push({
          id: question.id,
          content: question.content,
          category: "其他类问题",
          method: "default",
        });
      }
    }

    // 调用进度回调
    if (onProgress) {
      onProgress(i + 1, questions.length);
    }

    // API 限流控制：避免请求过于频繁
    if (i < questions.length - 1) {
      console.log("⏱️ 等待 1 秒避免 API 限流...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n✅ 批量分类完成! 总计: ${results.length} 个问题`);
  return results;
}

/**
 * 🎯 使用 DeepSeek API 生成随机学习问题
 *
 * 工作流程：
 * 1. 构建问题生成提示词
 * 2. 调用 DeepSeek API
 * 3. 验证和处理返回结果
 * 4. 返回生成的问题
 *
 * @param {string} subject - 学科领域
 * @param {string} difficulty - 难度级别
 * @returns {Promise<string>} 生成的随机问题
 */
export async function generateRandomQuestionWithDeepSeek(
  subject = "通用",
  difficulty = "中等"
) {
  console.log(`🎯 开始生成随机问题 - 学科: ${subject}, 难度: ${difficulty}`);

  try {
    // 检查 API 密钥
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("❌ DeepSeek API 密钥未配置");
    }

    // 构建问题生成提示词
    const prompt = RANDOM_QUESTION_PROMPT.replace("{subject}", subject).replace(
      "{difficulty}",
      difficulty
    );

    console.log("📝 构建问题生成提示词完成");

    // 调用 DeepSeek API
    const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: API_CONFIG.maxTokens,
        temperature: 0.8, // 提高创造性
        timeout: API_CONFIG.timeout,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ DeepSeek API 请求失败: ${response.status} - ${errorText}`
      );
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 DeepSeek API 响应:", JSON.stringify(data, null, 2));

    // 提取生成的问题
    const generatedQuestion = data.choices?.[0]?.message?.content?.trim();

    if (!generatedQuestion) {
      console.error("❌ API 响应中没有找到生成的问题");
      throw new Error("API 响应格式错误");
    }

    console.log(`✅ 成功生成随机问题: ${generatedQuestion}`);
    return generatedQuestion;
  } catch (error) {
    console.error(`❌ 生成随机问题失败:`, error);
    throw error;
  }
}

/**
 * 🔄 获取预设的随机问题（当 AI 不可用时使用）
 *
 * @param {string} subject - 学科领域
 * @param {string} difficulty - 难度级别
 * @returns {string} 预设的随机问题
 */
export function getFallbackRandomQuestion(
  subject = "通用",
  difficulty = "中等"
) {
  console.log(`🔄 使用预设问题 - 学科: ${subject}, 难度: ${difficulty}`);

  const fallbackQuestions = {
    数学: {
      简单: [
        "什么是分数？分数的分子和分母分别表示什么？",
        "如何计算两个数的最大公约数？",
        "什么是质数？请举几个例子。",
      ],
      中等: [
        "二次方程的求根公式是如何推导出来的？",
        "三角函数在实际生活中有哪些应用？",
        "如何理解函数的单调性和极值？",
      ],
      困难: [
        "微积分的基本定理说明了什么？",
        "如何证明欧拉公式 e^(iπ) + 1 = 0？",
        "什么是拓扑空间？它与欧几里得空间有什么区别？",
      ],
    },
    物理: {
      简单: [
        "什么是力？力的三要素是什么？",
        "光的传播速度是多少？在不同介质中会发生什么变化？",
        "什么是电流？电流的方向是如何定义的？",
      ],
      中等: [
        "牛顿第二定律是如何表述的？它在实际中如何应用？",
        "什么是电磁感应？法拉第定律的内容是什么？",
        "波的干涉现象是如何产生的？有哪些实际应用？",
      ],
      困难: [
        "相对论中的时间膨胀效应是如何产生的？",
        "量子力学中的不确定性原理说明了什么？",
        "什么是黑洞？霍金辐射的原理是什么？",
      ],
    },
    化学: {
      简单: [
        "什么是化学键？离子键和共价键有什么区别？",
        "原子的结构是怎样的？电子、质子、中子的作用是什么？",
        "什么是化学反应？反应前后质量守恒的原理是什么？",
      ],
      中等: [
        "酸碱反应的本质是什么？pH值是如何定义的？",
        "有机化合物的分类依据是什么？",
        "化学平衡是如何建立的？勒夏特列原理的内容是什么？",
      ],
      困难: [
        "分子轨道理论是如何解释化学键的？",
        "催化剂是如何影响反应速率的？催化机理是什么？",
        "配位化合物的结构特点和性质是什么？",
      ],
    },
    通用: {
      简单: [
        "什么是学习？有效学习的基本原则是什么？",
        "如何培养良好的学习习惯？",
        "为什么要设定学习目标？如何设定合理的目标？",
      ],
      中等: [
        "批判性思维包含哪些要素？如何培养批判性思维？",
        "什么是元认知？它对学习有什么帮助？",
        "如何在学习中保持专注力？有哪些有效的方法？",
      ],
      困难: [
        "知识的本质是什么？知识与信息、数据有什么区别？",
        "创新思维是如何产生的？如何培养创新能力？",
        "人工智能对教育的影响是什么？未来教育会如何发展？",
      ],
    },
  };

  const subjectQuestions =
    fallbackQuestions[subject] || fallbackQuestions["通用"];
  const difficultyQuestions =
    subjectQuestions[difficulty] || subjectQuestions["中等"];

  // 随机选择一个问题
  const randomIndex = Math.floor(Math.random() * difficultyQuestions.length);
  const selectedQuestion = difficultyQuestions[randomIndex];

  console.log(`✅ 选择预设问题: ${selectedQuestion}`);
  return selectedQuestion;
}

// ==================== 工具函数 ====================

/**
 * 获取 DeepSeek 配置信息
 * 用于调试和监控
 */
export function getDeepSeekConfig() {
  return {
    model: API_CONFIG.model,
    maxTokens: API_CONFIG.maxTokens,
    temperature: API_CONFIG.temperature,
    endpoint: API_CONFIG.baseURL,
    categories: CATEGORIES,
    hasApiKey: !!process.env.DEEPSEEK_API_KEY,
  };
}

/**
 * 获取可用的分类列表
 */
export function getAvailableCategories() {
  return [...CATEGORIES]; // 返回分类的副本
}
