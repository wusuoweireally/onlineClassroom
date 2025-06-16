// AI 问题分类增强模块
export const questionCategories = [
  {
    name: "知识点定义类问题",
    keywords: [
      "定义",
      "是什么",
      "含义",
      "概念",
      "什么叫",
      "如何定义",
      "推导",
      "公式是什么",
      "定理",
      "定律",
    ],
    examples: [
      "向心加速度的定义式是怎么推导出来的？",
      "动量的概念是什么？",
      "什么叫做牛顿第一定律？",
      "能量守恒定律的定义是什么？",
    ],
  },
  {
    name: "知识点应用类问题",
    keywords: [
      "怎么用",
      "如何应用",
      "怎么解",
      "计算",
      "求解",
      "应用",
      "解题",
      "运用",
      "实际中",
    ],
    examples: [
      "牛顿第二定律怎么用在斜面滑块问题上？",
      "如何用动能定理解决这类题目？",
      "这个公式在实际中怎么应用？",
      "怎么计算物体的加速度？",
    ],
  },
  {
    name: "知识点关联类问题",
    keywords: [
      "区别",
      "联系",
      "关系",
      "比较",
      "不同",
      "相同",
      "异同",
      "对比",
      "差异",
    ],
    examples: [
      "动能定理和机械能守恒定律有什么区别？",
      "速度和加速度有什么关系？",
      "重力和重量的区别是什么？",
      "电流和电压有什么联系？",
    ],
  },
  {
    name: "实验操作类问题",
    keywords: [
      "实验",
      "操作",
      "步骤",
      "过程",
      "做法",
      "实施",
      "测量",
      "观察",
      "记录",
    ],
    examples: [
      "这个物理实验的具体操作步骤是什么？",
      "如何测量物体的密度？",
      "实验中需要注意什么？",
      "怎么记录实验数据？",
    ],
  },
  {
    name: "现象解释类问题",
    keywords: [
      "为什么",
      "原因",
      "解释",
      "现象",
      "原理",
      "机制",
      "成因",
      "如何产生",
    ],
    examples: [
      "为什么物体会有惯性？",
      "为什么会发生这种现象？",
      "这个现象的原理是什么？",
      "为什么会产生电磁感应？",
    ],
  },
  {
    name: "计算方法类问题",
    keywords: ["计算", "公式", "方法", "步骤", "解题", "求", "算出", "怎么算"],
    examples: [
      "这道力学题应该用什么公式计算？",
      "怎么算出物体的速度？",
      "计算电阻的方法是什么？",
      "如何求解这个问题？",
    ],
  },
  {
    name: "疑难困惑类问题",
    keywords: [
      "不懂",
      "困惑",
      "疑问",
      "不理解",
      "难理解",
      "搞不清",
      "弄不明白",
      "看不懂",
    ],
    examples: [
      "我不理解这个概念，能详细解释一下吗？",
      "这个地方我有些困惑",
      "我搞不清楚这两个概念的区别",
      "这个公式我看不懂",
    ],
  },
  {
    name: "学习方法类问题",
    keywords: [
      "怎么学",
      "如何记忆",
      "学习方法",
      "记忆技巧",
      "复习",
      "预习",
      "总结",
    ],
    examples: [
      "怎么才能学好物理？",
      "有什么记忆公式的技巧？",
      "如何复习这一章的内容？",
      "学习物理的方法有哪些？",
    ],
  },
];

// 增强的AI分类算法
export function enhancedClassifyQuestion(content) {
  const contentLower = content.toLowerCase();

  // 为每个分类计算匹配分数
  const scores = questionCategories.map((category) => {
    let score = 0;

    // 关键词匹配
    for (let keyword of category.keywords) {
      if (contentLower.includes(keyword)) {
        score += 1;
      }
    }

    // 长关键词给予更高权重
    for (let keyword of category.keywords) {
      if (keyword.length > 2 && contentLower.includes(keyword)) {
        score += 0.5;
      }
    }

    return {
      category: category.name,
      score: score,
    };
  });

  // 找到得分最高的分类
  const bestMatch = scores.reduce((max, current) =>
    current.score > max.score ? current : max
  );

  // 如果没有匹配到任何关键词，返回"其他类问题"
  return bestMatch.score > 0 ? bestMatch.category : "其他类问题";
}

// 获取问题示例
export function getQuestionExamples() {
  const examples = [];
  questionCategories.forEach((category) => {
    examples.push(...category.examples);
  });
  return examples;
}
