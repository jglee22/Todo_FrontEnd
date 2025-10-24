import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Todo, 
  TodoDto, 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  PagedResult, 
  TodoQueryParams, 
  TodoStats, 
  Category, 
  Priority,
  Status,
  AdminUser,
  AdminTodo,
  SystemStats,
  ChangeRoleRequest
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5248/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터 - 토큰 자동 추가
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

    // 응답 인터셉터 - 에러 처리
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

  // 인증 관련 API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  // Todo 관련 API
  async getTodos(params?: TodoQueryParams): Promise<PagedResult<Todo>> {
    const response: AxiosResponse<PagedResult<Todo>> = await this.api.get('/todo', { params });
    return response.data;
  }

  async getTodoById(id: number): Promise<Todo> {
    const response: AxiosResponse<Todo> = await this.api.get(`/todo/${id}`);
    return response.data;
  }

  async createTodo(todo: TodoDto): Promise<Todo> {
    // 백엔드가 기대하는 CreateTodoRequest 형식으로 변환
    const request = {
      title: todo.title,
      description: todo.description || null,
      status: todo.status, // 상태 필드 추가
      category: todo.category, // 숫자로 전송 (enum 값)
      priority: todo.priority, // 숫자로 전송 (enum 값)
      startDate: todo.startDate || null, // 시작일 추가
      dueDate: todo.dueDate || null,
      tags: todo.tags || null
    };
    
    console.log('Sending request:', request); // 디버깅용
    
    const response: AxiosResponse<Todo> = await this.api.post('/todo', request);
    return response.data;
  }

  async updateTodo(id: number, todo: TodoDto): Promise<Todo> {
    // 백엔드가 기대하는 UpdateTodoRequest 형식으로 변환
    const request = {
      title: todo.title,
      description: todo.description || null,
      isCompleted: false, // 기본값 설정 (실제로는 백엔드에서 처리)
      status: todo.status, // 상태 필드 추가
      category: todo.category, // 숫자로 전송 (enum 값)
      priority: todo.priority, // 숫자로 전송 (enum 값)
      startDate: todo.startDate || null, // 시작일 추가
      dueDate: todo.dueDate || null,
      tags: todo.tags || null
    };
    
    console.log('Updating todo:', id, request); // 디버깅용
    
    const response: AxiosResponse<Todo> = await this.api.put(`/todo/${id}`, request);
    return response.data;
  }

  async deleteTodo(id: number): Promise<void> {
    await this.api.delete(`/todo/${id}`);
  }

  async toggleTodoComplete(id: number): Promise<Todo> {
    const response: AxiosResponse<Todo> = await this.api.patch(`/todo/${id}/complete`);
    return response.data;
  }

  async searchTodos(params: TodoQueryParams): Promise<PagedResult<Todo>> {
    const response: AxiosResponse<PagedResult<Todo>> = await this.api.get('/todo/search', { params });
    return response.data;
  }

  async getTodoStats(): Promise<TodoStats> {
    const response: AxiosResponse<TodoStats> = await this.api.get('/todo/stats');
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<{value: number, name: string}[]> = await this.api.get('/todo/categories');
    return response.data.map(item => ({
      id: item.value,
      name: item.name
    }));
  }

  async getPriorities(): Promise<Priority[]> {
    const response: AxiosResponse<{value: number, name: string}[]> = await this.api.get('/todo/priorities');
    return response.data.map(item => ({
      id: item.value,
      name: item.name
    }));
  }

  async getStatuses(): Promise<Status[]> {
    const response: AxiosResponse<{value: number, name: string}[]> = await this.api.get('/todo/statuses');
    return response.data.map(item => ({
      id: item.value,
      name: item.name
    }));
  }

  // 관리자 관련 메서드들
  async getAllUsers(): Promise<AdminUser[]> {
    const response: AxiosResponse<AdminUser[]> = await this.api.get('/admin/users');
    return response.data;
  }

  async getUser(id: number): Promise<AdminUser> {
    const response: AxiosResponse<AdminUser> = await this.api.get(`/admin/users/${id}`);
    return response.data;
  }

  async toggleUserActive(id: number): Promise<void> {
    await this.api.put(`/admin/users/${id}/toggle-active`);
  }

  async changeUserRole(id: number, role: number): Promise<void> {
    const request: ChangeRoleRequest = { role };
    await this.api.put(`/admin/users/${id}/role`, request);
  }

  async getAllTodos(): Promise<AdminTodo[]> {
    const response: AxiosResponse<AdminTodo[]> = await this.api.get('/admin/todos');
    return response.data;
  }

  async getUserTodos(userId: number): Promise<AdminTodo[]> {
    const response: AxiosResponse<AdminTodo[]> = await this.api.get(`/admin/users/${userId}/todos`);
    return response.data;
  }

  async getSystemStats(): Promise<SystemStats> {
    const response: AxiosResponse<SystemStats> = await this.api.get('/admin/stats');
    return response.data;
  }

  // 대시보드 통계 API
  async getDashboardStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/todo/dashboard');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
