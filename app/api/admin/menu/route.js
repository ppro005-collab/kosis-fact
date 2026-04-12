import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'menuSettings.json');

export async function GET() {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      return NextResponse.json({ success: true, settings: {} });
    }
    const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    return NextResponse.json({ success: true, settings: JSON.parse(data) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { settings } = await request.json();
    const dataDir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
