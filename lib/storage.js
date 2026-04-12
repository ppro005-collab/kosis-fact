import fs from 'fs';
import path from 'path';

/**
 * lib/storage.js
 * ──────────────
 * 로컬 파일 시스템(fs)과 클라우드 저장소(Supabase)를 선택적으로 사용하는
 * 통합 스토리지 라이브러리입니다.
 */

const IS_PROD = process.env.NODE_ENV === 'production';
const DATA_DIR = path.join(process.cwd(), 'data');

// 로컬 환경 초기화
if (!IS_PROD && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const StorageProvider = {
  /**
   * 파일 목록을 가져옵니다.
   */
  async listFiles() {
    if (IS_PROD && process.env.SUPABASE_URL) {
      // TODO: Supabase Storage API 연동
      // const { data, error } = await supabase.storage.from('datasets').list();
      return []; 
    } else {
      if (!fs.existsSync(DATA_DIR)) return [];
      return fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));
    }
  },

  /**
   * 파일의 버퍼(Buffer)를 읽어옵니다.
   */
  async readFile(fileName) {
    if (IS_PROD && process.env.SUPABASE_URL) {
      // const { data, error } = await supabase.storage.from('datasets').download(fileName);
      // return Buffer.from(await data.arrayBuffer());
      return null;
    } else {
      const filePath = path.join(DATA_DIR, fileName);
      if (!fs.existsSync(filePath)) throw new Error('File not found');
      return fs.readFileSync(filePath);
    }
  },

  /**
   * 파일을 저장합니다.
   */
  async writeFile(fileName, buffer) {
    if (IS_PROD && process.env.SUPABASE_URL) {
      // const { data, error } = await supabase.storage.from('datasets').upload(fileName, buffer);
    } else {
      const filePath = path.join(DATA_DIR, fileName);
      fs.writeFileSync(filePath, buffer);
    }
  },

  /**
   * 레드헤더(Redundant) 파일을 정리합니다.
   */
  async deleteFile(fileName) {
    if (IS_PROD && process.env.SUPABASE_URL) {
      // await supabase.storage.from('datasets').remove([fileName]);
    } else {
      const filePath = path.join(DATA_DIR, fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
};
