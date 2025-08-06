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

// JSON 파일 응답 생성 함수
function createJsonFileResponse(data) {
  // JSON 문자열로 변환
  const jsonString = JSON.stringify(data, null, 2);
  
  // 파일 다운로드처럼 응답 생성
  return new Response(jsonString, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'inline', // 브라우저에서 표시
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// 16진수 토큰 ID를 10진수로 변환하는 함수
function normalizeTokenId(hexId) {
  // .json 확장자 제거
  if (hexId.endsWith('.json')) {
    hexId = hexId.replace('.json', '');
  }
  
  // 16진수 문자열인지 확인
  const isHex = /^0x|^[0-9a-fA-F]+$/.test(hexId);
  
  if (isHex) {
    // 0x 접두사 처리
    if (hexId.startsWith('0x')) {
      hexId = hexId.substring(2);
    }
    
    // 16진수를 10진수로 변환
    try {
      const decimalId = parseInt(hexId, 16).toString();
      console.log(`16진수 ${hexId}를 10진수 ${decimalId}로 변환했습니다`);
      return decimalId;
    } catch (error) {
      console.error('16진수 변환 오류:', error);
      return hexId; // 변환 실패 시 원래 값 사용
    }
  }
  
  // 이미 10진수이거나 다른 형식이면 그대로 반환
  return hexId;
}

export async function GET(request, context) {
  const params = await context.params;
  let tokenId = params.tokenId;
  
  // 원본 토큰 ID 기록
  console.log('원본 요청된 tokenId:', tokenId);
  
  // 토큰 ID 정규화 (16진수 → 10진수)
  const normalizedTokenId = normalizeTokenId(tokenId);
  console.log('정규화된 tokenId:', normalizedTokenId);

  let redisClient;
  
  try {
    // Redis 클라이언트 초기화
    redisClient = await getRedisClient();
    console.log('Redis 연결 성공');
    
    const redisKey = `nft:metadata:${normalizedTokenId}`;
    console.log('조회할 Redis 키:', redisKey);
    
    // Redis에서 메타데이터 조회
    const storedMetadata = await redisClient.get(redisKey);
    console.log('Redis 조회 결과:', storedMetadata);
    
    if (storedMetadata) {
      console.log('메타데이터 찾음, 처리합니다');
      
      try {
        // JSON 형식 검증
        const parsedMetadata = JSON.parse(storedMetadata);
        
        // 메타데이터 스키마 검증
        if (!validateMetadataSchema(parsedMetadata)) {
          console.warn('메타데이터가 표준 스키마를 따르지 않습니다');
          
          // 필수 필드가 없는 경우 추가
          if (!parsedMetadata.name) parsedMetadata.name = `NFT #${normalizedTokenId}`;
          if (!parsedMetadata.description) parsedMetadata.description = `This is NFT with token ID ${normalizedTokenId}`;
          if (!parsedMetadata.image) parsedMetadata.image = `https://png.pngtree.com/png-vector/20231226/ourmid…er-one-1-written-with-gold-png-image_11383483.png`;
        }
        
        // JSON 파일 응답 반환
        return createJsonFileResponse(parsedMetadata);
      } catch (error) {
        console.error('저장된 메타데이터가 유효한 JSON 형식이 아닙니다:', error);
        
        // 유효한 JSON이 아닌 경우 기본 메타데이터 반환
        const defaultMetadata = {
          name: `NFT #${normalizedTokenId}`,
          description: `Invalid metadata format for token ID ${normalizedTokenId}`,
          image: `https://i.pinimg.com/736x/0f/34/5c/0f345c86de08d259f99f6e24da0b28ab.jpg`,
          error: "Original metadata was not valid JSON"
        };
        
        return createJsonFileResponse(defaultMetadata);
      }
    } else {
      console.log('메타데이터를 찾을 수 없음, 기본값 반환');
      // 저장된 메타데이터가 없으면 기본 메타데이터 생성
      const defaultMetadata = {
        name: `NFT #${normalizedTokenId}`,
        description: `This is NFT with token ID ${normalizedTokenId}`,
        image: `https://i.pinimg.com/736x/0f/34/5c/0f345c86de08d259f99f6e24da0b28ab.jpg`,
      };
      
      return createJsonFileResponse(defaultMetadata);
    }
  } catch (error) {
    console.error('메타데이터 조회 오류:', error);
    return createJsonFileResponse(
      { 
        error: 'Failed to fetch metadata', 
        details: error.message || 'Unknown error',
        name: `Error NFT #${normalizedTokenId}`,
        description: `Error retrieving metadata for token ID ${normalizedTokenId}`,
        image: `https://i.pinimg.com/736x/0f/34/5c/0f345c86de08d259f99f6e24da0b28ab.jpg`
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
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
