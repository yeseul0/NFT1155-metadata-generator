import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { tokenId, metadata } = await request.json();
    
    // public 폴더 내에 metadata 디렉토리가 없으면 생성
    const metadataDir = path.join(process.cwd(), 'public', 'metadata');
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }
    
    // JSON 파일 경로 설정
    const filePath = path.join(metadataDir, `${tokenId}.json`);
    
    // JSON 파일 작성
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
    
    return NextResponse.json({ success: true, message: `JSON file created at /metadata/${tokenId}.json` });
  } catch (error) {
    console.error('Error creating JSON file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create JSON file' },
      { status: 500 }
    );
  }
}
