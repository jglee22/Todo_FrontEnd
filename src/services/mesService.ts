import axios from 'axios';
import { 
  WorkOrder, 
  CreateWorkOrderRequest, 
  UpdateWorkOrderRequest, 
  UpdateWorkOrderStatusRequest, 
  UpdateWorkOrderQuantityRequest,
  MESStats,
  StatusDistribution,
  PriorityDistribution,
  UserPerformance,
  ProductionTrend
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5248';

class MESService {
  // 작업 지시서 목록 조회
  async getWorkOrders(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{
    workOrders: WorkOrder[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/workorder`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params
    });
    return response.data;
  }

  // 작업 지시서 상세 조회
  async getWorkOrder(id: number): Promise<WorkOrder> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/workorder/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  // 작업 지시서 생성
  async createWorkOrder(data: CreateWorkOrderRequest): Promise<WorkOrder> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/api/workorder`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // 작업 지시서 수정
  async updateWorkOrder(id: number, data: UpdateWorkOrderRequest): Promise<WorkOrder> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/api/workorder/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // 작업 지시서 상태 변경
  async updateWorkOrderStatus(id: number, data: UpdateWorkOrderStatusRequest): Promise<WorkOrder> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/api/workorder/${id}/status`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // 작업 지시서 수량 업데이트
  async updateWorkOrderQuantity(id: number, data: UpdateWorkOrderQuantityRequest): Promise<WorkOrder> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/api/workorder/${id}/quantity`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // 작업 지시서 삭제
  async deleteWorkOrder(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/api/workorder/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // MES 대시보드 통계 조회
  async getMESStats(): Promise<MESStats> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/mesdashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  // 상태별 분포 조회
  async getStatusDistribution(): Promise<StatusDistribution[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/mesdashboard/status-distribution`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  // 우선순위별 분포 조회
  async getPriorityDistribution(): Promise<PriorityDistribution[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/mesdashboard/priority-distribution`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  // 최근 작업 지시서 조회
  async getRecentWorkOrders(limit: number = 10): Promise<WorkOrder[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/mesdashboard/recent-workorders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { limit }
    });
    return response.data;
  }

  // 지연 작업 지시서 조회
  async getOverdueWorkOrders(limit: number = 10): Promise<WorkOrder[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/mesdashboard/overdue-workorders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { limit }
    });
    return response.data;
  }

  // 사용자 성과 조회 (관리자만)
  async getUserPerformance(): Promise<UserPerformance[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/mesdashboard/user-performance`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  // 생산 트렌드 조회
  async getProductionTrend(days: number = 30): Promise<ProductionTrend[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/mesdashboard/production-trend`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { days }
    });
    return response.data;
  }
}

export default new MESService();
