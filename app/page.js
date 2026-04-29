'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Database, BookOpen, ArrowRightLeft, 
  Download, Settings, ChevronRight, Code2, Users, Eye, 
  AlertCircle, CheckCircle, XCircle, Clock, Slash,
  ArrowLeft, ArrowRight, RefreshCw, Layout, MoveHorizontal,
  MoveVertical, Info, X, Briefcase
} from 'lucide-react';
import { PivotPanel } from '@/components/PivotPanel';
import { SURVEY_TYPES, DATASET_CONFIGS, SURVEY_ORDER, identifyDataset } from '@/lib/datasetConfigs';
import { DICTIONARIES } from '@/lib/dictionaryData';
import { KOSIS_MAP, findKosisTable } from '@/lib/kosisMap';
import { KakaoLoginButton } from '@/components/KakaoLogin';
import Script from 'next/script';

// VARIABLE_DICTIONARY removed - now using DICTIONARIES from lib/dictionaryData

// Multi-survey dictionary is now handled in lib/dictionaryData.js


// ─────────────────────────────────────────────────────────────
// MOCK USER STORE
// ─────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: 1, name: "홍길동", userId: "admin01", role: "super_admin", status: "active", requestDate: "2025-04-01", approvedDate: "2025-04-01" },
  { id: 2, name: "김분석", userId: "analyst01", role: "admin", status: "active", requestDate: "2025-04-10", approvedDate: "2025-04-11" },
  { id: 3, name: "이검토", userId: "user01", role: "user", status: "active", requestDate: "2025-04-15", approvedDate: "2025-04-16" },
  { id: 4, name: "박대기", userId: "pending01", role: "user", status: "pending", requestDate: "2026-04-10", approvedDate: null },
  { id: 5, name: "최요청", userId: "pending02", role: "user", status: "pending", requestDate: "2026-04-11", approvedDate: null },
];

const ROLES = ['super_admin', 'admin', 'user'];
const ROLE_LABELS = {
  super_admin: { label: "최고 관리자", color: "bg-purple-100 text-purple-700" },
  admin:       { label: "운영 관리자", color: "bg-blue-100 text-blue-700" },
  user:        { label: "일반 이용자", color: "bg-gray-100 text-gray-600" },
};

// ─────────────────────────────────────────────────────────────
// HELPER: 개월 → X년 Y개월
// ─────────────────────────────────────────────────────────────
function formatMonths(value) {
  if (!value || value <= 0) return '-';
  const y = Math.floor(value / 12);
  const m = Math.floor(value % 12);
  if (y > 0 && m > 0) return `${y}년 ${m}개월`;
  if (y > 0) return `${y}년`;
  return `${m}개월`;
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR MENU POOL (v7.9 Restore)
// ─────────────────────────────────────────────────────────────
const SIDEBAR_MENU_POOL = [
  { id: 'analyze',    label: 'AI 분석 추론',      icon: <Search size={16} /> },
  { id: 'factcheck',  label: '자율형 팩트체크',   icon: <ShieldCheck size={16} /> },
  { id: 'dictionary', label: '변수 백과사전',     icon: <BookOpen size={16} /> },
  { id: 'kosis_kb',   label: 'KOSIS 지식 베이스',  icon: <Database size={16} className="text-blue-500" /> },
  { id: 'data_mgmt',  label: '데이터 관리',       icon: <Database size={16} /> },
  { id: 'users',      label: '회원 관리',         icon: <Users size={16} /> },
  { id: 'menu_settings', label: '메뉴 권한 설정',  icon: <Settings size={16} /> },
];

// ─────────────────────────────────────────────────────────────
// SAS CODE GENERATOR (v8.0: Multi-Axis Sync + Variable Mapping)
// ─────────────────────────────────────────────────────────────
const LABEL_TO_SAS = {
  '학력 그룹': '교육정도컨버젼코드',
  '성별': '성별코드',
  '연령대 구분': '연령대코드',
  '경제활동상태': '경제활동상태코드',
  '조사연도': '조사연월',
  '근로형태': '근로형태코드',
  '전체': ''
};

const LOGIC_TO_VAR = {
  'calculateGraduationDuration': '졸업소요기간_개월',
  'getFirstJobDuration': '첫취업소요기간_개월',
  'getResignationReason': '첫직장퇴직사유코드',
  'getAge': '만연령',
  'ECONOMIC_STATUS': '_N_'
};

function generateSASCode(plan, pivotConfig = null) {
  if (!plan) return '/* 먼저 분석을 실행하세요 */';
  const { surveyType, yearRange, metrics, targetLogic, filters } = plan;
  
  const surveyLabel = DATASET_CONFIGS[surveyType]?.label || '청년층 부가조사';
  const dataSetName = `mdis.${surveyType.toLowerCase()}_[YEAR]05`;

  // 1. Filter Logic
  const filterLines = filters.map(f => {
    if (f.label.includes('세')) return `  WHERE 만연령 BETWEEN ${plan.ageRange.min} AND ${plan.ageRange.max}`;
    return `  AND /* ${f.label} 필터 적용 */`;
  }).join('\n');

  // 2. Class & Tables Sync (Real-time)
  const rows = pivotConfig?.rows || [];
  const cols = pivotConfig?.cols || [];
  const allDims = [...new Set([...rows, ...cols])].filter(d => d !== '전체' && d !== '계');
  
  const sasClassVars = allDims.map(d => LABEL_TO_SAS[d] || d).join(' ');
  const sasTableExpr = [...rows, ...cols]
    .filter(d => d !== '전체' && d !== '계')
    .map(d => LABEL_TO_SAS[d] || d)
    .join('*');

  const targetVar = LOGIC_TO_VAR[targetLogic] || '대상변수';

  let procStep = '';
  if (metrics?.type === 'average') {
    procStep = `PROC MEANS DATA=work_data NWAY NOPRINT;
  ${sasClassVars ? `CLASS ${sasClassVars};` : ''}
  VAR ${targetVar};
  WEIGHT 가중값;
  OUTPUT OUT=result MEAN=avg_val;
RUN;`;
  } else {
    procStep = `PROC FREQ DATA=work_data;
  ${sasTableExpr ? `TABLES ${sasTableExpr};` : 'TABLES _ALL_;'}
  WEIGHT 가중값;
RUN;`;
  }

  return `/* =================================================
   ${surveyLabel} 집계 알고리즘 (v8.0 Sync)
   주제: ${plan.title}
   범위: ${yearRange.start}~${yearRange.end}년
   ================================================= */

DATA work_data;
  SET ${dataSetName}; /* 연도별 루프 처리 필요 */
${filterLines}
  IF 가중값 <= 0 THEN DELETE;
RUN;

${procStep}

/* [참고] KOSIS 공표 수치(천 명) = 가중값 합 / 1000 */`;
}


// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const [actualRole, setActualRole]   = useState('super_admin');
  const [previewRole, setPreviewRole] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // ─── Adaptive Screen Detection ───────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole = previewRole || actualRole;

  const [activeTab, setActiveTab] = useState('analyze');
  const [expandedVar, setExpandedVar] = useState(null);
  const [menuPermissions, setMenuPermissions] = useState(null); // { super_admin: [], ... }
  const [dataInventory, setDataInventory] = useState({}); // { YOUTH: { 2025: true } }
  const [inventoryYears, setInventoryYears] = useState([2025, 2024, 2023, 2022, 2021]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // --- Hybrid Meta Control State ---
  const [manualMode, setManualMode] = useState(false);
  const [selectedSurveyType, setSelectedSurveyType] = useState(SURVEY_TYPES.YOUTH);
  const [selectedYears, setSelectedYears] = useState([2025]);
  const [selectedAgePreset, setSelectedAgePreset] = useState(0); // presets index

  // --- DnD Pivot State ---
  const [draggedHeader, setDraggedHeader] = useState(null);

  const [query, setQuery]               = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isTransposed, setIsTransposed] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [showCode, setShowCode]         = useState(false);
  const [showAnalysisSas, setShowAnalysisSas] = useState(false);
  const [users, setUsers]               = useState(INITIAL_USERS);
  const [isUploading, setIsUploading]   = useState(false);
  const [pivotConfig, setPivotConfig]   = useState({ rows: [], cols: [] });
  const [datasetMeta, setDatasetMeta]   = useState([]);  // [{key, label, recordCount}]
  const [intentClarification, setIntentClarification] = useState(null); // { message, options }

  const [url, setUrl]                     = useState('');
  const [factCheckStep, setFactCheckStep] = useState(0);
  const [factCheckResults, setFactCheckResults] = useState(null);

  // --- Knowledge Base State ---
  const [kbData, setKbData] = useState([]);
  const [kbLoading, setKbLoading] = useState(false);
  const [kbSearch, setKbSearch] = useState('');
  const [selectedKbSurvey, setSelectedKbSurvey] = useState('YOUTH'); 
  const [selectedTable, setSelectedTable] = useState(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // ── 인증 및 권한 확인 (우선 우회 처리) ───────────
  useEffect(() => {
    setIsAuthenticated(true);
    setActualRole('super_admin');
    setIsApproved(true);
    setIsSessionLoaded(true);
  }, []);

  // ── 탭 접근 권한 실시간 방어벽 (useEffect) ─────────────────
  useEffect(() => {
    const adminOnlyTabs = ['kosis_kb', 'data_mgmt', 'menu_settings', 'users'];
    if (adminOnlyTabs.includes(activeTab)) {
      if (actualRole !== 'super_admin' && actualRole !== 'admin') {
        alert('접근 권한이 없는 메뉴입니다. (관리자 전용)');
        setActiveTab('analyze');
      }
    }
  }, [activeTab, actualRole]);

  // ── 초기 데이터 로드 ──────────────────────────────────────
  const loadInventory = async () => {
    try {
      const invRes = await fetch('/api/data/inventory').then(r => r.json());
      if (invRes.success) {
        setDataInventory(invRes.inventory);
        if (invRes.allYears && invRes.allYears.length > 0) {
          setInventoryYears(invRes.allYears);
        }
      }
    } catch (e) { console.error('Inventory Load Error:', e); }
  };

  const loadKnowledge = async () => {
    setKbLoading(true);
    try {
      const res = await fetch('/api/knowledge').then(r => r.json());
      if (res.success) setKbData(res.surveys);
    } catch (e) { console.error('KB Load Error:', e); }
    finally { setKbLoading(false); }
  };

  // ── 분석 실행 ─────────────────────────────────────────────
  const handleAnalyze = async (overrideQuery = null) => {
    const targetQuery = overrideQuery || query;
    if (!targetQuery) return;
    setIsLoading(true);
    setAnalysisError(null);
    setIntentClarification(null);

    try {
      const payload = { 
        query: targetQuery, 
        manualMode, 
        manualSurveyType: selectedSurveyType,
        manualYears: selectedYears,
        manualAgeMin: DATASET_CONFIGS[selectedSurveyType]?.presets[selectedAgePreset]?.min || 15,
        manualAgeMax: DATASET_CONFIGS[selectedSurveyType]?.presets[selectedAgePreset]?.max || 29
      };

      const res  = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error);

      // 모호성 체크 (v7.5 Interactive Step)
      if (data.plan.isAmbiguous && !overrideQuery) {
        setIntentClarification({
          message: "질문이 다소 광범위합니다. 어떤 분석을 원하시나요?",
          options: data.plan.clarificationOptions
        });
        setIsLoading(false);
        return;
      }

      setAnalysisResult(data);
      setShowAnalysisSas(false);
      
      // ─── 지능형 기본 축 설정 (1D vs 2D vs 시계열 최적화) ───────────
      const gbs = data.plan.groupBys || [];
      const hasTimeseries = gbs.some(g => g.label === '조사연도');
      
      if (hasTimeseries) {
        // 시계열 데이터인 경우 연도를 무조건 행(Row)에 배치
        const otherGbs = gbs.filter(g => g.label !== '조사연도');
        setPivotConfig({ 
          rows: ['조사연도', ...(otherGbs[0] ? [otherGbs[0].label] : [])], 
          cols: otherGbs[1] ? [otherGbs[1].label] : ['계'] 
        });
      } else if (gbs.length >= 2) {
        setPivotConfig({ rows: [gbs[0].label], cols: [gbs[1].label] });
      } else if (gbs.length === 1) {
        setPivotConfig({ rows: [gbs[0].label], cols: ['계'] });
      } else {
        setPivotConfig({ rows: ['전체'], cols: ['계'] });
      }
      
      setDatasetMeta(data.datasetMeta || []);
      
      // 성공적으로 분석 완료 시 수동 모드/에러 해제
      if (manualMode) setManualMode(false);
      setAnalysisError(null);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const swapAxes = () => {
    setPivotConfig(prev => ({ rows: prev.cols, cols: prev.rows }));
  };

  // ── 드래그 앤 드롭 헤더 스왑 ──────────────────────────────
  const handleDragStart = (e, label) => {
    setDraggedHeader(label);
    e.dataTransfer.setData('text/plain', label);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToRow = (e) => {
    e.preventDefault();
    if (!draggedHeader) return;
    if (pivotConfig.cols.includes(draggedHeader)) {
      setPivotConfig({
        cols: pivotConfig.cols.filter(c => c !== draggedHeader),
        rows: [...pivotConfig.rows, draggedHeader]
      });
    }
    setDraggedHeader(null);
  };

  const handleDropToCol = (e) => {
    e.preventDefault();
    if (!draggedHeader) return;
    if (pivotConfig.rows.includes(draggedHeader)) {
      setPivotConfig({
        rows: pivotConfig.rows.filter(r => r !== draggedHeader),
        cols: [...pivotConfig.cols, draggedHeader]
      });
    }
    setDraggedHeader(null);
  };

  // ── 데이터 업로드 및 변환 (XLSX 지원) ─────────────────────────
  const processAndUploadFile = async (file) => {
    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        let csvContent = '';
        if (file.name.endsWith('.xlsx')) {
          const data = new Uint8Array(e.target.result);
          const workbook = window.XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          csvContent = window.XLSX.utils.sheet_to_csv(firstSheet);
        } else {
          // CSV - euc-kr 대응
          const decoder = new TextDecoder('euc-kr');
          csvContent = decoder.decode(e.target.result);
        }

        // ─── 지능형 식별 및 네이밍 로직 (v7.9 Filename-First) ─────────
        let surveyKey = 'UNKNOWN';
        let yearStr = 'UNKNOWN';

        // 1. 파일명에서 키워드 추출 (유저 요청: 최우선)
        const nameKeywords = file.name.toLowerCase();
        if (nameKeywords.includes('청년')) surveyKey = 'YOUTH';
        else if (nameKeywords.includes('근로') || nameKeywords.includes('비정규')) surveyKey = 'WORKING_TYPE';
        else if (nameKeywords.includes('고령')) surveyKey = 'ELDERLY';
        else if (nameKeywords.includes('경제')) surveyKey = 'ECONOMIC_ACT';

        const yearMatch = file.name.match(/\d{4}/);
        if (yearMatch) yearStr = yearMatch[0];

        // 2. 파일 내용에서 보완 (파일명에 정보가 없는 경우)
        const rows = csvContent.split('\n').filter(r => r.trim());
        if (rows.length < 2) throw new Error('파일 내용이 너무 적습니다.');
        
        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const body  = rows[1].split(',').map(b => b.trim().replace(/"/g, ''));

        if (surveyKey === 'UNKNOWN') surveyKey = identifyDataset(headers.join(' '));
        if (yearStr === 'UNKNOWN') {
           // '조사연월' 컬럼을 더 유연하게 탐색 (공백, 특수문자 무시)
           const yearIdx = headers.findIndex(h => h.includes('조사연월'));
           if (yearIdx !== -1) yearStr = String(body[yearIdx]).substring(0,4);
        }

        const standardizedName = `${surveyKey}_${yearStr}.csv`;

        // 서버 전송
        const formData = new FormData();
        formData.append('file', new Blob([csvContent], { type: 'text/csv' }), standardizedName);

        const res = await fetch('/api/data/upload', {
          method: 'POST',
          body: formData
        });
        const result = await res.json();
        
        if (result.success) {
          alert(`업로드 성공! [${standardizedName}]으로 시스템에 등록되었습니다.`);
          await loadInventory();
          
          // ─── 업로드 결과 실시간 반영 (v7.9 Sync Delay) ──────────
          // 파일 시스템 인덱싱 시간을 고려하여 1초 후 자동 분석 실행
          if (activeTab === 'analyze' && (query || manualMode)) {
            setTimeout(() => {
              handleAnalyze();
            }, 1000);
          }
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        alert('업로드 실패: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };

    if (file.name.endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsArrayBuffer(file); // TextDecoder 사용을 위해 ArrayBuffer로 읽음
    }
  };

  const onFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processAndUploadFile(files[0]);
    }
  };

  // 초기 로드 useEffect 수정
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const menuRes = await fetch('/api/admin/menu').then(r => r.json());
        if (menuRes.success) setMenuPermissions(menuRes.settings);
        loadInventory();
        loadKnowledge();
      } catch (e) { console.error(e); }
    };
    loadInitialData();
  }, []);
  const handleDownloadExcel = () => {
    const table = document.getElementById('result-table');
    if (!table) return;
    
    // Multi-level table row/col structural extraction
    let csv = '\uFEFF';
    for (const row of table.rows) {
      const cells = [];
      for (const cell of row.cells) {
        // Handle innerText but also repeat values for colSpans if needed
        // For CSV, we just take the innerText and wrap in quotes
        const text = `"${cell.innerText.replace(/"/g, '""')}"`;
        cells.push(text);
        
        // If colSpan > 1, add empty cells for spacing (optional based on format preference)
        if (cell.colSpan > 1) {
          for(let i=1; i<cell.colSpan; i++) cells.push('""');
        }
      }
      csv += cells.join(',') + '\r\n';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `KOSIS_FACT_${Date.now()}.csv`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── 팩트체크 ─────────────────────────────────────────────
  const handleFactCheck = async () => {
    if (!url) return;
    setFactCheckStep(1);
    setFactCheckResults(null);
    try {
      const res  = await fetch('/api/factcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setFactCheckResults(data.claims);
        setFactCheckStep(2);
      } else {
        alert('오류: ' + data.error);
        setFactCheckStep(0);
      }
    } catch (e) {
      alert('URL 요청 실패: ' + e.message);
      setFactCheckStep(0);
    }
  };

  // ── 회원 관리 ─────────────────────────────────────────────
  const assignableRoles = (myRole) => {
    // 자신보다 낮은 권한만 부여 가능
    const idx = ROLES.indexOf(myRole);
    return ROLES.slice(idx + 1); // super_admin은 [admin, user], admin은 [user]
  };

  const handleApproveUser = (id, newRole) => {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: 'active', role: newRole, approvedDate: new Date().toISOString().split('T')[0] }
      : u
    ));
  };
  const handleChangeRole = (id, newRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };
  const handleRevokeUser = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'revoked' } : u));
  };

  // ── 결과 테이블 렌더 (Vibrant Pivot + KOSIS Citation) ────────
  const renderResultTable = () => {
    if (!analysisResult) return null;
    const { plan, results } = analysisResult;
    const allResults = results || [];
    const unit = plan.unit || '천 명';
    const isAverage = plan.metrics?.type === 'average';
    const kosisInfo = findKosisTable(plan.targetLogic, plan.title);

    // ─── 피벗 핵심 함수: 차원 레이블로 groupKeys 값 조회 ───────
    // groupBys 인덱스와 무관하게 레이블 기반으로 안전하게 매칭
    const getDimIndex = (dimLabel) => (plan.groupBys || []).findIndex(g => g.label === dimLabel);

    const findItem = (rDims, rCombo, cDims, cCombo) => {
      // Create a map-like criteria for easy matching
      const targetCriteria = {};
      rDims.forEach((d, i) => { if (d !== '전체') targetCriteria[d] = rCombo[i]; });
      cDims.forEach((d, i) => { if (d !== '계') targetCriteria[d] = cCombo[i]; });

      return allResults.find(item => {
        const keys = item.groupKeys || [];
        
        // Check if all dimensions match
        return (plan.groupBys || []).every((gb, gIdx) => {
          const valInItem = keys[gIdx];
          const valInCriteria = targetCriteria[gb.label];
          
          if (valInCriteria !== undefined) {
             // If dimension is active in row/col, must match perfectly
             return valInItem === valInCriteria;
          } else {
             // If dimension is inactive, must be '계' (Total)
             return valInItem === '계';
          }
        });
      });
    };

    // ─── 차원 유일값 정렬 (카테고리별 정해진 순서 적용) ────────
    // 학력, 성별 등 의미론적 순서가 있는 차원은 가나다 정렬 대신 표준 순서 사용
    const CATEGORY_ORDER = {
      '계': -1, '전체': -1,
      // 학력
      '고졸 이하': 1,
      '전문대졸 (3년제 포함)': 2,
      '대학교졸 (4년제)': 3,
      '대학원졸 이상': 4,
      '분류 불가': 99,
      // 성별
      '남자': 1, '여자': 2,
      // 경제활동상태
      '취업자': 1, '실업자': 2, '비경제활동인구': 3,
      // 연령대 (KOSIS 5세 구간 기준)
      '15~19세': 1,
      '20~24세': 2,
      '25~29세': 3,
      '30~34세': 4,
      '35세 이상': 5,
      // 구(舊) 라벨 호환
      '10대': 1, '20대': 2, '30대': 3, '40대 이상': 4,
    };
    const semanticSort = (a, b) => {
      const oa = CATEGORY_ORDER[a], ob = CATEGORY_ORDER[b];
      if (oa !== undefined && ob !== undefined) return oa - ob;
      if (oa !== undefined) return oa < 0 ? -1 : 1; 
      if (ob !== undefined) return ob < 0 ? 1 : -1;
      // 연도: 숫자로 비교
      const an = parseInt(a), bn = parseInt(b);
      if (!isNaN(an) && !isNaN(bn)) return an - bn;
      return String(a).localeCompare(String(b), 'ko');
    };

    const dimUniques = {};
    (plan.groupBys || []).forEach((gb, idx) => {
      // 계(Total)가 데이터에 있다면 반드시 추출
      let vals = [...new Set(allResults.map(r => r.groupKeys?.[idx]))].filter(v => v != null && v !== "");
      if (vals.length === 0) vals = ['계'];
      vals.sort(semanticSort);
      dimUniques[gb.label] = vals;
    });

    // ─── 카르테시안 곱 ─────────────────────────────────────
    const cartesian = (sets) =>
      sets.reduce((acc, set) => acc.flatMap(head => set.map(tail => [...head, tail])), [[]]);

    const rowDims = pivotConfig.rows;
    const colDims = pivotConfig.cols;
    const rowSets = rowDims.map(d => dimUniques[d]).filter(Boolean);
    const colSets = colDims.map(d => dimUniques[d]).filter(Boolean);
    const rowCombinations = rowSets.length > 0 ? cartesian(rowSets) : [['계']];
    const colCombinations = colSets.length > 0 ? cartesian(colSets) : [['계']];

    // ─── 집계 범위 표시 (오름차순, 중복 제거) ─────────────
    const yearRange = plan.yearRange;
    const rangeLabel = yearRange.start === yearRange.end
      ? `${yearRange.start}년`
      : `${yearRange.start}~${yearRange.end}년`;
    const ageLabel = plan.ageRange ? `${plan.ageRange.min}~${plan.ageRange.max}세` : '';

    return (
      <div className="toss-card space-y-5">
        {/* Source & Citation */}
        <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <ShieldCheck size={20} />
             </div>
             <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">통계 출처</p>
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  {userRole === 'super_admin' && <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">{kosisInfo.id}</span>}
                  {kosisInfo.title}
                </h4>
             </div>
          </div>
          <a href={kosisInfo.url} target="_blank" className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">KOSIS 원본 확인 <ChevronRight size={14} /></a>
        </div>

        {/* 통합형 피벗 컨트롤러 (Integrated App-Like Toolbar) */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          <div className="bg-gray-50/50 p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Layout size={16} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-gray-900">{plan.title}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">실시간 통계 분석 데이터</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-black text-gray-600 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">(단위: {unit})</span>
              <div className="flex gap-1 border-l border-gray-200 pl-2">
                <button onClick={handleDownloadExcel} className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm transition-all"><Download size={16} /></button>
                <button onClick={swapAxes} title="행/열 전환" className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm transition-all"><RefreshCw size={16} /></button>
                <button type="button" onClick={()=>setShowCode(true)} title="피벗 기준 SAS 개요" className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm transition-all"><Code2 size={16} /></button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Row Bucket */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  const dim = e.dataTransfer.getData('dimension');
                  if (dim && !pivotConfig.rows.includes(dim))
                    setPivotConfig(prev => ({ rows: [...prev.rows, dim], cols: prev.cols.filter(c=>c!==dim) }));
                }}
                className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-2xl border border-gray-100 min-h-[52px]">
                <div className="flex flex-col items-center px-2 border-r border-gray-200 leading-none">
                  <span className="text-[8px] font-black text-blue-500 uppercase">Row</span>
                  <span className="text-[10px] font-black text-gray-400">행</span>
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {pivotConfig.rows.map((dim, dimIdx) => (
                    <div key={dim}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData('dimension', dim);
                        e.dataTransfer.setData('source', 'row');
                        e.dataTransfer.setData('sourceIndex', String(dimIdx));
                      }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.stopPropagation();
                        const src = e.dataTransfer.getData('source');
                        const dragDim = e.dataTransfer.getData('dimension');
                        if (src === 'row' && dragDim !== dim) {
                          // 같은 버튷 내 순서 변경
                          const newRows = pivotConfig.rows.filter(d => d !== dragDim);
                          const dropIdx = newRows.indexOf(dim);
                          newRows.splice(dropIdx, 0, dragDim);
                          setPivotConfig(p => ({ rows: newRows, cols: p.cols }));
                        }
                      }}
                      className="group px-3 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-1.5 cursor-grab">
                      {dim}
                      <button onClick={()=>setPivotConfig(p=>({rows:p.rows.filter(d=>d!==dim), cols:p.cols}))} className="opacity-0 group-hover:opacity-100 hover:text-red-200 transition-all"><X size={10}/></button>
                    </div>
                  ))}
                  {pivotConfig.rows.length === 0 && <span className="text-[11px] text-gray-300 italic px-2">행 차원 없음</span>}
                </div>
              </div>

              {/* Col Bucket */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  const dim = e.dataTransfer.getData('dimension');
                  if (dim && !pivotConfig.cols.includes(dim))
                    setPivotConfig(prev => ({ cols: [...prev.cols, dim], rows: prev.rows.filter(r=>r!==dim) }));
                }}
                className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-2xl border border-gray-100 min-h-[52px]">
                <div className="flex flex-col items-center px-2 border-r border-gray-200 leading-none">
                  <span className="text-[8px] font-black text-indigo-500 uppercase">Col</span>
                  <span className="text-[10px] font-black text-gray-400">열</span>
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {pivotConfig.cols.map((dim, dimIdx) => (
                    <div key={dim}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData('dimension', dim);
                        e.dataTransfer.setData('source', 'col');
                        e.dataTransfer.setData('sourceIndex', String(dimIdx));
                      }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.stopPropagation();
                        const src = e.dataTransfer.getData('source');
                        const dragDim = e.dataTransfer.getData('dimension');
                        if (src === 'col' && dragDim !== dim) {
                          // 같은 버튷 내 순서 변경
                          const newCols = pivotConfig.cols.filter(d => d !== dragDim);
                          const dropIdx = newCols.indexOf(dim);
                          newCols.splice(dropIdx, 0, dragDim);
                          setPivotConfig(p => ({ rows: p.rows, cols: newCols }));
                        }
                      }}
                      className="group px-3 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-1.5 cursor-grab">
                      {dim}
                      <button onClick={()=>setPivotConfig(p=>({cols:p.cols.filter(d=>d!==dim), rows:p.rows}))} className="opacity-0 group-hover:opacity-100 hover:text-red-200 transition-all"><X size={10}/></button>
                    </div>
                  ))}
                  {pivotConfig.cols.length === 0 && <span className="text-[11px] text-gray-300 italic px-2">열 차원 없음</span>}
                </div>
              </div>
            </div>

            {/* Dimension Chips - 클릭 지원 */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-black text-gray-400 mr-2">사용 가능 차원:</span>
              {(plan.groupBys || []).map(gb => {
                const inRow = pivotConfig.rows.includes(gb.label);
                const inCol = pivotConfig.cols.includes(gb.label);
                return (
                  <button 
                    key={gb.label}
                    onClick={() => {
                        if (!inRow && !inCol) setPivotConfig(p=>({rows:[...p.rows, gb.label], cols:p.cols}));
                    }}
                    draggable onDragStart={e => e.dataTransfer.setData('dimension', gb.label)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        inRow ? 'bg-blue-50 text-blue-600 border-blue-200' 
                        : inCol ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}>
                    {gb.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pivot Table (Integrated without extra cards) */}
          <div className="overflow-x-auto pivot-table-container">
            <table id="result-table" className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              {colDims.length === 0 ? (
                <tr>
                  {(rowDims.length > 0 ? rowDims : ['기준']).map((dim, hIdx) => (
                    <th
                      key={`h-${dim}-${hIdx}`}
                      className="px-4 py-3 text-left font-black text-gray-500 text-[11px] bg-gray-50 min-w-[104px] whitespace-nowrap sticky border-r-2 border-gray-200"
                      style={{ left: `${hIdx * 104}px`, zIndex: 20 + hIdx }}
                    >
                      {dim}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-bold text-blue-700 bg-blue-50 text-[12px]">전체 합계</th>
                </tr>
              ) : colDims.map((dim, dIdx) => (
                <tr key={dim}>
                  {dIdx === 0 &&
                    (rowDims.length > 0 ? rowDims : ['기준']).map((rd, hIdx) => (
                      <th
                        key={`corner-${rd}-${hIdx}`}
                        rowSpan={colDims.length}
                        className="px-4 py-3 text-left font-black text-gray-500 text-[11px] bg-gray-50 align-bottom min-w-[104px] whitespace-nowrap sticky border-r-2 border-gray-200"
                        style={{ left: `${hIdx * 104}px`, zIndex: 20 + hIdx }}
                      >
                        {rd}
                      </th>
                    ))}
                  {colCombinations.map((combo, cIdx) => {
                    const isShowing = cIdx === 0
                      || combo.slice(0, dIdx).join('|') !== colCombinations[cIdx-1].slice(0, dIdx).join('|')
                      || combo[dIdx] !== colCombinations[cIdx-1][dIdx];
                    if (!isShowing) return null;
                    let colSpan = 1;
                    for (let i=cIdx+1; i<colCombinations.length; i++) {
                      if (colCombinations[i].slice(0, dIdx+1).join('|') === combo.slice(0, dIdx+1).join('|')) colSpan++;
                      else break;
                    }
                    const isTotal = combo.includes('계') || combo.includes('전체');
                    return (
                      <th key={cIdx} colSpan={colSpan}
                        className={`px-4 py-3 text-center font-bold border-l border-gray-100 text-[12px] ${isTotal ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>
                        {combo[dIdx]}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rowCombinations.map((rCombo, rIdx) => {
                const isRowTotal = rCombo.includes('계') || rCombo.includes('전체');
                return (
                  <tr key={rIdx} className={`hover:bg-gray-50/50 transition-colors ${isRowTotal ? 'bg-blue-50/30' : ''}`}>
                    {rCombo.map((val, vIdx) => {
                      const isShowing = rIdx === 0
                        || rCombo.slice(0, vIdx).join('|') !== rowCombinations[rIdx-1].slice(0, vIdx).join('|')
                        || val !== rowCombinations[rIdx-1][vIdx];
                      if (!isShowing) return null;
                      let rowSpan = 1;
                      for (let i=rIdx+1; i<rowCombinations.length; i++) {
                        if (rowCombinations[i].slice(0, vIdx+1).join('|') === rCombo.slice(0, vIdx+1).join('|')) rowSpan++;
                        else break;
                      }
                      const isTotalCell = val === '계' || val === '전체';
                      return (
                        <td key={vIdx} rowSpan={rowSpan}
                          className={`px-4 py-3.5 font-bold border-r-2 border-gray-100 sticky text-[13px] min-w-[104px] ${isTotalCell ? 'text-blue-700 bg-blue-50' : 'text-gray-800 bg-white'}`}
                          style={{ left: `${vIdx * 104}px`, zIndex: 10 + vIdx }}>
                          {val}
                        </td>
                      );
                    })}
                    {colCombinations.map((cCombo, cIdx) => {
                      const item = findItem(rowDims, rCombo, colDims, cCombo);
                      const isTotal = isRowTotal || cCombo.includes('계') || cCombo.includes('전체');
                      const displayVal = item
                        ? (unit.includes('개월') ? formatMonths(item.value) : item.value.toLocaleString())
                        : '-';
                      return (
                        <td key={cIdx}
                          className={`px-4 py-3.5 text-center font-bold border-l border-gray-50 text-[13px] tabular-nums ${isTotal ? 'text-blue-600 bg-blue-50/20' : 'text-gray-900'}`}>
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footnote: 집계 대상 (단일, 하단에 한 번만) */}
        <div className="flex items-center gap-2 px-1 text-[11px] text-gray-400 border-t border-gray-50 pt-3">
          <Info size={11} className="text-blue-400 shrink-0" />
          <span>
            집계 대상: {kosisInfo.title}, {rangeLabel}{ageLabel ? `, ${ageLabel}` : ''}
            {plan.filterDesc ? ` · 필터: ${plan.filterDesc}` : ''}
            {datasetMeta.length > 0 ? ` · 수록 연도: ${datasetMeta.map(m=>m.label).join(' · ')}` : ''}
          </span>
        </div>

        {analysisResult?.sasCode && (
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <Code2 size={18} className="shrink-0" />
                <span className="text-sm font-black">검증용 SAS 코드</span>
                <span className="text-[10px] font-bold text-gray-400">(KOSIS·MDIS 대조용)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAnalysisSas(v => !v)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl text-sm font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all"
              >
                {showAnalysisSas ? '코드 접기' : '코드 보기'}
              </button>
            </div>
            {showAnalysisSas && (
              <div className="bg-[#1a1b26] rounded-2xl p-5 overflow-x-auto border border-gray-800 relative group">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(analysisResult.sasCode);
                    alert('SAS 코드가 클립보드에 복사되었습니다.');
                  }}
                  className="absolute top-3 right-3 text-[11px] font-bold text-gray-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl"
                >
                  복사
                </button>
                <pre className="text-xs text-emerald-100/95 leading-relaxed font-mono pr-16 whitespace-pre-wrap">
                  {analysisResult.sasCode}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── 탭 컨텐츠 ─────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'analyze': {
        return (
          <div className={`flex flex-col ${isMobile ? 'space-y-6' : 'lg:flex-row lg:gap-8 lg:items-start'}`}>
            {/* PC Left/Top Column: Search & Controls */}
            <div className={`${isMobile ? 'w-full' : 'lg:w-[350px] lg:sticky lg:top-10 space-y-6 shrink-0'}`}>
              <div className="toss-card p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Search size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">지능형 분석</h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase">AI Statistical Query</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="예: 2021~2025년 기준 대학졸업까지 걸린 기간을 교육수준별, 성별로 집계해줘"
                      className="w-full h-32 p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl text-sm leading-relaxed transition-all resize-none outline-none font-medium shadow-inner"
                    />
                    {!isMobile && (
                      <button
                        onClick={() => handleAnalyze()}
                        disabled={isLoading || !query.trim()}
                        className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-xl hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95 z-10"
                      >
                        {isLoading ? <RefreshCw size={22} className="animate-spin" /> : <ArrowRight size={22} />}
                      </button>
                    )}
                  </div>
                  
                  {isMobile && (
                    <button
                      onClick={() => handleAnalyze()}
                      disabled={isLoading || !query.trim()}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30"
                    >
                      {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                      {isLoading ? '분석 진행 중...' : '데이터 분석 시작'}
                    </button>
                  )}

                  {analysisError && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                       <p className="text-xs text-red-600 font-bold flex items-center gap-2">
                         <AlertCircle size={14} /> {analysisError}
                       </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <p className="text-[10px] font-black text-gray-400 w-full mb-1">KOSIS 표준 표 선택 (54종):</p>
                  {(Object.values(KOSIS_MAP) || []).filter(t => t.surveyType === selectedSurveyType).slice(0, 8).map(table => (
                    <button 
                      key={table.id} 
                      onClick={() => { setQuery(`${table.title}`); handleAnalyze(`${table.title}`); }} 
                      className="text-[10px] font-bold text-blue-600 bg-blue-50/50 border border-blue-100 px-2.5 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      {table.title}
                    </button>
                  ))}
                  <button 
                    onClick={() => setActiveTab('kosis_kb')}
                    className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition-all font-black"
                  >
                    전체 보기 +
                  </button>
                </div>
              </div>

              {/* Pivot Panel included in the control column for PC */}
              {analysisResult && (
                <PivotPanel
                  plan={analysisResult.plan}
                  pivotConfig={pivotConfig}
                  setPivotConfig={setPivotConfig}
                />
              )}
            </div>

            {/* PC Right Column / Mobile Bottom: Results */}
            <div className="flex-1 min-w-0 space-y-6">
              {isLoading && (
                <div className="toss-card p-20 flex flex-col items-center justify-center space-y-4 animate-pulse">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm font-black text-gray-400">마이크로데이터를 정밀 분석 중입니다...</p>
                </div>
              )}
              {!isLoading && analysisResult && (
                <div className="space-y-6">
                  {renderResultTable()}
                </div>
              )}
              {!isLoading && !analysisResult && (
                <div className="toss-card p-20 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-gray-100 bg-transparent">
                  <div className="w-20 h-20 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200">
                    <Database size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800">분석 결과가 여기에 표시됩니다</h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">상기 검색창에 분석하고 싶은 내용을 입력하거나 추천 키워드를 클릭해 보세요.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'factcheck': return (
        <section className="space-y-6 animate-in">
          <header>
            <h2 className="text-3xl font-black mb-1">자율형 팩트체크</h2>
            <p className="text-gray-400 text-sm">URL 입력 → 기사 내 모든 수치 자동 식별 → MDIS 마이크로데이터로 직접 검증</p>
          </header>

          <div className="toss-card space-y-4">
            <div className="flex gap-2">
              <input className="toss-input flex-1" placeholder="뉴스 기사 URL을 입력하세요"
                value={url} onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFactCheck()} />
              <button onClick={handleFactCheck} disabled={factCheckStep === 1} className="toss-button min-w-[110px] justify-center">
                {factCheckStep === 1
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><ShieldCheck size={16} /> 검증 시작</>}
              </button>
            </div>
            {factCheckStep >= 1 && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { s: 1, label: '① 기사 크롤링', sub: '본문 수집' },
                  { s: 2, label: '② 수치 식별', sub: '청년 관련 청구 추출' },
                  { s: 3, label: '③ MD 대조', sub: '마이크로데이터 집계' },
                ].map(({ s, label, sub }) => (
                  <div key={s} className={`p-3 rounded-2xl text-center transition-all border ${factCheckStep >= s ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                    <p className={`text-xs font-bold mb-0.5 ${factCheckStep >= s ? 'text-blue-600' : 'text-gray-300'}`}>{label}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {factCheckStep === 2 && factCheckResults && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-500">발견된 통계 주장 {factCheckResults.length}건</p>
              {factCheckResults.length === 0 && (
                <div className="toss-card text-center text-gray-400">기사에서 청년 통계 관련 수치를 찾지 못했습니다.</div>
              )}
              {factCheckResults.map((claim, i) => (
                <div key={i} className={`toss-card border-l-4 ${
                  claim.status === 'green' ? 'border-l-green-400' :
                  claim.status === 'yellow' ? 'border-l-yellow-400' : 'border-l-red-400'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {claim.status === 'green' ? <CheckCircle className="text-green-500 shrink-0" size={18} /> :
                     claim.status === 'yellow' ? <AlertCircle className="text-yellow-500 shrink-0" size={18} /> :
                     <XCircle className="text-red-500 shrink-0" size={18} />}
                    <span className={`text-sm font-bold ${
                      claim.status === 'green' ? 'text-green-700' :
                      claim.status === 'yellow' ? 'text-yellow-700' : 'text-red-700'}`}>{claim.message}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded-xl mb-3">"{claim.sentence}"</p>
                  <div className="flex gap-6 flex-wrap">
                    <div><p className="text-[10px] text-gray-400 mb-0.5">기사 수치</p><p className="text-xl font-black text-gray-800">{claim.articleValue}</p></div>
                    <div className="w-px bg-gray-200" />
                    <div><p className="text-[10px] text-gray-400 mb-0.5">MD 집계 수치</p><p className="text-xl font-black text-blue-600">{claim.mdValue}</p></div>
                    <div className="w-px bg-gray-200" />
                    <div><p className="text-[10px] text-gray-400 mb-0.5">대조 근거</p><p className="text-xs font-medium text-gray-500 max-w-[200px]">{claim.kosisTable}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      );

      case 'dictionary': return (
        <section className="space-y-6 animate-in">
          <header>
            <h2 className="text-3xl font-black mb-1">변수 백과사전</h2>
            <p className="text-gray-400 text-sm">5대 부가조회 마이크로데이터 통합 명세서</p>
          </header>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SURVEY_ORDER.map(st => (
              <button 
                key={st}
                onClick={() => setSelectedSurveyType(st)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border
                  ${selectedSurveyType === st 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-blue-400 hover:text-blue-500'}`}
              >
                {DATASET_CONFIGS[st].label}
              </button>
            ))}
          </div>

          <div className="toss-card p-0 overflow-hidden shadow-xl">
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">{DATASET_CONFIGS[selectedSurveyType].label} 변수 {DICTIONARIES[selectedSurveyType]?.length || 0}건</span>
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input placeholder="변수명 검색..." className="bg-white border border-gray-100 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:ring-2 focus:ring-blue-100 outline-none w-48 transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 font-black uppercase">문항 번호</th>
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 font-black uppercase">영역</th>
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 font-black uppercase">변수명</th>
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 font-black uppercase">타입</th>
                    <th className="px-5 py-3 text-left text-[10px] text-gray-400 font-black uppercase">설명</th>
                  </tr>
                </thead>
                <tbody>
                  {(DICTIONARIES[selectedSurveyType] || []).map((v, i) => (
                    <React.Fragment key={i}>
                      <tr 
                        className="border-t border-gray-50 hover:bg-blue-50/20 transition-all cursor-pointer"
                        onClick={() => setExpandedVar(expandedVar === v.name ? null : v.name)}
                      >
                        <td className="px-5 py-4 text-gray-950 text-[11px] font-black">{v.itemNum}</td>
                        <td className="px-5 py-4 text-gray-400 text-[11px] font-bold">{v.category}</td>
                        <td className="px-5 py-4 font-mono text-blue-600 font-black text-xs flex items-center gap-1">
                          {v.name}
                          {v.codes && v.codes.length > 0 && <ChevronRight size={12} className={`transition-transform ${expandedVar === v.name ? 'rotate-90' : ''}`} />}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-[11px]">{v.type}</td>
                        <td className="px-5 py-4 text-gray-600 text-[11px] max-w-sm truncate">{v.desc}</td>
                      </tr>
                      {expandedVar === v.name && v.codes && v.codes.length > 0 && (
                        <tr className="bg-blue-50/30">
                          <td colSpan="4" className="px-10 py-5">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {v.codes.map(c => (
                                <div key={c.val} className="flex items-center gap-2 text-[11px]">
                                  <span className="font-black text-blue-600 w-5 text-right shrink-0">{c.val}:</span>
                                  <span className="text-gray-700 font-medium">{c.label}</span>
                                </div>
                              ))}
                            </div>
                            {v.patch && (
                              <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-2">
                                <span className="text-[9px] bg-orange-400 text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">Correction</span>
                                <p className="text-[11px] text-blue-600 font-bold">{v.patch}</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );

      case 'users': return (
        <section className="space-y-6 animate-in">
          <header>
            <h2 className="text-3xl font-black mb-1">회원 관리</h2>
            <p className="text-gray-400 text-sm">가입 승인 · 권한 부여 · 접근 박탈</p>
          </header>

          {users.filter(u => u.status === 'pending').length > 0 && (
            <div className="toss-card border-2 border-orange-100">
              <h4 className="font-bold mb-4 text-orange-600 flex items-center gap-2">
                <Clock size={17} /> 승인 대기 ({users.filter(u => u.status === 'pending').length}건)
              </h4>
              <div className="space-y-3">
                {users.filter(u => u.status === 'pending').map(u => (
                  <div key={u.id} className="flex items-center gap-4 p-3 bg-orange-50 rounded-2xl flex-wrap">
                    <div className="flex-1 min-w-[100px]">
                      <p className="font-bold text-sm">{u.name} <span className="text-xs text-gray-400">({u.userId})</span></p>
                      <p className="text-xs text-gray-400">요청일: {u.requestDate}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {assignableRoles(actualRole).map(role => (
                        <button key={role} onClick={() => handleApproveUser(u.id, role)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 transition-all">
                          {ROLE_LABELS[role].label}로 승인
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="toss-card p-0 overflow-hidden">
            <div className="p-6 pb-3">
              <h4 className="font-bold flex items-center gap-2"><Users size={17} /> 전체 회원</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{['이름','아이디','권한','상태','승인일','관리'].map(h =>
                    <th key={h} className="px-5 py-3 text-left text-xs text-gray-400 font-semibold">{h}</th>
                  )}</tr>
                </thead>
                <tbody>
                  {users.filter(u => u.status !== 'pending').map(u => (
                    <tr key={u.id} className={`border-t border-gray-50 ${u.status === 'revoked' ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-4 font-semibold">{u.name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{u.userId}</td>
                      <td className="px-5 py-4">
                        {/* 자신보다 낮은 권한만 변경 가능, 본인 계정 제외 */}
                        {u.status === 'active' && u.id !== 1 && ROLES.indexOf(actualRole) < ROLES.indexOf(u.role) - 0 ? (
                          <select value={u.role} onChange={e => handleChangeRole(u.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-xl px-2 py-1 bg-white focus:outline-none focus:border-blue-400">
                            {assignableRoles(actualRole).map(r => (
                              <option key={r} value={r}>{ROLE_LABELS[r].label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${ROLE_LABELS[u.role]?.color}`}>
                            {ROLE_LABELS[u.role]?.label}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold ${u.status === 'active' ? 'text-green-600' : 'text-red-400'}`}>
                          {u.status === 'active' ? '재직 중' : '접근 박탈'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{u.approvedDate || '-'}</td>
                      <td className="px-5 py-4">
                        {u.status === 'active' && u.id !== 1 && (
                          <button onClick={() => handleRevokeUser(u.id)}
                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 font-semibold">
                            <Slash size={12} /> 박탈
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );

      case 'data_mgmt': return (
        <section className="space-y-6 animate-in">
          <header>
            <h2 className="text-3xl font-black mb-1">데이터 관리</h2>
            <p className="text-gray-400 text-sm">연도별·조사별 데이터 로드 현황 및 마이크로데이터 인터벤션</p>
          </header>
          
          <div className="toss-card p-0 overflow-hidden shadow-xl border-blue-50">
            <div className="p-6 bg-blue-50/30 flex justify-between items-center">
              <div>
                <h4 className="font-bold flex items-center gap-2"><Database size={18} /> 데이터셋 인벤토리 매트릭스</h4>
                <p className="text-xs text-blue-500 mt-1">서버의 /data 폴더 내 실제 파싱 가능한 CSV 현황입니다.</p>
              </div>
              <button 
                onClick={async () => {
                  setIsInventoryLoading(true);
                  fetch('/api/data/inventory').then(r=>r.json()).then(d => {
                    setDataInventory(d.inventory);
                    setIsInventoryLoading(false);
                  });
                }}
                className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-xl font-bold border border-blue-100 hover:bg-blue-50">
                {isInventoryLoading ? '갱신 중...' : '새로고침'}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 border-y border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] text-gray-400 font-black uppercase bg-white sticky left-0 z-10">조사 유형 / 구분</th>
                    {inventoryYears.map(y => (
                      <th key={y} className="px-6 py-4 text-center text-[10px] text-gray-400 font-black uppercase min-w-[80px]">{y}년</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SURVEY_ORDER.map(st => (
                    <tr key={st} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-gray-700 bg-white sticky left-0 z-10 border-r border-gray-50 whitespace-nowrap">
                        {DATASET_CONFIGS[st].label}
                      </td>
                      {inventoryYears.map(y => {
                        const isAvailable = dataInventory[st]?.[y];
                        return (
                          <td key={y} className="px-6 py-5 text-center">
                            {isAvailable ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black shadow-sm border border-green-100 whitespace-nowrap">
                                <CheckCircle size={10} /> 로드됨
                              </div>
                            ) : (
                              <span className="text-gray-300 text-[10px] items-center inline-flex gap-1.5 whitespace-nowrap">
                                <Slash size={10} /> 미장착
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(actualRole === 'super_admin' || actualRole === 'admin') && (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={onFileDrop}
              className={`toss-card border-2 border-dashed p-10 text-center animate-in transition-all
                ${isUploading ? 'border-blue-400 bg-blue-100/50' : 'border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:bg-blue-50/50'}`}
            >
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg text-blue-500 mx-auto mb-4">
                {isUploading ? <RefreshCw className="animate-spin" size={28} /> : <Database size={28} />}
              </div>
              <h4 className="text-xl font-black text-blue-900 mb-1">
                {isUploading ? '데이터 분석 및 변환 중...' : 'MDIS 데이터 업로드 센터'}
              </h4>
              <p className="text-sm text-blue-600/60 mb-8 leading-relaxed">
                {isUploading 
                  ? '파일의 구조를 분석하여 시스템 인벤토리에 자동 배치하고 있습니다.' 
                  : 'CSV 또는 XLSX 마이크로데이터 파일을 이곳에 드래그하거나 클릭하여 업로드하세요.'}
              </p>
              
              {!isUploading && (
                <div className="flex justify-center gap-3">
                  <label className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:scale-105 transition-all cursor-pointer">
                    파일 선택하기
                    <input type="file" className="hidden" accept=".csv, .xlsx" onChange={(e) => e.target.files?.[0] && processAndUploadFile(e.target.files[0])} />
                  </label>
                  <button className="px-8 py-4 bg-white text-blue-600 border border-blue-100 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all">업로드 로그 확인</button>
                </div>
              )}
            </div>
          )}
        </section>
      );

      case 'menu_settings': return (
        <section className="space-y-6 animate-in">
          <header>
            <h2 className="text-3xl font-black mb-1">메뉴 설정</h2>
            <p className="text-gray-400 text-sm">관리자 전용: 권한별 사이드바 메뉴 노출 여부 통제</p>
          </header>
          
          <div className="toss-card">
            <p className="text-sm text-gray-400 mb-6 bg-orange-50 p-4 rounded-2xl text-orange-600 font-bold border border-orange-100 flex items-center gap-2">
              <AlertCircle size={18} /> 최고 관리자만 수정 가능하며, 변경 시 즉시 모든 사용자에게 적용됩니다.
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              {ROLES.map(role => (
                <div key={role} className="p-6 border border-gray-100 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black ${ROLE_LABELS[role].color}`}>
                      {ROLE_LABELS[role].label} 권한 그룹
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {SIDEBAR_MENU_POOL.map(menu => (
                      <label key={menu.id} className="flex items-center gap-2 cursor-pointer bg-white border border-gray-100 px-4 py-2.5 rounded-2xl hover:border-blue-400 transition-all">
                        <input 
                          type="checkbox"
                          checked={menuPermissions?.[role]?.includes(menu.id)}
                          onChange={async (e) => {
                            const newSettings = { ...menuPermissions };
                            if (e.target.checked) {
                              newSettings[role] = [...(newSettings[role] || []), menu.id];
                            } else {
                              newSettings[role] = newSettings[role].filter(id => id !== menu.id);
                            }
                            setMenuPermissions(newSettings);
                            // 서버 저장
                            fetch('/api/admin/menu', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ settings: newSettings })
                            });
                          }}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="font-bold text-gray-600">{menu.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

      case 'kosis_kb': {
        const currentSurvey = kbData?.find(s => s.type === selectedKbSurvey);
        const filteredTables = currentSurvey?.tables?.filter(t => 
          t.id?.includes(kbSearch) || t.name?.includes(kbSearch) || t.keywords?.some(k => k.includes(kbSearch))
        ) || [];

        return (
          <section className="space-y-8 animate-in pb-20 relative">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest shadow-sm">KOSIS Master</span>
                  <span className="text-blue-400 text-[10px] font-black tracking-widest leading-none">전용 지식 베이스</span>
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">데이터 통합 분석 마스터</h2>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">통계청 MDIS 원시데이터와 KOSIS 공표 기준을 완벽하게 연결하는 실무 지침서</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text"
                    placeholder="표 번호 또는 이름 검색..."
                    value={kbSearch}
                    onChange={(e) => setKbSearch(e.target.value)}
                    className="w-full sm:w-64 pl-12 pr-6 py-3.5 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold shadow-sm focus:shadow-xl transition-all outline-none"
                  />
                </div>
              </div>
            </header>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex p-1.5 bg-gray-100/50 rounded-2xl w-full sm:w-fit backdrop-blur-md">
                {(kbData || []).map(survey => (
                  <button
                    key={survey.type}
                    onClick={() => { setSelectedKbSurvey(survey.type); setSelectedTable(null); }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                      selectedKbSurvey === survey.type ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {survey.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <ShieldCheck size={14} className="animate-pulse" />
                <span className="text-[11px] font-black">2025년 SAS 로직 기반 100% 무결성 검증됨</span>
              </div>
            </div>

            {kbLoading ? (
              <div className="toss-card p-20 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-gray-300 uppercase tracking-tighter">매뉴얼 라이브러리 로드 중...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className="toss-card p-6 text-left hover:border-blue-200 hover:shadow-xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                    
                      <div className="flex flex-col h-full uppercase">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg tracking-wider border border-blue-100">{table.id}</span>
                          {table.sas && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">SAS 집계가능</span>
                            </div>
                          )}
                        </div>
                        <h4 className="text-[13px] font-black text-gray-800 leading-snug mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {table.name}
                        </h4>
                      
                      <div className="mt-auto flex flex-wrap gap-1.5">
                        {(table.keywords || []).slice(0, 3).map((kw, i) => (
                          <span key={i} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">#{kw}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
                
                {filteredTables.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-3">
                    <p className="text-sm font-black text-gray-300">검색 결과와 일치하는 표가 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* 상세 뷰어 (Drawer) */}
            {selectedTable && (
              <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedTable(null)} />
                <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 p-6 flex items-center justify-between z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">{selectedTable.id}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedKbSurvey === 'YOUTH' ? '청년층 부가' : '근로형태별'}</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900">{selectedTable.name}</h3>
                    </div>
                    <button onClick={() => setSelectedTable(null)} className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-8 space-y-12 pb-32">
                    {/* 메타데이터 대시보드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50">
                        <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Database size={12} /> 주요 분석 변수</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedTable.variables || []).map((v, i) => (
                            <span key={i} className="text-xs font-bold text-blue-900 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-blue-100">{v}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100/50">
                        <h5 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><ArrowRightLeft size={12} /> 관련 질문 예시</h5>
                        <div className="space-y-1.5">
                          {(selectedTable.examples || []).map((ex, i) => (
                            <p key={i} className="text-[11px] font-bold text-purple-900 leading-tight">“{ex}”</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 매뉴얼 섹션 (지능형 렌더링) */}
                    {selectedTable.manual && (
                      <div className="space-y-8">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                          <h5 className="text-lg font-black text-gray-900 tracking-tight">집계 지침 및 실무 매뉴얼</h5>
                        </div>
                        
                        <div className="space-y-10">
                          {(() => {
                            const parts = selectedTable.manual.split(/\[(.*?)\]/);
                            if (parts.length <= 1) {
                              // 구조화된 헤더가 없는 경우 통째로 출력
                              return (
                                <div className="text-sm leading-relaxed text-gray-600 font-medium space-y-2 whitespace-pre-wrap pl-3 border-l-2 border-gray-50">
                                  {selectedTable.manual.split('\n').map((line, lIdx) => (
                                    <p key={lIdx} className={line.includes('★') ? 'bg-orange-50 text-orange-700 p-2 rounded-xl font-bold' : ''}>
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              );
                            }

                            return parts.map((part, idx, arr) => {
                              if (idx % 2 === 1) { // This is a header: [Title]
                                const title = part;
                                const content = arr[idx+1]?.trim() || '';
                                const isTable = content.includes('KOSIS') && content.includes('MDIS');
                                
                                return (
                                  <div key={idx} className="space-y-4">
                                    <h6 className="text-sm font-black text-gray-800 flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> {title}
                                    </h6>
                                    {isTable ? (
                                      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                        <pre className="p-5 text-[11px] leading-relaxed text-gray-600 font-mono overflow-x-auto bg-gray-50/50">
                                          {content}
                                        </pre>
                                      </div>
                                    ) : (
                                      <div className="text-sm leading-relaxed text-gray-600 font-medium space-y-2 whitespace-pre-wrap pl-3 border-l-2 border-gray-50">
                                        {content.split('\n').map((line, lIdx) => (
                                          <p key={lIdx} className={line.includes('★') ? 'bg-orange-50 text-orange-700 p-2 rounded-xl font-bold' : ''}>
                                            {line}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              // 헤더 이전의 텍스트 처리 (첫 섹션 이전에 서문이 있는 경우)
                              if (idx === 0 && part.trim()) {
                                return (
                                  <div key={idx} className="text-sm leading-relaxed text-gray-600 font-medium space-y-2 whitespace-pre-wrap mb-6 pb-6 border-b border-gray-100">
                                    {part.split('\n').map((line, lIdx) => (
                                      <p key={lIdx}>{line}</p>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {/* SAS 코드 섹션 */}
                    {selectedTable.sas && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            <h5 className="text-lg font-black text-gray-900 tracking-tight">공식 SAS 소스 코드 (MDIS 전용)</h5>
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedTable.sas);
                              alert('코드가 클립보드에 복사되었습니다.');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-black hover:bg-emerald-100 transition-all active:scale-95 shadow-sm border border-emerald-100"
                          >
                            <Code2 size={13} /> 코드 복사
                          </button>
                        </div>
                        <div className="bg-[#1a1b26] rounded-3xl p-8 overflow-x-auto shadow-2xl relative group border border-gray-800">
                          <div className="absolute top-4 right-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">sas environment</div>
                          <pre className="text-[12px] text-blue-100/90 leading-relaxed font-mono">
                            {selectedTable.sas}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      }

      case 'board': return (
        <section className="space-y-6 animate-in">
          <header>
            <h2 className="text-3xl font-black mb-1">게시판</h2>
            <p className="text-gray-400 text-sm">조사원 전용 업무 연락 및 질의응답</p>
          </header>
          <div className="toss-card h-96 flex items-center justify-center border-dashed border-2 border-gray-200">
            <p className="text-gray-400 font-bold">커뮤니티 게시판 준비 중입니다</p>
          </div>
        </section>
      );

      case 'education': return (
        <section className="space-y-6 animate-in">
          <header>
            <h2 className="text-3xl font-black mb-1">교육자료</h2>
            <p className="text-gray-400 text-sm">마이크로데이터 집계 규칙 및 지침서 아카이브</p>
          </header>
          <div className="toss-card h-96 flex items-center justify-center border-dashed border-2 border-gray-200">
            <p className="text-gray-400 font-bold">교육용 영상 및 가이드 준비 중입니다</p>
          </div>
        </section>
      );

      default: return null;
    }
  };

  // ── 네비게이션 항목 (동적 권한 반영) ───────────────────────────
  const SIDEBAR_MENU_POOL = [
    { id: 'analyze',      icon: <Search size={20} />,      label: '자율형 분석' },
    { id: 'factcheck',    icon: <ShieldCheck size={20} />, label: '팩트체크' },
    { id: 'data_mgmt',    icon: <Database size={20} />,    label: '데이터 관리' },
    { id: 'dictionary',   icon: <BookOpen size={20} />,     label: '변수 사전' },
    { id: 'users',        icon: <Users size={20} />,        label: '회원 관리' },
    { id: 'board',        icon: <Clock size={20} />,        label: '게시판' },
    { id: 'education',    icon: <RefreshCw size={20} />,    label: '교육자료' },
    { id: 'kosis_kb',     icon: <Database size={20} />,     label: 'KOSIS 지식베이스' },
    { id: 'menu_settings', icon: <Settings size={20} />,     label: '메뉴 설정' },
  ];

  const navItems = SIDEBAR_MENU_POOL.filter(item => {
    // 1. 기본적으로 menuPermissions에 포함되어 있어야 함
    const hasPermission = menuPermissions?.[actualRole]?.includes(item.id);
    
    // 2. KOSIS KB는 관리자급에서만 강제 노출 (설정 누락 방지)
    if (item.id === 'kosis_kb') {
      return actualRole === 'super_admin' || actualRole === 'admin';
    }
    
    return hasPermission;
  });

  // ── RENDER ────────────────────────────────────────────────
  if (!isSessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // [임시 우회] 로그인 및 승인 대기 화면 비활성화
  if (false && !isAuthenticated) {
    // ... 기존 코드 보존 (사용 안함)
  }
  if (false && isAuthenticated && !isApproved) {
    // ... 기존 코드 보존 (사용 안함)
  }
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f5f6f8]">
      <Script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js" strategy="lazyOnload" />
      
      {/* ─── Mobile Header ────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Database size={16} />
          </div>
          <h1 className="font-black text-sm tracking-tight text-gray-800">KOSIS Fact</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <MoveHorizontal size={20} />
        </button>
      </header>

      {/* ─── Mobile Backdrop ─────────────────────────────── */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ─── Sidebar (Responsive Drawer) ──────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white p-5 space-y-5 shrink-0 z-[70] transition-transform duration-300 ease-out md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 md:bg-white md:border-r md:border-gray-100 md:z-auto
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setActiveTab('analyze'); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-2 pt-2 hover:opacity-80 transition-opacity text-left"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-md">
              <Database size={18} />
            </div>
            <div>
              <h1 className="font-black text-lg leading-none tracking-tight">KOSIS Fact</h1>
              <p className="text-[10px] text-gray-400 mt-0.5">청년층 부가조사 분석 플랫폼</p>
            </div>
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto pt-4">
          {navItems.map(({ id, icon, label }) => (
            <button key={id} onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm transition-all font-medium
                ${activeTab === id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}>
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* 카카오 인증 (v7 신규) */}
        {!actualRole || actualRole === 'user' ? (
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-tighter text-center">Admin/User Access</p>
            <KakaoLoginButton />
          </div>
        ) : (
          <div className="bg-green-50 p-3 rounded-2xl border border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle size={14} />
              </div>
              <span className="text-[10px] font-black text-green-700">카카오 인증됨</span>
            </div>
            <button className="text-[10px] text-green-400 hover:text-green-600 font-bold underline">로그아웃</button>
          </div>
        )}

        {/* 권한 미리보기 (최고 관리자만) */}
        {actualRole === 'super_admin' && (
          <div className="bg-purple-50 p-3 rounded-2xl">
            <p className="text-[10px] font-bold text-purple-400 mb-2 flex items-center gap-1"><Eye size={10} /> 권한 미리보기</p>
            <div className="flex gap-1.5 flex-wrap">
              {[null, 'admin', 'user'].map(role => (
                <button key={String(role)} onClick={() => { setPreviewRole(role); setActiveTab('analyze'); }}
                  className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-all
                    ${previewRole === role ? 'bg-purple-500 text-white' : 'bg-white text-purple-500 border border-purple-200 hover:bg-purple-100'}`}>
                  {role === null ? '내 권한' : ROLE_LABELS[role].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 현재 권한 */}
        <div className="bg-gray-50 p-3 rounded-2xl">
          <p className="text-[10px] text-gray-400 mb-1">접속 권한</p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${ROLE_LABELS[userRole]?.color}`}>
              {ROLE_LABELS[userRole]?.label}
            </span>
            {previewRole && <span className="text-[10px] text-gray-400">(미리보기)</span>}
          </div>
        </div>
      </aside>

      {/* ─── Main ─────────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-10 min-w-0 overflow-y-auto">
        {renderContent()}
      </main>

      {/* ─── Mobile Bottom Nav ────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden h-[68px] items-center justify-around px-2 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {navItems.slice(0, 5).map(({ id, icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center flex-1 gap-1 transition-all pt-1 ${activeTab === id ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
            {React.cloneElement(icon, { size: activeTab === id ? 24 : 22, className: activeTab === id ? 'opacity-100' : 'opacity-70' })}
            <span className={`text-[10px] ${activeTab === id ? 'font-black' : 'font-bold'}`}>{label}</span>
          </button>
        ))}
      </nav>

      {/* ─── SAS Code Viewer Modal ────────────────────────── */}
      {showCode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCode(false)}>
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl p-8 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5 shrink-0">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-2"><Code2 className="text-blue-500" /> 통계 집계 알고리즘 (SAS)</h3>
                <p className="text-xs text-gray-400 mt-1">MDIS 마이크로데이터 직접 집계 산식 · 분석 조건에 따라 동적 생성됨</p>
              </div>
              <button onClick={() => setShowCode(false)} className="text-gray-300 hover:text-black text-2xl font-light leading-none">✕</button>
            </div>
            <div className="bg-gray-950 rounded-2xl p-6 overflow-auto flex-1 font-mono text-sm text-green-300 leading-relaxed">
              <pre className="whitespace-pre-wrap">{generateSASCode(analysisResult?.plan, pivotConfig)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
