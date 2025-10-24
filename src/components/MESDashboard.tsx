import React, { useState, useEffect } from 'react';
import { 
  MESStats, 
  StatusDistribution, 
  PriorityDistribution, 
  WorkOrder, 
  UserPerformance, 
  ProductionTrend,
  WorkOrderStatus,
  WorkOrderPriority
} from '../types';
import mesService from '../services/mesService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import ExcelExportButton from './ExcelExportButton';

const MESDashboard: React.FC = () => {
  const [stats, setStats] = useState<MESStats | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution[]>([]);
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrder[]>([]);
  const [overdueWorkOrders, setOverdueWorkOrders] = useState<WorkOrder[]>([]);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [productionTrend, setProductionTrend] = useState<ProductionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsData,
        statusData,
        priorityData,
        recentData,
        overdueData,
        userData,
        trendData
      ] = await Promise.all([
        mesService.getMESStats(),
        mesService.getStatusDistribution(),
        mesService.getPriorityDistribution(),
        mesService.getRecentWorkOrders(5),
        mesService.getOverdueWorkOrders(5),
        mesService.getUserPerformance().catch(() => []), // 관리자가 아닐 수 있으므로 에러 무시
        mesService.getProductionTrend(30)
      ]);

      setStats(statsData);
      setStatusDistribution(statusData);
      setPriorityDistribution(priorityData);
      setRecentWorkOrders(recentData);
      setOverdueWorkOrders(overdueData);
      setUserPerformance(userData);
      setProductionTrend(trendData);
    } catch (err) {
      console.error('대시보드 데이터 로드 실패:', err);
      setError('대시보드 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: WorkOrderStatus): string => {
    switch (status) {
      case WorkOrderStatus.Pending: return '#ffc107';
      case WorkOrderStatus.InProgress: return '#007bff';
      case WorkOrderStatus.OnHold: return '#6c757d';
      case WorkOrderStatus.Completed: return '#28a745';
      case WorkOrderStatus.Cancelled: return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: WorkOrderPriority): string => {
    switch (priority) {
      case WorkOrderPriority.Low: return '#28a745';
      case WorkOrderPriority.Medium: return '#ffc107';
      case WorkOrderPriority.High: return '#fd7e14';
      case WorkOrderPriority.Critical: return '#dc3545';
      default: return '#6c757d';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>MES 대시보드 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>❌ 오류 발생</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} style={styles.retryButton}>
          다시 시도
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.errorContainer}>
        <h2>📊 MES 대시보드</h2>
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏭 MES 생산 관리 대시보드</h1>
        <div style={styles.headerActions}>
          <ExcelExportButton exportType="workorders" />
        </div>
      </div>
      <div style={styles.summaryBar}>
        <span>총 작업지시서: {stats.summary.totalWorkOrders}개</span>
        <span>생산률: {stats.production.productionRate.toFixed(1)}%</span>
        <span>완료율: {stats.summary.completionRate.toFixed(1)}%</span>
        <span>이번 주 완료: {stats.timeline.weekCompleted}개</span>
      </div>

      {/* 주요 지표 카드들 */}
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📋 전체 작업지시서</h3>
          <div style={styles.cardValue}>{stats.summary.totalWorkOrders}</div>
          <div style={styles.cardSubtext}>총 작업지시서 수</div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>✅ 완료된 작업</h3>
          <div style={styles.cardValue}>{stats.summary.completedWorkOrders}</div>
          <div style={styles.cardSubtext}>완료율: {stats.summary.completionRate.toFixed(1)}%</div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚡ 진행중인 작업</h3>
          <div style={styles.cardValue}>{stats.summary.inProgressWorkOrders}</div>
          <div style={styles.cardSubtext}>현재 진행중</div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚠️ 지연된 작업</h3>
          <div style={styles.cardValue}>{stats.summary.overdueWorkOrders}</div>
          <div style={styles.cardSubtext}>마감일 초과</div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📦 생산 수량</h3>
          <div style={styles.cardValue}>{stats.production.totalCompletedQuantity}</div>
          <div style={styles.cardSubtext}>완료 수량 / {stats.production.totalPlannedQuantity} 계획</div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔍 불량률</h3>
          <div style={styles.cardValue}>{stats.production.defectRate.toFixed(1)}%</div>
          <div style={styles.cardSubtext}>불량 수량: {stats.production.totalDefectiveQuantity}</div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div style={styles.chartsGrid}>
        {/* 상태별 분포 파이 차트 */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 작업 상태별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution.map(item => ({
                  name: item.displayName,
                  value: item.count,
                  status: item.status
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 우선순위별 분포 바 차트 */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🎯 우선순위별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityDistribution.map(item => ({
              name: item.displayName,
              value: item.count,
              priority: item.priority
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 생산 트렌드 라인 차트 */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 생산 트렌드 (최근 30일)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionTrend.map(item => ({
              date: item.date,
              completedQuantity: item.completedQuantity,
              defectiveQuantity: item.defectiveQuantity
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completedQuantity" stroke="#8884d8" name="완료 수량" />
              <Line type="monotone" dataKey="defectiveQuantity" stroke="#ff7300" name="불량 수량" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 사용자 성과 (관리자만) */}
        {userPerformance.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>👥 사용자별 성과</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userPerformance.map(item => ({
                username: item.username,
                completionRate: item.completionRate
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#8884d8" name="완료율 (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 최근 작업지시서 및 지연 작업 */}
      <div style={styles.listsGrid}>
        <div style={styles.listCard}>
          <h3 style={styles.listTitle}>🕒 최근 작업지시서</h3>
          <div style={styles.listContainer}>
            {recentWorkOrders.map(workOrder => (
              <div key={workOrder.id} style={styles.listItem}>
                <div style={styles.listItemHeader}>
                  <span style={styles.listItemTitle}>{workOrder.orderNumber}</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(workOrder.status)
                  }}>
                    {workOrder.status === WorkOrderStatus.Pending && '대기'}
                    {workOrder.status === WorkOrderStatus.InProgress && '진행중'}
                    {workOrder.status === WorkOrderStatus.OnHold && '보류'}
                    {workOrder.status === WorkOrderStatus.Completed && '완료'}
                    {workOrder.status === WorkOrderStatus.Cancelled && '취소'}
                  </span>
                </div>
                <div style={styles.listItemContent}>
                  <div>{workOrder.productName}</div>
                  <div style={styles.listItemSubtext}>
                    담당: {workOrder.assignedToUser.username} | 
                    진행률: {workOrder.progressPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.listCard}>
          <h3 style={styles.listTitle}>⚠️ 지연된 작업지시서</h3>
          <div style={styles.listContainer}>
            {overdueWorkOrders.length === 0 ? (
              <div style={styles.emptyMessage}>지연된 작업이 없습니다. 👍</div>
            ) : (
              overdueWorkOrders.map(workOrder => (
                <div key={workOrder.id} style={styles.listItem}>
                  <div style={styles.listItemHeader}>
                    <span style={styles.listItemTitle}>{workOrder.orderNumber}</span>
                    <span style={styles.overdueBadge}>
                      {workOrder.dueDate ? 
                        `${Math.ceil((new Date().getTime() - new Date(workOrder.dueDate).getTime()) / (1000 * 60 * 60 * 24))}일 지연` : 
                        '지연'
                      }
                    </span>
                  </div>
                  <div style={styles.listItemContent}>
                    <div>{workOrder.productName}</div>
                    <div style={styles.listItemSubtext}>
                      담당: {workOrder.assignedToUser.username} | 
                      마감: {workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : '미정'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  summaryBar: {
    display: 'flex',
    gap: '2rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '0.9rem',
    color: '#666',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  cardTitle: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  cardValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  cardSubtext: {
    fontSize: '0.8rem',
    color: '#999',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  listsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1rem',
  },
  listCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  listTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1rem',
  },
  listContainer: {
    maxHeight: '400px',
    overflowY: 'auto' as const,
  },
  listItem: {
    padding: '1rem',
    borderBottom: '1px solid #eee',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  listItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  listItemTitle: {
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: 'white',
    fontWeight: '500',
  },
  overdueBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    backgroundColor: '#dc3545',
    color: 'white',
    fontWeight: '500',
  },
  listItemContent: {
    fontSize: '0.9rem',
    color: '#666',
  },
  listItemSubtext: {
    fontSize: '0.8rem',
    color: '#999',
    marginTop: '0.25rem',
  },
  emptyMessage: {
    textAlign: 'center' as const,
    color: '#999',
    fontStyle: 'italic',
    padding: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    textAlign: 'center' as const,
  },
  retryButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
};

export default MESDashboard;
