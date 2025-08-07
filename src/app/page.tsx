'use client';

import { useState } from 'react';
import React from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [generatedJson, setGeneratedJson] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [submittedData, setSubmittedData] = useState<{ id: number; url: string; json: object }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력된 데이터를 JSON 형태로 생성
    const metadata = {
      name,
      description,
      image,
    };

    // JSON 데이터를 화면에 출력
    setGeneratedJson(JSON.stringify(metadata, null, 2));

    // JSON 파일 생성 요청 및 서버에서 할당된 tokenId 받기
    const result = await createJsonFile(metadata);
    
    if (result && result.tokenId) {
      const newTokenId = result.tokenId;
      setTokenId(newTokenId);

      // URL 생성
      const newUrl = `/api/metadata/${newTokenId}.json`;

      // 데이터 저장
      setSubmittedData((prevData) => [
        ...prevData,
        { id: newTokenId, url: newUrl, json: metadata },
      ]);

      // 입력값 초기화
      setName('');
      setDescription('');
      setImage('');
    }
  };

  const createJsonFile = async (metadata: object) => {
    try {
      console.log('Sending request to:', '/api/create-json'); // 디버깅용
      const response = await fetch('/api/create-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', errorData);
        throw new Error('Failed to create JSON file');
      }
      
      const result = await response.json();
      console.log('Success:', result);
      return result; // 서버 응답 전체 반환
    } catch (error) {
      console.error('Error creating JSON file:', error);
      return null;
    }
  };
  
  return (
    <div style={styles.container}>
      {/* 컨트랙트 주소 정보 - 필요할 때 주석 해제하세요 */}
      <div style={styles.contractAddressContainer}>
        <p style={styles.contractAddressLabel}>컨트랙트 주소</p>
        <p style={styles.contractAddress}>0x52E285D031246af8A273247487c732e1d0E70939</p>
      </div>
      
      <h1 style={styles.title}>NFT Metadata Generator</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Image URL:</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>
          Generate Metadata
        </button>
      </form>
      {tokenId !== null && (
        <div style={styles.alert}>
          <p>🎉 당신의 token_id는 <strong>{tokenId}번</strong>입니다!</p>
        </div>
      )}
      {generatedJson && (
        <div style={styles.jsonOutput}>
          <h2 style={styles.jsonTitle}>Generated JSON:</h2>
          <pre style={styles.jsonContent}>{generatedJson}</pre>
        </div>
      )}
      {submittedData.length > 0 && (
        <div style={styles.submittedData}>
          <h2 style={styles.submittedTitle}>Submitted Data:</h2>
          <ul style={styles.list}>
            {submittedData.map((data) => (
              <li key={data.id} style={styles.listItem}>
                <a href={data.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  Token {data.id} - {data.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 스타일 객체는 기존과 동일하게 유지
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f4f8',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  // 컨트랙트 주소 관련 스타일 추가
  contractAddressContainer: {
    backgroundColor: '#e9f5ff',
    padding: '10px 15px',
    borderRadius: '5px',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    border: '1px solid #b3d7ff',
  },
  contractAddressLabel: {
    fontSize: '14px',
    fontWeight: 'bold' as 'bold',
    color: '#0056b3',
    marginBottom: '5px',
  },
  contractAddress: {
    fontSize: '16px',
    fontFamily: 'monospace',
    wordBreak: 'break-all' as 'break-all',
    color: '#0056b3',
  },
  title: {
    textAlign: 'center' as 'center', // 명시적 리터럴 타입 지정
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column', // 명시적 리터럴 타입 지정
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column', // 명시적 리터럴 타입 지정
  },
  label: {
    fontSize: '16px',
    marginBottom: '5px',
    color: '#555',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
    resize: 'none' as 'none', // 명시적 리터럴 타입 지정
    height: '100px',
  },
  button: {
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  viewButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    fontSize: '14px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  alert: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#d4edda',
    borderRadius: '5px',
    color: '#155724',
    fontSize: '16px',
  },
  jsonOutput: {
    marginTop: '20px',
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  jsonTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#333',
  },
  jsonContent: {
    whiteSpace: 'pre-wrap' as 'pre-wrap', // 명시적 리터럴 타입 지정
    wordWrap: 'break-word' as 'break-word', // 명시적 리터럴 타입 지정
    fontSize: '14px',
    color: '#555',
  },
  submittedData: {
    marginTop: '20px',
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  submittedTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#333',
  },
  list: {
    listStyle: 'none',
    padding: '0',
  },
  listItem: {
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    color: '#007BFF',
    textDecoration: 'none',
  },
};
