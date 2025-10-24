import axios from 'axios';
import { TodoAttachment, FileUploadResponse } from '../types';

const API_BASE_URL = 'http://localhost:5248/api';

class FileService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };
  }

  // 파일 업로드
  async uploadFile(todoId: number, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_BASE_URL}/file/upload/${todoId}`,
      formData,
      {
        headers: this.getAuthHeaders()
      }
    );

    return response.data;
  }

  // 파일 목록 조회
  async getFileList(todoId: number): Promise<TodoAttachment[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/file/list/${todoId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  }

  // 파일 다운로드
  async downloadFile(attachmentId: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/file/download/${attachmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      }
    );

    // 파일명 추출 (RFC 5987 표준 지원)
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'download';
    
    if (contentDisposition) {
      console.log('Content-Disposition 헤더:', contentDisposition); // 디버깅용
      
      // RFC 5987 표준 패턴들
      const patterns = [
        /filename\*=UTF-8''([^;]+)/,   // filename*=UTF-8''encoded_filename
        /filename="([^"]+)"/,          // filename="file.txt"
        /filename=([^;]+)/,            // filename=file.txt
        /filename\*=([^;]+)/           // filename*=encoded_filename
      ];
      
      for (const pattern of patterns) {
        const match = contentDisposition.match(pattern);
        if (match && match[1]) {
          try {
            // URL 디코딩 시도
            fileName = decodeURIComponent(match[1]);
            console.log('파싱된 파일명:', fileName); // 디버깅용
            break;
          } catch (e) {
            console.warn('파일명 디코딩 실패:', match[1], e);
            fileName = match[1]; // 디코딩 실패 시 원본 사용
            break;
          }
        }
      }
    }

    // Content-Type 확인 및 Blob 생성
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    
    // Blob을 파일로 다운로드
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // 파일 삭제
  async deleteFile(attachmentId: number): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(
      `${API_BASE_URL}/file/${attachmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }

  // 파일 크기 포맷팅
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 파일 아이콘 가져오기
  getFileIcon(contentType: string): string {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('image')) return '🖼️';
    if (contentType.includes('zip') || contentType.includes('rar')) return '📦';
    if (contentType.includes('text')) return '📄';
    return '📎';
  }

  // 파일 확장자 가져오기
  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toUpperCase() || '';
  }
}

export const fileService = new FileService();
