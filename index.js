const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel 文件夹路径
const excelDir = path.join(__dirname, 'datas/excel_datas');

// 读取所有文件
fs.readdirSync(excelDir).forEach(file => {
  const ext = path.extname(file);
  if (ext === '.xlsx' || ext === '.xls') {
    const filePath = path.join(excelDir, file);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // 默认取第一个 sheet
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const baseName = path.basename(file, ext); // 去除扩展名
    const outputPath = path.join(excelDir, `${baseName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log(`已导出：${baseName}.json`);
  }
});
