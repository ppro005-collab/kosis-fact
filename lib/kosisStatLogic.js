// Population and filtering metadata for KOSIS tables (v8.6 - Unicode Perfected)
// Use Unicode escapes for Korean to avoid encoding corruption.

export const METRIC_METADATA = {
  "YOUTH_01": { label: "[\uccad\ub144\uce35] \ud45c 01. \uc5f0\ub839\ubcc4 \uc218\ud559 \uc5ec\ubd80", logicKey: "getEducationStatus", type: "count", unit: "\ucccc \uba85", prerequisites: ["isAge15to29"] },
  "YOUTH_02": { label: "[\uccad\ub144\uce35] \ud45c 02. \uc5f0\ub839\ubcc4 \uacbd\uc81c\ud65c\ub3d9\uc0c1\ud0dc", logicKey: "getEconomicStatus", type: "count", unit: "\ucccc \uba85", prerequisites: ["isAge15to29"] },
  "YOUTH_03": { label: "[\uccad\ub144\uce35] \ud45c 03. \uc9c8\uc5c5\u00b7\uc911\ud1f4 \ucde8\uc5c5\uc790\uc758 \uc0b0\uc5c5\ubcc4 \ucde8\uc5c5\ubd84\ud3ec", logicKey: "getIndustryDistribution", type: "count", unit: "\ucccc \uba85", prerequisites: ["isAge15to29", "isGraduateOrDropout", "isEmployed"] },
  "YOUTH_05": { label: "[\uccad\ub144\uce35] \ud45c 05. \uc131 \ubc0f \ud559\uc81c\ubcc4 \ub300\ud559\uc878\uc5c5\uc18c\uc694\uae30\uac04", logicKey: "timeToGraduation", type: "average", unit: "\uac1c\uc6d4", prerequisites: ["isAge15to29", "isUniversityGradOnly"] },
  "YOUTH_11": { label: "[\uccad\ub144\uce35] \ud45c 11. \uc131\ubcc4 \ucde8\uc5c5\uacbd\ud5d8 \uc720\ubb34 \ubc0f \ud69f\uc218", logicKey: "getJobExperienceCount", type: "count", unit: "\ucccc \uba85", prerequisites: ["isAge15to29", "isGraduateOrDropout"] },
  "YOUTH_18": { label: "[\uccad\ub144\uce35] \ud45c 18. \uc131\ubcc4 \uccab\uc77c\uc790\ub9ac \uc6d4\ud3c9\uade0\uc784\uae08", logicKey: "getFirstJobWage", type: "count", unit: "\ucccc \uba85", prerequisites: ["isAge15to29", "isGraduateOrDropout", "isJobExperienced"] },
  
  "WORK_01": { label: "[\uadfc\ub85c\ud615\ud0dc] \ud45c 01. \uc131\u00b7\uadfc\ub85c\ud615\ud0dc\ubcc4 \uc784\uae08\uadfc\ub85c\uc790 \uaddc\ubaa8 \ubc0f \ube44\uc911", logicKey: "getEmploymentTypeLabel", type: "count", unit: "\ucccc \uba85", prerequisites: ["isWageWorker"] },
  "WORK_17": { label: "[\uadfc\ub85c\ud615\ud0dc] \ud45c 17. \uc6d4\ud3c9\uade0\uc784\uae08 \ubc0f \uc99d\uac10", logicKey: "monthlyWage", type: "average", unit: "\ub9cc\uc6d0", prerequisites: ["isWageWorker"] }
};

export const PREREQ_MAP = {
  isAge15to29: (row) => parseInt(row['\ub9cc\uc5f0\ub839']) >= 15 && parseInt(row['\ub9cc\uc5f0\ub839']) <= 29,
  /** 표 05 등: 전문대(4)·대학(5)·대학원권(6+) 졸업자 — 명세 항목6 (1~3은 초·중·고) */
  isUniversityGradOnly: (row) => {
    const g = parseInt(row['\uad50\uc721\uc815\ub3c4_\ud559\ub825\uad6c\ubd84\ucf54\ub4dc'] || 0, 10);
    const enroll = parseInt(row['\uad50\uc721\uc815\ub3c4_\uc218\ud559\uad6c\ubd84\ucf54\ub4dc'] || 0, 10);
    return enroll === 1 && g >= 4 && g <= 7;
  },
  isGraduateOrDropout: (row) => [1, 3, 5].includes(parseInt(row['\uad50\uc721\uc815\ub3c4_\uc218\ud559\uad6c\ubd84\ucf54\ub4dc'])) && parseInt(row['\uac00\uc7a5\ucd5c\uadfc\ud559\uad50_\uc878\uc5c5\ubc0f\uc911\ud1f4\uc5f0\uc6d4']) > 0,
  isJobExperienced: (row) => [2, 3, 4, 5].includes(parseInt(row['\uc878\uc5c5\ubc0f\uc911\ud1f4\ud6c4\ucde8\uc5c5\ud69f\uc218\ucf54\ub4dc'])),
  isEmployed: (row) => parseInt(row['\uacbd\uc81c\ud65c\ub3d9\uc0c1\ud0dc\ucf54\ub4dc']) === 1,
  isWageWorker: (row) => {
    const s = parseInt(row['\ud604\uc7ac\uc77c\uad00\ub828\uc0ac\ud56d_\uc885\uc0ac\uc0c1\uc9c0\uc704\ucf54\ub4dc']);
    return s >= 1 && s <= 3;
  },
  isNonRegular: (row) => {
    const label = statLogic.getEmploymentTypeLabel(row);
    return label.includes("\ube44\uc815\uaddc\uc9c1");
  },
  hasWorkExperience: (row) => parseInt(row['\uc9c1\uc5c5\uad50\uc721\ubc0f\uc9c1\uc7a5\uccb4\ud5d8_\uc7ac\ud559\ud734\ud559\uc911\uc9c1\uc7a5\uccb4\ud5d8\uc5ec\ubd80']) === 1,
  hasVocationalTraining: (row) => parseInt(row['\uc9c1\uc5c5\uad50\uc721\ubc0f\uc9c1\uc7a5\uccb4\ud5d8_\uc9c1\uc5c5\uad50\uc721\ubc0f\uc911\ubb34\uccb4\ud5d8\uc9c1\uc5c5\uad50\uc721\uc218\ud61c\uad6c\ubd84\ucf54\ub4dc']) > 0
};

export const statLogic = {
  getEconomicStatus: (row) => {
    const c = parseInt(row['\uacbd\uc81c\ud65c\ub3d9\uc0c1\ud0dc\ucf54\ub4dc']);
    return c === 1 ? "\ucde8\uc5c5\uc790" : c === 2 ? "\uc2e4\uc5c5\uc790" : c === 3 ? "\ube44\uacbd\uc81c\ud65c\ub3d9\uc778\uad6c" : "\ubd84\ub958\ubd88\uac00";
  },
  getEducationStatus: (row) => {
    const code = parseInt(row['\uad50\uc721\uc815\ub3c4_\uc218\ud559\uad6c\ubd84\ucf54\ub4dc']);
    if ([1, 3, 5].includes(code)) return "\uc878\uc5c5/\uc911\ud1f4/\uc218\ub8cc";
    return "\uc7ac\ud559/\ud734\ud559";
  },
  getIndustryDistribution: (row) => {
    return row['\ud604\uc7ac\uc77c\uad00\ub828\uc0ac\ud56d_11\ucc28\uc0b0\uc5c5\ub300\ubd84\ub958\ucf54\ub4dc'] || '\ubd84\ub958\ubd88\uac00';
  },
  getJobExperienceCount: (row) => {
    const counts = {1: '1\ud68c', 2: '1\ud68c', 3: '2\ud68c', 4: '3\ud68c', 5: '4\ud68c \uc774\uc0c1'};
    const c = parseInt(row['\uc878\uc5c5\ubc0f\uc911\ud1f4\ud6c4\ucde8\uc5c5\ud69f\uc218\ucf54\ub4dc'] || 0);
    return counts[c] || '\uc5c6\uc74c';
  },
  getGender: (row) => parseInt(row['\uc131\ubcc4\ucf54\ub4dc']) === 1 ? "\ub0a8\uc790" : "\uc5ec\uc790",
  getAge: (row) => parseInt(row['\ub9cc\uc5f0\ub839']),
  getEmploymentTypeLabel: (row) => {
    const status = parseInt(row['\ud604\uc7ac\uc77c\uad00\ub828\uc0ac\ud56d_\uc885\uc0ac\uc0c1\uc9c0\uc704\ucf54\ub4dc']);
    if (status < 1 || status > 3) return "\ube44\uc784\uae08";
    return "\uc815\uaddc\uc9c1";
  },
  timeToGraduation: (row) => {
    let start_ym = parseInt(row['\uac00\uc7a5\ucd5c\uadfc\ud559\uad50_\uc785\ud559\ubc0f\ud3b8\uc785\uc5f0\uc6d4'] || 0);
    if (parseInt(row['\uac00\uc7a5\ucd5c\uadfc\ud559\uad50_\ud3b8\uc785\uacbd\ud5d8\uc720\ubb34'] || 0) === 1 && parseInt(row['\uac00\uc7a5\ucd5c\uadfc\ud559\uad50_\ud3b8\uc785\uc804\ud559\uad50\uc785\ud559\uc5f0\uc6d4'] || 0) > 0) {
      start_ym = parseInt(row['\uac00\uc7a5\ucd5c\uadfc\ud559\uad50_\ud3b8\uc785\uc804\ud559\uad50\uc785\ud559\uc5f0\uc6d4']);
    }
    const end_ym = parseInt(row['\uac00\uc7a5\ucd5c\uadfc\ud559\uad50_\uc878\uc5c5\ubc0f\uc911\ud1f4\uc5f0\uc6d4'] || 0);
    if (start_ym <= 0 || end_ym <= 0) return 0;
    
    const start_m = Math.floor(start_ym / 100) * 12 + (start_ym % 100);
    const end_m = Math.floor(end_ym / 100) * 12 + (end_ym % 100);
    const period = end_m - start_m;
    return period > 0 ? period : 0;
  },
  getFirstJobWage: (row) => {
    const c = parseInt(row['\uccab\uc9c1\uc7a5_\uc6d4\ud3c9\uade0\uae09\uc5ec\uc561']);
    if (c === 1) return '50\ub9cc\uc6d0 \ubbf8\ub9cc';
    if (c === 2) return '50~100\ub9cc\uc6d0 \ubbf8\ub9cc';
    if (c === 3) return '100~150\ub9cc\uc6d0 \ubbf8\ub9cc';
    if (c === 4) return '150~200\ub9cc\uc6d0 \ubbf8\ub9cc';
    if (c === 5) return '200~300\ub9cc\uc6d0 \ubbf8\ub9cc';
    if (c >= 6 && c <= 8) return '300\ub9cc\uc6d0 \uc774\uc0c1';
    return '\ubd84\ub958\ubd88\uac00';
  },
  monthlyWage: (row) => parseFloat(row['\ucd5c\uadfc3\uac1c\uc6d4\uac04\ud3c9\uade0\uae09\uc5ec'] || 0),
  weeklyHours: (row) => parseFloat(row['\ud604\uc7ac\uc77c\uad00\ub828\uc0ac\ud56d_\ucd1d\uc2e4\uc81c\ucde8\uc5c5\uc2dc\uac04\uc218'] || 0),

  /** 조사연월/조사연도 → "2025년" */
  getSurveyYearLabel: (row) => {
    const v = row['조사연월'] || row['조사연도'] || row['_fileYear'] || '';
    const s = String(v);
    const y = s.replace(/\D/g, '').slice(0, 4);
    return y.length === 4 ? `${y}년` : '계';
  },

  /**
   * 청년층 부가 표 05 학제별 — 항목6 교육정도_학력구분코드
   * (명세: 1~3 초·중·고, 4=전문대, 5=대졸) + 6·7은 대학원권이 쓰이는 연도 있음
   */
  getYouthEducationSystem: (row) => {
    const g = parseInt(row['\uad50\uc721\uc815\ub3c4_\ud559\ub825\uad6c\ubd84\ucf54\ub4dc'] || 0, 10);
    const enroll = parseInt(row['\uad50\uc721\uc815\ub3c4_\uc218\ud559\uad6c\ubd84\ucf54\ub4dc'] || 0, 10);
    if (enroll !== 1) return '\ubd84\ub958\ubd88\uac00';
    if (g === 4) return '\uc804\ubb38\ub300\uc878 (3\ub144\uc81c \ud3ec\ud568)';
    if (g === 5) return '\ub300\ud559\uad50\uc878 (4\ub144\uc81c)';
    if (g >= 6) return '\ub300\ud559\uc6d0\uc878 \uc774\uc0c1';
    return '\uae30\ud0c0';
  },

  /** KOSIS \ud45c01/02 \uae30\uc900 \uc5f0\ub839\ubcc4 (5\uc138 \uad6c\uac04) */
  getAgeBandYouth: (row) => {
    const a = parseInt(row['\ub9cc\uc5f0\ub839'] || row.age || 0, 10);
    if (a >= 15 && a <= 19) return '15~19\uc138';
    if (a >= 20 && a <= 24) return '20~24\uc138';
    if (a >= 25 && a <= 29) return '25~29\uc138';
    if (a >= 30 && a <= 34) return '30~34\uc138';
    if (a >= 35) return '35\uc138 \uc774\uc0c1';
    return '\uacc4';
  },

  /** \ub2e8\uc21c \uc5f0\ub839\ubcc4 (\uac01 \uc138\ubcc4 \uc9d1\uacc4, \ud45c \uc138\ubd84\ud654 \ud544\uc694 \uc2dc) */
  getAgeYearly: (row) => {
    const a = parseInt(row['\ub9cc\uc5f0\ub839'] || row.age || 0, 10);
    return a > 0 ? `${a}\uc138` : '\uacc4';
  }
};

/** \ucc28\uc6d0 \ub77c\ubca8(UI) \u2192 \uc9d1\uacc4 \ud568\uc218 */
export const DIMENSION_LABEL_EXTRACTORS = {
  '\uc131\ubcc4':            (row) => statLogic.getGender(row),
  '\uc870\uc0ac\uc5f0\ub3c4':         (row) => statLogic.getSurveyYearLabel(row),
  '\uacbd\uc131\ud65c\ub3d9\uc0c1\ud0dc':     (row) => statLogic.getEconomicStatus(row),
  '\uc0b0\uc5c5':            (row) => statLogic.getIndustryDistribution(row),
  '\ud559\ub825 \uadf8\ub8f9':        (row) => statLogic.getYouthEducationSystem(row),
  // \uc5f0\ub839 \uad00\ub828 - \ub2e4\uc591\ud55c \ub77c\ubca8 \ub300\uc751
  '\uc5f0\ub839\ub300 \uad6c\ubd84':      (row) => statLogic.getAgeBandYouth(row),
  '\uc5f0\ub839\ubcc4':           (row) => statLogic.getAgeBandYouth(row),
  '\uc5f0\ub839':             (row) => statLogic.getAgeBandYouth(row),
  '\ub098\uc774\ubcc4':           (row) => statLogic.getAgeBandYouth(row),
  // \uae30\ud0c0
  '\uad6c\ubd84':            (row) => statLogic.getEducationStatus(row),
  '\ucc44\uc5c5\uacbd\ud5d8':        (row) => statLogic.getJobExperienceCount(row),
  '\uc784\uae08\uad6c\uac04':        (row) => statLogic.getFirstJobWage(row),
  '\uadfc\ub85c\ud615\ud0dc':        (row) => statLogic.getEmploymentTypeLabel(row)
};

export function getFirstJobAttribute(row, attrName) {
    const mapping = {
    '\uccab\uc9c1\uc7a5\ucde8\uc5c5\uc5f0\uc6d4': '\ud604\uc7ac\uc77c\uad00\ub828\uc0ac\ud56d_\uc9c1\uc7a5\uc2dc\uc791\uc5f0\uc6d4',
    '\uccab\uc9c1\uc7a5_\uc6d4\ud3c9\uade0\uae09\uc5ec\uc561': '\uccab\uc9c1\uc7a5_\uc6d4\ud3c9\uade0\uae09\uc5ec\uc561'
  };
  return row[attrName] || row[mapping[attrName]] || 0;
}
