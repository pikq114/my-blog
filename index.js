#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// 设置环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 检查是否存在hexo配置文件
const configPath = path.join(process.cwd(), '_config.yml');

if (!fs.existsSync(configPath)) {
    console.error('Error: _config.yml not found. Please make sure you are in a Hexo project directory.');
    process.exit(1);
}

try {
    // 引入Hexo
    const Hexo = require('hexo');
    
    // 创建Hexo实例
    const hexo = new Hexo(process.cwd(), {
        debug: false,
        safe: false,
        silent: false
    });
    
    // 初始化Hexo
    hexo.init().then(() => {
        console.log('Hexo initialized successfully');
        
        // 如果是生产环境，先生成静态文件
        if (process.env.NODE_ENV === 'production') {
            console.log('Generating static files...');
            return hexo.call('generate');
        }
        return Promise.resolve();
    }).then(() => {
        console.log('Starting Hexo server...');
        
        // 启动服务器
        return hexo.call('server', {
            port: process.env.PORT || 4000,
            ip: process.env.HOST || '0.0.0.0',
            logger: true
        });
    }).then(() => {
        console.log(`Hexo server is running on http://0.0.0.0:${process.env.PORT || 4000}`);
    }).catch(err => {
        console.error('Error starting Hexo:', err);
        process.exit(1);
    });

} catch (error) {
    console.error('Failed to load Hexo:', error.message);
    
    // 备用方案：使用简单的HTTP服务器
    console.log('Falling back to simple HTTP server...');
    
    const http = require('http');
    const url = require('url');
    
    // 检查是否存在public目录（生成的静态文件）
    const publicDir = path.join(process.cwd(), 'public');
    
    if (fs.existsSync(publicDir)) {
        // 提供静态文件服务
        const server = http.createServer((req, res) => {
            const pathname = url.parse(req.url).pathname;
            let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);
            
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('404 Not Found');
                } else {
                    const ext = path.extname(filePath);
                    let contentType = 'text/html';
                    
                    switch (ext) {
                        case '.css':
                            contentType = 'text/css';
                            break;
                        case '.js':
                            contentType = 'text/javascript';
                            break;
                        case '.json':
                            contentType = 'application/json';
                            break;
                    }
                    
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                }
            });
        });
        
        const port = process.env.PORT || 4000;
        server.listen(port, '0.0.0.0', () => {
            console.log(`Static file server running on http://0.0.0.0:${port}`);
        });
    } else {
        // 如果没有生成的文件，创建一个简单的欢迎页面
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Hexo博客启动中</title>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .container { max-width: 600px; margin: 0 auto; }
                        h1 { color: #333; }
                        p { color: #666; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>欢迎来到你的博客</h1>
                        <p>Hexo正在初始化中，请稍等片刻...</p>
                        <p>如果持续显示此页面，请检查Hexo配置是否正确。</p>
                    </div>
                </body>
                </html>
            `);
        });
        
        const port = process.env.PORT || 4000;
        server.listen(port, '0.0.0.0', () => {
            console.log(`Welcome server running on http://0.0.0.0:${port}`);
        });
    }
}
