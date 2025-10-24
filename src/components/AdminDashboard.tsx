import React, { useState, useEffect } from 'react';
import { AdminUser, AdminTodo, SystemStats } from '../types';
import apiService from '../services/api';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'todos'>('overview');
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [todos, setTodos] = useState<AdminTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      switch (activeTab) {
        case 'overview':
          const stats = await apiService.getSystemStats();
          setSystemStats(stats);
          break;
        case 'users':
          const usersData = await apiService.getAllUsers();
          setUsers(usersData);
          break;
        case 'todos':
          const todosData = await apiService.getAllTodos();
          setTodos(todosData);
          break;
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserActive = async (userId: number) => {
    try {
      await apiService.toggleUserActive(userId);
      await loadData(); // 데이터 새로고침
    } catch (error) {
      console.error('사용자 상태 변경 실패:', error);
      setError('사용자 상태 변경에 실패했습니다.');
    }
  };

  const handleChangeUserRole = async (userId: number, newRole: number) => {
    try {
      await apiService.changeUserRole(userId, newRole);
      await loadData(); // 데이터 새로고침
    } catch (error) {
      console.error('사용자 역할 변경 실패:', error);
      setError('사용자 역할 변경에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <div>{error}</div>
        <button onClick={loadData} style={styles.retryButton}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>관리자 대시보드</h1>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'overview' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('overview')}
          >
            📊 개요
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'users' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('users')}
          >
            👥 사용자 관리
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'todos' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('todos')}
          >
            📝 Todo 관리
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {activeTab === 'overview' && systemStats && (
          <div style={styles.overview}>
            {/* 사용자 통계 */}
            <div style={styles.statsSection}>
              <h2 style={styles.sectionTitle}>사용자 통계</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{systemStats.users.total}</div>
                  <div style={styles.statLabel}>전체 사용자</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{systemStats.users.active}</div>
                  <div style={styles.statLabel}>활성 사용자</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{systemStats.users.admins}</div>
                  <div style={styles.statLabel}>관리자</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{systemStats.users.regularUsers}</div>
                  <div style={styles.statLabel}>일반 사용자</div>
                </div>
              </div>
            </div>

            {/* Todo 통계 */}
            <div style={styles.statsSection}>
              <h2 style={styles.sectionTitle}>Todo 통계</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{systemStats.todos.total}</div>
                  <div style={styles.statLabel}>전체 Todo</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{systemStats.todos.completed}</div>
                  <div style={styles.statLabel}>완료된 Todo</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{systemStats.todos.pending}</div>
                  <div style={styles.statLabel}>진행 중인 Todo</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{systemStats.todos.completionRate}%</div>
                  <div style={styles.statLabel}>완료율</div>
                </div>
              </div>
            </div>

            {/* 최근 가입 사용자 */}
            <div style={styles.statsSection}>
              <h2 style={styles.sectionTitle}>최근 가입 사용자</h2>
              <div style={styles.recentUsers}>
                {systemStats.recentUsers.map(user => (
                  <div key={user.id} style={styles.recentUserCard}>
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>{user.username}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                      <div style={styles.userRole}>{user.role}</div>
                    </div>
                    <div style={styles.userMeta}>
                      <div style={styles.joinDate}>{formatDate(user.createdAt)}</div>
                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: user.isActive ? '#28a745' : '#dc3545'
                      }}>
                        {user.isActive ? '활성' : '비활성'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={styles.usersSection}>
            <h2 style={styles.sectionTitle}>사용자 관리</h2>
            <div style={styles.usersList}>
              {users.map(user => (
                <div key={user.id} style={styles.userCard}>
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>{user.username}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                    <div style={styles.userDetails}>
                      <span style={styles.userRole}>{user.roleName}</span>
                      <span style={styles.joinDate}>가입: {formatDate(user.createdAt)}</span>
                      {user.lastLoginAt && (
                        <span style={styles.lastLogin}>마지막 로그인: {formatDateTime(user.lastLoginAt)}</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.userActions}>
                    <button
                      style={{
                        ...styles.actionButton,
                        backgroundColor: user.isActive ? '#dc3545' : '#28a745'
                      }}
                      onClick={() => handleToggleUserActive(user.id)}
                    >
                      {user.isActive ? '비활성화' : '활성화'}
                    </button>
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeUserRole(user.id, parseInt(e.target.value))}
                      style={styles.roleSelect}
                    >
                      <option value={1}>사용자</option>
                      <option value={2}>관리자</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'todos' && (
          <div style={styles.todosSection}>
            <h2 style={styles.sectionTitle}>전체 Todo 관리</h2>
            <div style={styles.todosList}>
              {todos.map(todo => (
                <div key={todo.id} style={styles.todoCard}>
                  <div style={styles.todoHeader}>
                    <div style={styles.todoTitle}>{todo.title}</div>
                    <div style={styles.todoUser}>작성자: {todo.userName}</div>
                  </div>
                  {todo.description && (
                    <div style={styles.todoDescription}>{todo.description}</div>
                  )}
                  <div style={styles.todoMeta}>
                    <span style={styles.todoStatus}>{todo.statusName}</span>
                    <span style={styles.todoCategory}>{todo.categoryName}</span>
                    <span style={styles.todoPriority}>우선순위: {todo.priorityName}</span>
                    {todo.dueDate && (
                      <span style={styles.todoDueDate}>마감: {formatDate(todo.dueDate)}</span>
                    )}
                  </div>
                  <div style={styles.todoFooter}>
                    <span style={styles.todoCreated}>생성: {formatDateTime(todo.createdAt)}</span>
                    {todo.updatedAt && (
                      <span style={styles.todoUpdated}>수정: {formatDateTime(todo.updatedAt)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#333',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid #e9ecef',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#6c757d',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#007bff',
    borderBottomColor: '#007bff',
  },
  content: {
    minHeight: '400px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    fontSize: '1.2rem',
    color: '#6c757d',
  },
  error: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    fontSize: '1.2rem',
    color: '#dc3545',
  },
  retryButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  overview: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  statsSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    textAlign: 'center' as const,
    border: '1px solid #e9ecef',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#6c757d',
  },
  recentUsers: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  recentUserCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  userName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: '0.875rem',
    color: '#6c757d',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#007bff',
    fontWeight: '500',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  joinDate: {
    fontSize: '0.75rem',
    color: '#6c757d',
  },
  statusBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'white',
  },
  usersSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  userCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  },
  userDetails: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#6c757d',
    marginTop: '0.25rem',
  },
  lastLogin: {
    fontSize: '0.75rem',
    color: '#6c757d',
  },
  userActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  roleSelect: {
    padding: '0.5rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '0.875rem',
  },
  todosSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  todosList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  todoCard: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  },
  todoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  todoTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  todoUser: {
    fontSize: '0.875rem',
    color: '#007bff',
    fontWeight: '500',
  },
  todoDescription: {
    fontSize: '0.9rem',
    color: '#6c757d',
    marginBottom: '0.75rem',
    lineHeight: '1.4',
  },
  todoMeta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  todoStatus: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  todoCategory: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e9ecef',
    color: '#495057',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  todoPriority: {
    fontSize: '0.875rem',
    color: '#6c757d',
  },
  todoDueDate: {
    fontSize: '0.875rem',
    color: '#dc3545',
    fontWeight: '500',
  },
  todoFooter: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#6c757d',
  },
  todoCreated: {
    fontSize: '0.75rem',
    color: '#6c757d',
  },
  todoUpdated: {
    fontSize: '0.75rem',
    color: '#6c757d',
  },
};

export default AdminDashboard;
