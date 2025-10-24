// API 응답 타입들
export interface Todo {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  status: number;
  statusName: string;
  category: number;
  categoryName: string;
  priority: number;
  priorityName: string;
  startDate?: string;
  dueDate?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  userId?: number;
  userName?: string;
}

export interface TodoDto {
  title: string;
  description: string;
  status: number;
  category: number;
  priority: number;
  startDate?: string;
  dueDate?: string;
  tags?: string;
}

// 파일 첨부 관련 타입
export interface TodoAttachment {
  id: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface FileUploadResponse {
  id: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  message: string;
}

// 하위 작업 관련 타입
export interface SubTask {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
  order: number;
}

export interface CreateSubTaskRequest {
  title: string;
}

export interface UpdateSubTaskRequest {
  title: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  role: number;
  roleName: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TodoQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  category?: number;
  priority?: number;
  status?: number;
  isCompleted?: boolean;
  searchTerm?: string;
  tags?: string;
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  overdueTodos: number;
  // 상태별 통계 추가
  notStarted: number;
  inProgress: number;
  completedStatus: number;
  onHold: number;
  categoryStats: CategoryStat[];
  priorityStats: PriorityStat[];
}

export interface CategoryStat {
  categoryId: number;
  categoryName: string;
  count: number;
}

export interface PriorityStat {
  priorityId: number;
  priorityName: string;
  count: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Priority {
  id: number;
  name: string;
}

export interface Status {
  id: number;
  name: string;
}

// 관리자 관련 타입들
export interface AdminUser extends User {
  todoCount?: number;
}

export interface AdminTodo extends Todo {
  userName: string;
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    regularUsers: number;
  };
  todos: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  statusStats: Array<{
    status: number;
    statusName: string;
    count: number;
  }>;
  categoryStats: Array<{
    category: number;
    categoryName: string;
    count: number;
  }>;
  priorityStats: Array<{
    priority: number;
    priorityName: string;
    count: number;
  }>;
  recentUsers: Array<{
    id: number;
    username: string;
    email: string;
    createdAt: string;
    isActive: boolean;
    role: string;
  }>;
}

export interface ChangeRoleRequest {
  role: number;
}

// 알림 관련 타입들
export interface Notification {
  id: number;
  title: string;
  message?: string;
  type: number;
  typeName: string;
  status: number;
  statusName: string;
  todoId?: number;
  createdAt: string;
  readAt?: string;
}

export interface NotificationMessage {
  id: number;
  title: string;
  message?: string;
  type: number;
  typeName: string;
  todoId?: number;
  createdAt: string;
}

export interface TodoUpdateMessage {
  todoId: number;
  title: string;
  action: string;
  timestamp: string;
}

export interface PagedNotificationResult {
  items: Notification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export enum NotificationType {
  DueDateReminder = 1,
  TodoCreated = 2,
  TodoUpdated = 3,
  TodoCompleted = 4,
  SystemMessage = 5
}

export enum NotificationStatus {
  Unread = 1,
  Read = 2,
  Archived = 3
}

// MES 관련 타입들
export interface WorkOrder {
  id: number;
  orderNumber: string;
  productName: string;
  description?: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  plannedQuantity: number;
  completedQuantity: number;
  defectiveQuantity: number;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  progressPercentage: number;
  remainingQuantity: number;
  isCompleted: boolean;
  isOverdue: boolean;
  assignedToUser: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdByUser: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  steps?: WorkOrderStep[];
  qualityChecks?: QualityCheck[];
  attachments?: WorkOrderAttachment[];
}

export interface WorkOrderStep {
  id: number;
  stepName: string;
  description?: string;
  sequence: number;
  estimatedMinutes: number;
  actualMinutes: number;
  status: WorkOrderStepStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  isCompleted: boolean;
  isInProgress: boolean;
  duration?: string;
  assignedToUser: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface QualityCheck {
  id: number;
  checkItem: string;
  standard?: string;
  type: QualityCheckType;
  result: QualityCheckResult;
  measuredValue?: string;
  notes?: string;
  checkedAt: string;
  isPassed: boolean;
  isFailed: boolean;
  isPending: boolean;
  checkedByUser: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface WorkOrderAttachment {
  id: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  uploadedBy: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export enum WorkOrderStatus {
  Pending = 0,        // 대기
  InProgress = 1,     // 진행중
  OnHold = 2,         // 보류
  Completed = 3,      // 완료
  Cancelled = 4       // 취소
}

export enum WorkOrderPriority {
  Low = 0,           // 낮음
  Medium = 1,        // 보통
  High = 2,          // 높음
  Critical = 3       // 긴급
}

export enum WorkOrderStepStatus {
  Pending = 0,        // 대기
  InProgress = 1,     // 진행중
  Completed = 2,      // 완료
  Skipped = 3         // 건너뜀
}

export enum QualityCheckType {
  Inspection = 0,     // 검사
  Test = 1,          // 시험
  Measurement = 2,   // 측정
  Verification = 3   // 검증
}

export enum QualityCheckResult {
  Pending = 0,       // 대기
  Passed = 1,        // 합격
  Failed = 2,        // 불합격
  Conditional = 3    // 조건부 합격
}

export interface CreateWorkOrderRequest {
  orderNumber: string;
  productName: string;
  description?: string;
  priority: WorkOrderPriority;
  plannedQuantity: number;
  startDate?: string;
  dueDate?: string;
  assignedToUserId: number;
}

export interface UpdateWorkOrderRequest {
  orderNumber: string;
  productName: string;
  description?: string;
  priority: WorkOrderPriority;
  plannedQuantity: number;
  startDate?: string;
  dueDate?: string;
  assignedToUserId: number;
}

export interface UpdateWorkOrderStatusRequest {
  status: WorkOrderStatus;
}

export interface UpdateWorkOrderQuantityRequest {
  completedQuantity: number;
  defectiveQuantity: number;
}

export interface MESStats {
  summary: {
    totalWorkOrders: number;
    completedWorkOrders: number;
    inProgressWorkOrders: number;
    pendingWorkOrders: number;
    onHoldWorkOrders: number;
    overdueWorkOrders: number;
    completionRate: number;
  };
  production: {
    totalPlannedQuantity: number;
    totalCompletedQuantity: number;
    totalDefectiveQuantity: number;
    productionRate: number;
    defectRate: number;
    remainingQuantity: number;
  };
  timeline: {
    todayCompleted: number;
    weekCompleted: number;
    monthCompleted: number;
  };
}

export interface StatusDistribution {
  status: WorkOrderStatus;
  count: number;
  displayName: string;
}

export interface PriorityDistribution {
  priority: WorkOrderPriority;
  count: number;
  displayName: string;
}

export interface UserPerformance {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}

export interface ProductionTrend {
  date: string;
  completedCount: number;
  completedQuantity: number;
  defectiveQuantity: number;
}

// 설비 관리 관련 타입들
export interface Equipment {
  id: number;
  equipmentCode: string;
  equipmentName: string;
  description?: string;
  type: EquipmentType;
  typeName: string;
  status: EquipmentStatus;
  statusName: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  expectedLifetimeHours?: number;
  currentOperatingHours: number;
  location?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  assignedToUser?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdByUser: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  isOperational: boolean;
  isMaintenanceDue: boolean;
  utilizationRate: number;
  maintenanceRecords?: MaintenanceRecord[];
  failures?: EquipmentFailure[];
  attachments?: EquipmentAttachment[];
}

export interface MaintenanceRecord {
  id: number;
  title: string;
  description?: string;
  type: MaintenanceType;
  typeName: string;
  status: MaintenanceStatus;
  statusName: string;
  scheduledDate?: string;
  startedDate?: string;
  completedDate?: string;
  estimatedDurationMinutes?: number;
  actualDurationMinutes?: number;
  partsUsed?: string;
  cost?: number;
  workPerformed?: string;
  notes?: string;
  createdAt: string;
  assignedToUser?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdByUser: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  isCompleted: boolean;
  isInProgress: boolean;
  isOverdue: boolean;
}

export interface EquipmentFailure {
  id: number;
  title: string;
  description?: string;
  type: FailureType;
  typeName: string;
  severity: FailureSeverity;
  severityName: string;
  failureDate: string;
  resolvedDate?: string;
  rootCause?: string;
  resolution?: string;
  preventiveAction?: string;
  repairCost?: number;
  downtimeMinutes?: number;
  notes?: string;
  createdAt: string;
  assignedToUser?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  reportedByUser: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  isResolved: boolean;
  daysSinceFailure: number;
}

export interface EquipmentAttachment {
  id: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  description?: string;
  uploadedAt: string;
  uploadedBy: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export enum EquipmentType {
  Machine = 0,        // 기계
  Tool = 1,          // 공구
  Vehicle = 2,       // 차량
  Computer = 3,      // 컴퓨터
  Instrument = 4,    // 계측기
  Other = 5         // 기타
}

export enum EquipmentStatus {
  Operational = 0,   // 가동중
  Idle = 1,          // 대기중
  Maintenance = 2,    // 정비중
  Breakdown = 3,     // 고장
  Retired = 4        // 폐기
}

export enum MaintenanceType {
  Preventive = 0,    // 예방정비
  Corrective = 1,    // 수리정비
  Predictive = 2,    // 예측정비
  Emergency = 3      // 긴급정비
}

export enum MaintenanceStatus {
  Scheduled = 0,     // 예정
  InProgress = 1,    // 진행중
  Completed = 2,     // 완료
  Cancelled = 3,     // 취소
  Overdue = 4       // 지연
}

export enum FailureType {
  Mechanical = 0,    // 기계적 고장
  Electrical = 1,   // 전기적 고장
  Hydraulic = 2,    // 유압 고장
  Pneumatic = 3,    // 공압 고장
  Software = 4,     // 소프트웨어 고장
  Human = 5,        // 인적 오류
  Environmental = 6, // 환경적 요인
  Other = 7         // 기타
}

export enum FailureSeverity {
  Low = 0,          // 낮음
  Medium = 1,       // 보통
  High = 2,         // 높음
  Critical = 3      // 심각
}

export interface CreateEquipmentRequest {
  equipmentCode: string;
  equipmentName: string;
  description?: string;
  type: EquipmentType;
  status: EquipmentStatus;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
  nextMaintenanceDate?: string;
  expectedLifetimeHours?: number;
  location?: string;
  department?: string;
  assignedToUserId?: number;
}

export interface UpdateEquipmentRequest {
  equipmentCode: string;
  equipmentName: string;
  description?: string;
  type: EquipmentType;
  status: EquipmentStatus;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
  nextMaintenanceDate?: string;
  expectedLifetimeHours?: number;
  location?: string;
  department?: string;
  assignedToUserId?: number;
}

export interface UpdateEquipmentStatusRequest {
  status: EquipmentStatus;
}

export interface UpdateOperatingHoursRequest {
  currentOperatingHours: number;
}

export interface EquipmentStats {
  summary: {
    totalEquipment: number;
    operationalEquipment: number;
    maintenanceEquipment: number;
    breakdownEquipment: number;
    idleEquipment: number;
    maintenanceDueEquipment: number;
    recentFailures: number;
    operationalRate: number;
  };
  utilization: {
    totalOperatingHours: number;
    totalExpectedLifetime: number;
    averageUtilizationRate: number;
  };
}

export interface EquipmentStatusDistribution {
  status: EquipmentStatus;
  count: number;
  displayName: string;
}

export interface EquipmentTypeDistribution {
  type: EquipmentType;
  count: number;
  displayName: string;
}

export interface MaintenanceTrend {
  date: string;
  scheduledCount: number;
  completedCount: number;
  inProgressCount: number;
  overdueCount: number;
}

export interface UtilizationByDepartment {
  department: string;
  totalEquipment: number;
  operationalEquipment: number;
  totalOperatingHours: number;
  totalExpectedLifetime: number;
  averageUtilizationRate: number;
}
