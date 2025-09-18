// index.js

console.log("程序启动成功！");

// 例如，如果你要跑一个 Bot/服务器，可以在这里写启动逻辑
// 比如监听 HTTP 请求：
const http = require("http");

const server = http.createServer((req, res) => {
  res.end("Hello World!");
});

server.listen(3000, () => {
  console.log("服务器运行在 http://localhost:3000");
});
