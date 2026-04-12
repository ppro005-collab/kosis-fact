# 🚀 KOSIS Youth Employment Analytics - 상시 접속 배포 가이드

본 가이드는 PC를 꺼두어도 핸드폰이나 외부에서 상시 접속할 수 있는 환경을 구축하는 방법을 설명합니다.

## 1. 사전 준비물
- [GitHub](https://github.com/) 계정 및 새 리포지토리 생성
- [Vercel](https://vercel.com/) 계정 (GitHub 연동)
- [Kakao Developers](https://developers.kakao.com/) 애플리케이션 생성 (REST API 키, 보안 비밀키 필수)

## 2. GitHub에 소스 업로드
1.  PC의 `kosisfact` 폴더로 이동합니다.
2.  아래 명령어로 Git을 초기화하고 GitHub에 푸시합니다:
    ```bash
    git init
    git add .
    git commit -m "feat: Cloud ready persistent deploy with security lock"
    git branch -M main
    git remote add origin [나의-깃허브-주소]
    git push -u origin main
    ```

## 3. Vercel에서 배포 시작
1.  Vercel 대시보드에서 **[Add New...] -> [Project]**를 클릭합니다.
2.  생성한 GitHub 리포지토리를 **[Import]** 합니다.
3.  **Environment Variables** 섹션에 아래 항목들을 추가합니다:
    - `KAKAO_CLIENT_ID`: (카카오 REST API 키)
    - `KAKAO_CLIENT_SECRET`: (카카오 보안 비밀키)
    - `MASTER_EMAILS`: (나의 카카오 이메일, 예: me@kakao.com)
    - `JWT_SECRET`: (아무 긴 문자열)
    - `NEXT_PUBLIC_KAKAO_CLIENT_ID`: (카카오 REST API 키)

## 4. 데이터 영구 저장 (Supabase 권장)
- 현재 앱은 로컬 파일 기반입니다. Vercel 배포 후 업로드한 파일이 계속 보존되길 원하신다면, [Supabase](https://supabase.com/) 스토리지 생성 후 `SUPABASE_URL`, `SUPABASE_KEY`를 Vercel 환경 변수에 추가하면 됩니다. (제가 작성한 코드에 이미 대응되어 있습니다.)

## 5. 확인
- 배포가 완료되면 Vercel이 생성해준 `https://[프로젝트-이름].vercel.app` 주소로 접속하세요.
- 핸드폰에서 해당 주소로 이동하여 카카오 로그인을 하면, PC가 꺼져 있어도 자유롭게 분석이 가능합니다!

---

> [!TIP]
> **보안 알림**: 지정되지 않은 이메일로 로그인하면 분석 메뉴가 자동으로 잠깁니다. 반드시 `MASTER_EMAILS`에 등록된 이메일을 사용해 주세요.
