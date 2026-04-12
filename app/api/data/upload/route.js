import { NextResponse } from 'next/server';
import { StorageProvider } from '@/lib/storage.js';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: '파일이 없습니다.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;

    // ─── 지능형 중복 파일 정리 (v7.9 Auto-Cleanup) ─────────────────
    const files = await StorageProvider.listFiles();
    const yearMatch = fileName.match(/\d{4}/);
    
    if (yearMatch) {
      const year = yearMatch[0];
      const surveyPrefix = fileName.split('_')[0]; 
      
      for (const f of files) {
        if (f !== fileName && f.includes(year)) {
          if (f.startsWith(surveyPrefix) || !isNaN(f.replace('.csv', ''))) {
            try {
              await StorageProvider.deleteFile(f);
              console.log(`[Cleanup] Deleted redundant file: ${f}`);
            } catch (e) {
              console.error(`[Cleanup] Failed to delete ${f}:`, e);
            }
          }
        }
      }
    }

    await StorageProvider.writeFile(fileName, buffer);

    return NextResponse.json({ 
      success: true, 
      message: `${fileName} 파일이 성공적으로 업로드되었습니다.`
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
