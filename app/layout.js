import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

export const metadata = {
  title: 'KOSIS Fact | 청년층 부가조사 마이크로데이터 분석 플랫폼',
  description: '통계청 MDIS 청년층 경제활동인구 부가조사 데이터를 직접 집계하고, 뉴스 보도의 통계 수치를 자동 팩트체크합니다.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KOSIS Fact',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3182f6" />
      </head>
      <body>{children}</body>
    </html>
  );
}
