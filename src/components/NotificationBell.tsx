import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { signalRService } from '../services/signalRService';
import NotificationPanel from './NotificationPanel';

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // 읽지 않은 알림 개수 로드
  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('읽지 않은 알림 개수 로드 실패:', error);
    }
  };

  // SignalR 연결 상태 확인
  const checkConnectionStatus = () => {
    setIsConnected(signalRService.getConnectionState());
  };

  useEffect(() => {
    // 초기 알림 개수 로드
    loadUnreadCount();

    // SignalR 이벤트 등록
    signalRService.onReceiveUnreadCount((count: number) => {
      setUnreadCount(count);
    });

    signalRService.onReceiveNotification(() => {
      // 새 알림이 오면 개수 업데이트
      loadUnreadCount();
    });

    // SignalR 연결 시작
    signalRService.startConnection();

    // 연결 상태 확인
    const interval = setInterval(checkConnectionStatus, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleBellClick = () => {
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <>
      <div style={styles.container}>
        <button
          style={{
            ...styles.bellButton,
            backgroundColor: isConnected ? '#28a745' : '#6c757d'
          }}
          onClick={handleBellClick}
          title={isConnected ? '알림 연결됨' : '알림 연결 끊김'}
        >
          🔔
          {unreadCount > 0 && (
            <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
        
        {/* 연결 상태 표시 */}
        <div style={{
          ...styles.statusIndicator,
          backgroundColor: isConnected ? '#28a745' : '#dc3545'
        }} />
      </div>

      <NotificationPanel 
        isOpen={isPanelOpen} 
        onClose={handleClosePanel} 
      />
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  bellButton: {
    position: 'relative',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    borderRadius: '50%',
    minWidth: '18px',
    height: '18px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid #ffffff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: '1px solid #ffffff',
  },
};

export default NotificationBell;
