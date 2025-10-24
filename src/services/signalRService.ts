import * as signalR from '@microsoft/signalr';
import { NotificationMessage, TodoUpdateMessage } from '../types';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;

  // SignalR 연결 시작
  async startConnection(): Promise<void> {
    if (this.connection && this.isConnected) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('JWT 토큰이 없어 SignalR 연결을 시작할 수 없습니다.');
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5248/notificationHub', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    // 연결 이벤트 핸들러
    this.connection.onclose((error) => {
      console.log('SignalR 연결이 종료되었습니다:', error);
      this.isConnected = false;
    });

    this.connection.onreconnecting((error) => {
      console.log('SignalR 재연결 중:', error);
      this.isConnected = false;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR 재연결 완료:', connectionId);
      this.isConnected = true;
    });

    try {
      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR 연결이 성공적으로 시작되었습니다.');
    } catch (error) {
      console.error('SignalR 연결 시작 실패:', error);
      this.isConnected = false;
    }
  }

  // SignalR 연결 종료
  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.isConnected = false;
      console.log('SignalR 연결이 종료되었습니다.');
    }
  }

  // 알림 수신 이벤트 등록
  onReceiveNotification(callback: (notification: NotificationMessage) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveNotification', callback);
    }
  }

  // 읽지 않은 알림 개수 수신 이벤트 등록
  onReceiveUnreadCount(callback: (count: number) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveUnreadCount', callback);
    }
  }

  // Todo 업데이트 수신 이벤트 등록
  onTodoUpdated(callback: (message: TodoUpdateMessage) => void): void {
    if (this.connection) {
      this.connection.on('TodoUpdated', callback);
    }
  }

  // Todo 생성 수신 이벤트 등록
  onTodoCreated(callback: (message: TodoUpdateMessage) => void): void {
    if (this.connection) {
      this.connection.on('TodoCreated', callback);
    }
  }

  // Todo 완료 수신 이벤트 등록
  onTodoCompleted(callback: (message: TodoUpdateMessage) => void): void {
    if (this.connection) {
      this.connection.on('TodoCompleted', callback);
    }
  }

  // 연결 상태 확인
  getConnectionState(): boolean {
    return this.isConnected;
  }

  // 연결 상태 확인
  getConnectionStateString(): string {
    if (!this.connection) return 'Disconnected';
    return this.connection.state;
  }
}

export const signalRService = new SignalRService();
