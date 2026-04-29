import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';

XLSX.set_fs(fs);
const workbook = XLSX.readFile('MDIS_근로형태_자연어_변수매핑테이블_2025년08월.xlsx');
console.log(workbook.SheetNames);
