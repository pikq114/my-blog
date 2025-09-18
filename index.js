// index.js
const Hexo = require('hexo');
const hexo = new Hexo(process.cwd(), {});

hexo.init()
  .then(() => hexo.call('server', [])) // 启动本地服务器
  .then(() => hexo.exit())
  .catch(err => {
    console.error(err);
    hexo.exit(err);
  });
