const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const app = express();

// 静态资源目录（Vue + Element UI 前端页面）
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 路由 1：执行 Python 脚本
app.get('/run-python', (req, res) => {
  exec('python3 main.py', (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr);
    res.send(stdout);
  });
});

// 路由 2：执行 Node 脚本
app.get('/run-node', (req, res) => {
  exec('node index.js', (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr);
    res.send(stdout);
  });
});

// 路由 3：依次执行 Python + Node 脚本
app.get('/run-all', (req, res) => {
  const scriptPath = path.join(__dirname, 'main.py');
  exec(`python3 ${scriptPath}`, (pyErr, pyOut, pyStderr) => {
    if (pyErr) return res.status(500).send(`[Python Error]\n${pyStderr}`);
    exec('node index.js', (nodeErr, nodeOut, nodeStderr) => {
      if (nodeErr) return res.status(500).send(`[Node Error]\n${nodeStderr}`);
      const result = `[Python Output]\n${pyOut}\n\n[Node.js Output]\n${nodeOut}`;
      res.send(result);
    });
  });
});

// 路由 4：下载 excel_datas 目录下所有 .json 文件为 zip 包
app.get('/download-jsons', (req, res) => {
  const dirPath = path.join(__dirname, 'datas/excel_datas');
  const zipName = 'data.zip';
  const zipPath = path.join(__dirname, zipName);

  // 创建压缩文件流
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    // 确保所有文件都压缩完毕后再进行下载
    res.download(zipPath, zipName, (err) => {
      if (err) console.error('Download error:', err);
      fs.unlinkSync(zipPath); // 下载完成后删除临时 zip 文件
    });
  });

  archive.on('error', (err) => {
    console.error('Archive error:', err);
    res.status(500).send('压缩文件出错');
  });

  archive.pipe(output);

  // 读取并添加 .json 文件
  fs.readdirSync(dirPath).forEach((file) => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      archive.file(filePath, { name: file });
    }
  });

  // 调用 finalize() 来确保所有文件都被压缩
  archive.finalize();
});
// 更新 COOKIES 环境变量
app.post('/update-cookies', (req, res) => {
  console.log('------',req.body)
  const { cookies } = req.body;

  // 获取 .env 文件路径
  const envPath = path.resolve(__dirname, '.env');

  // 读取现有的 .env 文件
  fs.readFile(envPath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('读取 .env 文件失败');
    }

    // 查找和替换 COOKIES 值
    const updatedData = data.replace(/COOKIES=.*/, `COOKIES='${cookies}'`);

    // 将更新后的内容写回 .env 文件
    fs.writeFile(envPath, updatedData, 'utf-8', (err) => {
      if (err) {
        return res.status(500).send('更新 .env 文件失败');
      }
      res.send('COOKIES 值更新成功');
    });
  });
});

app.post('/update-query', (req, res) => {
  console.log('------',req.body)
  const { keyword, queryNum } = req.body;

  // 获取文件路径
  const envPath = path.resolve(__dirname, 'main.py');

  // 读取现有的文件
  fs.readFile(envPath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('读取 main.py 文件失败');
    }

    const updatedData = data
      .replace(/query\s*=\s*['"].*?['"]/, `query = "${keyword}"`)
      .replace(/query_num\s*=\s*(['"]?\d+['"]?)/, `query_num = ${Number(queryNum)}`);

    // 将更新后的内容写回文件
    fs.writeFile(envPath, updatedData, 'utf-8', (err) => {
      if (err) {
        return res.status(500).send('更新 关键字和数量 文件失败');
      }
      res.send('更新成功');
    });
  });
});

// 启动服务器
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
