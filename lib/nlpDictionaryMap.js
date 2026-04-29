/**
 * 자연어 키워드와 실제 MDIS 변수명 및 KOSIS 집계 로직을 매핑하는 사전입니다.
 * (엑셀 파일에서 자동 생성됨: 2026. 4. 29. PM 8:44:58)
 */

export const NLP_VARIABLE_MAP = {
  YOUTH: [
  {
    "variable": "가중값",
    "nlKeywords": [
      "인구수",
      "규모",
      "몇명"
    ],
    "type": "dimension_or_filter",
    "category": "공통"
  },
  {
    "variable": "만연령",
    "nlKeywords": [
      "연령별",
      "나이별",
      "15~29세",
      "20~34세"
    ],
    "type": "dimension_or_filter",
    "category": "공통"
  },
  {
    "variable": "성별코드",
    "nlKeywords": [
      "남녀",
      "성별",
      "남자",
      "여자"
    ],
    "type": "dimension",
    "category": "공통"
  },
  {
    "variable": "교육정도_수학구분코드",
    "nlKeywords": [
      "졸업",
      "재학중",
      "중퇴",
      "휴학",
      "수료"
    ],
    "type": "dimension",
    "category": "교육이력"
  },
  {
    "variable": "교육정도_학력구분코드",
    "nlKeywords": [
      "고졸",
      "전문대",
      "4년제",
      "대학원",
      "학력"
    ],
    "type": "dimension",
    "category": "교육이력"
  },
  {
    "variable": "교육정도컨버젼코드",
    "nlKeywords": [
      "고졸이하",
      "대졸이상",
      "학력별"
    ],
    "type": "dimension",
    "category": "교육이력"
  },
  {
    "variable": "경제활동상태코드",
    "nlKeywords": [
      "취업",
      "실업",
      "비경활",
      "고용",
      "일자리"
    ],
    "type": "dimension",
    "category": "경제활동"
  },
  {
    "variable": "현재일관련사항_11차산업대분류코드",
    "nlKeywords": [
      "산업별",
      "제조업",
      "IT",
      "의료",
      "교육",
      "공공"
    ],
    "type": "dimension_or_filter",
    "category": "현재직장"
  },
  {
    "variable": "현재일관련사항_8차직업대분류코드",
    "nlKeywords": [
      "직업별",
      "관리자",
      "사무직",
      "서비스"
    ],
    "type": "dimension",
    "category": "현재직장"
  },
  {
    "variable": "현재일관련사항_종사상지위코드",
    "nlKeywords": [
      "임금근로자",
      "자영업",
      "정규직"
    ],
    "type": "dimension",
    "category": "현재직장"
  },
  {
    "variable": "현재일관련사항_고용계약기간정함여부",
    "nlKeywords": [
      "계약기간",
      "기간제",
      "비기간제"
    ],
    "type": "dimension",
    "category": "현재직장"
  },
  {
    "variable": "현재일관련사항_고용계약기간코드",
    "nlKeywords": [
      "계약기간 길이",
      "1년이하",
      "1년초과"
    ],
    "type": "dimension",
    "category": "현재직장"
  },
  {
    "variable": "가장최근학교_입학및편입연월",
    "nlKeywords": [
      "입학년도",
      "대학입학"
    ],
    "type": "dimension_or_filter",
    "category": "학업이력"
  },
  {
    "variable": "가장최근학교_졸업및중퇴연월",
    "nlKeywords": [
      "졸업년도",
      "언제졸업"
    ],
    "type": "dimension_or_filter",
    "category": "학업이력"
  },
  {
    "variable": "가장최근학교_편입경험유무",
    "nlKeywords": [
      "편입",
      "편입여부"
    ],
    "type": "dimension",
    "category": "학업이력"
  },
  {
    "variable": "가장최근학교_편입전학교입학연월",
    "nlKeywords": [
      "편입전학교"
    ],
    "type": "dimension_or_filter",
    "category": "학업이력"
  },
  {
    "variable": "가장최근학교_휴학경험유무",
    "nlKeywords": [
      "휴학했나",
      "휴학경험"
    ],
    "type": "dimension",
    "category": "학업이력"
  },
  {
    "variable": "가장최근학교_휴학기간년수",
    "nlKeywords": [
      "휴학기간"
    ],
    "type": "dimension_or_filter",
    "category": "학업이력"
  },
  {
    "variable": "가장최근학교_휴학기간월수",
    "nlKeywords": [
      "휴학기간"
    ],
    "type": "dimension_or_filter",
    "category": "학업이력"
  },
  {
    "variable": "가장최근학교_휴학사유1코드\n가장최근학교_휴학사유2코드",
    "nlKeywords": [
      "휴학이유",
      "군대",
      "어학연수",
      "인턴"
    ],
    "type": "dimension",
    "category": "학업이력"
  },
  {
    "variable": "직업교육및직장체험_직업교육수혜구분코드",
    "nlKeywords": [
      "직업훈련",
      "직업교육",
      "훈련받았나"
    ],
    "type": "dimension",
    "category": "직업훈련"
  },
  {
    "variable": "직업교육및직장체험_재학휴학중직장체험여부",
    "nlKeywords": [
      "직장체험",
      "인턴경험"
    ],
    "type": "dimension",
    "category": "직업훈련"
  },
  {
    "variable": "직업교육및직장체험_직장체험주요형태코드",
    "nlKeywords": [
      "체험형태",
      "알바",
      "인턴",
      "현장실습"
    ],
    "type": "dimension",
    "category": "직업훈련"
  },
  {
    "variable": "직업교육및직장체험_재학휴학중직장체험기간코드",
    "nlKeywords": [
      "체험기간",
      "얼마나"
    ],
    "type": "dimension",
    "category": "직업훈련"
  },
  {
    "variable": "직업교육및직장체험_취업관련시험준비여부",
    "nlKeywords": [
      "취업시험준비",
      "취준"
    ],
    "type": "dimension",
    "category": "직업훈련"
  },
  {
    "variable": "직업교육및직장체험_취업관련시험준비분야코드",
    "nlKeywords": [
      "공무원시험",
      "공기업",
      "고시",
      "교원"
    ],
    "type": "dimension",
    "category": "직업훈련"
  },
  {
    "variable": "졸업및중퇴후취업횟수코드",
    "nlKeywords": [
      "취업횟수",
      "이직횟수",
      "경험유무"
    ],
    "type": "dimension",
    "category": "취업이력"
  },
  {
    "variable": "첫직장_취업당시고용형태코드",
    "nlKeywords": [
      "첫직장계약",
      "기간제",
      "비기간제"
    ],
    "type": "dimension",
    "category": "취업이력"
  },
  {
    "variable": "첫직장_임금근로자_전일제시간제여부",
    "nlKeywords": [
      "전일제",
      "시간제",
      "파트타임"
    ],
    "type": "dimension",
    "category": "취업이력"
  },
  {
    "variable": "첫직장_월평균급여액",
    "nlKeywords": [
      "임금",
      "월급",
      "초봉",
      "급여"
    ],
    "type": "dimension",
    "category": "취업이력"
  },
  {
    "variable": "첫직장취업연월",
    "nlKeywords": [
      "첫취업시기",
      "처음취업"
    ],
    "type": "dimension_or_filter",
    "category": "취업이력"
  },
  {
    "variable": "첫직장이직연월",
    "nlKeywords": [
      "이직시기",
      "첫직장그만둔시기"
    ],
    "type": "dimension_or_filter",
    "category": "취업이력"
  },
  {
    "variable": "첫직장퇴직사유코드",
    "nlKeywords": [
      "퇴직사유",
      "이직이유",
      "그만둔이유"
    ],
    "type": "dimension",
    "category": "취업이력"
  },
  {
    "variable": "첫직장업종코드",
    "nlKeywords": [
      "첫직장업종",
      "처음일한산업"
    ],
    "type": "dimension_or_filter",
    "category": "취업이력"
  },
  {
    "variable": "첫직장_근로형태코드",
    "nlKeywords": [
      "첫직장직업",
      "처음무슨일"
    ],
    "type": "dimension",
    "category": "취업이력"
  },
  {
    "variable": "최근직장_취업경로코드",
    "nlKeywords": [
      "취업경로",
      "어떻게취업",
      "공개시험"
    ],
    "type": "dimension",
    "category": "취업이력"
  },
  {
    "variable": "최근직장_전공관련성코드",
    "nlKeywords": [
      "전공일치",
      "미스매치",
      "전공관련"
    ],
    "type": "dimension",
    "category": "취업이력"
  },
  {
    "variable": "미취업_퇴직후미취업기간구분코드",
    "nlKeywords": [
      "미취업기간",
      "얼마나놀았나",
      "장기미취업"
    ],
    "type": "dimension",
    "category": "미취업"
  },
  {
    "variable": "미취업_주요활동상태코드",
    "nlKeywords": [
      "미취업중뭐했나",
      "쉬었음",
      "구직",
      "취준"
    ],
    "type": "dimension",
    "category": "미취업"
  },
  {
    "variable": "연령별 수학 여부",
    "nlKeywords": [
      "수학여부",
      "졸업",
      "중퇴",
      "재학",
      "휴학",
      "무학",
      "청년층인구",
      "연령별인구",
      "학교다니는지",
      "다니고있는지",
      "졸업자수",
      "재학생수"
    ],
    "targetMetric": "YOUTH_01",
    "type": "metric"
  },
  {
    "variable": "연령별 경제활동 상태",
    "nlKeywords": [
      "고용률",
      "취업률",
      "실업률",
      "취업자수",
      "실업자수",
      "비경활",
      "경제활동참가율",
      "취업했나",
      "일하는사람",
      "놀고있는사람",
      "구직중",
      "백수"
    ],
    "targetMetric": "YOUTH_02",
    "type": "metric"
  },
  {
    "variable": "졸업·중퇴 취업자 산업별 분포",
    "nlKeywords": [
      "산업별",
      "제조업",
      "보건복지",
      "정보통신",
      "도소매",
      "숙박음식",
      "건설",
      "금융",
      "교육서비스",
      "공공행정",
      "어느업종",
      "어디서 일해",
      "산업분포",
      "IT업종"
    ],
    "targetMetric": "YOUTH_03",
    "type": "metric"
  },
  {
    "variable": "졸업·중퇴 취업자 직업별 분포",
    "nlKeywords": [
      "직업별",
      "관리자",
      "전문가",
      "사무직",
      "서비스직",
      "단순노무",
      "기능원",
      "판매",
      "어떤직업",
      "직종별",
      "무슨일해"
    ],
    "targetMetric": "YOUTH_04",
    "type": "metric"
  },
  {
    "variable": "성·학제별 대학 졸업 소요기간",
    "nlKeywords": [
      "졸업소요기간",
      "졸업까지기간",
      "전문대",
      "4년제",
      "대학졸업개월",
      "평균졸업기간",
      "편입",
      "대학 몇년만에 졸업",
      "군복무 영향",
      "남녀 졸업기간 차이"
    ],
    "targetMetric": "YOUTH_05",
    "type": "metric"
  },
  {
    "variable": "성별 휴학 경험·사유·평균기간",
    "nlKeywords": [
      "휴학",
      "휴학경험",
      "휴학사유",
      "병역",
      "군대",
      "어학연수",
      "학비마련",
      "인턴",
      "평균휴학기간",
      "군입대휴학",
      "취업준비휴학",
      "얼마나쉬었나"
    ],
    "targetMetric": "YOUTH_06",
    "type": "metric"
  },
  {
    "variable": "성별 직장체험 유무·기간",
    "nlKeywords": [
      "직장체험",
      "인턴",
      "체험유무",
      "체험기간",
      "아르바이트경험",
      "현장실습",
      "일해본적있나",
      "직장경험",
      "취업경험재학중"
    ],
    "targetMetric": "YOUTH_07",
    "type": "metric"
  },
  {
    "variable": "성별 직장체험 형태",
    "nlKeywords": [
      "직장체험형태",
      "시간제취업",
      "전일제취업",
      "기업인턴",
      "현장실습",
      "정부지원프로그램",
      "알바형태",
      "어떤인턴",
      "체험방식"
    ],
    "targetMetric": "YOUTH_08",
    "type": "metric"
  },
  {
    "variable": "성별 직업교육·훈련 경험·시기",
    "nlKeywords": [
      "직업훈련",
      "직업교육",
      "훈련경험",
      "재학중훈련",
      "졸업후훈련",
      "취업교육받았나",
      "직훈",
      "국비훈련"
    ],
    "targetMetric": "YOUTH_09",
    "type": "metric"
  },
  {
    "variable": "성별 직업훈련 기관",
    "nlKeywords": [
      "훈련기관",
      "사설학원",
      "공공훈련기관",
      "직업능력개발",
      "대학훈련",
      "어디서 훈련받았나",
      "학원다녔나"
    ],
    "targetMetric": "YOUTH_10",
    "type": "metric"
  },
  {
    "variable": "성별 취업경험 유무·횟수",
    "nlKeywords": [
      "취업경험",
      "취업횟수",
      "이직횟수",
      "취업경험률",
      "한번두번세번",
      "몇번취업",
      "일해본적",
      "취업해봤나",
      "직장경험횟수"
    ],
    "targetMetric": "YOUTH_11",
    "type": "metric"
  },
  {
    "variable": "성별·학력별 취업경로",
    "nlKeywords": [
      "취업경로",
      "어떻게취업",
      "공개시험",
      "신문인터넷응모",
      "가족친지소개",
      "특별채용",
      "학교추천",
      "고졸",
      "대졸",
      "어떻게 일자리 구했나",
      "채용방식",
      "취업방법"
    ],
    "targetMetric": "YOUTH_12",
    "type": "metric"
  },
  {
    "variable": "성별 첫취업 소요기간·평균",
    "nlKeywords": [
      "첫취업소요기간",
      "취업까지기간",
      "졸업후취업",
      "평균소요기간",
      "얼마만에취업",
      "취업까지 몇달",
      "졸업하고 언제취업",
      "구직기간"
    ],
    "targetMetric": "YOUTH_13",
    "type": "metric"
  },
  {
    "variable": "첫직장 근속기간",
    "nlKeywords": [
      "근속기간",
      "첫직장근속",
      "첫직장얼마나",
      "이직전근속",
      "현직장근속",
      "첫직장 몇달다녔나",
      "얼마나버텼나",
      "이직까지기간"
    ],
    "targetMetric": "YOUTH_14",
    "type": "metric"
  },
  {
    "variable": "성별 첫일자리 산업",
    "nlKeywords": [
      "첫일자리산업",
      "첫직장업종",
      "처음취업산업",
      "숙박음식점",
      "제조업",
      "보건복지",
      "처음 어디서 일했나",
      "첫직장분야"
    ],
    "targetMetric": "YOUTH_15",
    "type": "metric"
  },
  {
    "variable": "성별 첫일자리 직업",
    "nlKeywords": [
      "첫일자리직업",
      "첫직장직업",
      "관리자전문가",
      "서비스직",
      "사무직",
      "단순노무",
      "처음 무슨일 했나",
      "첫직장직종"
    ],
    "targetMetric": "YOUTH_16",
    "type": "metric"
  },
  {
    "variable": "성별 첫일자리 근로형태",
    "nlKeywords": [
      "근로형태",
      "기간제",
      "비기간제",
      "전일제",
      "시간제",
      "계약기간",
      "자영업",
      "계속근무",
      "정규직이었나",
      "알바였나",
      "계약직비율",
      "기간제비율"
    ],
    "targetMetric": "YOUTH_17",
    "type": "metric"
  },
  {
    "variable": "성별 첫일자리 월평균임금",
    "nlKeywords": [
      "월평균임금",
      "첫직장임금",
      "임금분포",
      "200만원",
      "300만원이상",
      "첫봉급",
      "첫직장 얼마받았나",
      "초봉",
      "신입연봉",
      "임금구간"
    ],
    "targetMetric": "YOUTH_18",
    "type": "metric"
  },
  {
    "variable": "성별 첫일자리 그만둔 사유",
    "nlKeywords": [
      "퇴직사유",
      "이직사유",
      "근로여건불만족",
      "계약기간",
      "직장폐업",
      "개인가족이유",
      "전망없어서",
      "왜그만뒀나",
      "첫직장 왜뒀나",
      "퇴사이유"
    ],
    "targetMetric": "YOUTH_19",
    "type": "metric"
  },
  {
    "variable": "성별 취업시험준비 유무·분야",
    "nlKeywords": [
      "취업시험준비",
      "공무원시험",
      "공기업",
      "일반기업",
      "교원임용",
      "고시",
      "비경활준비",
      "공시족",
      "공무원준비",
      "취준생",
      "시험준비중"
    ],
    "targetMetric": "YOUTH_20",
    "type": "metric"
  },
  {
    "variable": "성별 최종학교 전공일치 여부",
    "nlKeywords": [
      "전공일치",
      "전공불일치",
      "전공관련성",
      "미스매치",
      "전공무관",
      "매우불일치",
      "약간불일치",
      "전공이랑 관련있나",
      "전공살렸나",
      "전공맞는일"
    ],
    "targetMetric": "YOUTH_21",
    "type": "metric"
  },
  {
    "variable": "성별 미취업기간별 미취업자",
    "nlKeywords": [
      "미취업기간",
      "장기미취업",
      "6개월미만",
      "3년이상",
      "졸업후미취업",
      "얼마나 쉬었나",
      "백수기간",
      "취업안된기간"
    ],
    "targetMetric": "YOUTH_22",
    "type": "metric"
  },
  {
    "variable": "성별 미취업기간 활동별 미취업자",
    "nlKeywords": [
      "미취업활동",
      "취업시험준비",
      "쉬었음",
      "구직활동",
      "육아가사",
      "진학준비",
      "여가",
      "백수때 뭐했나",
      "쉬는중",
      "쉬면서뭐하나",
      "그냥쉬는사람"
    ],
    "targetMetric": "YOUTH_23",
    "type": "metric"
  }
],
  WORK: [
  {
    "variable": "현재일관련사항_종사상지위코드",
    "nlKeywords": [
      "임금근로자",
      "임금근로",
      "고용된 근로자",
      "wage worker",
      "employee"
    ],
    "type": "filter",
    "category": "분석대상 필터"
  },
  {
    "variable": "계속근로가능여부 / 단기근로기간형태여부",
    "nlKeywords": [
      "불응 제외",
      "무응답 제외",
      "결측 제외",
      "non-response exclusion"
    ],
    "type": "filter",
    "category": "분석대상 필터"
  },
  {
    "variable": "가중값",
    "nlKeywords": [
      "가중치",
      "가중값",
      "천명 단위",
      "추정치",
      "weight",
      "expansion factor"
    ],
    "type": "filter",
    "category": "분석대상 필터"
  },
  {
    "variable": "정규직",
    "nlKeywords": [
      "정규직",
      "일반근로자",
      "상시근로자",
      "regular worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "비정규직",
    "nlKeywords": [
      "비정규직",
      "불안정 고용",
      "비정규",
      "비정규 근로자",
      "non-regular",
      "irregular worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "한시적",
    "nlKeywords": [
      "한시적",
      "임시근로",
      "계약직 전체",
      "temporary worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "현재일관련사항_고용계약기간정함여부",
    "nlKeywords": [
      "기간제",
      "계약직",
      "유기계약",
      "기간 정한 계약",
      "fixed-term worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "비기간제",
    "nlKeywords": [
      "비기간제",
      "계약기간 미정",
      "묵시적 계약",
      "non-fixed-term worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "계속근로가능사유코드",
    "nlKeywords": [
      "비기간제 계약반복",
      "갱신계약",
      "반복갱신",
      "repeated-contract worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "근속기간제한사유코드",
    "nlKeywords": [
      "비기간제 단기근로",
      "단기계약",
      "고용주 사정",
      "계절직",
      "short-term worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "근로시간형태코드",
    "nlKeywords": [
      "시간제",
      "파트타임",
      "단시간",
      "아르바이트",
      "part-time worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "비전형",
    "nlKeywords": [
      "비전형",
      "특수고용",
      "파견",
      "용역",
      "재택 근로",
      "atypical worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "급여수령위치코드",
    "nlKeywords": [
      "파견",
      "파견근로자",
      "파견업체",
      "dispatched worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "급여수령위치코드",
    "nlKeywords": [
      "용역",
      "용역근로자",
      "외주",
      "outsourced worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "특수형태근로종사자여부",
    "nlKeywords": [
      "특고",
      "특수형태",
      "보험설계사",
      "학습지교사",
      "택배기사",
      "프리랜서",
      "special-form worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "근로장소코드",
    "nlKeywords": [
      "가정내 근로",
      "재택근로(비전형)",
      "home-based worker"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "단기근로기간형태여부",
    "nlKeywords": [
      "일일근로",
      "일당",
      "일용 비전형",
      "daily worker (atypical)"
    ],
    "type": "dimension",
    "category": "근로형태 분류"
  },
  {
    "variable": "성별코드",
    "nlKeywords": [
      "성별",
      "남자",
      "여자",
      "남성",
      "여성",
      "sex",
      "gender",
      "male",
      "female"
    ],
    "type": "dimension",
    "category": "인구특성"
  },
  {
    "variable": "만연령",
    "nlKeywords": [
      "연령",
      "나이",
      "몇 세",
      "20대",
      "30대",
      "60세 이상",
      "age"
    ],
    "type": "dimension",
    "category": "인구특성"
  },
  {
    "variable": "교육정도컨버젼코드",
    "nlKeywords": [
      "학력",
      "교육수준",
      "고졸",
      "대졸",
      "초졸",
      "education"
    ],
    "type": "dimension",
    "category": "인구특성"
  },
  {
    "variable": "혼인상태코드",
    "nlKeywords": [
      "혼인상태",
      "기혼",
      "미혼",
      "유배우",
      "사별",
      "이혼",
      "marital status"
    ],
    "type": "dimension",
    "category": "인구특성"
  },
  {
    "variable": "현재일관련사항_종사자규모코드",
    "nlKeywords": [
      "사업체 규모",
      "직장 규모",
      "대기업",
      "중소기업",
      "종사자 수",
      "firm size",
      "establishment size"
    ],
    "type": "dimension",
    "category": "인구특성"
  },
  {
    "variable": "현재일관련사항_11차산업대분류코드",
    "nlKeywords": [
      "산업",
      "제조업",
      "건설업",
      "서비스업",
      "보건복지",
      "교육",
      "industry"
    ],
    "type": "dimension",
    "category": "인구특성"
  },
  {
    "variable": "현재일관련사항_8차직업대분류코드",
    "nlKeywords": [
      "직업",
      "관리자",
      "전문가",
      "단순노무",
      "서비스직",
      "occupation"
    ],
    "type": "dimension",
    "category": "인구특성"
  },
  {
    "variable": "조사구번호 앞 2자리 → 시도코드",
    "nlKeywords": [
      "지역",
      "시도",
      "서울",
      "경기",
      "광역시",
      "region",
      "province",
      "city"
    ],
    "type": "dimension",
    "category": "인구특성"
  },
  {
    "variable": "현재일관련사항_총실제취업시간수",
    "nlKeywords": [
      "취업시간",
      "근로시간",
      "주당 시간",
      "일한 시간",
      "working hours",
      "employment hours"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "최근3개월간평균급여",
    "nlKeywords": [
      "임금",
      "월급",
      "월평균임금",
      "급여",
      "3개월 평균",
      "wage",
      "monthly wage",
      "earnings"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "국민연금및특수직연금가입구분코드",
    "nlKeywords": [
      "국민연금",
      "연금",
      "직장가입",
      "national pension"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "건강보험가입구분코드",
    "nlKeywords": [
      "건강보험",
      "의료보험",
      "직장의료보험",
      "health insurance"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "고용보험가입여부",
    "nlKeywords": [
      "고용보험",
      "실업급여",
      "고용보험 가입",
      "employment insurance"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "퇴직급여혜택여부",
    "nlKeywords": [
      "퇴직금",
      "퇴직급여",
      "퇴직연금",
      "severance pay",
      "retirement benefit"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "상여금혜택여부",
    "nlKeywords": [
      "상여금",
      "보너스",
      "bonus"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "시간외수당혜택여부",
    "nlKeywords": [
      "시간외수당",
      "초과근무수당",
      "연장근로수당",
      "overtime pay"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "유급휴일및휴가혜택여부",
    "nlKeywords": [
      "유급휴가",
      "연차",
      "휴가",
      "paid leave",
      "annual leave"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "교육훈련경험여부",
    "nlKeywords": [
      "교육훈련",
      "직업훈련",
      "교육 참여",
      "vocational training",
      "education"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "노동조합가입구분코드",
    "nlKeywords": [
      "노동조합",
      "노조",
      "조합 가입",
      "노조 가입률",
      "labor union",
      "trade union"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "근로계약서작성여부",
    "nlKeywords": [
      "근로계약서",
      "계약서 작성",
      "서면계약",
      "written employment contract"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "급여형태코드",
    "nlKeywords": [
      "임금형태",
      "급여형태",
      "시급",
      "월급",
      "연봉",
      "실적급",
      "pay type",
      "wage type"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "현재일관련사항_직장시작연월 (파생계산)",
    "nlKeywords": [
      "근속기간",
      "재직기간",
      "얼마나 일했나",
      "장기근속",
      "tenure",
      "seniority"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "지난주취업동기코드 / 지난주취업_주요사유코드",
    "nlKeywords": [
      "일자리 선택 동기",
      "자발적",
      "비자발적",
      "당장수입",
      "근로조건 만족",
      "job choice motive",
      "voluntary",
      "involuntary"
    ],
    "type": "dimension",
    "category": "근로조건"
  },
  {
    "variable": "유연근무제_활용여부",
    "nlKeywords": [
      "유연근무제",
      "유연근무",
      "탄력근무",
      "재택근무",
      "활용여부",
      "flexible work",
      "remote work"
    ],
    "type": "dimension",
    "category": "유연근무제"
  },
  {
    "variable": "유연근무제_활용형태1코드 / 형태2코드",
    "nlKeywords": [
      "유연근무 형태",
      "시차출퇴근",
      "탄력근무제",
      "선택적근무",
      "재택원격",
      "flexible work type"
    ],
    "type": "dimension",
    "category": "유연근무제"
  },
  {
    "variable": "향후활용예정형태1코드 / 형태2코드",
    "nlKeywords": [
      "향후 유연근무 희망",
      "유연근무 희망형태",
      "desired flexible work"
    ],
    "type": "dimension",
    "category": "유연근무제"
  },
  {
    "variable": "성별 근로형태별 임금근로자 규모 및 비중",
    "nlKeywords": [
      "성별 근로형태별 임금근로자 규모 및 비중"
    ],
    "targetMetric": "WORK_01",
    "type": "metric"
  },
  {
    "variable": "연령·산업·직업별 비정규직 규모 및 비중",
    "nlKeywords": [
      "연령",
      "산업",
      "직업별 비정규직 규모 및 비중"
    ],
    "targetMetric": "WORK_02",
    "type": "metric"
  },
  {
    "variable": "근로형태별 임금근로자 특성 총괄",
    "nlKeywords": [
      "근로형태별 임금근로자 특성 총괄"
    ],
    "targetMetric": "WORK_03",
    "type": "metric"
  },
  {
    "variable": "성·연령별 근로형태별 취업자",
    "nlKeywords": [
      "성",
      "연령별 근로형태별 취업자"
    ],
    "targetMetric": "WORK_04",
    "type": "metric"
  },
  {
    "variable": "성·교육정도별 근로형태별 취업자",
    "nlKeywords": [
      "성",
      "교육정도별 근로형태별 취업자"
    ],
    "targetMetric": "WORK_05",
    "type": "metric"
  },
  {
    "variable": "성·종사자규모별 근로형태별 취업자",
    "nlKeywords": [
      "성",
      "종사자규모별 근로형태별 취업자"
    ],
    "targetMetric": "WORK_06",
    "type": "metric"
  },
  {
    "variable": "산업별 근로형태별 취업자(11차)",
    "nlKeywords": [
      "산업별 근로형태별 취업자(11차)"
    ],
    "targetMetric": "WORK_07",
    "type": "metric"
  },
  {
    "variable": "직업별 근로형태별 취업자(8차)",
    "nlKeywords": [
      "직업별 근로형태별 취업자(8차)"
    ],
    "targetMetric": "WORK_08",
    "type": "metric"
  },
  {
    "variable": "한시적 근로자 규모 및 증감",
    "nlKeywords": [
      "한시적 근로자 규모 및 증감"
    ],
    "targetMetric": "WORK_09",
    "type": "metric"
  },
  {
    "variable": "시간제 고용안정성 비율",
    "nlKeywords": [
      "시간제 고용안정성 비율"
    ],
    "targetMetric": "WORK_10",
    "type": "metric"
  },
  {
    "variable": "성별 시간제 주당 평균취업시간",
    "nlKeywords": [
      "성별 시간제 주당 평균취업시간"
    ],
    "targetMetric": "WORK_11",
    "type": "metric"
  },
  {
    "variable": "성별 시간제 월평균임금",
    "nlKeywords": [
      "성별 시간제 월평균임금"
    ],
    "targetMetric": "WORK_12",
    "type": "metric"
  },
  {
    "variable": "비전형 근로자 규모 및 증감",
    "nlKeywords": [
      "비전형 근로자 규모 및 증감"
    ],
    "targetMetric": "WORK_13",
    "type": "metric"
  },
  {
    "variable": "일자리선택동기별 근로형태별 구성비",
    "nlKeywords": [
      "일자리선택동기별 근로형태별 구성비"
    ],
    "targetMetric": "WORK_14",
    "type": "metric"
  },
  {
    "variable": "근로형태별 평균근속기간 및 구성비",
    "nlKeywords": [
      "근로형태별 평균근속기간 및 구성비"
    ],
    "targetMetric": "WORK_15",
    "type": "metric"
  },
  {
    "variable": "근로형태별 주당 평균취업시간",
    "nlKeywords": [
      "근로형태별 주당 평균취업시간"
    ],
    "targetMetric": "WORK_16",
    "type": "metric"
  },
  {
    "variable": "근로형태별 월평균임금",
    "nlKeywords": [
      "근로형태별 월평균임금"
    ],
    "targetMetric": "WORK_17",
    "type": "metric"
  },
  {
    "variable": "근로형태별 사회보험 가입률",
    "nlKeywords": [
      "근로형태별 사회보험 가입률"
    ],
    "targetMetric": "WORK_18",
    "type": "metric"
  },
  {
    "variable": "근로형태별 근로복지 수혜율",
    "nlKeywords": [
      "근로형태별 근로복지 수혜율"
    ],
    "targetMetric": "WORK_19",
    "type": "metric"
  },
  {
    "variable": "근로형태별 교육훈련 경험",
    "nlKeywords": [
      "근로형태별 교육훈련 경험"
    ],
    "targetMetric": "WORK_20",
    "type": "metric"
  },
  {
    "variable": "근로형태별 노동조합 가입률",
    "nlKeywords": [
      "근로형태별 노동조합 가입률"
    ],
    "targetMetric": "WORK_21",
    "type": "metric"
  },
  {
    "variable": "주40시간 실시비율",
    "nlKeywords": [
      "주40시간 실시비율"
    ],
    "targetMetric": "WORK_22",
    "type": "metric"
  },
  {
    "variable": "근로형태별 근로계약서 서면작성률",
    "nlKeywords": [
      "근로형태별 근로계약서 서면작성률"
    ],
    "targetMetric": "WORK_23",
    "type": "metric"
  },
  {
    "variable": "임금형태별 근로형태별 비율",
    "nlKeywords": [
      "임금형태별 근로형태별 비율"
    ],
    "targetMetric": "WORK_24",
    "type": "metric"
  },
  {
    "variable": "유연근무제 활용여부",
    "nlKeywords": [
      "유연근무제 활용여부"
    ],
    "targetMetric": "WORK_25",
    "type": "metric"
  },
  {
    "variable": "유연근무제 활용형태(복수응답)",
    "nlKeywords": [
      "유연근무제 활용형태(복수응답)"
    ],
    "targetMetric": "WORK_26",
    "type": "metric"
  },
  {
    "variable": "성별 유연근무제 활용현황",
    "nlKeywords": [
      "성별 유연근무제 활용현황"
    ],
    "targetMetric": "WORK_27",
    "type": "metric"
  },
  {
    "variable": "혼인상태별 유연근무제 활용현황",
    "nlKeywords": [
      "혼인상태별 유연근무제 활용현황"
    ],
    "targetMetric": "WORK_28",
    "type": "metric"
  },
  {
    "variable": "연령별 유연근무제 활용현황",
    "nlKeywords": [
      "연령별 유연근무제 활용현황"
    ],
    "targetMetric": "WORK_29",
    "type": "metric"
  },
  {
    "variable": "향후 유연근무제 활용형태",
    "nlKeywords": [
      "향후 유연근무제 활용형태"
    ],
    "targetMetric": "WORK_30",
    "type": "metric"
  },
  {
    "variable": "시도별 비정규직 근로자 규모",
    "nlKeywords": [
      "시도별 비정규직 근로자 규모"
    ],
    "targetMetric": "WORK_31",
    "type": "metric"
  }
]
};

// 동의어를 기반으로 변수명을 찾는 헬퍼 함수
export const findVariableByKeyword = (surveyType, keyword) => {
  const dictionary = NLP_VARIABLE_MAP[surveyType] || [];
  return dictionary.find(item => item.nlKeywords.some(kw => keyword.includes(kw)));
};
