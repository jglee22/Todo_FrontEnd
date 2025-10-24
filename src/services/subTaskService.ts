import axios from 'axios';
import { SubTask, CreateSubTaskRequest, UpdateSubTaskRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5248';

class SubTaskService {
  // 하위 작업 목록 조회
  async getSubTasks(todoId: number): Promise<SubTask[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/subtask/${todoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  // 하위 작업 추가
  async createSubTask(todoId: number, request: CreateSubTaskRequest): Promise<SubTask> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/api/subtask/${todoId}`, request, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // 하위 작업 완료/미완료 토글
  async toggleSubTask(subTaskId: number): Promise<SubTask> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/api/subtask/${subTaskId}/toggle`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // 하위 작업 수정
  async updateSubTask(subTaskId: number, request: UpdateSubTaskRequest): Promise<SubTask> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/api/subtask/${subTaskId}`, request, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // 하위 작업 삭제
  async deleteSubTask(subTaskId: number): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/api/subtask/${subTaskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

export default new SubTaskService();
