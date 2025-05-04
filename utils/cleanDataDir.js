// utils/cleanDataDir.js
const fs = require('fs');
const path = require('path');

/**
 * 删除指定目录下的所有子目录
 * @param {string} targetDir - 要清理的目录路径
 */
function cleanSubdirectories(targetDir) {
  if (!fs.existsSync(targetDir)) {
    console.warn(`目录不存在: ${targetDir}`);
    return;
  }

  const files = fs.readdirSync(targetDir);
  files.forEach(file => {
    const fullPath = path.join(targetDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`已删除子目录: ${file}`);
    }
  });
}

module.exports = { cleanSubdirectories };
