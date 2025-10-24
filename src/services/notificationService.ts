import axios, { AxiosResponse } from 'axios';
import { Notification, PagedNotificationResult } from '../types';

class NotificationService {
  private api = axios.create({
    baseURL: 'http://localhost:5248/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // 요청 인터셉터 - JWT 토큰 자동 추가
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 - 401 에러 시 로그인 페이지로 리다이렉트
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 알림 목록 조회
  async getNotifications(page: number = 1, pageSize: number = 10): Promise<PagedNotificationResult> {
    const response: AxiosResponse<PagedNotificationResult> = await this.api.get(
      `/notification?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  }

  // 읽지 않은 알림 개수 조회
  async getUnreadCount(): Promise<number> {
    const response: AxiosResponse<number> = await this.api.get('/notification/unread-count');
    return response.data;
  }

  // 알림 읽음 처리
  async markAsRead(notificationId: number): Promise<void> {
    await this.api.patch(`/notification/${notificationId}/read`);
  }

  // 모든 알림 읽음 처리
  async markAllAsRead(): Promise<void> {
    await this.api.patch('/notification/mark-all-read');
  }

  // 알림 삭제
  async deleteNotification(notificationId: number): Promise<void> {
    await this.api.delete(`/notification/${notificationId}`);
  }
}

export const notificationService = new NotificationService();
