import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * api/auth/kakao/route.js
 * ──────────────
 * 실제 카카오 로그인을 처리하고 보안 화이트리스트 및 DB 기반 승인을 처리합니다.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const origin = new URL(request.url).origin;

  if (!code) {
    return NextResponse.json({ success: false, error: "Authorization code not found" }, { status: 400 });
  }

  try {
    // 1. 토큰 교환 (Vercel 환경 변수 필요)
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID || 'a6cc7aa688eb60b7a2c507a54bffbaaf', 
        client_secret: process.env.KAKAO_CLIENT_SECRET || '', 
        redirect_uri: `${origin}/api/auth/kakao`,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error_description || 'Token error');

    // 2. 사용자 정보 가져오기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();
    const email = userData.kakao_account?.email;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email permission required" }, { status: 403 });
    }

    // 3. 화이트리스트(보안 잠금) 및 DB 연동
    const masterEmails = (process.env.MASTER_EMAILS || 'ppro005@naver.com').split(',').map(e => e.trim());
    const isMaster = masterEmails.includes(email);
    const nickname = userData.properties?.nickname || email.split('@')[0];

    // DB 유저 싱크
    let userRecord = null;
    try {
      userRecord = await db.prepare('SELECT * FROM users WHERE userId = ?').get(email);
      
      if (isMaster) {
        if (userRecord) {
          // 마스터 계정 무조건 승인 및 권한 부여
          await db.prepare('UPDATE users SET role = ?, approved = ? WHERE userId = ?').run('super_admin', 1, email);
          userRecord.role = 'super_admin';
          userRecord.approved = 1;
        } else {
          await db.prepare('INSERT INTO users (userId, password, role, name, approved) VALUES (?, ?, ?, ?, ?)').run(email, 'oauth', 'super_admin', nickname, 1);
          userRecord = { userId: email, role: 'super_admin', approved: 1, name: nickname };
        }
      } else {
        if (!userRecord) {
          // 일반 유저 신규 가입 (대기 상태)
          await db.prepare('INSERT INTO users (userId, password, role, name, approved) VALUES (?, ?, ?, ?, ?)').run(email, 'oauth', 'user', nickname, 0);
          userRecord = { userId: email, role: 'user', approved: 0, name: nickname };
        }
      }
    } catch (dbErr) {
      console.error('DB User Sync Error:', dbErr);
      userRecord = { userId: email, role: isMaster ? 'super_admin' : 'user', approved: isMaster ? 1 : 0, name: nickname };
    }

    const isAuthorized = userRecord.approved === 1;

    // 4. JWT 세션 생성 (DB 상태 포함)
    const token = jwt.sign(
      { 
        email, 
        name: userRecord.name, 
        isAuthorized, 
        role: userRecord.role,
        approved: userRecord.approved 
      },
      process.env.JWT_SECRET || 'kosis-fact-2026-fighting',
      { expiresIn: '7d' }
    );

    // 5. 보안 쿠키 설정 및 리다이렉트
    const response = NextResponse.redirect(`${origin}/?login=success`);
    response.cookies.set('kosis_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    return response;

  } catch (error) {
    console.error('Kakao Auth Error:', error);
    return NextResponse.redirect(`${origin}/?login=error&message=${encodeURIComponent(error.message)}`);
  }
}
