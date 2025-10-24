import axios from 'axios';
import { 
  Equipment, 
  CreateEquipmentRequest, 
  UpdateEquipmentRequest, 
  UpdateEquipmentStatusRequest, 
  UpdateOperatingHoursRequest,
  EquipmentStats,
  EquipmentStatusDistribution,
  EquipmentTypeDistribution,
  MaintenanceTrend,
  UtilizationByDepartment
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5248';

class EquipmentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // 설비 목록 조회
  async getEquipment(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: string;
    searchTerm?: string;
    assignedToUserId?: number;
    department?: string;
  }): Promise<{
    items: Equipment[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/api/equipment`, {
      headers: this.getAuthHeaders(),
      params
    });
    return response.data;
  }

  // 설비 상세 조회
  async getEquipmentById(id: number): Promise<Equipment> {
    const response = await axios.get(`${API_BASE_URL}/api/equipment/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // 설비 생성
  async createEquipment(data: CreateEquipmentRequest): Promise<Equipment> {
    const response = await axios.post(`${API_BASE_URL}/api/equipment`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // 설비 수정
  async updateEquipment(id: number, data: UpdateEquipmentRequest): Promise<Equipment> {
    const response = await axios.put(`${API_BASE_URL}/api/equipment/${id}`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // 설비 상태 변경
  async updateEquipmentStatus(id: number, data: UpdateEquipmentStatusRequest): Promise<Equipment> {
    const response = await axios.put(`${API_BASE_URL}/api/equipment/${id}/status`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // 설비 가동시간 업데이트
  async updateOperatingHours(id: number, data: UpdateOperatingHoursRequest): Promise<Equipment> {
    const response = await axios.put(`${API_BASE_URL}/api/equipment/${id}/operating-hours`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // 설비 삭제
  async deleteEquipment(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/equipment/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // 설비 대시보드 통계 조회
  async getEquipmentStats(): Promise<EquipmentStats> {
    const response = await axios.get(`${API_BASE_URL}/api/equipmentdashboard/stats`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // 설비 상태별 분포 조회
  async getStatusDistribution(): Promise<EquipmentStatusDistribution[]> {
    const response = await axios.get(`${API_BASE_URL}/api/equipmentdashboard/status-distribution`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // 설비 타입별 분포 조회
  async getTypeDistribution(): Promise<EquipmentTypeDistribution[]> {
    const response = await axios.get(`${API_BASE_URL}/api/equipmentdashboard/type-distribution`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // 정비 예정 설비 조회
  async getMaintenanceDueEquipment(limit: number = 10): Promise<Equipment[]> {
    const response = await axios.get(`${API_BASE_URL}/api/equipmentdashboard/maintenance-due`, {
      headers: this.getAuthHeaders(),
      params: { limit }
    });
    return response.data;
  }

  // 최근 고장 조회
  async getRecentFailures(limit: number = 10): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/api/equipmentdashboard/recent-failures`, {
      headers: this.getAuthHeaders(),
      params: { limit }
    });
    return response.data;
  }

  // 정비 트렌드 조회
  async getMaintenanceTrend(days: number = 30): Promise<MaintenanceTrend[]> {
    const response = await axios.get(`${API_BASE_URL}/api/equipmentdashboard/maintenance-trend`, {
      headers: this.getAuthHeaders(),
      params: { days }
    });
    return response.data;
  }

  // 부서별 가동률 조회 (관리자만)
  async getUtilizationByDepartment(): Promise<UtilizationByDepartment[]> {
    const response = await axios.get(`${API_BASE_URL}/api/equipmentdashboard/utilization-by-department`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}

export default new EquipmentService();
