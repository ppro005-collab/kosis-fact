import React from 'react';

/**
 * KakaoLoginButton
 * ───────────────
 * 사용자님의 Kakao REST API Key를 환경변수나 설정값에 넣으면 바로 작동합니다.
 */
export const KakaoLoginButton = ({ onLoading }) => {
  const KAKAO_CLIENT_ID = "a6cc7aa688eb60b7a2c507a54bffbaaf"; 
  const REDIRECT_URI = "https://kosis-fact.vercel.app/api/auth/kakao";
  
  const handleLogin = () => {
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
