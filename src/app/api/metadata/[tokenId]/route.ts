// src/app/api/metadata/[tokenId]/route.js
import { NextResponse } from 'next/server';
import { createClient } from 'redis';

// Redis 클라이언트 초기화 함수
const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  if (!client.isOpen) {
    await client.connect();
  }
  
  return client;
};

export async function GET(request, context) {
  const params = await context.params;
  let tokenId = params.tokenId;
  if (tokenId.endsWith('.json')) {
    tokenId = tokenId.replace('.json', '');
  }
  console.log('요청(정제)된 tokenId:', tokenId);

  
  let redisClient;
  
  try {
    // Redis 클라이언트 초기화
    redisClient = await getRedisClient();
    console.log('Redis 연결 성공');
    
    const redisKey = `nft:metadata:${tokenId}`;
    console.log('조회할 Redis 키:', redisKey);
    
    // Redis에서 메타데이터 조회
    const storedMetadata = await redisClient.get(redisKey);
    console.log('Redis 조회 결과:', storedMetadata);
    
    if (storedMetadata) {
      console.log('메타데이터 찾음, 반환합니다');
      return new NextResponse(storedMetadata, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      console.log('메타데이터를 찾을 수 없음, 기본값 반환');
      // 저장된 메타데이터가 없으면 기본 메타데이터 생성
      const defaultMetadata = {
        name: `NFT #${tokenId}`,
        description: `This is NFT with token ID ${tokenId}`,
        image: `https://via.placeholder.com/350x350?text=NFT+${tokenId}`,
      };
      
      return NextResponse.json(defaultMetadata);
    }
  } catch (error) {
    console.error('메타데이터 조회 오류:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  } finally {
    // 연결 종료
    if (redisClient && redisClient.isOpen) {
      await redisClient.disconnect();
      console.log('Redis 연결 종료');
    }
  }
}
