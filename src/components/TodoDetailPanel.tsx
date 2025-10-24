import React, { useState, useEffect } from 'react';
import { Todo } from '../types';
import apiService from '../services/api';
import FileUpload from './FileUpload';
import FileList from './FileList';
import SubTaskList from './SubTaskList';

interface TodoDetailPanelProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onTodoChange?: (todo: Todo) => void;
}

const TodoDetailPanel: React.FC<TodoDetailPanelProps> = ({
  todo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onTodoChange,
}) => {
  const [localTodo, setLocalTodo] = useState<Todo | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [fileKey, setFileKey] = useState(0); // 파일 목록 새로고침을 위한 키

  useEffect(() => {
    if (todo) {
      setLocalTodo({ ...todo });
      setHasChanges(false);
    }
  }, [todo]);

  const handleFileUploadSuccess = () => {
    setFileKey(prev => prev + 1); // 파일 목록 새로고침
  };

  if (!localTodo) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return '#dc3545'; // 높음 - 빨간색
      case 2: return '#ffc107'; // 보통 - 노란색
      case 1: return '#28a745'; // 낮음 - 초록색
      default: return '#6c757d';
    }
  };

  const getPriorityName = (priority: number) => {
    switch (priority) {
      case 3: return '높음';
      case 2: return '보통';
      case 1: return '낮음';
      default: return '보통';
    }
  };

  const getCategoryName = (categoryId: number) => {
    const categories = {
      1: '업무',
      2: '학습',
      3: '쇼핑',
      4: '개인',
      5: '교육',
      6: '기타'
    };
    return categories[categoryId as keyof typeof categories] || '기타';
  };

  const getStatusName = (statusId: number) => {
    const statuses = {
      1: '시작 전',
      2: '진행 중',
      3: '완료',
      4: '보류'
    };
    return statuses[statusId as keyof typeof statuses] || '시작 전';
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return '#6c757d'; // 시작 전 - 회색
      case 2: return '#007bff'; // 진행 중 - 파란색
      case 3: return '#28a745'; // 완료 - 초록색
      case 4: return '#ffc107'; // 보류 - 노란색
      default: return '#6c757d';
    }
  };

  const isOverdue = localTodo.dueDate && new Date(localTodo.dueDate) < new Date() && !localTodo.isCompleted;

  const handleToggleComplete = () => {
    setLocalTodo(prev => prev ? { ...prev, isCompleted: !prev.isCompleted } : null);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (localTodo && hasChanges) {
      onToggleComplete(localTodo.id);
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit(localTodo);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 Todo를 삭제하시겠습니까?')) {
      onDelete(localTodo.id);
      onClose();
    }
  };

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          style={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* 슬라이드 패널 */}
      <div
        style={{
          ...styles.panel,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* 헤더 */}
        <div style={styles.header}>
          <h2 style={styles.title}>Todo 상세</h2>
          <button
            onClick={onClose}
            style={styles.closeButton}
            title="닫기"
          >
            ✕
          </button>
        </div>

        {/* 내용 */}
        <div style={styles.content}>
          {/* 완료 상태 토글 */}
          <div style={styles.completeSection}>
            <label style={styles.completeLabel}>
              <input
                type="checkbox"
                checked={localTodo.isCompleted}
                onChange={handleToggleComplete}
                style={styles.checkbox}
              />
              <span style={styles.completeText}>
                완료됨
              </span>
            </label>
            <div style={styles.completeDescription}>
              {localTodo.isCompleted 
                ? '✅ 이 Todo는 완료되었습니다.' 
                : '⏳ 이 Todo는 아직 완료되지 않았습니다. 체크박스를 클릭하여 완료 처리하세요.'
              }
            </div>
          </div>

          {/* 제목 */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>제목</h3>
            <p style={{
              ...styles.text,
              textDecoration: localTodo.isCompleted ? 'line-through' : 'none',
              opacity: localTodo.isCompleted ? 0.7 : 1,
            }}>
              {localTodo.title}
            </p>
          </div>

          {/* 설명 */}
          {localTodo.description && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>설명</h3>
              <p style={styles.text}>{localTodo.description}</p>
            </div>
          )}

          {/* 상태 정보 */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>상태 정보</h3>
            <div style={styles.badges}>
              <span style={{
                ...styles.badge,
                backgroundColor: getStatusColor(localTodo.status),
              }}>
                {getStatusName(localTodo.status)}
              </span>
              <span style={{
                ...styles.badge,
                backgroundColor: getPriorityColor(localTodo.priority),
              }}>
                우선순위: {getPriorityName(localTodo.priority)}
              </span>
              <span style={{
                ...styles.badge,
                backgroundColor: '#e9ecef',
                color: '#495057',
              }}>
                {getCategoryName(localTodo.category)}
              </span>
            </div>
          </div>

          {/* 날짜 정보 */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>날짜 정보</h3>
            <div style={styles.dateInfo}>
              {localTodo.startDate && (
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>시작일:</span>
                  <span style={styles.dateValue}>{formatDate(localTodo.startDate)}</span>
                </div>
              )}
              {localTodo.dueDate && (
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>마감일:</span>
                  <span style={{
                    ...styles.dateValue,
                    color: isOverdue ? '#dc3545' : '#495057',
                    fontWeight: isOverdue ? 'bold' : 'normal',
                  }}>
                    {formatDate(localTodo.dueDate)}
                    {isOverdue && ' (지연됨)'}
                  </span>
                </div>
              )}
              <div style={styles.dateItem}>
                <span style={styles.dateLabel}>생성일:</span>
                <span style={styles.dateValue}>{formatDateTime(localTodo.createdAt)}</span>
              </div>
              {localTodo.updatedAt && (
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>수정일:</span>
                  <span style={styles.dateValue}>{formatDateTime(localTodo.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 태그 */}
          {localTodo.tags && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>태그</h3>
              <div style={styles.tags}>
                {localTodo.tags.split(',').map((tag, index) => (
                  <span key={index} style={styles.tag}>
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 하위 작업 */}
          <div style={styles.section}>
            <SubTaskList 
              todoId={localTodo.id}
              onSubTaskChange={async () => {
                // 하위 작업이 변경되면 Todo 정보 새로고침
                try {
                  const updatedTodo = await apiService.getTodoById(localTodo.id);
                  setLocalTodo(updatedTodo);
                  // 상위 컴포넌트에도 변경 알림
                  onTodoChange?.(updatedTodo);
                } catch (error) {
                  console.error('Todo 정보 새로고침 실패:', error);
                }
              }}
            />
          </div>

          {/* 파일 첨부 */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>파일 첨부</h3>
            <FileUpload 
              todoId={localTodo.id} 
              onUploadSuccess={handleFileUploadSuccess}
              disabled={hasChanges}
            />
            <FileList 
              key={fileKey}
              todoId={localTodo.id} 
              onFileChange={handleFileUploadSuccess}
            />
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div style={styles.actions}>
          {hasChanges && (
            <button
              onClick={handleSave}
              style={styles.saveButton}
            >
              💾 저장
            </button>
          )}
          <button
            onClick={handleEdit}
            style={styles.editButton}
          >
            ✏️ 수정
          </button>
          <button
            onClick={handleDelete}
            style={styles.deleteButton}
          >
            🗑️ 삭제
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: '400px', // 패널 너비만큼 제외
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // 더 연하게
    zIndex: 1000,
    pointerEvents: 'none' as const, // 클릭 이벤트를 통과시킴
  },
  panel: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    width: '400px',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'transform 0.3s ease-in-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    color: '#6c757d',
  },
  content: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto' as const,
  },
  completeSection: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  completeLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  checkbox: {
    marginRight: '0.75rem',
    transform: 'scale(1.3)',
  },
  completeText: {
    color: '#495057',
  },
  completeDescription: {
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: '#6c757d',
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #007bff',
    paddingBottom: '0.5rem',
  },
  text: {
    margin: 0,
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#495057',
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  badge: {
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '16px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  dateInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  dateItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  },
  dateLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6c757d',
  },
  dateValue: {
    fontSize: '0.875rem',
    color: '#495057',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '0.5rem 0.75rem',
    borderRadius: '16px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  actions: {
    padding: '1.5rem',
    borderTop: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    gap: '1rem',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
};

export default TodoDetailPanel;
