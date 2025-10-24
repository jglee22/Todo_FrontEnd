import React, { useState, useEffect } from 'react';
import { Notification, NotificationMessage, TodoUpdateMessage } from '../types';
import { notificationService } from '../services/notificationService';
import { signalRService } from '../services/signalRService';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 알림 목록 로드
  const loadNotifications = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications(pageNum, 10);
      
      if (append) {
        setNotifications(prev => [...prev, ...result.items]);
      } else {
        setNotifications(result.items);
      }
      
      setHasMore(result.page < result.totalPages);
      setPage(result.page);
    } catch (error) {
      console.error('알림 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 읽지 않은 알림 개수 로드
  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('읽지 않은 알림 개수 로드 실패:', error);
    }
  };

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 2, statusName: '읽음', readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 2, statusName: '읽음', readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  // 알림 삭제
  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  // 더 많은 알림 로드
  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, true);
    }
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: number): string => {
    switch (type) {
      case 1: return '⏰'; // 마감일 알림
      case 2: return '➕'; // Todo 생성
      case 3: return '✏️'; // Todo 수정
      case 4: return '✅'; // Todo 완료
      case 5: return '📢'; // 시스템 메시지
      default: return '📄';
    }
  };

  // 알림 타입별 색상
  const getNotificationColor = (type: number): string => {
    switch (type) {
      case 1: return '#ff6b6b'; // 마감일 알림 - 빨강
      case 2: return '#4ecdc4'; // Todo 생성 - 청록
      case 3: return '#45b7d1'; // Todo 수정 - 파랑
      case 4: return '#96ceb4'; // Todo 완료 - 초록
      case 5: return '#feca57'; // 시스템 메시지 - 노랑
      default: return '#6c757d';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays === 1) return '어제';
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}개월 전`;
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isOpen]);

  useEffect(() => {
    // SignalR 이벤트 등록
    signalRService.onReceiveNotification((notification: NotificationMessage) => {
      const newNotification: Notification = {
        ...notification,
        status: 1,
        statusName: '읽지 않음',
        readAt: undefined
      };
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    signalRService.onReceiveUnreadCount((count: number) => {
      setUnreadCount(count);
    });

    signalRService.onTodoCreated((message: TodoUpdateMessage) => {
      console.log('새 Todo 생성됨:', message);
    });

    signalRService.onTodoUpdated((message: TodoUpdateMessage) => {
      console.log('Todo 수정됨:', message);
    });

    signalRService.onTodoCompleted((message: TodoUpdateMessage) => {
      console.log('Todo 완료됨:', message);
    });

    // SignalR 연결 시작
    signalRService.startConnection();

    return () => {
      // 컴포넌트 언마운트 시 SignalR 연결 종료하지 않음 (다른 컴포넌트에서 사용할 수 있음)
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            🔔 알림
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </h3>
          <div style={styles.headerActions}>
            {unreadCount > 0 && (
              <button 
                style={styles.markAllButton}
                onClick={handleMarkAllAsRead}
              >
                모두 읽음
              </button>
            )}
            <button style={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {notifications.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyText}>알림이 없습니다</p>
            </div>
          ) : (
            <div style={styles.notificationList}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    ...styles.notificationItem,
                    backgroundColor: notification.status === 1 ? '#f8f9fa' : '#ffffff',
                    borderLeft: `4px solid ${getNotificationColor(notification.type)}`
                  }}
                >
                  <div style={styles.notificationHeader}>
                    <span style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <span style={styles.notificationTitle}>
                      {notification.title}
                    </span>
                    <div style={styles.notificationActions}>
                      {notification.status === 1 && (
                        <button
                          style={styles.readButton}
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="읽음 처리"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteNotification(notification.id)}
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {notification.message && (
                    <p style={styles.notificationMessage}>
                      {notification.message}
                    </p>
                  )}
                  
                  <div style={styles.notificationFooter}>
                    <span style={styles.notificationType}>
                      {notification.typeName}
                    </span>
                    <span style={styles.notificationDate}>
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <button
                  style={styles.loadMoreButton}
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? '로딩 중...' : '더 보기'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: '60px',
  },
  panel: {
    width: '400px',
    maxHeight: '80vh',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    marginRight: '20px',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  badge: {
    backgroundColor: '#dc3545',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  markAllButton: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  emptyText: {
    color: '#6c757d',
    fontSize: '1rem',
    margin: 0,
  },
  notificationList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 0',
  },
  notificationItem: {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f3f4',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  notificationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  notificationIcon: {
    fontSize: '1.2rem',
  },
  notificationTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    color: '#333',
  },
  notificationActions: {
    display: 'flex',
    gap: '4px',
  },
  readButton: {
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  notificationMessage: {
    margin: '0 0 8px 0',
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.4',
  },
  notificationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#999',
  },
  notificationType: {
    backgroundColor: '#f8f9fa',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  notificationDate: {
    fontSize: '0.8rem',
  },
  loadMoreButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    margin: '10px 20px',
  },
};

export default NotificationPanel;
