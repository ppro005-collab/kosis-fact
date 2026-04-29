import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
XLSX.set_fs(fs);

const filePath = 'KOSIS_청년부가_자연어변수매핑테이블.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  console.log("Sheet Names:", workbook.SheetNames);
  
  workbook.SheetNames.forEach(name => {
    console.log(`\n--- Sheet: ${name} ---`);
    const sheet = workbook.Sheets[name];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    let headerRowIndex = rawData.findIndex(row => row && row.some(cell => typeof cell === 'string' && cell.includes('표번호')));
    if (headerRowIndex !== -1) {
      console.log(`Header found at row ${headerRowIndex}`);
      console.log("Headers:", rawData[headerRowIndex]);
      const dataRows = rawData.slice(headerRowIndex + 1);
      console.log("Sample Data Rows:", JSON.stringify(dataRows.filter(row => row[0]).slice(0, 5), null, 2));
    } else {
      console.log("Header '표번호' not found.");
    }
  });
} catch (err) {
  console.error("Error reading file:", err.stack);
}
