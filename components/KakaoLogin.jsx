import React from 'react';

/**
 * KakaoLoginButton
 * ───────────────
 * 사용자님의 Kakao REST API Key를 환경변수나 설정값에 넣으면 바로 작동합니다.
 */
export const KakaoLoginButton = ({ onLoading }) => {
  const KAKAO_CLIENT_ID = "YOUR_REST_API_KEY_HERE"; // 발급받은 REST API 키를 여기에 넣으세요
  const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/kakao` : '';
  
  const handleLogin = () => {
    if (KAKAO_CLIENT_ID === "YOUR_REST_API_KEY_HERE") {
      alert("카카오 개발자 센터에서 발급받은 REST API 키를 애플리케이션에 등록해야 합니다.\n(lib/kakaoService.js 또는 환경변수 설정)");
      return;
    }
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <button 
      onClick={handleLogin}
      className="flex items-center justify-center gap-2 w-full py-3 bg-[#FEE500] text-[#191919] rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
    >
      <img src="https://developers.kakao.com/assets/img/lib/logos/kakaologin/kakao_symbol.png" alt="k" className="w-5 h-5" />
      카카오로 1초 시작하기
    </button>
  );
};
