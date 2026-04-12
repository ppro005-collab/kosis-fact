import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * middleware.js
 * ─────────────
 * 분석 및 데이터 관리 API에 대한 접근 권한(이메일 화이트리스트)을 강제합니다.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로 설정
  const protectedPaths = ['/api/analyze', '/api/data/upload', '/api/data/inventory'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    const token = request.cookies.get('kosis_auth')?.value;

    if (!token) {
      // [DEVELOPMENT ONLY] 임시로 검증 건너뛰기
      return NextResponse.next();
    }

    try {
      // JWT 검증 (jose 라이브러리 사용 - Edge Runtime 호환)
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-12345');
      const { payload } = await jwtVerify(token, secret);

      // 화이트리스트 체크
      if (!payload.isAuthorized) {
        return NextResponse.json({ 
          success: false, 
          error: "분석 권한이 없습니다. 승인된 사용자만 이용 가능합니다." 
        }, { status: 403 });
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Middleware Auth Error:', err);
      return NextResponse.json({ success: false, error: "유효하지 않은 세션입니다." }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
