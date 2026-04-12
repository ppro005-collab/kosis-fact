export const SURVEY_TYPES = {
  YOUTH:        'YOUTH',
  WORKING_TYPE: 'WORKING_TYPE',
  ECONOMIC_ACT: 'ECONOMIC_ACT',
  ELDERLY:      'ELDERLY',
  NON_WAGE:     'NON_WAGE',
};

export const SURVEY_ORDER = [
  SURVEY_TYPES.YOUTH,
  SURVEY_TYPES.WORKING_TYPE,
  SURVEY_TYPES.ECONOMIC_ACT,
  SURVEY_TYPES.ELDERLY,
  SURVEY_TYPES.NON_WAGE,
];

export const DATASET_CONFIGS = {
  [SURVEY_TYPES.YOUTH]: {
    label: '청년층 부가조사',
    keywords: ['청년', '졸업', '첫 일자리', '미취업', 'YOUTH'],
    years: [2025, 2024, 2023, 2022, 2021],
    defaultYear: 2025,
    weightColumn: '가중값',
    ageColumn: '만연령',
    classificationLabel: '연령대 구분',
    presets: [
      { label: '청년 전체 (15~29세)', min: 15, max: 29 },
      { label: '핵심 청년 (20~29세)', min: 20, max: 29 },
      { label: '확장 청년 (15~34세)', min: 15, max: 34 },
    ]
  },
  [SURVEY_TYPES.WORKING_TYPE]: {
    label: '근로형태별 부가조사',
    keywords: ['근로형태', '비정규직', '정규직', '시간제', 'WORKING_TYPE', '한시적', '기간제', '파견', '용역', '특고'],
    years: [2025, 2024, 2023, 2022, 2021],
    defaultYear: 2025,
    weightColumn: '가중값',
    ageColumn: '만연령',
    classificationLabel: '근로자 구분',
    presets: [
      { label: '임금근로자 전체', min: 15, max: 99 },
      { label: '청년 비정규직 (15~29세)', min: 15, max: 29 },
      { label: '중장년 비정규직 (30~59세)', min: 30, max: 59 },
    ],
    // SAS 매뉴얼 기반 공공용 MD 컬럼 매핑
    columnMapping: {
      status: '현재일관련사항_종사상지위코드',
      contractType: '현재일관련사항_고용계약기간정함여부',
      canContinue: '계속근로가능여부',
      continueReason: '계속근로가능사유코드',
      limitReason: '근속기간제한사유코드',
      workTimeType: '근로시간형태코드',
      payLocation: '급여수령위치코드',
      isSpecial: '특수형태근로종사자여부',
      workPlace: '근로장소코드',
      isShortTerm: '단기근로기간형태여부',
      jobStartDate: '현재일관련사항_직장시작연월',
      weeklyHours: '현재일관련사항_총실제취업시간수',
      monthlyWage: '최근3개월간평균급여'
    }
  },
  [SURVEY_TYPES.ECONOMIC_ACT]: {
    label: '경제활동인구조사',
    keywords: ['경제활동', '실업률', '고용률', '전체', 'ECONOMIC_ACT'],
    years: [2025, 2024],
    defaultYear: 2025,
    weightColumn: '가중값',
    ageColumn: '만연령',
    classificationLabel: '조사 대상',
    presets: [{ label: '15세 이상 인구', min: 15, max: 99 }]
  },
  [SURVEY_TYPES.ELDERLY]: {
    label: '고령층 부가조사',
    keywords: ['고령', '연금', '노인', '은퇴', 'ELDERLY'],
    years: [2024, 2023],
    defaultYear: 2024,
    weightColumn: '가중값',
    ageColumn: '만연령',
    classificationLabel: '연령대 구분',
    presets: [{ label: '고령층 (55~79세)', min: 55, max: 79 }]
  },
  [SURVEY_TYPES.NON_WAGE]: {
    label: '비임금근로 부가조사',
    keywords: ['비임금', '자영업', '사장', '무급', 'NON_WAGE'],
    years: [2024, 2023],
    defaultYear: 2024,
    weightColumn: '가중값',
    ageColumn: '만연령',
    classificationLabel: '대상 구분',
    presets: [{ label: '자영업자 및 무급가족', min: 15, max: 99 }]
  }
};

export function identifyDataset(input) {
  const query = Array.isArray(input) ? input.join(' ') : (input || '');
  const t = query.toLowerCase();
  
  // 1. 명시적 키워드 확률 점수제
  let scores = {};
  for (const [type, cfg] of Object.entries(DATASET_CONFIGS)) {
    scores[type] = 0;
    cfg.keywords.forEach(k => { if (t.includes(k.toLowerCase())) scores[type] += 1; });
  }

  const bestMatch = Object.entries(scores).sort((a,b) => b[1] - a[1])[0];
  if (bestMatch && bestMatch[1] > 0) return bestMatch[0];

  // 2. 폴백 폴백
  if (t.includes('졸업')) return SURVEY_TYPES.YOUTH;
  if (t.includes('고용형태')) return SURVEY_TYPES.WORKING_TYPE;
  
  return SURVEY_TYPES.YOUTH; // Default
}
