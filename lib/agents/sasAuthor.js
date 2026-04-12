import { METRIC_METADATA } from '../kosisStatLogic.js';

const PREREQ_SAS = {
  isAge15to29: '15 <= 만연령 <= 29',
  isUniversityGradOnly: '교육정도_학력구분코드 IN (4,5) AND 교육정도_수학구분코드 = 1',
  isGraduateOrDropout: '/* isGraduateOrDropout: 매뉴얼 조건 */',
  isJobExperienced: '졸업및중퇴후취업횟수코드 IN (2,3,4,5)',
  isEmployed: '경제활동상태코드 = 1',
  isWageWorker: '현재일관련사항_종사상지위코드 BETWEEN 1 AND 3'
};

/**
 * 검증용 SAS (통합파일·10번 검증 스타일: DATA 필터 → PROC FREQ/MEANS, 가중값/천 명 주석).
 */
export const SasAuthorAgent = {
  generate: (queryPlan) => {
    const meta = METRIC_METADATA[queryPlan.metric];
    const groupLabels = queryPlan.groupByLabels || (queryPlan.groupBys || []).map(g => g.label);
    const classVars = (groupLabels || []).filter(Boolean).join(' ');
    const surveyLabel =
      queryPlan.surveyType === 'WORKING_TYPE'
        ? '경제활동인구조사 근로형태별 부가조사'
        : '경제활동인구조사 청년층 부가조사';

    let sasCode = `/* ========================================================================= */\n`;
    sasCode += `/* KOSIS FACT 검증용 SAS — ${surveyLabel} */\n`;
    sasCode += `/* 지표: ${meta?.label || queryPlan.metric} */\n`;
    sasCode += `/* [통계표 단위] 천 명 = 가중값 합 / 1,000,000 (가중값 설계 기준) */\n`;
    sasCode += `/* ========================================================================= */\n\n`;

    sasCode += `DATA work.kosis_fact;\n`;
    sasCode += `  SET mdis.youth_yymm; /* 실제 라이브러리·테이블명으로 교체 */\n`;
    sasCode += `  WHERE 가중값 > 0;\n`;

    if (queryPlan.filters?.length) {
      queryPlan.filters.forEach(f => {
        const cond = PREREQ_SAS[f.fnKey];
        if (cond) sasCode += `  IF NOT (${cond}) THEN DELETE;\n`;
        else sasCode += `  /* FILTER ${f.fnKey || f.label} */\n`;
      });
    }

    sasCode += `RUN;\n\n`;

    if (meta?.type === 'average') {
      const targetVar =
        queryPlan.metric === 'YOUTH_05'
          ? '/* 입학~졸업 월차: 매뉴얼 산식(연·월) */ duration_months'
          : 'TARGET_NUM';
      sasCode += `PROC MEANS DATA=work.kosis_fact NOPRINT NWAY;\n`;
      if (classVars) sasCode += `  CLASS ${classVars};\n`;
      sasCode += `  VAR ${targetVar};\n`;
      sasCode += `  WEIGHT 가중값;\n`;
      sasCode += `  OUTPUT OUT=work.out MEAN=mean_val;\n`;
      sasCode += `RUN;\n`;
    } else {
      sasCode += `PROC FREQ DATA=work.kosis_fact;\n`;
      if (classVars) sasCode += `  TABLES ${classVars.replace(/\s+/g, '*')};\n`;
      sasCode += `  WEIGHT 가중값;\n`;
      sasCode += `RUN;\n`;
    }

    sasCode += `\n/* [검증] PROC PRINT 결과의 Count 합계를 천 명 단위로 환산해 MDIS 웹 결과와 대조 */\n`;

    return sasCode;
  }
};
