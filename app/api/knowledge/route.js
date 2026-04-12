import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * 10번(SAS 코드)과 11번(매뉴얼) 폴더를 통합하여 
 * 카드형 명세서 구성을 위한 하이브리드 지식 베이스를 생성합니다.
 */
export async function GET() {
  try {
    const root = path.join(process.cwd(), '..');
    const sasRoot = path.join(root, '10. KOSIS 표 검증에 사용된 SAS 코드(클로드 활용)');
    const manualRoot = path.join(root, '11. KOSIS 표 SAS 코드 설명매뉴얼(클로드 활용)');
    
    if (!fs.existsSync(sasRoot) || !fs.existsSync(manualRoot)) {
       return NextResponse.json({ success: false, error: 'Source folders (10 or 11) not found' }, { status: 404 });
    }

    const surveyConfigs = [
      { 
        type: 'YOUTH', 
        label: '청년층 부가조사',
        manualDir: path.join(manualRoot, '11-1. (청년층) KOSIS 표 SAS 코드 설명매뉴얼(클로드 활용)'),
        sasDir: path.join(sasRoot, '10-1. (청년층) KOSIS 표 검증에 사용된 SAS코드(클로드 활용)'),
        prefix: '[청년층]'
      },
      { 
        type: 'WORKING_TYPE', 
        label: '근로형태별 부가조사',
        manualDir: path.join(manualRoot, '11-2. (근로형태별) KOSIS 표 SAS 코드 설명매뉴얼(클로드 활용)'),
        sasDir: path.join(sasRoot, '10-2. (근로형태별) KOSIS 표 검증에 사용된 SAS코드(클로드 활용)'),
        prefix: '[근로형태]'
      }
    ];

    const results = surveyConfigs.map(config => {
      const tables = mergeFolders(config.manualDir, config.sasDir, config.prefix);
      return { type: config.type, label: config.label, tables };
    });

    return NextResponse.json({ success: true, surveys: results });

  } catch (error) {
    console.error('Unified KB API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * 매뉴얼과 SAS 코드를 번호 기준으로 병합
 */
function mergeFolders(manualDir, sasDir, prefix) {
  if (!fs.existsSync(manualDir)) return [];
  
  const manualFiles = fs.readdirSync(manualDir).filter(f => f.endsWith('.txt'));
  const sasFiles = fs.existsSync(sasDir) ? fs.readdirSync(sasDir).filter(f => f.endsWith('.txt')) : [];
  
  const tableMap = new Map();

  // 1. 매뉴얼 파싱
  manualFiles.forEach(file => {
    const idNum = extractTableNumber(file);
    if (!idNum) return;
    
    const idKey = parseInt(idNum);
    const content = readTextFileSync(path.join(manualDir, file));
    
    tableMap.set(idKey, {
      id: `표 ${idKey.toString().padStart(2, '0')}`,
      name: `${prefix} 표 ${idKey.toString().padStart(2, '0')}. ${extractTitle(content) || '명칭 미정'}`,
      manual: content.trim(),
      sas: "SAS 코드를 찾을 수 없습니다."
    });
  });

  // 2. SAS 코드 매칭 및 병합
  sasFiles.forEach(file => {
    const idNum = extractTableNumber(file);
    if (!idNum) return;
    
    const idKey = parseInt(idNum);
    if (tableMap.has(idKey)) {
      const sasContent = readTextFileSync(path.join(sasDir, file));
      tableMap.get(idKey).sas = sasContent.trim();
    }
  });

  return Array.from(tableMap.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function extractTableNumber(fileName) {
  // 표01, 표 01, 11-1-1_ 등 다양한 패턴 대응
  const match = fileName.match(/표\s*(\d+)/) || fileName.match(/-(\d+)_/);
  return match ? match[1] : null;
}

function extractTitle(content) {
  const m = content.match(/\[표 제목\]\s*([^\r\n]+)/) || content.match(/표\s*\d+\.\s*([^\r\n]+)/);
  return m ? m[1].trim() : null;
}

function readTextFileSync(filePath) {
  const buffer = fs.readFileSync(filePath);
  try {
    const utf8Text = buffer.toString('utf8');
    if (utf8Text.includes('\ufffd')) throw new Error();
    return utf8Text;
  } catch {
    const decoder = new TextDecoder('euc-kr');
    return decoder.decode(buffer);
  }
}
