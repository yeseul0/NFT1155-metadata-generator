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

// 메타데이터 스키마 검증 함수
function validateMetadataSchema(metadata) {
  // 기본 필수 필드 확인
  const requiredFields = ['name', 'description', 'image'];
  for (const field of requiredFields) {
    if (!metadata[field]) {
      return false;
    }
  }
  return true;
}

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
    console.log('Redis 조회 결과 타입:', typeof storedMetadata);
    
    if (storedMetadata) {
      console.log('메타데이터 찾음, 처리합니다');
      
      try {
        // JSON 형식 검증
        const parsedMetadata = JSON.parse(storedMetadata);
        console.log('파싱된 메타데이터 타입:', typeof parsedMetadata);
        console.log('파싱된 메타데이터가 객체인가?:', Object.prototype.toString.call(parsedMetadata) === '[object Object]');
        console.log('파싱된 메타데이터 내용:', parsedMetadata);
        
        // 메타데이터 스키마 검증
        if (!validateMetadataSchema(parsedMetadata)) {
          console.warn('메타데이터가 표준 스키마를 따르지 않습니다');
          console.log('누락된 필드:', ['name', 'description', 'image'].filter(field => !parsedMetadata[field]));
          
          // 필수 필드가 없는 경우 추가
          if (!parsedMetadata.name) parsedMetadata.name = `NFT #${tokenId}`;
          if (!parsedMetadata.description) parsedMetadata.description = `This is NFT with token ID ${tokenId}`;
          if (!parsedMetadata.image) parsedMetadata.image = `https://via.placeholder.com/350x350?text=NFT+${tokenId}`;
        }
        
        // 유효한 JSON으로 응답
        return NextResponse.json(parsedMetadata, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      } catch (error) {
        console.error('저장된 메타데이터가 유효한 JSON 형식이 아닙니다:', error);
        console.log('JSON 파싱 실패한 원본 데이터:', storedMetadata);
        
        // 유효한 JSON이 아닌 경우 기본 메타데이터 반환
        const defaultMetadata = {
          name: `NFT #${tokenId}`,
          description: `Invalid metadata format for token ID ${tokenId}`,
          image: `https://via.placeholder.com/350x350?text=Invalid+Format+${tokenId}`,
          error: "Original metadata was not valid JSON"
        };
        
        return NextResponse.json(defaultMetadata, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }
    } else {
      console.log('메타데이터를 찾을 수 없음, 기본값 반환');
      // 저장된 메타데이터가 없으면 기본 메타데이터 생성
      const defaultMetadata = {
        name: `NFT #${tokenId}`,
        description: `This is NFT with token ID ${tokenId}`,
        image: `https://via.placeholder.com/350x350?text=NFT+${tokenId}`,
        attributes: []
      };
      
      return NextResponse.json(defaultMetadata, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
  } catch (error) {
    console.error('메타데이터 조회 오류:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch metadata', 
        details: error.message || 'Unknown error' 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } finally {
    // 연결 종료
    if (redisClient && redisClient.isOpen) {
      await redisClient.disconnect();
      console.log('Redis 연결 종료');
    }
  }
}

// OPTIONS 메서드 핸들러 추가 (CORS 프리플라이트 요청 처리)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
