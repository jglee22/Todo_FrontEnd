import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  statusStats: Array<{
    status: number;
    statusName: string;
    count: number;
    percentage: number;
  }>;
  priorityStats: Array<{
    priority: number;
    priorityName: string;
    count: number;
  }>;
  upcomingTodos: Array<{
    id: number;
    title: string;
    dueDate: string;
    priority: number;
    priorityName: string;
    daysLeft: number;
  }>;
  userStats: Array<{
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    todoCount: number;
    completedCount: number;
  }>;
  recentTodos: Array<{
    id: number;
    title: string;
    createdAt: string;
    status: number;
    statusName: string;
    userId: number;
    userName?: string;
  }>;
  recentlyCompletedTodos: Array<{
    id: number;
    title: string;
    updatedAt: string;
    userId: number;
    userName?: string;
  }>;
  monthlyStats: Array<{
    month: string;
    monthName: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  isAdmin: boolean;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await apiService.getDashboardStats();
      
      // 백분율 계산
      const totalStatusCount = data.statusStats.reduce((sum: number, item: any) => sum + item.count, 0);
      data.statusStats.forEach((item: any) => {
        item.percentage = totalStatusCount > 0 ? (item.count / totalStatusCount) * 100 : 0;
      });

      // 월별 완료율 계산
      data.monthlyStats.forEach((item: any) => {
        item.completionRate = item.total > 0 ? (item.completed / item.total) * 100 : 0;
      });

      setStats(data);
    } catch (error) {
      console.error('대시보드 통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 일관된 색상 팔레트 (피드백에 따라 통일)
  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return '#6c757d'; // 시작전 - 회색
      case 2: return '#007bff'; // 진행중 - 파랑
      case 3: return '#28a745'; // 완료 - 초록
      case 4: return '#6c757d'; // 보류 - 회색 (진행중과 구분)
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#dc3545'; // 높음 - 빨강
      case 2: return '#ffc107'; // 보통 - 노랑
      case 3: return '#28a745'; // 낮음 - 초록
      default: return '#6c757d';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>대시보드 로딩 중...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorText}>대시보드 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  // 요약 통계 계산
  const totalTodos = stats.statusStats.reduce((sum, item) => sum + item.count, 0);
  const completedTodos = stats.statusStats.find(item => item.status === 3)?.count || 0;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  
  // 이번 주 신규 Todo 계산 (최근 7일)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekNewTodos = stats.recentTodos.filter(todo => 
    new Date(todo.createdAt) >= oneWeekAgo
  ).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 대시보드</h1>
        <p style={styles.subtitle}>
          {user?.role === 2 ? '전체 시스템 현황' : '나의 Todo 현황'}을 한눈에 확인하세요
        </p>
      </div>

      {/* 상단 요약 지표 바 */}
      <div style={styles.summaryBar}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>전체 Todo:</span>
          <span style={styles.summaryValue}>{totalTodos}</span>
        </div>
        <div style={styles.summaryDivider}>|</div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>완료율:</span>
          <span style={styles.summaryValue}>{completionRate}%</span>
        </div>
        <div style={styles.summaryDivider}>|</div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>이번 주 신규:</span>
          <span style={styles.summaryValue}>{thisWeekNewTodos}건</span>
        </div>
      </div>

      <div style={styles.grid}>
        {/* 1. 진행 상태 비율 그래프 */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📈 진행 상태 비율</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.statusStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ statusName, percentage }: any) => `${statusName} ${(percentage as number).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                animationBegin={0}
                animationDuration={800}
              >
                {stats.statusStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 2. 우선순위별 분포 그래프 */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🎯 우선순위별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.priorityStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priorityName" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill="#8884d8"
                animationBegin={0}
                animationDuration={800}
              >
                {stats.priorityStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. 마감 임박 Todo 목록 */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⏰ 마감 임박 (3일 이내)</h3>
          <div style={styles.listContainer}>
            {stats.upcomingTodos.length === 0 ? (
              <div style={styles.emptyText}>마감 임박인 Todo가 없습니다.</div>
            ) : (
              stats.upcomingTodos.map((todo) => (
                <div key={todo.id} style={styles.listItem}>
                  <div style={styles.listItemContent}>
                    <div style={styles.listItemTitle}>{todo.title}</div>
                    <div style={styles.listItemMeta}>
                      <span style={{ ...styles.priorityBadge, backgroundColor: getPriorityColor(todo.priority) }}>
                        {todo.priorityName}
                      </span>
                      <span style={styles.daysLeft}>
                        {todo.daysLeft === 0 ? '오늘' : `${todo.daysLeft}일 후`}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. 사용자별 Todo 수 (관리자용) */}
        {stats.isAdmin && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>👥 사용자별 Todo 수</h3>
            <div style={styles.listContainer}>
              {stats.userStats.map((user) => (
                <div key={user.id} style={styles.listItem}>
                  <div style={styles.listItemContent}>
                    <div style={styles.listItemTitle}>
                      {user.firstName} {user.lastName} ({user.username})
                    </div>
                    <div style={styles.listItemMeta}>
                      <span style={styles.userStats}>
                        전체: {user.todoCount} | 완료: {user.completedCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. 최근 추가된 Todo */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🆕 최근 추가된 Todo</h3>
          <div style={styles.listContainer}>
            {stats.recentTodos.map((todo) => (
              <div key={todo.id} style={styles.listItem}>
                <div style={styles.listItemContent}>
                  <div style={styles.listItemTitle}>{todo.title}</div>
                  <div style={styles.listItemMeta}>
                    <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(todo.status) }}>
                      {todo.statusName}
                    </span>
                    {todo.userName && <span style={styles.userName}>- {todo.userName}</span>}
                    <span style={styles.dateText}>{formatDateTime(todo.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 최근 완료된 Todo */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>✅ 최근 완료된 Todo</h3>
          <div style={styles.listContainer}>
            {stats.recentlyCompletedTodos.map((todo) => (
              <div key={todo.id} style={styles.listItem}>
                <div style={styles.listItemContent}>
                  <div style={styles.listItemTitle}>{todo.title}</div>
                  <div style={styles.listItemMeta}>
                    {todo.userName && <span style={styles.userName}>- {todo.userName}</span>}
                    <span style={styles.dateText}>{formatDateTime(todo.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. 기간별 완료율 변화 */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📊 월별 완료율 변화</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '완료율']} />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#8884d8" 
                strokeWidth={2}
                animationBegin={0}
                animationDuration={800}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    margin: '0',
  },
  summaryBar: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  summaryLabel: {
    fontSize: '1rem',
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: '1.2rem',
    color: '#333',
    fontWeight: 'bold',
  },
  summaryDivider: {
    fontSize: '1.2rem',
    color: '#dee2e6',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef',
  },
  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 20px 0',
    borderBottom: '2px solid #e9ecef',
    paddingBottom: '10px',
    height: '50px', // 높이 통일
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.2',
  },
  listContainer: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  listItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f1f3f4',
  },
  listItemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listItemTitle: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333',
  },
  listItemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: 'white',
    fontWeight: '500',
  },
  priorityBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: 'white',
    fontWeight: '500',
  },
  daysLeft: {
    fontSize: '0.9rem',
    color: '#dc3545',
    fontWeight: '500',
  },
  userName: {
    fontSize: '0.85rem',
    color: '#6c757d',
  },
  dateText: {
    fontSize: '0.85rem',
    color: '#6c757d',
  },
  userStats: {
    fontSize: '0.9rem',
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    padding: '20px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  loadingText: {
    fontSize: '1.2rem',
    color: '#666',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  errorText: {
    fontSize: '1.2rem',
    color: '#dc3545',
  },
};

export default Dashboard;
