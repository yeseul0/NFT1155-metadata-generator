// app/metadata/[tokenId]/route.ts

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId;
  
  // 토큰 ID에 따라 다른 메타데이터 반환
  const metadata = {
    name: `NFT #${tokenId}`,
    description: `This is NFT number ${tokenId}`,
    image: `https://nft-metadata-generator.vercel.app/images/${tokenId}.png`,
  };

  return NextResponse.json(metadata);
}
