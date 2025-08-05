// import { NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';

// export async function GET(request, { params }) {
//   const { tokenId } = params;
  
//   try {
//     const filePath = path.join(process.cwd(), 'data', 'metadata', `${tokenId}.json`);
    
//     if (!fs.existsSync(filePath)) {
//       return new NextResponse(JSON.stringify({ error: 'Token not found' }), {
//         status: 404,
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//     }
    
//     const fileContent = fs.readFileSync(filePath, 'utf8');
    
//     // Content-Type 헤더를 application/json으로 설정하여 JSON 파일로 응답
//     return new NextResponse(fileContent, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//   } catch (error) {
//     return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//   }
// } 

import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { tokenId } = params;
  
  // 고정된 JSON 데이터 반환
  const metadata = {
    name: `NFT #${tokenId}`,
    description: `This is NFT number ${tokenId}`,
    image: `https://nft-metadata-generator.vercel.app/images/${tokenId}.png`,
    attributes: [
      {
        trait_type: "Rarity",
        value: "Common"
      },
      {
        trait_type: "Type",
        value: "Basic"
      }
    ]
  };
  
  // JSON 형식으로 응답
  return new NextResponse(JSON.stringify(metadata, null, 2), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
