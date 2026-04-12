// Population and filtering metadata for KOSIS tables (v8.6 - Unicode Perfected)
// Use Unicode escapes for Korean to avoid encoding corruption.

export const METRIC_METADATA = {
  "YOUTH_01": { label: "[\uccad\ub144\uce35] \ud45c 01. \uc5f0\ub839\ubcc4 \uc218\ud559 \uc5ec\ubd80", logicKey: "getEducationStatus", type: "count", unit: "\ucccc \uba85", prerequisites: ["isAge15to29"] },
  "YOUTH_02": { label: "[\uccad\ub144\uce35] \ud45c 02. \uc5f0\ub839\ubcc4 \uacbd\uc81c\ud65c\ub3d9\uc0c1\ud0dc", logicKey: "getEconomicStatus", type: "count", unit: "\ucccc \uba85", prerequisites: ["isAge15to29"] },
  "YOUTH_03": { label: "[\uccad\ub144\uce35] \ud45c 03. \uc9c8\uc5c5\u00b7\uc911\ud1f4 \ucde8\uc5c5\uc790\uc758 \uc0b0\uc5c5\ubcc4 \ucde8\uc5c5\ubd84\ud3ec", logicKey: "getIndustryDistribution", type: "count", unit: "\ucccc \uba85", prerequisites: ["isGraduateOrDropout", "isEmployed"] },
  "YOUTH_11": { label: "[\uccad\ub144\uce35] \ud45c 11. \uc131\ubcc4 \ucde8\uc5c5\uacbd\ud5d8 \uc720\ubb34 \ubc0f \ud69f\uc218", logicKey: "getJobExperienceCount", type: "count", unit: "\ucccc \uba85", prerequisites: ["isGraduateOrDropout"] },
  "YOUTH_18": { label: "[\uccad\ub144\uce35] \ud45c 18. \uc131\ubcc4 \uccab\uc77c\uc790\ub9ac \uc6d4\ud3c9\uade0\uc784\uae08", logicKey: "getFirstJobWage", type: "average", unit: "\ub9cc\uc6d0", prerequisites: ["isJobExperienced"] },
  
  "WORK_01": { label: "[\uadfc\ub85c\ud615\ud0dc] \ud45c 01. \uc131\u00b7\uadfc\ub85c\ud615\ud0dc\ubcc4 \uc784\uae08\uadfc\ub85c\uc790 \uaddc\ubaa8 \ubc0f \ube44\uc911", logicKey: "getEmploymentTypeLabel", type: "count", unit: "\ucccc \uba85", prerequisites: ["isWageWorker"] },
  "WORK_17": { label: "[\uadfc\ub85c\ud615\ud0dc] \ud45c 17. \uc6d4\ud3c9\uade0\uc784\uae08 \ubc0f \uc99d\uac10", logicKey: "monthlyWage", type: "average", unit: "\ub9cc\uc6d0", prerequisites: ["isWageWorker"] }
};

export const PREREQ_MAP = {
  isAge15to29: (row) => parseInt(row['\ub9cc\uc5f0\ub839']) >= 15 && parseInt(row['\ub9cc\uc5f0\ub839']) <= 29,
  isUniversityGradOnly: (row) => [4, 5].includes(parseInt(row['\uad50\uc721\uc815\ub3c4_\ud559\ub825\uad6c\ubd84\ucf54\ub4dc'])) && parseInt(row['\uad50\uc721\uc815\ub3c4_\uc218\ud559\uad6c\ubd84\ucf54\ub4dc']) === 1,
  isGraduateOrDropout: (row) => [1, 3, 5].includes(parseInt(row['\uad50\uc721\uc815\ub3c4_\uc218\ud559\uad6c\ubd84\ucf54\ub4dc'])) && parseInt(row['\uac00\uc7a5\ucd5c\uadfc\ud559\uad50_\uc9d8\uc5c5\ubc0f\uc911\ud1f4\uc5f0\uc6d4']) > 0,
  isJobExperienced: (row) => [2, 3, 4, 5].includes(parseInt(row['\uc9d8\uc5c5\ubc0f\uc911\ud1f4\ud6c4\ucde8\uc5c5\ud69f\uc218\ucf54\ub4dc'])),
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
    if ([1, 3, 5].includes(code)) return "\uc9d8\uc5c5/\uc911\ud1f4/\uc218\ub8cc";
    return "\uae30\ud0c0";
  },
  getGender: (row) => parseInt(row['\uc131\ubcc4\ucf54\ub4dc']) === 1 ? "\ub0a8\uc790" : "\uc5ec\uc790",
  getAge: (row) => parseInt(row['\ub9cc\uc5f0\ub839']),
  getEmploymentTypeLabel: (row) => {
    const status = parseInt(row['\ud604\uc7ac\uc77c\uad00\ub828\uc0ac\ud56d_\uc885\uc0ac\uc0c1\uc9c0\uc704\ucf54\ub4dc']);
    if (status < 1 || status > 3) return "\ube44\uc784\uae08";
    return "\uc815\uaddc\uc9c1";
  },
  monthlyWage: (row) => parseFloat(row['\ucd5c\uadfc3\uac1c\uc6d4\uac04\ud3c9\uade0\uae09\uc5ec'] || 0),
  weeklyHours: (row) => parseFloat(row['\ud604\uc7ac\uc77c\uad00\ub828\uc0ac\ud56d_\ucd1d\uc2e4\uc81c\ucde8\uc5c5\uc2dc\uac04\uc218'] || 0)
};

export function getFirstJobAttribute(row, attrName) {
    const mapping = {
    '\uccab\uc9c1\uc7a5\ucde8\uc5c5\uc5f0\uc6d4': '\ud604\uc7ac\uc77c\uad00\ub828\uc0ac\ud56d_\uc9c1\uc7a5\uc2dc\uc791\uc5f0\uc6d4',
    '\uccab\uc9c1\uc7a5_\uc6d4\ud3c9\uade0\uae09\uc5ec\uc561': '\uccab\uc9c1\uc7a5_\uc6d4\ud3c9\uade0\uae09\uc5ec\uc561'
  };
  return row[attrName] || row[mapping[attrName]] || 0;
}
