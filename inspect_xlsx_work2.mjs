import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';

XLSX.set_fs(fs);
const workbook = XLSX.readFile('MDIS_근로형태_자연어_변수매핑테이블_2025년08월.xlsx');

const sheet1 = workbook.Sheets['01_자연어-변수명_매핑'];
const data1 = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
console.log("Sheet 01 Header:", data1[0]);
console.log("Sheet 01 Row 1:", data1[1]);

const sheet4 = workbook.Sheets['04_표별_핵심변수_연결'];
const data4 = XLSX.utils.sheet_to_json(sheet4, { header: 1 });
console.log("Sheet 04 Header:", data4[0]);
console.log("Sheet 04 Row 1:", data4[1]);
