import React, { useState, useEffect } from 'react';
import { TodoAttachment } from '../types';
import { fileService } from '../services/fileService';

interface FileListProps {
  todoId: number;
  onFileChange: () => void;
}

const FileList: React.FC<FileListProps> = ({ todoId, onFileChange }) => {
  const [files, setFiles] = useState<TodoAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadFiles();
  }, [todoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFiles = async () => {
    try {
      setLoading(true);
      const fileList = await fileService.getFileList(todoId);
      setFiles(fileList);
    } catch (error) {
      console.error('파일 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachmentId: number, fileName: string) => {
    try {
      await fileService.downloadFile(attachmentId);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!window.confirm('파일을 삭제하시겠습니까?')) return;

    try {
      setDeletingId(attachmentId);
      await fileService.deleteFile(attachmentId);
      await loadFiles();
      onFileChange();
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      alert('파일 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="file-list-container">
        <div className="file-list-header">
          <h3 className="file-list-title">📎 첨부파일</h3>
        </div>
        <div className="file-list-loading">
          <div className="loading-spinner"></div>
          <p>파일 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <h3 className="file-list-title">📎 첨부파일 ({files.length})</h3>
      </div>

      {files.length === 0 ? (
        <div className="file-list-empty">
          <p>첨부된 파일이 없습니다.</p>
        </div>
      ) : (
        <div className="file-list">
          {files.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-info">
                <div className="file-icon">
                  {fileService.getFileIcon(file.contentType)}
                </div>
                <div className="file-details">
                  <div className="file-name" title={file.fileName}>
                    {file.fileName}
                  </div>
                  <div className="file-meta">
                    <span className="file-size">
                      {fileService.formatFileSize(file.fileSize)}
                    </span>
                    <span className="file-date">
                      {formatDate(file.uploadedAt)}
                    </span>
                    <span className="file-uploader">
                      by {file.uploadedBy}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="file-actions">
                <button
                  className="action-btn download-btn"
                  onClick={() => handleDownload(file.id, file.fileName)}
                  title="다운로드"
                >
                  ⬇️
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(file.id)}
                  disabled={deletingId === file.id}
                  title="삭제"
                >
                  {deletingId === file.id ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .file-list-container {
          margin: 16px 0;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background-color: #ffffff;
        }

        .file-list-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
          border-radius: 8px 8px 0 0;
        }

        .file-list-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .file-list-loading {
          padding: 24px;
          text-align: center;
          color: #6b7280;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .file-list-empty {
          padding: 24px;
          text-align: center;
          color: #6b7280;
        }

        .file-list {
          padding: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .file-item:hover {
          background-color: #f9fafb;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .file-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .file-details {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .file-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #6b7280;
        }

        .file-size {
          font-weight: 500;
        }

        .file-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .download-btn {
          background-color: #eff6ff;
          color: #3b82f6;
        }

        .download-btn:hover {
          background-color: #dbeafe;
        }

        .delete-btn {
          background-color: #fef2f2;
          color: #ef4444;
        }

        .delete-btn:hover:not(:disabled) {
          background-color: #fee2e2;
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default FileList;
