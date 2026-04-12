import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

/**
 * api/auth/session/route.js
 * ─────────────
 * 현재 브라우저의 JWT 세션을 검증하고 사용자 정보 및 권한 상태를 반환합니다.
 */
export async function GET(request) {
  const token = request.cookies.get('kosis_auth')?.value;

  if (!token) {
    // [DEVELOPMENT ONLY] 로컬 개발 시 카카오 로그인 패스 및 자동 승인
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        authenticated: true, 
        email: 'dev@local.local', 
        name: '로컬 최고 관리자', 
        role: 'super_admin', 
        isAuthorized: true,
        approved: 1
      });
    }
    return NextResponse.json({ authenticated: false, role: 'user' });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-12345');
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      authenticated: true,
      email: payload.email,
      name: payload.name,
      role: payload.role || (payload.isAuthorized ? 'super_admin' : 'user'),
      isAuthorized: payload.isAuthorized,
      approved: payload.approved || (payload.isAuthorized ? 1 : 0)
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, role: 'user' });
  }
}
