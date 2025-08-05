import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  context: { params: { tokenId: string } }
) {
  const tokenId = context.params.tokenId;
  
  try {
    // .json 확장자가 없는 경우 추가
    const fileTokenId = tokenId.endsWith('.json') ? tokenId : `${tokenId}.json`;
    
    // JSON 파일 경로
    const filePath = path.join(process.cwd(), 'public', 'metadata', fileTokenId);
    console.log('Attempting to read file at:', filePath); // 디버깅용
    
    // 파일이 존재하는지 확인
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Metadata not found' },
        { status: 404 }
      );
    }
    
    // 파일 읽기
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const metadata = JSON.parse(fileContent);
    
    // JSON 응답 반환
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error retrieving metadata:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve metadata' },
      { status: 500 }
    );
  }
}
