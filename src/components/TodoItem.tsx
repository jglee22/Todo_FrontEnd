import React from 'react';
import { Todo } from '../types';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onViewDetail: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete, onViewDetail }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 2;
  const handleToggleComplete = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // 이벤트 전파 방지
    try {
      const updatedTodo = await apiService.toggleTodoComplete(todo.id);
      onUpdate(updatedTodo);
    } catch (error) {
      console.error('Todo 상태 변경 실패:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 Todo를 삭제하시겠습니까?')) {
      try {
        await apiService.deleteTodo(todo.id);
        onDelete(todo.id);
      } catch (error) {
        console.error('Todo 삭제 실패:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return '#dc3545'; // 높음 - 빨간색
      case 2: return '#ffc107'; // 보통 - 노란색
      case 1: return '#28a745'; // 낮음 - 초록색
      default: return '#6c757d';
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

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.isCompleted;

  const handleContainerClick = (e: React.MouseEvent) => {
    // 삭제 버튼 클릭 시에는 상세 패널이 열리지 않도록
    if ((e.target as HTMLElement).closest('[data-action="delete"]')) {
      return;
    }
    onViewDetail(todo);
  };

  return (
    <div 
      style={{
        ...styles.container,
        backgroundColor: todo.isCompleted ? '#f8f9fa' : 'white',
        opacity: todo.isCompleted ? 0.7 : 1,
        cursor: 'pointer',
      }}
      onClick={handleContainerClick}
    >
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <input
            type="checkbox"
            checked={todo.isCompleted}
            onChange={(e) => handleToggleComplete(e)}
            style={styles.checkbox}
          />
          <h4 style={{
            ...styles.title,
            textDecoration: todo.isCompleted ? 'line-through' : 'none',
            color: todo.isCompleted ? '#6c757d' : '#333',
          }}>
            {todo.title}
            {isAdmin && todo.userName && (
              <span style={styles.userName}> - {todo.userName}</span>
            )}
          </h4>
        </div>
        <div style={styles.badges}>
          <span style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(todo.status),
          }}>
            {getStatusName(todo.status)}
          </span>
          <span style={{
            ...styles.priorityBadge,
            backgroundColor: getPriorityColor(todo.priority),
          }}>
            우선순위 {todo.priority}
          </span>
          <span style={styles.categoryBadge}>
            {getCategoryName(todo.category)}
          </span>
        </div>
      </div>

      {todo.description && (
        <p style={styles.description}>{todo.description}</p>
      )}

      <div style={styles.meta}>
        {todo.dueDate && (
          <span style={{
            ...styles.dueDate,
            color: isOverdue ? '#dc3545' : '#6c757d',
            fontWeight: isOverdue ? 'bold' : 'normal',
          }}>
            마감일: {formatDate(todo.dueDate)}
            {isOverdue && ' (지연됨)'}
          </span>
        )}
        {todo.tags && (
          <div style={styles.tags}>
            {todo.tags.split(',').map((tag, index) => (
              <span key={index} style={styles.tag}>
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <span style={styles.createdAt}>
          생성일: {formatDate(todo.createdAt)}
        </span>
        <div style={styles.actions}>
          <button
            onClick={handleDelete}
            style={styles.deleteButton}
            title="삭제"
            data-action="delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: '0.75rem',
    transform: 'scale(1.2)',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '400',
    color: '#6c757d',
    marginLeft: '0.5rem',
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
  },
  priorityBadge: {
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  statusBadge: {
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#e9ecef',
    color: '#495057',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  description: {
    margin: '0.5rem 0',
    color: '#6c757d',
    lineHeight: '1.4',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  dueDate: {
    fontSize: '0.875rem',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.25rem',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '0.125rem 0.375rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e9ecef',
  },
  createdAt: {
    fontSize: '0.75rem',
    color: '#6c757d',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
    borderRadius: '4px',
    opacity: 0.7,
  },
};

export default TodoItem;
