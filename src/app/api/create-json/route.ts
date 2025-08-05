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

export async function POST(request: Request) {
  let redisClient;
  
  try {
    // 요청 처리 시 Redis 클라이언트 초기화
    redisClient = await getRedisClient();
    console.log('Redis 연결 성공');

    const { tokenId, metadata } = await request.json();
    console.log('받은 데이터:', { tokenId, metadata });

    if (!tokenId || !metadata) {
      return NextResponse.json(
        { success: false, error: 'TokenId and metadata are required' },
        { status: 400 }
      );
    }
    
    // Redis에 메타데이터 저장
    await redisClient.set(`nft:metadata:${tokenId}`, JSON.stringify(metadata));
    const storedValue = await redisClient.get(`nft:metadata:${tokenId}`);


    return NextResponse.json({ 
      success: true, 
      message: `Metadata for token ${tokenId} stored successfully`,
      url: `/api/metadata/${tokenId}`
    });
  } catch (error) {
    console.error('Error storing metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store metadata' },
      { status: 500 }
    );
  } finally {
    // 연결 종료
    if (redisClient && redisClient.isOpen) {
      await redisClient.disconnect();
    }
  }
}
