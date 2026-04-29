import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import path from 'path';

XLSX.set_fs(fs);

const EXCEL_PATH = 'KOSIS_청년부가_자연어변수매핑테이블.xlsx';
const OUTPUT_PATH = 'lib/nlpDictionaryMap.js';

function parseKeywords(text) {
  if (!text) return [];
  // 콤마, 공백, 줄바꿈 등으로 분리
  return text.split(/[,|\n\/·]/).map(k => k.trim()).filter(k => k.length > 0);
}

function generateJsContent(youthMappings, workMappings) {
  return `/**
 * 자연어 키워드와 실제 MDIS 변수명 및 KOSIS 집계 로직을 매핑하는 사전입니다.
 * (엑셀 파일에서 자동 생성됨: ${new Date().toLocaleString()})
 */

export const NLP_VARIABLE_MAP = {
  YOUTH: ${JSON.stringify(youthMappings, null, 2)},
  WORK: ${JSON.stringify(workMappings, null, 2)}
};

// 동의어를 기반으로 변수명을 찾는 헬퍼 함수
export const findVariableByKeyword = (surveyType, keyword) => {
  const dictionary = NLP_VARIABLE_MAP[surveyType] || [];
  return dictionary.find(item => item.nlKeywords.some(kw => keyword.includes(kw)));
};
`;
}

try {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const youthMappings = [];

  // 1. 변수명 매핑 처리 (Sheet 2)
  const sheet2 = workbook.Sheets['2_변수명→자연어역매핑'];
  if (sheet2) {
    const data2 = XLSX.utils.sheet_to_json(sheet2, { header: 1 });
    const headerRow = data2.findIndex(row => row && row[0] === '변수명 (MDIS)');
    if (headerRow !== -1) {
      data2.slice(headerRow + 1).forEach(row => {
        if (!row[0]) return;
        const variable = row[0].toString().trim();
        const primaryKeywords = parseKeywords(row[4]);
        const typeMapping = row[1]?.includes('범주') ? 'dimension' : 'dimension_or_filter';

        if (primaryKeywords.length > 0) {
          youthMappings.push({
            variable,
            nlKeywords: primaryKeywords,
            type: typeMapping,
            category: row[6] || '기본'
          });
        }
      });
    }
  }

  // 2. 표 번호 매핑 처리 (Sheet 1)
  const sheet1 = workbook.Sheets['1_자연어→표번호매핑'];
  if (sheet1) {
    const data1 = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
    const headerRowIdx = data1.findIndex(row => row && row[0] === '표번호');
    if (headerRowIdx !== -1) {
      data1.slice(headerRowIdx + 1).forEach(row => {
        const tableId = row[0]?.toString().trim();
        if (tableId && tableId.startsWith('표')) {
          const metricId = `YOUTH_${tableId.replace('표', '').padStart(2, '0')}`;
          const keywords = [
            ...parseKeywords(row[2]),
            ...parseKeywords(row[3])
          ];
          
          if (keywords.length > 0) {
            // 기존 변수 매핑과 합치거나 별도 필드로 추가
            // 여기서는 지표 전용 매핑으로 추가
            youthMappings.push({
              variable: row[1] || metricId,
              nlKeywords: Array.from(new Set(keywords)),
              targetMetric: metricId,
              type: 'metric'
            });
          }
        }
      });
    }
  }

  // 3. 근로형태 매핑 처리 (WORK)
  const WORK_EXCEL_PATH = 'MDIS_근로형태_자연어_변수매핑테이블_2025년08월.xlsx';
  const workMappings = [];
  
  if (fs.existsSync(WORK_EXCEL_PATH)) {
    const workWorkbook = XLSX.readFile(WORK_EXCEL_PATH);
    
    // 변수명 매핑 처리 (Sheet: 01_자연어-변수명_매핑)
    const workSheet1 = workWorkbook.Sheets['01_자연어-변수명_매핑'];
    if (workSheet1) {
      const wData1 = XLSX.utils.sheet_to_json(workSheet1, { header: 1 });
      const wHeaderRow = wData1.findIndex(row => row && row[0] === 'No');
      if (wHeaderRow !== -1) {
        wData1.slice(wHeaderRow + 1).forEach(row => {
          if (!row[0]) return;
          const variable = row[4]?.toString().trim() || row[6]?.toString().trim();
          if (!variable) return;
          
          const primaryKeywords = [
            ...parseKeywords(row[2]),
            ...parseKeywords(row[3])
          ];
          const typeMapping = row[1]?.includes('필터') ? 'filter' : 'dimension';

          if (primaryKeywords.length > 0) {
            workMappings.push({
              variable: variable === '(파생 플래그)' ? row[2]?.split(',')[0].trim() : variable,
              nlKeywords: Array.from(new Set(primaryKeywords)),
              type: typeMapping,
              category: row[1] || '기본'
            });
          }
        });
      }
    }

    // 표 번호 매핑 처리 (Sheet: 04_표별_핵심변수_연결)
    const workSheet4 = workWorkbook.Sheets['04_표별_핵심변수_연결'];
    if (workSheet4) {
      const wData4 = XLSX.utils.sheet_to_json(workSheet4, { header: 1 });
      const wHeaderRowIdx = wData4.findIndex(row => row && row[0] === '표번호');
      if (wHeaderRowIdx !== -1) {
        wData4.slice(wHeaderRowIdx + 1).forEach(row => {
          const tableId = row[0]?.toString().trim();
          if (tableId && tableId.startsWith('표')) {
            const metricId = `WORK_${tableId.replace('표', '').padStart(2, '0')}`;
            const keywords = parseKeywords(row[1]); // 표 제목을 키워드로 활용
            
            if (keywords.length > 0) {
              workMappings.push({
                variable: row[1] || metricId,
                nlKeywords: Array.from(new Set(keywords)),
                targetMetric: metricId,
                type: 'metric'
              });
            }
          }
        });
      }
    }
  } else {
    console.log(`근로형태 엑셀 파일을 찾을 수 없습니다: ${WORK_EXCEL_PATH}. (기본값 사용)`);
    workMappings.push({
      variable: "현재일관련사항_종사상지위코드",
      nlKeywords: ["정규직", "비정규직", "상용직", "임시직", "일용직"],
      type: "dimension_or_filter"
    });
  }

  const content = generateJsContent(youthMappings, workMappings);
  fs.writeFileSync(OUTPUT_PATH, content);
  console.log(`Successfully synced ${youthMappings.length} youth mappings and ${workMappings.length} work mappings to ${OUTPUT_PATH}`);

} catch (err) {
  console.error("Error syncing mapping table:", err.message);
}
