import React, { useState, useRef, useCallback } from 'react';
import { fileService } from '../services/fileService';

interface FileUploadProps {
  todoId: number;
  onUploadSuccess: () => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ todoId, onUploadSuccess, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 디버깅 로그
    console.log('파일 선택됨:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 형식 체크
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar'
    ];

    console.log('파일 타입 체크:', {
      fileType: file.type,
      isAllowed: allowedTypes.includes(file.type),
      allowedTypes: allowedTypes
    });

    if (!allowedTypes.includes(file.type)) {
      alert(`지원되지 않는 파일 형식입니다: ${file.type}\n(PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ZIP, RAR만 지원)`);
      return;
    }

    try {
      console.log('파일 업로드 시작:', { todoId, fileName: file.name });
      setIsUploading(true);
      setUploadProgress(0);

      // 업로드 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await fileService.uploadFile(todoId, file);
      console.log('파일 업로드 성공:', result);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onUploadSuccess();
      }, 500);

    } catch (error) {
      console.error('파일 업로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`파일 업로드에 실패했습니다: ${errorMessage}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [todoId, onUploadSuccess]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
        />
        
        {isUploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">업로드 중... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📎</div>
            <p className="upload-text">
              {isDragOver ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="upload-hint">
              PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ZIP, RAR (최대 10MB)
            </p>
          </div>
        )}
      </div>

      <style>{`
        .file-upload-container {
          margin: 16px 0;
        }

        .file-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f9fafb;
        }

        .file-upload-area:hover:not(.disabled) {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .file-upload-area.drag-over {
          border-color: #3b82f6;
          background-color: #eff6ff;
          transform: scale(1.02);
        }

        .file-upload-area.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .upload-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .upload-text {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          margin: 0;
        }

        .upload-hint {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #3b82f6;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 14px;
          color: #374151;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default FileUpload;
