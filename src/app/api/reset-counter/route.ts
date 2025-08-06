// /app/api/reset-counter/route.ts
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
    // Redis 클라이언트 초기화
    redisClient = await getRedisClient();
    console.log('Redis 연결 성공');

    // 카운터를 0으로 초기화 (다음 토큰 ID는 1이 됨)
    await redisClient.set('nft:counter', '0');
    console.log('카운터 값을 0으로 초기화했습니다');

    return NextResponse.json({ 
      success: true, 
      message: 'Counter reset to 0 successfully'
    });
  } catch (error) {
    console.error('Error resetting counter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset counter' },
      { status: 500 }
    );
  } finally {
    // 연결 종료
    if (redisClient && redisClient.isOpen) {
      await redisClient.disconnect();
    }
  }
}
