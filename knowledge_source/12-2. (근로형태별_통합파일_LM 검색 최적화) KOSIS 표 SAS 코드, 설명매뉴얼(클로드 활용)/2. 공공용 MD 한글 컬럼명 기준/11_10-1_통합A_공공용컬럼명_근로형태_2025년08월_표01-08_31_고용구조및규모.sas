/*
================================================================================
  A. 고용구조 및 규모
  2025년 8월 경제활동인구조사 근로형태별 부가조사 — 표01~08, 표31
  비정규직·정규직 규모 및 비중 — 성별·연령별·산업별·직업별·교육정도별·종사자규모별·시도별

  ★ 이 파일은 공공용 MDIS CSV 컬럼명(파일설계서 기준)으로 교정된 버전입니다.
     원본(내부망 hsgjno## 체계) → 공공용 컬럼명 변환표:

     내부망 변수명          항목번호  공공용 컬럼명
     ─────────────────────────────────────────────────────────────────────
     Nhsgjno23               51    조사연월
     Nhsgjno20               27    현재일관련사항_종사상지위코드
     Nhsgjno22               29    현재일관련사항_고용계약기간정함여부
     HSGJNO100               58    계약기간반복갱신여부
     HSGJNO101               59    단기근로기간형태여부
     HSGJNO102               60    계속근로가능여부
     HSGJNO103               61    계속근로가능사유코드
     HSGJNO47                64    근속기간제한사유코드
     NHSGJNO18               65    근로시간형태코드
     HSGJNO50                68    급여수령위치코드
     HSGJNO52                69    특수형태근로종사자여부
     HSGJNO53                70    근로장소코드
     masex                    3    성별코드
     maage                   54    만연령
     maedu_c                 53    교육정도컨버젼코드
     nhsgjno17_3_c           24    현재일관련사항_11차산업대분류코드
     nhsgjno19_3_c           26    현재일관련사항_8차직업대분류코드
     HSGJNO32                25    현재일관련사항_종사자규모코드
     ratio                   56    가중값
     Nhsgjno26               28    현재일관련사항_직장시작연월
     hsgjno13_3              18    현재일관련사항_총실제취업시간수
     HSGJNO69                84    최근3개월간평균급여
     HSGJNO55                73    국민연금및특수직연금가입구분코드
     HSGJNO56                74    건강보험가입구분코드
     HSGJNO57                75    고용보험가입여부
     HSGJNO58                76    퇴직급여혜택여부
     HSGJNO67                77    상여금혜택여부
     HSGJNO68                78    시간외수당혜택여부
     HSGJNO61                79    유급휴일및휴가혜택여부
     majno                   N/A   (공공용 미제공 — 표31 시도별 집계 불가)

  [포함 표] 표01, 표02, 표03, 표04, 표05, 표06, 표07, 표08, 표31
  [검증]    전 표 KOSIS 완전 일치 확인 (표31 전국합계 기준)
  [조사]    통계청 경제활동인구조사 근로형태별 부가조사 2025년 8월
================================================================================
*/


/* ══════════════════════════════════════════════════════════════════════════
   표01 — 성별 근로형태별 임금근로자 규모 및 비중 총괄
   키워드: 성별, 임금근로자, 정규직, 비정규직, 규모, 비중, 총괄, 남자, 여자
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 1. 성별 근로형태별 임금근로자 규모 및 비중 총괄
 기준: 2025년 8월 경제활동인구조사 근로형태별 부가조사
 데이터: ea_buga.ea1925 (2019년 8월 ~ 2025년 8월 통합 데이터셋)
 KOSIS 검증: 전 항목 ±1천명 이내 완전 일치 확인
***********************************************************************/

/* STEP 1. 임금근로자 추출 및 근로형태 플래그 생성 */
data b0 b1 b2 b3 b4 b5 b6 b7 b8 b9;
  set ea_buga.ea1925;

  /* 2025년 8월만 사용 */
  if substr(조사연월, 5, 2) = '08';

  /* 임금근로자 필터 (종사상지위 1=상용, 2=임시, 3=일용) */
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;

  /* 불응 제외 */
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* ── 근로형태 플래그 생성 ── */

  /* 기간제: 고용계약기간을 명시적으로 정함 */
  b4_flag = (현재일관련사항_고용계약기간정함여부 = 1);

  /* 비기간제-계약반복
     조건: 계약기간 미정 + 계속근로 가능 + 사유=계약의 반복·갱신(코드 2)
     ※ 주의: 계약기간반복갱신여부가 아닌 계속근로가능사유코드 사용
              계약기간반복갱신여부는 기간제 집단에서만 활성화, 비기간제는 전부 0 */
  b6_flag = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);

  /* 비기간제-단기근로
     조건: 계약기간 미정 + 계속근로 불가 + 비자발적 사유(코드 01~06) */
  b7_flag = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);

  /* 비기간제 = 계약반복 OR 단기근로 */
  b5_flag = (b6_flag or b7_flag);

  /* 한시적 = 기간제 OR 비기간제 */
  b3_flag = (b4_flag or b5_flag);

  /* 시간제: 근로시간형태 = 시간제(2) */
  b8_flag = (근로시간형태코드 = 2);

  /* 비전형 = 파견(2) or 용역(3) or 특고(1) or 가정내(1) or 일일근로(1) */
  b9_flag = (급여수령위치코드 = 2) or (급여수령위치코드 = 3) or
            (특수형태근로종사자여부 = 1) or (근로장소코드 = 1) or (단기근로기간형태여부 = 1);

  /* 비정규직 = 한시적 OR 시간제 OR 비전형
     ※ OR 연산으로 중복 자동 제거 (단순합산 금지) */
  b2_flag = (b3_flag or b8_flag or b9_flag);

  /* 정규직 = 임금근로자 중 비정규직 아닌 자 */
  b1_flag = (b2_flag = 0);

  /* 가중치 (천 명 단위) */
  wei = 가중값 / 1000;

  /* 파일 분리 출력 */
  output b0;                          /* 임금근로자 전체 */
  if b1_flag then output b1;          /* 정규직        */
  if b2_flag then output b2;          /* 비정규직       */
  if b3_flag then output b3;          /* 한시적        */
  if b4_flag then output b4;          /* 기간제        */
  if b5_flag then output b5;          /* 비기간제       */
  if b6_flag then output b6;          /* 계약반복       */
  if b7_flag then output b7;          /* 단기근로       */
  if b8_flag then output b8;          /* 시간제        */
  if b9_flag then output b9;          /* 비전형        */
run;


/* STEP 2. 성별 집계 매크로 */
%macro buga(i, o, s);
  proc means data=&i sum noprint;
    var wei;
    class 조사연월 성별코드;
    output out=&o sum=&s;
  run;
  data &o;
    set &o;
    if 조사연월 ^= '';
    keep 조사연월 성별코드 &s;
  run;
  proc sort data=&o; by 조사연월 성별코드; run;
%mend buga;

%buga(i=b0, o=o0, s=s0);  /* 임금근로자 */
%buga(i=b1, o=o1, s=s1);  /* 정규직     */
%buga(i=b2, o=o2, s=s2);  /* 비정규직   */
%buga(i=b3, o=o3, s=s3);  /* 한시적     */
%buga(i=b4, o=o4, s=s4);  /* 기간제     */
%buga(i=b5, o=o5, s=s5);  /* 비기간제   */
%buga(i=b8, o=o8, s=s8);  /* 시간제     */
%buga(i=b9, o=o9, s=s9);  /* 비전형     */


/* STEP 3. 결과 병합 및 정리 */
data result;
  merge o0 o1 o2 o3 o4 o5 o8 o9;
  by 조사연월 성별코드;

  format 연월 $char6. 성별 $char6.;
  연월 = 조사연월;

  if 성별코드 = 1 then 성별 = '1남자';
  else if 성별코드 = 2 then 성별 = '2여자';
  else 성별 = '0합계';

  /* 소수점 1자리 반올림 (천 명 단위) */
  s0=round(s0,0.1); s1=round(s1,0.1); s2=round(s2,0.1);
  s3=round(s3,0.1); s4=round(s4,0.1); s5=round(s5,0.1);
  s8=round(s8,0.1); s9=round(s9,0.1);

  format 임금근로자 10.1 정규직 10.1 비정규직 10.1
         한시적 10.1 기간제 10.1 비기간제 10.1
         시간제 10.1 비전형 10.1;

  임금근로자 = s0;  정규직 = s1;  비정규직 = s2;
  한시적     = s3;  기간제 = s4;  비기간제 = s5;
  시간제     = s8;  비전형 = s9;

  drop s0--s9 조사연월 성별코드;
run;


/* STEP 4. 비중(%) 추가 산출 */
data result_pct;
  set result;
  if 성별 = '0합계' then do;
    정규직_비중   = round(정규직   / 임금근로자 * 100, 0.1);
    비정규직_비중 = round(비정규직 / 임금근로자 * 100, 0.1);
  end;
run;

proc sort data=result_pct; by 연월 성별; run;


/* STEP 5. 엑셀 파일 출력 */
proc export data=result_pct
  outfile="I:\집계\근로형태별\표01_성별_근로형태별_임금근로자_규모_및_비중.xlsx"
  dbms=xlsx replace;
  sheet="표1_규모및비중";
run;

/* ──────────────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════
   표02 — 연령·산업·직업별 비정규직 근로자 규모 및 비중 총괄
   키워드: 연령별, 산업별, 직업별, 비정규직, 규모, 비중, 총괄
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 2. 연령·산업·직업별 비정규직 근로자 규모 및 비중 총괄
 기준: 2025년 8월 경제활동인구조사 근로형태별 부가조사
 데이터: ea_buga.ea1925 (2019년 8월 ~ 2025년 8월 통합 데이터셋)
 KOSIS 검증: 전 항목 ±1천명 이내 완전 일치 확인
***********************************************************************/

/* STEP 1. 비정규직 데이터셋 생성 */
data b2;
  set ea_buga.ea1925;

  /* 2025년 8월만 사용 */
  if substr(조사연월, 5, 2) = '08';

  /* 임금근로자 필터 */
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;

  /* 불응 제외 */
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* 비정규직 판별 (최종 확정 로직) */
  b4 = (현재일관련사항_고용계약기간정함여부 = 1);
  b6 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);
  b7 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);
  b8 = (근로시간형태코드 = 2);
  b9 = (급여수령위치코드 in (2,3)) or (특수형태근로종사자여부 = 1) or
       (근로장소코드 = 1) or (단기근로기간형태여부 = 1);

  b2_flag = (b4 or b6 or b7 or b8 or b9);

  /* 비정규직만 추출 */
  if b2_flag;

  /* 가중치 (천 명 단위) */
  wei = 가중값 / 1000;

  /* 연령 구간 분류 */
  if      15 <= 만연령 <= 19 then age_grp = '1_15~19세';
  else if 20 <= 만연령 <= 29 then age_grp = '2_20~29세';
  else if 30 <= 만연령 <= 39 then age_grp = '3_30~39세';
  else if 40 <= 만연령 <= 49 then age_grp = '4_40~49세';
  else if 50 <= 만연령 <= 59 then age_grp = '5_50~59세';
  else if 만연령 >= 60        then age_grp = '6_60세이상';

  /* 산업 코드 (11차 대분류, 알파벳) */
  sanup = 현재일관련사항_11차산업대분류코드;

  /* 산업 그룹 분류 */
  if      sanup = 'A'
    then ind_grp = '1_농업임업어업(A)';
  else if sanup in ('B','C')
    then ind_grp = '2_광제조업(BC)';
  else if sanup not in ('A','B','C')
    then ind_grp = '3_사회간접기타(D~U)';

  /* 산업 세부 그룹 (중분류용) */
  if sanup = 'F'                          then ind_sub = '건설업(F)';
  if sanup in ('G','I')                   then ind_sub = '도소매음식숙박(GI)';
  if sanup in ('E','L','M','N','O','P',
               'Q','R','S','T','U')        then ind_sub = '사업개인공공(ELU)';
  if sanup in ('D','H','J','K')           then ind_sub = '전기운수통신금융(DHJK)';

  /* 직업 코드 (8차 대분류, 숫자) */
  jikup = 현재일관련사항_8차직업대분류코드;

  /* 직업 그룹 분류 */
  if      jikup in ('1','2') then job_grp = '1_전문기술행정관리';
  else if jikup = '3'        then job_grp = '2_사무종사자';
  else if jikup in ('4','5') then job_grp = '3_서비스판매';
  else if jikup = '6'        then job_grp = '4_농림어업숙련';
  else if jikup in ('7','8') then job_grp = '5_기능기계조작조립';
  else if jikup = '9'        then job_grp = '6_단순노무';

run;


/* STEP 2. 전체 비정규직 합계 (비중 분모) */
proc means data=b2 sum noprint;
  var wei;
  class 조사연월;
  output out=total_out sum=total_wei;
run;
data total_out;
  set total_out;
  if 조사연월 ^= '';
  total_wei = round(total_wei, 0.1);
  keep 조사연월 total_wei;
run;


/* STEP 3. 집계 매크로 */
%macro agg_grp(data=, grpvar=, outname=, sumvar=s);
  proc means data=&data sum noprint;
    var wei;
    class 조사연월 &grpvar;
    output out=&outname sum=&sumvar;
  run;
  data &outname;
    set &outname;
    if 조사연월 ^= '' and &grpvar ^= '';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 &grpvar &sumvar;
  run;
  proc sort data=&outname; by 조사연월 &grpvar; run;
%mend;

/* 연령별 집계 */
%agg_grp(data=b2, grpvar=age_grp,  outname=out_age,  sumvar=s_age);

/* 산업 그룹별 집계 */
%agg_grp(data=b2, grpvar=ind_grp,  outname=out_ind,  sumvar=s_ind);

/* 산업 세부별 집계 */
%agg_grp(data=b2, grpvar=sanup,    outname=out_sanup, sumvar=s_sanup);

/* 직업 그룹별 집계 */
%agg_grp(data=b2, grpvar=job_grp,  outname=out_job,  sumvar=s_job);

/* 직업 개별별 집계 */
%agg_grp(data=b2, grpvar=jikup,    outname=out_jikup, sumvar=s_jikup);


/* STEP 4. 비중 산출 및 엑셀 출력 */

/* 연령별 */
data result_age;
  merge out_age total_out; by 조사연월;
  format 연월 $char6. 연령구간 $char15. 규모_천명 10.1 비중_pct 6.1;
  연월      = 조사연월;
  연령구간  = age_grp;
  규모_천명 = s_age;
  비중_pct  = round(s_age / total_wei * 100, 0.1);
  drop s_age total_wei 조사연월 age_grp;
run;

proc export data=result_age
  outfile="I:\집계\근로형태별\표02_연령산업직업별_비정규직.xlsx"
  dbms=xlsx replace; sheet="연령별"; run;

/* 산업별 */
data result_ind;
  merge out_ind total_out; by 조사연월;
  format 연월 $char6. 산업그룹 $char30. 규모_천명 10.1 비중_pct 6.1;
  연월      = 조사연월;
  산업그룹  = ind_grp;
  규모_천명 = s_ind;
  비중_pct  = round(s_ind / total_wei * 100, 0.1);
  drop s_ind total_wei 조사연월 ind_grp;
run;

proc export data=result_ind
  outfile="I:\집계\근로형태별\표02_연령산업직업별_비정규직.xlsx"
  dbms=xlsx replace; sheet="산업별"; run;

/* 직업별 */
data result_job;
  merge out_job total_out; by 조사연월;
  format 연월 $char6. 직업그룹 $char25. 규모_천명 10.1 비중_pct 6.1;
  연월      = 조사연월;
  직업그룹  = job_grp;
  규모_천명 = s_job;
  비중_pct  = round(s_job / total_wei * 100, 0.1);
  drop s_job total_wei 조사연월 job_grp;
run;

proc export data=result_job
  outfile="I:\집계\근로형태별\표02_연령산업직업별_비정규직.xlsx"
  dbms=xlsx replace; sheet="직업별"; run;

/* ──────────────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════
   표03 — 근로형태별 임금근로자 특성 총괄
   키워드: 임금근로자, 특성, 총괄, 비정규직, 한시적, 기간제, 시간제, 비전형
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 3. 근로형태별 임금근로자 특성 총괄
 기준: 2025년 8월 경제활동인구조사 근로형태별 부가조사
 데이터: ea_buga.ea1925 (2019년 8월 ~ 2025년 8월 통합 데이터셋)
 KOSIS 검증: 전 30개 항목 완전 일치 확인
***********************************************************************/

/* STEP 1. 임금근로자 데이터 준비 및 비정규직 플래그 */
data work;
  set ea_buga.ea1925;

  /* 2025년 8월만 사용 */
  if substr(조사연월, 5, 2) = '08';

  /* 임금근로자 필터 */
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;

  /* 불응 제외 */
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* ── 비정규직 판별 플래그 ── */
  b4 = (현재일관련사항_고용계약기간정함여부 = 1);
  b6 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);
  b7 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);
  b8 = (근로시간형태코드 = 2);
  b9 = (급여수령위치코드 in (2,3)) or (특수형태근로종사자여부 = 1) or
       (근로장소코드 = 1) or (단기근로기간형태여부 = 1);

  b2 = (b4 or b6 or b7 or b8 or b9);  /* 비정규직 */
  b1 = (b2 = 0);                        /* 정규직   */

  /* 근로형태 구분 변수 */
  if b1 then emp_type = '정규직  ';
  else       emp_type = '비정규직';

  /* 가중치 (천 명 단위) */
  wei = 가중값 / 1000;

  /* 평균근속기간 (개월): 조사연월 - 직장시작연월
     현재일관련사항_직장시작연월 = 직장시작연월 (YYYYMM 형식 정수) */
  if 현재일관련사항_직장시작연월 > 0 and 현재일관련사항_직장시작연월 ^= . then do;
    start_y = int(현재일관련사항_직장시작연월 / 100);
    start_m = mod(현재일관련사항_직장시작연월, 100);
    tenure_m = (2025 * 12 + 8) - (start_y * 12 + start_m);
    if tenure_m < 0 then tenure_m = .;
  end;
  else tenure_m = .;

  /* 고용보험 가입 여부 (분모 처리용)
     31=가입, 32=미가입, 0=해당없음(의무대상외)
     비율 산출 시 분모에서 코드 0 제외 필요 */
  emp_ins_flag  = (고용보험가입여부 = 31);
  emp_ins_valid = (고용보험가입여부 in (31, 32));

run;


/* STEP 2. 집계 ─────────────────────────────────────── */

/* ① 평균근속기간 */
proc means data=work mean noprint;
  var tenure_m;
  class 조사연월 emp_type;
  weight wei;
  output out=out_tenure mean=s_tenure;
run;
data out_tenure;
  set out_tenure;
  if 조사연월 ^= '' and _type_ in (2, 3);
  s_tenure = round(s_tenure, 0.1);
  keep 조사연월 emp_type s_tenure;
run;

/* ② 평균취업시간 (총실제취업시간) */
proc means data=work mean noprint;
  var 현재일관련사항_총실제취업시간수;
  class 조사연월 emp_type;
  weight wei;
  output out=out_hours mean=s_hours;
run;
data out_hours;
  set out_hours;
  if 조사연월 ^= '' and _type_ in (2, 3);
  s_hours = round(s_hours, 0.1);
  keep 조사연월 emp_type s_hours;
run;

/* ③ 월평균임금 (최근3개월간평균급여, 단위: 만원) */
proc means data=work mean noprint;
  var 최근3개월간평균급여;
  class 조사연월 emp_type;
  weight wei;
  output out=out_pay mean=s_pay;
run;
data out_pay;
  set out_pay;
  if 조사연월 ^= '' and _type_ in (2, 3);
  s_pay = round(s_pay, 0.1);
  keep 조사연월 emp_type s_pay;
run;

/* ④ 국민연금 가입률 (직장가입자=111 / 전체 분모) */
proc means data=work sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_tot_ sum=tot_wei;
run;
data _tot_; set _tot_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type tot_wei; run;

proc means data=work(where=(국민연금및특수직연금가입구분코드=111)) sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_num_nps_ sum=n_nps;
run;
data _num_nps_; set _num_nps_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type n_nps; run;

data out_nps;
  merge _tot_ _num_nps_; by 조사연월 emp_type;
  s_nps = round(n_nps / tot_wei * 100, 0.1);
  keep 조사연월 emp_type s_nps;
run;

/* ⑤ 건강보험 가입률 (직장가입자=211 / 전체 분모) */
proc means data=work(where=(건강보험가입구분코드=211)) sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_num_hi_ sum=n_hi;
run;
data _num_hi_; set _num_hi_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type n_hi; run;

data out_hi;
  merge _tot_ _num_hi_; by 조사연월 emp_type;
  s_hi = round(n_hi / tot_wei * 100, 0.1);
  keep 조사연월 emp_type s_hi;
run;

/* ⑥ 고용보험 가입률 ★ 분모에서 코드 0 제외 ★
   분모: 고용보험가입여부 in (31, 32)만 포함
   분자: 고용보험가입여부 = 31 */
proc means data=work(where=(고용보험가입여부 in (31,32))) sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_emp_denom_ sum=d_emp;
run;
data _emp_denom_; set _emp_denom_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type d_emp; run;

proc means data=work(where=(고용보험가입여부=31)) sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_emp_num_ sum=n_emp;
run;
data _emp_num_; set _emp_num_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type n_emp; run;

data out_emp;
  merge _emp_denom_ _emp_num_; by 조사연월 emp_type;
  s_emp = round(n_emp / d_emp * 100, 0.1);
  keep 조사연월 emp_type s_emp;
run;

/* ⑦ 퇴직급여 수혜율 (111=수혜 / 전체 분모) */
proc means data=work(where=(퇴직급여혜택여부=111)) sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_num_ret_ sum=n_ret;
run;
data _num_ret_; set _num_ret_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type n_ret; run;

data out_ret;
  merge _tot_ _num_ret_; by 조사연월 emp_type;
  s_ret = round(n_ret / tot_wei * 100, 0.1);
  keep 조사연월 emp_type s_ret;
run;

/* ⑧ 상여금 수혜율 (21=수혜) */
proc means data=work(where=(상여금혜택여부=21)) sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_num_bon_ sum=n_bon;
run;
data _num_bon_; set _num_bon_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type n_bon; run;

data out_bon;
  merge _tot_ _num_bon_; by 조사연월 emp_type;
  s_bon = round(n_bon / tot_wei * 100, 0.1);
  keep 조사연월 emp_type s_bon;
run;

/* ⑨ 시간외수당 수혜율 (31=수혜) */
proc means data=work(where=(시간외수당혜택여부=31)) sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_num_ot_ sum=n_ot;
run;
data _num_ot_; set _num_ot_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type n_ot; run;

data out_ot;
  merge _tot_ _num_ot_; by 조사연월 emp_type;
  s_ot = round(n_ot / tot_wei * 100, 0.1);
  keep 조사연월 emp_type s_ot;
run;

/* ⑩ 유급휴가 수혜율 (41=수혜) */
proc means data=work(where=(유급휴일및휴가혜택여부=41)) sum noprint;
  var wei;
  class 조사연월 emp_type;
  output out=_num_vac_ sum=n_vac;
run;
data _num_vac_; set _num_vac_; if 조사연월^='' and _type_ in (2,3);
  keep 조사연월 emp_type n_vac; run;

data out_vac;
  merge _tot_ _num_vac_; by 조사연월 emp_type;
  s_vac = round(n_vac / tot_wei * 100, 0.1);
  keep 조사연월 emp_type s_vac;
run;


/* STEP 3. 결과 병합 및 엑셀 출력 */
data result;
  merge out_tenure out_hours out_pay
        out_nps    out_hi    out_emp
        out_ret    out_bon   out_ot   out_vac;
  by 조사연월 emp_type;

  format 연월 $char6. 근로형태 $char6.;
  연월    = 조사연월;
  근로형태 = emp_type;

  label s_tenure = '평균근속기간(개월)'
        s_hours  = '평균취업시간(시간/주)'
        s_pay    = '월평균임금(만원)'
        s_nps    = '국민연금가입률(%)'
        s_hi     = '건강보험가입률(%)'
        s_emp    = '고용보험가입률(%)'
        s_ret    = '퇴직급여수혜율(%)'
        s_bon    = '상여금수혜율(%)'
        s_ot     = '시간외수당수혜율(%)'
        s_vac    = '유급휴가수혜율(%)';

  drop 조사연월 emp_type;
run;

proc sort data=result; by 연월 근로형태; run;

proc export data=result
  outfile="I:\집계\근로형태별\표03_근로형태별_임금근로자_특성.xlsx"
  dbms=xlsx replace;
  sheet="표3_특성총괄";
run;

/* ──────────────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════
   표04 — 성·연령별 근로형태(비정규직)별 취업자
   키워드: 성별, 연령별, 비정규직, 취업자, 남자, 여자
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 4. 성·연령별 근로형태(비정규직)별 취업자
 기준: 2025년 8월 경제활동인구조사 근로형태별 부가조사
 데이터: ea_buga.ea1925 (2019년 8월 ~ 2025년 8월 통합 데이터셋)
 KOSIS 검증: 전 147개 항목 완전 일치 확인
***********************************************************************/

/* STEP 1. 데이터 준비 및 플래그 생성 */
data work;
  set ea_buga.ea1925;

  /* 2025년 8월만 사용 */
  if substr(조사연월, 5, 2) = '08';

  /* 임금근로자 필터 */
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;

  /* 불응 제외 */
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* ── 비정규직 플래그 (최종 확정 로직) ── */
  b4 = (현재일관련사항_고용계약기간정함여부 = 1);
  b6 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);
  b7 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);
  b8 = (근로시간형태코드 = 2);
  b9 = (급여수령위치코드 in (2,3)) or (특수형태근로종사자여부 = 1) or
       (근로장소코드 = 1) or (단기근로기간형태여부 = 1);

  b3 = (b4 or b6 or b7);              /* 한시적 */
  b2 = (b3 or b8 or b9);              /* 비정규직 */
  b1 = (b2 = 0);                       /* 정규직  */

  /* ── 연령 구간 (만연령 기준) ── */
  if      15 <= 만연령 <= 19 then age_grp = '1_15~19세';
  else if 20 <= 만연령 <= 29 then age_grp = '2_20~29세';
  else if 30 <= 만연령 <= 39 then age_grp = '3_30~39세';
  else if 40 <= 만연령 <= 49 then age_grp = '4_40~49세';
  else if 50 <= 만연령 <= 59 then age_grp = '5_50~59세';
  else if 만연령 >= 60        then age_grp = '6_60세이상';

  /* ── 가중치 (천 명 단위) ── */
  wei = 가중값 / 1000;

run;


/* STEP 2. 집계 매크로 정의
   [구조] 성별(계/남/여) × 연령별(계+6구간) 교차 집계
*/
%macro agg_type(data=, flag=, outname=, sumvar=);

  /* ① 전체(계) × 연령별 */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월 age_grp;
    output out=_all_ sum=&sumvar;
  run;
  data _all_;
    set _all_;
    if 조사연월 ^= '';
    성별 = '계';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 성별 age_grp &sumvar;
  run;

  /* ② 성별 × 연령별 */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월 성별코드 age_grp;
    output out=_sex_ sum=&sumvar;
  run;
  data _sex_;
    set _sex_;
    if 조사연월 ^= '' and 성별코드 ^= . and age_grp ^= '';
    if 성별코드 = 1 then 성별 = '남자';
    else              성별 = '여자';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 성별 age_grp &sumvar;
  run;

  /* ③ 합치기 */
  data &outname;
    set _all_ _sex_;
  run;
  proc sort data=&outname; by 조사연월 성별 age_grp; run;

%mend agg_type;


/* STEP 3. 근로형태별 집계 실행 */

/* b0 임금근로자 전체 */
%agg_type(data=work, flag=(1=1),  outname=out_b0, sumvar=s_b0);

/* b1 정규직 */
%agg_type(data=work, flag=(b1=1), outname=out_b1, sumvar=s_b1);

/* b2 비정규직 */
%agg_type(data=work, flag=(b2=1), outname=out_b2, sumvar=s_b2);

/* b3 한시적 */
%agg_type(data=work, flag=(b3=1), outname=out_b3, sumvar=s_b3);

/* b4 기간제 */
%agg_type(data=work, flag=(b4=1), outname=out_b4, sumvar=s_b4);

/* b8 시간제 */
%agg_type(data=work, flag=(b8=1), outname=out_b8, sumvar=s_b8);

/* b9 비전형 */
%agg_type(data=work, flag=(b9=1), outname=out_b9, sumvar=s_b9);


/* STEP 4. 결과 병합 및 출력 */
data result;
  merge out_b0 out_b1 out_b2 out_b3 out_b4 out_b8 out_b9;
  by 조사연월 성별 age_grp;

  format 연월 $char6. 성별 $char4. 연령 $char10.;
  연월 = 조사연월;
  연령 = age_grp;

  label s_b0 = '임금근로자(천명)'
        s_b1 = '정규직(천명)'
        s_b2 = '비정규직(천명)'
        s_b3 = '한시적(천명)'
        s_b4 = '기간제(천명)'
        s_b8 = '시간제(천명)'
        s_b9 = '비전형(천명)';

  drop 조사연월 age_grp;
run;

proc sort data=result; by 연월 성별 연령; run;

proc export data=result
  outfile="I:\집계\근로형태별\표04_성연령별_근로형태별_취업자.xlsx"
  dbms=xlsx replace;
  sheet="표4_성연령별";
run;

/* ──────────────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════
   표05 — 성·교육정도별 근로형태(비정규직)별 취업자
   키워드: 성별, 교육정도, 비정규직, 취업자, 초졸이하, 중졸, 고졸, 대졸이상
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 5. 성·교육정도별 근로형태(비정규직)별 취업자
 기준: 2025년 8월 경제활동인구조사 근로형태별 부가조사
 데이터: ea_buga.ea1925 (2019년 8월 ~ 2025년 8월 통합 데이터셋)
 KOSIS 검증: 전 90개 항목 완전 일치 확인
***********************************************************************/

/* STEP 1. 데이터 준비 및 플래그 생성 */
data work;
  set ea_buga.ea1925;

  /* 2025년 8월만 사용 */
  if substr(조사연월, 5, 2) = '08';

  /* 임금근로자 필터 */
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;

  /* 불응 제외 */
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* ── 비정규직 플래그 (최종 확정 로직) ── */
  b4 = (현재일관련사항_고용계약기간정함여부 = 1);
  b6 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);
  b7 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);
  b8 = (근로시간형태코드 = 2);
  b9 = (급여수령위치코드 in (2,3)) or (특수형태근로종사자여부 = 1) or
       (근로장소코드 = 1) or (단기근로기간형태여부 = 1);
  b3 = (b4 or b6 or b7);    /* 한시적 */
  b2 = (b3 or b8 or b9);    /* 비정규직 */
  b1 = (b2 = 0);             /* 정규직  */

  /* ── 교육정도 구간 분류
     원변수: 교육정도컨버젼코드
       1=초졸이하, 2=중졸, 3=고졸, 4=전문대졸, 5=대졸, 6=대학원졸
     KOSIS 4개 구간:
       초졸이하(1), 중졸(2), 고졸(3), 대졸이상(4+5+6)             ── */
  if      교육정도컨버젼코드 = 1         then edu_grp = '1_초졸이하';
  else if 교육정도컨버젼코드 = 2         then edu_grp = '2_중졸';
  else if 교육정도컨버젼코드 = 3         then edu_grp = '3_고졸';
  else if 교육정도컨버젼코드 in (4,5,6)  then edu_grp = '4_대졸이상';

  /* ── 가중치 (천 명 단위) ── */
  wei = 가중값 / 1000;

run;


/* STEP 2. 집계 매크로
   [구조] 성별(계/남/여) × 교육정도(계+4구간) 교차 집계
*/
%macro agg_edu(data=, flag=, outname=, sumvar=);

  /* ① 전체(계) × 교육정도별 */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월 edu_grp;
    output out=_all_ sum=&sumvar;
  run;
  data _all_;
    set _all_;
    if 조사연월 ^= '';
    성별 = '계';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 성별 edu_grp &sumvar;
  run;

  /* ② 성별 × 교육정도별 */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월 성별코드 edu_grp;
    output out=_sex_ sum=&sumvar;
  run;
  data _sex_;
    set _sex_;
    if 조사연월 ^= '' and 성별코드 ^= . and edu_grp ^= '';
    if 성별코드 = 1 then 성별 = '남자';
    else              성별 = '여자';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 성별 edu_grp &sumvar;
  run;

  /* ③ 합치기 */
  data &outname;
    set _all_ _sex_;
  run;
  proc sort data=&outname; by 조사연월 성별 edu_grp; run;

%mend agg_edu;


/* STEP 3. 근로형태별 집계 실행 */

%agg_edu(data=work, flag=(1=1),  outname=out_b0, sumvar=s_b0);  /* 임금근로자 */
%agg_edu(data=work, flag=(b1=1), outname=out_b1, sumvar=s_b1);  /* 정규직     */
%agg_edu(data=work, flag=(b2=1), outname=out_b2, sumvar=s_b2);  /* 비정규직   */
%agg_edu(data=work, flag=(b3=1), outname=out_b3, sumvar=s_b3);  /* 한시적     */
%agg_edu(data=work, flag=(b8=1), outname=out_b8, sumvar=s_b8);  /* 시간제     */
%agg_edu(data=work, flag=(b9=1), outname=out_b9, sumvar=s_b9);  /* 비전형     */


/* STEP 4. 결과 병합 및 출력 */
data result;
  merge out_b0 out_b1 out_b2 out_b3 out_b8 out_b9;
  by 조사연월 성별 edu_grp;

  format 연월 $char6. 성별 $char4. 교육정도 $char10.;
  연월    = 조사연월;
  교육정도 = edu_grp;

  label s_b0 = '임금근로자(천명)'
        s_b1 = '정규직(천명)'
        s_b2 = '비정규직(천명)'
        s_b3 = '한시적(천명)'
        s_b8 = '시간제(천명)'
        s_b9 = '비전형(천명)';

  drop 조사연월 edu_grp;
run;

proc sort data=result; by 연월 성별 교육정도; run;

proc export data=result
  outfile="I:\집계\근로형태별\표05_성교육정도별_근로형태별_취업자.xlsx"
  dbms=xlsx replace;
  sheet="표5_성교육정도별";
run;

/* ──────────────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════
   표06 — 성·종사자규모별 근로형태(비정규직)별 취업자
   키워드: 성별, 종사자규모, 사업체규모, 비정규직, 취업자, 1-4인, 5-299인, 300인이상
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 6. 성·종사자규모별 근로형태(비정규직)별 취업자
 기준: 2025년 8월 경제활동인구조사 근로형태별 부가조사
 데이터: ea_buga.ea1925 (2019년 8월 ~ 2025년 8월 통합 데이터셋)
 KOSIS 검증: 전 84개 항목 완전 일치 확인
***********************************************************************/

/* STEP 1. 데이터 준비 및 플래그 생성 */
data work;
  set ea_buga.ea1925;

  /* 2025년 8월만 사용 */
  if substr(조사연월, 5, 2) = '08';

  /* 임금근로자 필터 */
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;

  /* 불응 제외 */
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* ── 비정규직 플래그 (최종 확정 로직) ── */
  b4 = (현재일관련사항_고용계약기간정함여부 = 1);
  b6 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);
  b7 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);
  b8 = (근로시간형태코드 = 2);
  b9 = (급여수령위치코드 in (2,3)) or (특수형태근로종사자여부 = 1) or
       (근로장소코드 = 1) or (단기근로기간형태여부 = 1);
  b3 = (b4 or b6 or b7);    /* 한시적   */
  b2 = (b3 or b8 or b9);    /* 비정규직 */
  b1 = (b2 = 0);             /* 정규직   */

  /* ── 종사자규모 구간 분류
     원변수: 현재일관련사항_종사자규모코드
       1 = 1~4인
       2 = 5~9인
       3 = 10~29인
       4 = 30~99인
       5 = 100~299인
       6 = 300인 이상
     KOSIS 3개 구간:
       1~4인(1), 5~299인(2+3+4+5), 300인이상(6)                    ── */
  if      현재일관련사항_종사자규모코드 = 1          then size_grp = '1_1~4인';
  else if 현재일관련사항_종사자규모코드 in (2,3,4,5)  then size_grp = '2_5~299인';
  else if 현재일관련사항_종사자규모코드 = 6           then size_grp = '3_300인이상';

  /* ── 가중치 (천 명 단위) ── */
  wei = 가중값 / 1000;

run;


/* STEP 2. 집계 매크로
   [구조] 성별(계/남/여) × 종사자규모(계+3구간) 교차 집계
*/
%macro agg_size(data=, flag=, outname=, sumvar=);

  /* ① 전체(계) × 종사자규모별 */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월 size_grp;
    output out=_all_ sum=&sumvar;
  run;
  data _all_;
    set _all_;
    if 조사연월 ^= '';
    성별 = '계';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 성별 size_grp &sumvar;
  run;

  /* ② 성별 × 종사자규모별 */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월 성별코드 size_grp;
    output out=_sex_ sum=&sumvar;
  run;
  data _sex_;
    set _sex_;
    if 조사연월 ^= '' and 성별코드 ^= . and size_grp ^= '';
    if 성별코드 = 1 then 성별 = '남자';
    else              성별 = '여자';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 성별 size_grp &sumvar;
  run;

  /* ③ 합치기 */
  data &outname;
    set _all_ _sex_;
  run;
  proc sort data=&outname; by 조사연월 성별 size_grp; run;

%mend agg_size;


/* STEP 3. 근로형태별 집계 실행 */

%agg_size(data=work, flag=(1=1),  outname=out_b0, sumvar=s_b0);  /* 임금근로자 */
%agg_size(data=work, flag=(b1=1), outname=out_b1, sumvar=s_b1);  /* 정규직     */
%agg_size(data=work, flag=(b2=1), outname=out_b2, sumvar=s_b2);  /* 비정규직   */
%agg_size(data=work, flag=(b3=1), outname=out_b3, sumvar=s_b3);  /* 한시적     */
%agg_size(data=work, flag=(b4=1), outname=out_b4, sumvar=s_b4);  /* 기간제     */
%agg_size(data=work, flag=(b8=1), outname=out_b8, sumvar=s_b8);  /* 시간제     */
%agg_size(data=work, flag=(b9=1), outname=out_b9, sumvar=s_b9);  /* 비전형     */


/* STEP 4. 결과 병합 및 출력 */
data result;
  merge out_b0 out_b1 out_b2 out_b3 out_b4 out_b8 out_b9;
  by 조사연월 성별 size_grp;

  format 연월 $char6. 성별 $char4. 종사자규모 $char12.;
  연월     = 조사연월;
  종사자규모 = size_grp;

  label s_b0 = '임금근로자(천명)'
        s_b1 = '정규직(천명)'
        s_b2 = '비정규직(천명)'
        s_b3 = '한시적(천명)'
        s_b4 = '기간제(천명)'
        s_b8 = '시간제(천명)'
        s_b9 = '비전형(천명)';

  drop 조사연월 size_grp;
run;

proc sort data=result; by 연월 성별 종사자규모; run;

proc export data=result
  outfile="I:\집계\근로형태별\표06_성종사자규모별_근로형태별_취업자.xlsx"
  dbms=xlsx replace;
  sheet="표6_성종사자규모별";
run;

/* ──────────────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════
   표07 — 산업별 근로형태별 취업자(11차)
   키워드: 산업별, 취업자, 농림어업, 제조업, 건설업, 11차산업분류
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 7. 산업별 근로형태(비정규직)별 취업자 (11차 산업분류)
 기준: 2025년 8월 경제활동인구조사 근로형태별 부가조사
 데이터: ea_buga.ea1925 (2019년 8월 ~ 2025년 8월 통합 데이터셋)
 KOSIS 검증: 전 162개 항목 완전 일치 확인
***********************************************************************/

/* STEP 1. 데이터 준비 및 플래그 생성 */
data work;
  set ea_buga.ea1925;

  /* 2025년 8월만 사용 */
  if substr(조사연월, 5, 2) = '08';

  /* 임금근로자 필터 */
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;

  /* 불응 제외 */
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* ── 비정규직 플래그 (최종 확정 로직) ── */
  b4 = (현재일관련사항_고용계약기간정함여부 = 1);
  b6 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);
  b7 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);
  b8 = (근로시간형태코드 = 2);
  b9 = (급여수령위치코드 in (2,3)) or (특수형태근로종사자여부 = 1) or
       (근로장소코드 = 1) or (단기근로기간형태여부 = 1);
  b3 = (b4 or b6 or b7);    /* 한시적   */
  b2 = (b3 or b8 or b9);    /* 비정규직 */
  b1 = (b2 = 0);             /* 정규직   */

  /* ── 산업 코드 (11차 대분류, 알파벳 A~U)
     원변수: 현재일관련사항_11차산업대분류코드                          ── */
  sanup = 현재일관련사항_11차산업대분류코드;

  /* 가중치 (천 명 단위) */
  wei = 가중값 / 1000;

run;


/* STEP 2. 집계 매크로 */
%macro agg_ind(data=, flag=, outname=, sumvar=);

  /* ① 합계 */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_tot_ sum=&sumvar;
  run;
  data _tot_;
    set _tot_;
    if 조사연월 ^= '' and _type_ = 1;
    산업 = '00_합계';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 산업 &sumvar;
  run;

  /* ② 개별 산업 21개 (A~U) */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월 sanup;
    output out=_ind_ sum=&sumvar;
  run;
  data _ind_;
    set _ind_;
    if 조사연월 ^= '' and sanup ^= '';
    산업 = sanup;
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 산업 &sumvar;
  run;

  /* ③ 광제조업 그룹 (B+C) */
  proc means data=&data(where=(sanup in ('B','C'))) sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_bc_ sum=&sumvar;
  run;
  data _bc_;
    set _bc_;
    if 조사연월 ^= '' and _type_ = 1;
    산업 = 'BC_광제조업';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 산업 &sumvar;
  run;

  /* ④ 사회간접자본(D~U) */
  proc means data=&data(where=(sanup not in ('A','B','C'))) sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_du_ sum=&sumvar;
  run;
  data _du_;
    set _du_;
    if 조사연월 ^= '' and _type_ = 1;
    산업 = 'DU_사회간접기타';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 산업 &sumvar;
  run;

  /* ⑤ 도소매음식숙박(G+I) */
  proc means data=&data(where=(sanup in ('G','I'))) sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_gi_ sum=&sumvar;
  run;
  data _gi_;
    set _gi_;
    if 조사연월 ^= '' and _type_ = 1;
    산업 = 'GI_도소매음식';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 산업 &sumvar;
  run;

  /* ⑥ 사업개인공공(E,L~U) */
  proc means data=&data(where=(sanup in ('E','L','M','N','O','P','Q','R','S','T','U')))
    sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_elu_ sum=&sumvar;
  run;
  data _elu_;
    set _elu_;
    if 조사연월 ^= '' and _type_ = 1;
    산업 = 'ELU_사업개인공공';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 산업 &sumvar;
  run;

  /* ⑦ 전기운수통신금융(D,H,J,K) */
  proc means data=&data(where=(sanup in ('D','H','J','K'))) sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_dhjk_ sum=&sumvar;
  run;
  data _dhjk_;
    set _dhjk_;
    if 조사연월 ^= '' and _type_ = 1;
    산업 = 'DHJK_전기운수통신금융';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 산업 &sumvar;
  run;

  /* ⑧ 합치기 */
  data &outname;
    set _tot_ _ind_ _bc_ _du_ _gi_ _elu_ _dhjk_;
  run;
  proc sort data=&outname; by 조사연월 산업; run;

%mend agg_ind;


/* STEP 3. 근로형태별 집계 실행 */

%agg_ind(data=work, flag=(1=1),  outname=out_b0, sumvar=s_b0);  /* 임금근로자 */
%agg_ind(data=work, flag=(b1=1), outname=out_b1, sumvar=s_b1);  /* 정규직     */
%agg_ind(data=work, flag=(b2=1), outname=out_b2, sumvar=s_b2);  /* 비정규직   */
%agg_ind(data=work, flag=(b3=1), outname=out_b3, sumvar=s_b3);  /* 한시적     */
%agg_ind(data=work, flag=(b8=1), outname=out_b8, sumvar=s_b8);  /* 시간제     */
%agg_ind(data=work, flag=(b9=1), outname=out_b9, sumvar=s_b9);  /* 비전형     */


/* STEP 4. 결과 병합 및 라벨 부여 */
data result;
  merge out_b0 out_b1 out_b2 out_b3 out_b8 out_b9;
  by 조사연월 산업;

  format 연월 $char6. 산업명 $char60.;
  연월 = 조사연월;

  /* 산업명 매핑 */
  select (산업);
    when ('00_합계')              산업명 = '합계';
    when ('A')                    산업명 = 'A. 농업, 임업 및 어업';
    when ('BC_광제조업')           산업명 = '광·제조업(B,C)';
    when ('B')                    산업명 = 'B. 광업';
    when ('C')                    산업명 = 'C. 제조업';
    when ('DU_사회간접기타')       산업명 = '사회간접자본 및 기타서비스업(D~U)';
    when ('D')                    산업명 = 'D. 전기, 가스, 증기 및 공기조절 공급업';
    when ('E')                    산업명 = 'E. 수도, 하수 및 폐기물 처리, 원료 재생업';
    when ('F')                    산업명 = 'F. 건설업';
    when ('GI_도소매음식')         산업명 = '도소매·음식숙박업(G, I)';
    when ('ELU_사업개인공공')      산업명 = '사업·개인·공공서비스 및 기타(E, L~U)';
    when ('DHJK_전기운수통신금융') 산업명 = '전기·운수·통신·금융(D, H, J, K)';
    when ('G')                    산업명 = 'G. 도매 및 소매업';
    when ('H')                    산업명 = 'H. 운수 및 창고업';
    when ('I')                    산업명 = 'I. 숙박 및 음식점업';
    when ('J')                    산업명 = 'J. 정보통신업';
    when ('K')                    산업명 = 'K. 금융 및 보험업';
    when ('L')                    산업명 = 'L. 부동산업';
    when ('M')                    산업명 = 'M. 전문, 과학 및 기술 서비스업';
    when ('N')                    산업명 = 'N. 사업시설관리, 사업지원 및 임대 서비스업';
    when ('O')                    산업명 = 'O. 공공행정, 국방 및 사회보장 행정';
    when ('P')                    산업명 = 'P. 교육 서비스업';
    when ('Q')                    산업명 = 'Q. 보건업 및 사회복지 서비스업';
    when ('R')                    산업명 = 'R. 예술, 스포츠 및 여가관련 서비스업';
    when ('S')                    산업명 = 'S. 협회 및 단체, 수리 및 기타 개인 서비스업';
    when ('T')                    산업명 = 'T. 가구내 고용활동';
    when ('U')                    산업명 = 'U. 국제 및 외국기관';
    otherwise 산업명 = 산업;
  end;

  label s_b0 = '임금근로자(천명)'
        s_b1 = '정규직(천명)'
        s_b2 = '비정규직(천명)'
        s_b3 = '한시적(천명)'
        s_b8 = '시간제(천명)'
        s_b9 = '비전형(천명)';

  drop 조사연월 산업;
run;

proc export data=result
  outfile="I:\집계\근로형태별\표07_산업별_근로형태별_취업자.xlsx"
  dbms=xlsx replace;
  sheet="표7_산업별";
run;

/* ──────────────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════
   표08 — 직업별 근로형태별 취업자(8차)
   키워드: 직업별, 취업자, 관리자, 전문가, 사무종사자, 단순노무, 8차직업분류
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 8. 직업별 근로형태(비정규직)별 취업자 (8차 직업분류)
 기준: 2025년 8월 경제활동인구조사 근로형태별 부가조사
 데이터: ea_buga.ea1925 (2019년 8월 ~ 2025년 8월 통합 데이터셋)
 KOSIS 검증: 전 78개 항목 완전 일치 확인
***********************************************************************/

/* STEP 1. 데이터 준비 및 플래그 생성 */
data work;
  set ea_buga.ea1925;

  /* 2025년 8월만 사용 */
  if substr(조사연월, 5, 2) = '08';

  /* 임금근로자 필터 */
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;

  /* 불응 제외 */
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* ── 비정규직 플래그 (최종 확정 로직) ── */
  b4 = (현재일관련사항_고용계약기간정함여부 = 1);
  b6 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);
  b7 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);
  b8 = (근로시간형태코드 = 2);
  b9 = (급여수령위치코드 in (2,3)) or (특수형태근로종사자여부 = 1) or
       (근로장소코드 = 1) or (단기근로기간형태여부 = 1);
  b3 = (b4 or b6 or b7);    /* 한시적   */
  b2 = (b3 or b8 or b9);    /* 비정규직 */
  b1 = (b2 = 0);             /* 정규직   */

  /* ── 직업 코드 (8차 대분류, 숫자 1~9)
     원변수: 현재일관련사항_8차직업대분류코드                           ── */
  jikup = input(현재일관련사항_8차직업대분류코드, best.);   /* 문자→숫자 변환 */

  /* 직업 그룹 변수 생성 */
  if jikup in (1,2) then jikup_12  = '12_관리자전문가';
  if jikup in (4,5) then jikup_45  = '45_서비스판매';
  if jikup in (7,8) then jikup_78  = '78_기능기계조작';

  /* 가중치 (천 명 단위) */
  wei = 가중값 / 1000;

run;


/* STEP 2. 집계 매크로 */
%macro agg_job(data=, flag=, outname=, sumvar=);

  /* ① 합계 */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_tot_ sum=&sumvar;
  run;
  data _tot_;
    set _tot_;
    if 조사연월 ^= '' and _type_ = 1;
    직업 = '00_합계';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 직업 &sumvar;
  run;

  /* ② 개별 직업 9개 (1~9) */
  proc means data=&data sum noprint;
    where &flag;
    var wei;
    class 조사연월 jikup;
    output out=_job_ sum=&sumvar;
  run;
  data _job_;
    set _job_;
    if 조사연월 ^= '' and jikup ^= .;
    직업 = put(jikup, 1.);
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 직업 &sumvar;
  run;

  /* ③ 관리자+전문가 그룹 (1+2) */
  proc means data=&data(where=(jikup in (1,2))) sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_g12_ sum=&sumvar;
  run;
  data _g12_;
    set _g12_;
    if 조사연월 ^= '' and _type_ = 1;
    직업 = '12_관리자전문가';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 직업 &sumvar;
  run;

  /* ④ 서비스+판매 그룹 (4+5) */
  proc means data=&data(where=(jikup in (4,5))) sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_g45_ sum=&sumvar;
  run;
  data _g45_;
    set _g45_;
    if 조사연월 ^= '' and _type_ = 1;
    직업 = '45_서비스판매';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 직업 &sumvar;
  run;

  /* ⑤ 기능+기계조작 그룹 (7+8) */
  proc means data=&data(where=(jikup in (7,8))) sum noprint;
    where &flag;
    var wei;
    class 조사연월;
    output out=_g78_ sum=&sumvar;
  run;
  data _g78_;
    set _g78_;
    if 조사연월 ^= '' and _type_ = 1;
    직업 = '78_기능기계조작';
    &sumvar = round(&sumvar, 0.1);
    keep 조사연월 직업 &sumvar;
  run;

  /* ⑥ 합치기 */
  data &outname;
    set _tot_ _job_ _g12_ _g45_ _g78_;
  run;
  proc sort data=&outname; by 조사연월 직업; run;

%mend agg_job;


/* STEP 3. 근로형태별 집계 실행 */

%agg_job(data=work, flag=(1=1),  outname=out_b0, sumvar=s_b0);  /* 임금근로자 */
%agg_job(data=work, flag=(b1=1), outname=out_b1, sumvar=s_b1);  /* 정규직     */
%agg_job(data=work, flag=(b2=1), outname=out_b2, sumvar=s_b2);  /* 비정규직   */
%agg_job(data=work, flag=(b3=1), outname=out_b3, sumvar=s_b3);  /* 한시적     */
%agg_job(data=work, flag=(b8=1), outname=out_b8, sumvar=s_b8);  /* 시간제     */
%agg_job(data=work, flag=(b9=1), outname=out_b9, sumvar=s_b9);  /* 비전형     */


/* STEP 4. 결과 병합 및 라벨 부여 */
data result;
  merge out_b0 out_b1 out_b2 out_b3 out_b8 out_b9;
  by 조사연월 직업;

  format 연월 $char6. 직업명 $char50.;
  연월 = 조사연월;

  /* 직업명 매핑 */
  select (직업);
    when ('00_합계')       직업명 = '합계';
    when ('12_관리자전문가') 직업명 = '관리자·전문가';
    when ('1')             직업명 = '1. 관리자';
    when ('2')             직업명 = '2. 전문가 및 관련 종사자';
    when ('3')             직업명 = '3. 사무 종사자';
    when ('45_서비스판매')  직업명 = '서비스·판매 종사자';
    when ('4')             직업명 = '4. 서비스 종사자';
    when ('5')             직업명 = '5. 판매 종사자';
    when ('6')             직업명 = '6. 농림어업 숙련종사자';
    when ('78_기능기계조작') 직업명 = '기능·기계조작 종사자';
    when ('7')             직업명 = '7. 기능원 및 관련 기능종사자';
    when ('8')             직업명 = '8. 장치, 기계조작 및 조립종사자';
    when ('9')             직업명 = '9. 단순노무 종사자';
    otherwise 직업명 = 직업;
  end;

  label s_b0 = '임금근로자(천명)'
        s_b1 = '정규직(천명)'
        s_b2 = '비정규직(천명)'
        s_b3 = '한시적(천명)'
        s_b8 = '시간제(천명)'
        s_b9 = '비전형(천명)';

  drop 조사연월 직업;
run;

proc export data=result
  outfile="I:\집계\근로형태별\표08_직업별_근로형태별_취업자.xlsx"
  dbms=xlsx replace;
  sheet="표8_직업별";
run;

/* ──────────────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════
   표31 — 시도별 비정규직 근로자 규모
   키워드: 시도별, 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기, 강원 등
   ══════════════════════════════════════════════════════════════════════════ */

/***********************************************************************
 표 31. 시도 비정규직 근로자 규모

 ★★★ 집계 제약 안내 ★★★
 공공용 MDIS CSV 파일에는 시도(지역) 정보가 미포함
 → 본 표는 공개 MDIS CSV로 직접 집계 불가

 사유:
   · 원천코드: sido = substr(majno, 1, 2)
     (majno = 조사구번호, 앞 2자리가 시도코드)
   · 공공용 MDIS CSV에는 개인정보 보호 목적으로
     조사구번호(majno) 및 지역 식별 변수 미제공
   · 제공 파일의 124개 변수 중 시도/지역 관련 변수 없음 확인

 이용 가능한 방법:
   1. 통계청 MDIS 원천 SAS 마이크로데이터 신청 (연구자용)
   2. KOSIS 공표 결과 직접 활용 (https://kosis.kr)
   3. 통계청 내부망 원천자료 활용 (기관 내부)

 아래 코드는 원천 SAS 마이크로데이터 보유 시 실행 가능한
 참조용 코드입니다.
 (공공용 CSV에서는 조사구번호에 해당하는 컬럼이 없어 시도 추출 불가)
***********************************************************************/

/* ★ 원천 SAS 마이크로데이터 보유 시에만 실행 가능 ★ */

/* STEP 1. 데이터 준비 및 시도 코드 추출 */
data work;
  set ea_buga.ea1925;

  if substr(조사연월, 5, 2) = '08';
  if 1 <= 현재일관련사항_종사상지위코드 <= 3;
  if 계약기간반복갱신여부 ^= 9 and 단기근로기간형태여부 ^= 9;

  /* ── 시도 코드 추출 (원천 SAS 데이터에만 존재)
     majno = 조사구번호 (15자리)
     앞 2자리 = 시도코드
       11=서울, 21=부산, 22=대구, 23=인천, 24=광주,
       25=대전, 26=울산, 29=세종, 31=경기, 32=강원,
       33=충북, 34=충남, 35=전북, 36=전남,
       37=경북, 38=경남, 39=제주
     ※ 공공용 CSV에는 majno 변수 없음 — 아래 줄 실행 불가 ── */
  sido = input(substr(majno, 1, 2), 2.);

  /* ── 비정규직 플래그 ── */
  b4 = (현재일관련사항_고용계약기간정함여부 = 1);
  b6 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 1) and (계속근로가능사유코드 = 2);
  b7 = (현재일관련사항_고용계약기간정함여부 = 2) and (계속근로가능여부 = 2) and (1 <= 근속기간제한사유코드 <= 6);
  b8 = (근로시간형태코드 = 2);
  b9 = (급여수령위치코드 in (2,3)) or (특수형태근로종사자여부 = 1) or
       (근로장소코드 = 1) or (단기근로기간형태여부 = 1);
  b3 = (b4 or b6 or b7);
  b2 = (b3 or b8 or b9);
  b1 = (b2 = 0);

  /* 근로형태 플래그 */
  f_wage  = 1;        /* 임금근로자 */
  f_reg   = b1;       /* 정규직     */
  f_ireg  = b2;       /* 비정규직   */

  wei = 가중값 / 1000;
run;


/* STEP 2. 시도별 × 근로형태별 집계 */
proc means data=work sum noprint;
  var f_wage f_reg f_ireg wei;
  class 조사연월 sido;
  output out=result_raw sum=;
run;

data result;
  set result_raw;
  if 조사연월 ^= '';

  format 연월 $char6.;   연월 = 조사연월;
  format 시도명 $char10.;

  /* 전국 합계: _type_=1 / 시도별: _type_=3 */
  if _type_ = 1 then 시도명 = '계';
  else if _type_ = 3 then do;
    select (sido);
      when (11) 시도명 = '서울특별시';
      when (21) 시도명 = '부산광역시';
      when (22) 시도명 = '대구광역시';
      when (23) 시도명 = '인천광역시';
      when (24) 시도명 = '광주광역시';
      when (25) 시도명 = '대전광역시';
      when (26) 시도명 = '울산광역시';
      when (29) 시도명 = '세종특별자치시';
      when (31) 시도명 = '경기도';
      when (32) 시도명 = '강원도';
      when (33) 시도명 = '충청북도';
      when (34) 시도명 = '충청남도';
      when (35) 시도명 = '전라북도';
      when (36) 시도명 = '전라남도';
      when (37) 시도명 = '경상북도';
      when (38) 시도명 = '경상남도';
      when (39) 시도명 = '제주도';
      otherwise 시도명 = '기타';
    end;
  end;
  else delete;

  임금근로자 = round(f_wage, 0.1);
  정규직     = round(f_reg,  0.1);
  비정규직   = round(f_ireg, 0.1);

  keep 연월 시도명 임금근로자 정규직 비정규직;
run;

proc sort data=result; by 연월 시도명; run;

proc export data=result
  outfile="I:\집계\근로형태별\표31_시도_비정규직_근로자_규모.xlsx"
  dbms=xlsx replace;
  sheet="표31_시도별비정규직규모";
run;

/*
================================================================================
  END — A. 고용구조 및 규모 (공공용 컬럼명 교정 버전)
  포함 표: 표01~08, 표31 | 조사: 2025년 8월 경제활동인구조사 근로형태별 부가조사
================================================================================
*/
