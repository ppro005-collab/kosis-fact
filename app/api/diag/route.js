import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const cwd = process.cwd();
  const dataPath = path.join(cwd, 'data');
  const exists = fs.existsSync(dataPath);
  let files = [];
  if (exists) {
    files = fs.readdirSync(dataPath);
  }
  
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    SUPABASE_URL: !!process.env.SUPABASE_URL
  };

  return NextResponse.json({
    cwd,
    dataPath,
    exists,
    files,
    env
  });
}
