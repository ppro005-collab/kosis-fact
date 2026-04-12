/**
 * KOSIS 공식 통계표 매핑 마스터 (v8.1 - 2025 Standard Refined)
 * ─────────────────────────────────────────────────────────
 * MDIS 집계 결과와 KOSIS 공표 통계표를 1:1로 매핑합니다.
 * 네이밍 규칙: [조사분류] 표 번호. 통계표 공식 명칭
 */

export const KOSIS_MAP = {
  // ■ 청년층 부가조사 (YOUTH - 23 Tables)
  YOUTH_01: { id: "표 01", title: "[청년층] 표 01. 연령별 수학 여부", logicKey: "getEducationStatus", surveyType: "YOUTH" },
  YOUTH_02: { id: "표 02", title: "[청년층] 표 02. 연령별 경제활동상태", logicKey: "getEconomicStatus", surveyType: "YOUTH" },
  YOUTH_03: { id: "표 03", title: "[청년층] 표 03. 졸업·중퇴 취업자의 산업별 취업분포", logicKey: "getIndustryDistribution", surveyType: "YOUTH" },
  YOUTH_04: { id: "표 04", title: "[청년층] 표 04. 졸업·중퇴 취업자의 직업별 취업분포", logicKey: "getOccupationDistribution", surveyType: "YOUTH" },
  YOUTH_05: { id: "표 05", title: "[청년층] 표 05. 성 및 학제별 대학졸업 소요기간", logicKey: "getGraduationDuration", surveyType: "YOUTH" },
  YOUTH_06: { id: "표 06", title: "[청년층] 표 06. 성별 휴학경험 유무 및 사유/평균휴학기간", logicKey: "getLeaveOfAbsence", surveyType: "YOUTH" },
  YOUTH_07: { id: "표 07", title: "[청년층] 표 07. 성별 직장체험 유무 및 기간", logicKey: "getWorkExperience", surveyType: "YOUTH" },
  YOUTH_08: { id: "표 08", title: "[청년층] 표 08. 성별 직장체험 형태", logicKey: "getWorkExpType", surveyType: "YOUTH" },
  YOUTH_09: { id: "표 09", title: "[청년층] 표 09. 성별 직업교육·훈련 경험 유무 및 시기", logicKey: "getVocationalTraining", surveyType: "YOUTH" },
  YOUTH_10: { id: "표 10", title: "[청년층] 표 10. 성별 직업교육·훈련 받은 기관", logicKey: "getVocationalInstitute", surveyType: "YOUTH" },
  YOUTH_11: { id: "표 11", title: "[청년층] 표 11. 성별 취업경험 유무 및 횟수", logicKey: "getJobExperienceCount", surveyType: "YOUTH" },
  YOUTH_12: { id: "표 12", title: "[청년층] 표 12. 성별 학력별 취업경로", logicKey: "getJobSearchChannel", surveyType: "YOUTH" },
  YOUTH_13: { id: "표 13", title: "[청년층] 표 13. 성별 첫취업 소요기간 및 평균소요기간", logicKey: "getFirstJobDuration", surveyType: "YOUTH" },
  YOUTH_14: { id: "표 14", title: "[청년층] 표 14. 첫직장 근속기간", logicKey: "getFirstJobTenure", surveyType: "YOUTH" },
  YOUTH_15: { id: "표 15", title: "[청년층] 표 15. 성별 첫일자리 산업", logicKey: "getFirstJobIndustry", surveyType: "YOUTH" },
  YOUTH_16: { id: "표 16", title: "[청년층] 표 16. 성별 첫일자리 직업", logicKey: "getFirstJobOccupation", surveyType: "YOUTH" },
  YOUTH_17: { id: "표 17", title: "[청년층] 표 17. 성별 첫일자리 근로형태", logicKey: "getFirstJobWorkType", surveyType: "YOUTH" },
  YOUTH_18: { id: "표 18", title: "[청년층] 표 18. 성별 첫일자리 월평균임금", logicKey: "getFirstJobWage", surveyType: "YOUTH" },
  YOUTH_19: { id: "표 19", title: "[청년층] 표 19. 성별 첫일자리 그만둔 사유", logicKey: "getResignationReason", surveyType: "YOUTH" },
  YOUTH_20: { id: "표 20", title: "[청년층] 표 20. 성별 취업시험 준비 유무 및 분야", logicKey: "getExamPrep", surveyType: "YOUTH" },
  YOUTH_21: { id: "표 21", title: "[청년층] 표 21. 성별 최종학교 전공 일치여부", logicKey: "getMajorMatch", surveyType: "YOUTH" },
  YOUTH_22: { id: "표 22", title: "[청년층] 표 22. 성별 미취업기간별 미취업자", logicKey: "getUnemploymentPeriod", surveyType: "YOUTH" },
  YOUTH_23: { id: "표 23", title: "[청년층] 표 23. 성별 미취업기간 활동별 미취업자", logicKey: "getUnemploymentActivity", surveyType: "YOUTH" },

  // ■ 근로형태별 부가조사 (WORK - 31 Tables)
  WORK_01: { id: "표 01", title: "[근로형태] 표 01. 성·근로형태별 임금근로자 규모 및 비중", logicKey: "getWorkTypeScale", surveyType: "WORKING_TYPE" },
  WORK_02: { id: "표 02", title: "[근로형태] 표 02. 연령·산업·직업별 비정규직 근로자 규모", logicKey: "getNonRegularScale", surveyType: "WORKING_TYPE" },
  WORK_03: { id: "표 03", title: "[근로형태] 표 03. 근로형태별 임금근로자 특성 총괄", logicKey: "getWorkTypeAttributes", surveyType: "WORKING_TYPE" },
  WORK_04: { id: "표 04", title: "[근로형태] 표 04. 성·연령별 근로형태별 취업자", logicKey: "getWorkTypeByAge", surveyType: "WORKING_TYPE" },
  WORK_05: { id: "표 05", title: "[근로형태] 표 05. 성·교육정도별 근로형태별 취업자", logicKey: "getWorkTypeByEducation", surveyType: "WORKING_TYPE" },
  WORK_06: { id: "표 06", title: "[근로형태] 표 06. 성·종사자규모별 근로형태별 취업자", logicKey: "getWorkTypeBySize", surveyType: "WORKING_TYPE" },
  WORK_07: { id: "표 07", title: "[근로형태] 표 07. 산업별 근로형태별 취업자 (11차)", logicKey: "getWorkTypeByIndustry", surveyType: "WORKING_TYPE" },
  WORK_08: { id: "표 08", title: "[근로형태] 표 08. 직업별 근로형태별 취업자 (8차)", logicKey: "getWorkTypeByOccupation", surveyType: "WORKING_TYPE" },
  WORK_09: { id: "표 09", title: "[근로형태] 표 09. 한시적근로자 규모 및 증감", logicKey: "getContingentScale", surveyType: "WORKING_TYPE" },
  WORK_10: { id: "표 10", title: "[근로형태] 표 10. 시간제근로자 고용안정성 비율", logicKey: "getPartTimeStability", surveyType: "WORKING_TYPE" },
  WORK_11: { id: "표 11", title: "[근로형태] 표 11. 시간제근로자 주당 평균취업시간", logicKey: "getPartTimeHours", surveyType: "WORKING_TYPE" },
  WORK_12: { id: "표 12", title: "[근로형태] 표 12. 시간제근로자 월평균임금", logicKey: "getPartTimeWage", surveyType: "WORKING_TYPE" },
  WORK_13: { id: "표 13", title: "[근로형태] 표 13. 비전형근로자 규모 및 증감", logicKey: "getAtypicalScale", surveyType: "WORKING_TYPE" },
  WORK_14: { id: "표 14", title: "[근로형태] 표 14. 일자리선택 동기별 구성비", logicKey: "getJobMotive", surveyType: "WORKING_TYPE" },
  WORK_15: { id: "표 15", title: "[근로형태] 표 15. 평균 근속기간 및 구성비", logicKey: "getWorkTenure", surveyType: "WORKING_TYPE" },
  WORK_16: { id: "표 16", title: "[근로형태] 표 16. 주당 평균취업시간 및 증감", logicKey: "getWeeklyHours", surveyType: "WORKING_TYPE" },
  WORK_17: { id: "표 17", title: "[근로형태] 표 17. 월평균임금 및 증감", logicKey: "getMonthlyWage", surveyType: "WORKING_TYPE" },
  WORK_18: { id: "표 18", title: "[근로형태] 표 18. 사회보험 가입자 비율", logicKey: "getInsuranceRate", surveyType: "WORKING_TYPE" },
  WORK_19: { id: "표 19", title: "[근로형태] 표 19. 근로복지 수혜자 비율", logicKey: "getBenefitRate", surveyType: "WORKING_TYPE" },
  WORK_20: { id: "표 20", title: "[근로형태] 표 20. 교육훈련 경험 및 시간", logicKey: "getTrainingExperience", surveyType: "WORKING_TYPE" },
  WORK_21: { id: "표 21", title: "[근로형태] 표 21. 노동조합 가입비율", logicKey: "getUnionRate", surveyType: "WORKING_TYPE" },
  WORK_22: { id: "표 22", title: "[근로형태] 표 22. 주 40시간 실시비율 (공표중단)", logicKey: "getWeekly40hRate", surveyType: "WORKING_TYPE" },
  WORK_23: { id: "표 23", title: "[근로형태] 표 23. 근로계약서 서면작성 비율", logicKey: "getContractRate", surveyType: "WORKING_TYPE" },
  WORK_24: { id: "표 24", title: "[근로형태] 표 24. 임금형태별 비율", logicKey: "getWageTypeRate", surveyType: "WORKING_TYPE" },
  WORK_25: { id: "표 25", title: "[근로형태] 표 25. 유연근무제 활용 여부", logicKey: "getFlexibleWorkRate", surveyType: "WORKING_TYPE" },
  WORK_26: { id: "표 26", title: "[근로형태] 표 26. 유연근무제 활용 형태", logicKey: "getFlexibleWorkType", surveyType: "WORKING_TYPE" },
  WORK_27: { id: "표 27", title: "[근로형태] 표 27. 성별 유연근무제 활용현황", logicKey: "getFlexibleWorkByGender", surveyType: "WORKING_TYPE" },
  WORK_28: { id: "표 28", title: "[근로형태] 표 28. 혼인상태별 유연근무제 활용현황", logicKey: "getFlexibleWorkByMarital", surveyType: "WORKING_TYPE" },
  WORK_29: { id: "표 29", title: "[근로형태] 표 29. 연령별 유연근무제 활용현황", logicKey: "getFlexibleWorkByAge", surveyType: "WORKING_TYPE" },
  WORK_30: { id: "표 30", title: "[근로형태] 표 30. 향후 유연근무제 활용 희망 형태", logicKey: "getFlexibleWorkWish", surveyType: "WORKING_TYPE" },
  WORK_31: { id: "표 31", title: "[근로형태] 표 31. 시도별 비정규직 근로자 규모", logicKey: "getRegionNonRegular", surveyType: "WORKING_TYPE" }
};

/**
 * 쿼리 결과를 바탕으로 가장 적합한 KOSIS 표를 추천합니다.
 */
export function findKosisTable(logicKey, title) {
  // 1. 로직 키 매칭
  if (logicKey) {
    const matchByLogic = Object.values(KOSIS_MAP).find(m => m.logicKey === logicKey);
    if (matchByLogic) return matchByLogic;
  }

  // 2. 제목 키워드 매칭 (title이 undefined/null이면 건너뜀)
  if (title && typeof title === 'string') {
    const matchByTitle = Object.values(KOSIS_MAP).find(m => 
      m.title && (title.includes(m.title) || m.title.includes(title))
    );
    if (matchByTitle) return matchByTitle;
  }

  return {
    id: "MDIS",
    title: "마이크로데이터 직접 집계 결과 (참조용 KOSIS 표 없음)",
    url: "#"
  };
}
