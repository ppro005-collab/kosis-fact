import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';

XLSX.set_fs(fs);
const workbook = XLSX.readFile('MDIS_근로형태_자연어_변수매핑테이블_2025년08월.xlsx');

const sheet1 = workbook.Sheets['01_자연어-변수명_매핑'];
const data1 = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
for(let i=0; i<10; i++) {
    console.log(`Row ${i}:`, data1[i]);
}
