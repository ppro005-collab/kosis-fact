import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Papa from 'papaparse';
import { nlpEngine } from '@/lib/nlpEngine.js';
import { mdParser } from '@/lib/mdParser.js';

// ─────────────────────────────────────────────────────────────
// 마이크로데이터 로드 (서버 캐시)
// ─────────────────────────────────────────────────────────────
let cachedData = null;

function loadMicrodata() {
  if (cachedData) return cachedData;
  const dataDir = path.join(process.cwd(), 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  let allRows = [];
  for (const file of files) {
    const buffer = fs.readFileSync(path.join(dataDir, file));
    const decoder = new TextDecoder('euc-kr');
    const csvData = decoder.decode(buffer);
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true, dynamicTyping: true });
    const rows = parsed.data.map(row => {
      const newRow = {};
      for (let key in row) {
        const cleanKey = key.trim();
        if (cleanKey.includes('가중값')) {
          newRow['가중값'] = parseFloat(row[key]) || 0;
        } else {
          newRow[cleanKey] = row[key];
        }
      }
      return newRow;
    });
    allRows = allRows.concat(rows);
  }
  cachedData = allRows;
  return allRows;
}

// ─────────────────────────────────────────────────────────────
// 수치 + 문맥 추출기
// 청년층 부가조사 관련 문장에서 수치를 모두 뽑아냄
// ─────────────────────────────────────────────────────────────
const YOUTH_KEYWORDS = [
  '청년', '졸업', '취업', '소요기간', '개월', '첫 직장', '첫직장',
  '부가조사', '학력', '대졸', '고졸', '미취업', '이직', '퇴직',
  '직업훈련', '직장체험', '인턴', '준비기간', '실업', '비경활'
];

const NUMBER_PATTERN = /(\d{1,4}(?:[.,]\d+)?)\s*(개월|년|만\s*명|천\s*명|명|%|배|년간)/g;

function extractClaims(text) {
  // 문장 분리
  const sentences = text.split(/[.。\n]+/).map(s => s.trim()).filter(s => s.length > 10);
  const claims = [];

  for (const sentence of sentences) {
    // 청년 관련 문장만
    const isRelevant = YOUTH_KEYWORDS.some(kw => sentence.includes(kw));
    if (!isRelevant) continue;

    // 수치 추출
    let match;
    const pattern = new RegExp(NUMBER_PATTERN.source, 'g');
    while ((match = pattern.exec(sentence)) !== null) {
      const rawNum = parseFloat(match[1].replace(',', ''));
      const unit = match[2].trim();
      claims.push({
        sentence: sentence.length > 100 ? sentence.substring(0, 100) + '...' : sentence,
        articleValue: `${match[1]}${unit}`,
        rawNum,
        unit,
        query: buildQuery(sentence), // NLP 쿼리로 변환
      });
    }
  }

  return claims.slice(0, 10); // 최대 10개 수치
}

// ─────────────────────────────────────────────────────────────
// 문장 → 자동 쿼리 변환기
// ─────────────────────────────────────────────────────────────
function buildQuery(sentence) {
  let query = '';

  if (/졸업|소요기간/.test(sentence)) query += '졸업까지 걸린 기간 ';
  if (/첫.?직장|첫.?일자리|준비기간/.test(sentence)) query += '첫직장 취업 소요기간 ';
  if (/훈련|직업교육/.test(sentence)) query += '직업훈련 ';
  if (/직장체험|인턴/.test(sentence)) query += '직장체험 ';
  if (/퇴직|이직/.test(sentence)) query += '이직사유 ';

  if (/성별|남성|여성|남자|여자/.test(sentence)) query += '성별';
  if (/학력|대졸|고졸|교육/.test(sentence)) query += '교육수준별';

  return query.trim() || '청년층 기본 집계';
}

// ─────────────────────────────────────────────────────────────
// 수치 비교 (단위 통일 후 오차율 계산)
// ─────────────────────────────────────────────────────────────
function compareClaim(claim, mdResults) {
  if (!mdResults || mdResults.length === 0) {
    return { status: 'yellow', message: '해당 집계 조건에서 결과를 찾지 못했습니다.', mdValue: '-' };
  }

  let mdValue = mdResults[0].value;
  let mdUnit = mdResults[0].unit;
  let articleNum = claim.rawNum;

  // 단위 정규화
  if (mdUnit === '천 명') {
    if (claim.unit.includes('만')) articleNum = articleNum * 10;       // 만명 → 천명
    else if (claim.unit === '명') articleNum = articleNum / 1000;       // 명 → 천명
  }
  if (mdUnit.includes('개월')) {
    if (claim.unit === '년') articleNum = articleNum * 12;              // 년 → 개월
  }

  const diff = Math.abs(mdValue - articleNum);
  const diffPct = mdValue > 0 ? diff / mdValue : 1;

  let mdDisplay = mdUnit.includes('개월')
    ? formatMonths(mdValue) + ' (' + mdValue.toFixed(1) + '개월)'
    : mdValue.toLocaleString() + ' ' + mdUnit;

  if (diffPct <= 0.05) return { status: 'green', message: '수치 정확 일치 (5% 오차 이내)', mdValue: mdDisplay };
  if (diffPct <= 0.15) return { status: 'yellow', message: `미세 차이 (오차 ${(diffPct*100).toFixed(1)}% - 반올림·단위 차이 가능)`, mdValue: mdDisplay };
  return { status: 'red', message: `수치 불일치 (오차 ${(diffPct*100).toFixed(1)}% - 기사와 마이크로데이터 간 불일치)`, mdValue: mdDisplay };
}

function formatMonths(value) {
  if (!value || value <= 0) return '-';
  const y = Math.floor(value / 12);
  const m = Math.floor(value % 12);
  if (y > 0 && m > 0) return `${y}년 ${m}개월`;
  if (y > 0) return `${y}년`;
  return `${m}개월`;
}

// ─────────────────────────────────────────────────────────────
// POST /api/factcheck
// ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { url } = await request.json();

    // ── Step 1: 기사 크롤링 ──────────────────────────────
    let articleText = '';
    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
        },
        timeout: 10000
      });
      const $ = cheerio.load(html);
      // 기사 본문 추출 (뉴스 사이트 공통 패턴)
      articleText = $('article, .article-body, .news-content, #articleBodyContents, #newsct_article, .article_txt, p')
        .map((_, el) => $(el).text())
        .get()
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000);
    } catch (fetchErr) {
      return NextResponse.json({
        success: false,
        error: `URL 접근 실패: ${fetchErr.message}. CORS 정책 또는 유료 뉴스사이트일 수 있습니다.`
      }, { status: 400 });
    }

    if (!articleText || articleText.length < 50) {
      return NextResponse.json({ success: false, error: '기사 본문을 추출하지 못했습니다.' }, { status: 400 });
    }

    // ── Step 2: 관련 수치 전부 추출 ─────────────────────
    const globalContext = nlpEngine.extractGlobalContext(articleText);
    const claims = extractClaims(articleText);

    if (claims.length === 0) {
      return NextResponse.json({
        success: true,
        claims: [],
        message: '기사에서 청년 통계 관련 수치를 찾지 못했습니다.'
      });
    }

    // ── Step 3: 각 수치를 MD 직접 집계로 검증 ───────────
    const microdata = loadMicrodata();
    const results = [];

    for (const claim of claims) {
      // 기사 전체 맥락(연도, 디폴트 연령)을 반영하여 쿼리 해석
      const queryPlan = nlpEngine.parseQuery(claim.query, globalContext);
      const mdResults = mdParser.aggregateData(microdata, queryPlan);
      const comparison = compareClaim(claim, mdResults);

      results.push({
        sentence: claim.sentence,
        articleValue: claim.articleValue,
        mdValue: comparison.mdValue,
        status: comparison.status,
        message: comparison.message,
        kosisTable: queryPlan.kosisTable || '-',
        queryUsed: claim.query,
      });
    }

    return NextResponse.json({ success: true, claims: results });

  } catch (error) {
    console.error('FactCheck API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
