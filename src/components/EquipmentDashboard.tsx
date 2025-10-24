import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import equipmentService from '../services/equipmentService';
import { EquipmentStats, EquipmentStatusDistribution, EquipmentTypeDistribution, MaintenanceTrend, UtilizationByDepartment, EquipmentStatus, EquipmentType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ExcelExportButton from './ExcelExportButton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6666'];

const EquipmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 2;

  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<EquipmentStatusDistribution[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<EquipmentTypeDistribution[]>([]);
  const [maintenanceTrend, setMaintenanceTrend] = useState<MaintenanceTrend[]>([]);
  const [utilizationByDepartment, setUtilizationByDepartment] = useState<UtilizationByDepartment[]>([]);
  const [maintenanceDueEquipment, setMaintenanceDueEquipment] = useState<any[]>([]);
  const [recentFailures, setRecentFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        equipmentStats,
        statusDist,
        typeDist,
        maintTrend,
        maintDue,
        failures,
      ] = await Promise.all([
        equipmentService.getEquipmentStats(),
        equipmentService.getStatusDistribution(),
        equipmentService.getTypeDistribution(),
        equipmentService.getMaintenanceTrend(),
        equipmentService.getMaintenanceDueEquipment(5),
        equipmentService.getRecentFailures(5),
      ]);

      setStats(equipmentStats);
      setStatusDistribution(statusDist.map(item => ({
        ...item,
        displayName: getEquipmentStatusDisplayName(item.status)
      })));
      setTypeDistribution(typeDist.map(item => ({
        ...item,
        displayName: getEquipmentTypeDisplayName(item.type)
      })));
      setMaintenanceTrend(maintTrend);
      setMaintenanceDueEquipment(maintDue);
      setRecentFailures(failures);

      if (isAdmin) {
        const utilization = await equipmentService.getUtilizationByDepartment();
        setUtilizationByDepartment(utilization);
      }

    } catch (err) {
      console.error('Failed to fetch equipment dashboard data:', err);
      setError('대시보드 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentStatusDisplayName = (status: EquipmentStatus): string => {
    switch (status) {
      case EquipmentStatus.Operational: return '가동중';
      case EquipmentStatus.Idle: return '대기중';
      case EquipmentStatus.Maintenance: return '정비중';
      case EquipmentStatus.Breakdown: return '고장';
      case EquipmentStatus.Retired: return '폐기';
      default: return '알 수 없음';
    }
  };

  const getEquipmentTypeDisplayName = (type: EquipmentType): string => {
    switch (type) {
      case EquipmentType.Machine: return '기계';
      case EquipmentType.Tool: return '공구';
      case EquipmentType.Vehicle: return '차량';
      case EquipmentType.Computer: return '컴퓨터';
      case EquipmentType.Instrument: return '계측기';
      case EquipmentType.Other: return '기타';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status: EquipmentStatus): string => {
    switch (status) {
      case EquipmentStatus.Operational: return '#28a745';
      case EquipmentStatus.Idle: return '#ffc107';
      case EquipmentStatus.Maintenance: return '#007bff';
      case EquipmentStatus.Breakdown: return '#dc3545';
      case EquipmentStatus.Retired: return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getTypeColor = (type: EquipmentType): string => {
    switch (type) {
      case EquipmentType.Machine: return '#007bff';
      case EquipmentType.Tool: return '#28a745';
      case EquipmentType.Vehicle: return '#ffc107';
      case EquipmentType.Computer: return '#17a2b8';
      case EquipmentType.Instrument: return '#6f42c1';
      case EquipmentType.Other: return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div style={styles.loading}>설비 관리 대시보드 로딩 중...</div>;
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorMessage}>오류 발생</p>
        <p>{error}</p>
        <button onClick={fetchData} style={styles.retryButton}>다시 시도</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>🔧 설비 관리 대시보드</h2>
        <div style={styles.headerActions}>
          <ExcelExportButton exportType="equipment" />
        </div>
      </div>

      {stats && (
        <>
          <div style={styles.summaryBar}>
            <span>총 설비: {stats.summary.totalEquipment}</span>
            <span>가동률: {stats.summary.operationalRate.toFixed(1)}%</span>
            <span>평균 가동률: {stats.utilization.averageUtilizationRate.toFixed(1)}%</span>
            <span>정비 예정: {stats.summary.maintenanceDueEquipment}대</span>
          </div>

          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>총 설비</h3>
              <p style={styles.cardValue}>{stats.summary.totalEquipment}</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>가동중</h3>
              <p style={styles.cardValue}>{stats.summary.operationalEquipment}</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>정비중</h3>
              <p style={styles.cardValue}>{stats.summary.maintenanceEquipment}</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>고장</h3>
              <p style={styles.cardValue}>{stats.summary.breakdownEquipment}</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>대기중</h3>
              <p style={styles.cardValue}>{stats.summary.idleEquipment}</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>정비 예정</h3>
              <p style={styles.cardValue}>{stats.summary.maintenanceDueEquipment}</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>최근 고장</h3>
              <p style={styles.cardValue}>{stats.summary.recentFailures}</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>총 가동시간</h3>
              <p style={styles.cardValue}>{stats.utilization.totalOperatingHours.toLocaleString()}h</p>
            </div>
          </div>
        </>
      )}

      <div style={styles.chartGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 설비 상태별 분포</h3>
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

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🏭 설비 타입별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeDistribution.map(item => ({
              name: item.displayName,
              value: item.count,
              type: item.type
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d">
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTypeColor(entry.type)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {isAdmin && utilizationByDepartment.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🏢 부서별 가동률 (관리자 전용)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationByDepartment.map(item => ({
                department: item.department,
                utilizationRate: item.averageUtilizationRate
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilizationRate" fill="#8884d8" name="가동률 (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {maintenanceTrend.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>📈 정비 트렌드 (최근 30일)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={maintenanceTrend.map(item => ({
                date: item.date,
                scheduled: item.scheduledCount,
                completed: item.completedCount,
                inProgress: item.inProgressCount,
                overdue: item.overdueCount
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="scheduled" stroke="#ffc107" name="예정" />
                <Line type="monotone" dataKey="completed" stroke="#28a745" name="완료" />
                <Line type="monotone" dataKey="inProgress" stroke="#007bff" name="진행중" />
                <Line type="monotone" dataKey="overdue" stroke="#dc3545" name="지연" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={styles.listGrid}>
        <div style={styles.listCard}>
          <h3 style={styles.listTitle}>⚠️ 정비 예정 설비</h3>
          <div style={styles.listContent}>
            {maintenanceDueEquipment.length > 0 ? (
              maintenanceDueEquipment.map((equipment, index) => (
                <div key={index} style={styles.listItem}>
                  <div style={styles.listItemHeader}>
                    <strong>{equipment.equipmentCode}</strong>
                    <span style={styles.badge}>{equipment.equipmentName}</span>
                  </div>
                  <div style={styles.listItemDetails}>
                    <span>정비 예정일: {new Date(equipment.nextMaintenanceDate).toLocaleDateString()}</span>
                    <span style={styles.daysBadge}>
                      {equipment.daysUntilMaintenance > 0 ? `${equipment.daysUntilMaintenance}일 후` : '오늘'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.emptyMessage}>정비 예정인 설비가 없습니다.</p>
            )}
          </div>
        </div>

        <div style={styles.listCard}>
          <h3 style={styles.listTitle}>🚨 최근 고장</h3>
          <div style={styles.listContent}>
            {recentFailures.length > 0 ? (
              recentFailures.map((failure, index) => (
                <div key={index} style={styles.listItem}>
                  <div style={styles.listItemHeader}>
                    <strong>{failure.title}</strong>
                    <span style={styles.badge}>{failure.equipment.equipmentCode}</span>
                  </div>
                  <div style={styles.listItemDetails}>
                    <span>고장일: {new Date(failure.failureDate).toLocaleDateString()}</span>
                    <span style={styles.daysBadge}>
                      {failure.daysSinceFailure}일 전
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.emptyMessage}>최근 고장이 없습니다.</p>
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
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  headerTitle: {
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
  loading: {
    textAlign: 'center' as const,
    fontSize: '1.2rem',
    padding: '2rem',
  },
  errorContainer: {
    textAlign: 'center' as const,
    padding: '2rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    margin: '2rem auto',
    maxWidth: '600px',
  },
  errorMessage: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  retryButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#e9ecef',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#495057',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    textAlign: 'center' as const,
    borderLeft: '5px solid #007bff',
  },
  cardTitle: {
    fontSize: '1rem',
    color: '#6c757d',
    marginBottom: '0.5rem',
  },
  cardValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#343a40',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  listGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  listCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
  listTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  listContent: {
    maxHeight: '300px',
    overflowY: 'auto' as const,
  },
  listItem: {
    padding: '0.75rem',
    borderBottom: '1px solid #e9ecef',
    marginBottom: '0.5rem',
  },
  listItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  listItemDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#6c757d',
  },
  badge: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  daysBadge: {
    backgroundColor: '#ffc107',
    color: '#212529',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center' as const,
    color: '#6c757d',
    fontStyle: 'italic',
    padding: '2rem',
  },
};

export default EquipmentDashboard;
