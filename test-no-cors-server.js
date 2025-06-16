// 临时创建一个没有 CORS 的服务器来演示区别
import express from "express";

const app = express();
const port = 3002;

// 注意：这里故意不使用 cors() 中间件

app.get("/api/test", (req, res) => {
  console.log("服务器收到了请求！"); // 证明服务器确实收到了请求
  res.json({
    message: "服务器成功处理了请求",
    timestamp: new Date().toISOString(),
    receivedRequest: true,
  });
});
app.listen(port, () => {
  console.log("这个服务器故意不设置 CORS 头，用来演示浏览器的行为");
  console.log(`没有 CORS 的测试服务器运行在 http://localhost:${port}`);
});
/* 
你好啊
*/
