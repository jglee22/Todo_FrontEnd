import React, { useState, useEffect } from 'react';
import { Todo, TodoQueryParams, TodoStats, Category, Priority, Status } from '../types';
import apiService from '../services/api';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import CalendarView from './CalendarView';
import TodoDetailPanel from './TodoDetailPanel';
import ExcelExportButton from './ExcelExportButton';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [filters, setFilters] = useState<TodoQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  useEffect(() => {
    loadData();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [todosData, statsData, categoriesData, prioritiesData, statusesData] = await Promise.all([
        apiService.getTodos(filters),
        apiService.getTodoStats(),
        apiService.getCategories(),
        apiService.getPriorities(),
        apiService.getStatuses(),
      ]);

      setTodos(todosData.data);
      setPagination({
        pageNumber: todosData.pageNumber,
        pageSize: todosData.pageSize,
        totalPages: todosData.totalPages,
        totalCount: todosData.totalCount,
        hasPreviousPage: todosData.hasPreviousPage,
        hasNextPage: todosData.hasNextPage,
      });
      setStats(statsData);
      setCategories(categoriesData);
      setPriorities(prioritiesData);
      setStatuses(statusesData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TodoQueryParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // 필터 변경 시 첫 페이지로 리셋
    }));
  };

  // 통계 카드 클릭 핸들러 추가
  const handleStatCardClick = (statusType: 'all' | 'completed' | 'inProgress' | 'overdue' | 'notStarted' | 'onHold') => {
    switch (statusType) {
      case 'all':
        // 모든 필터 초기화
        setFilters({
          page: 1,
          pageSize: 10,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        });
        break;
      case 'completed':
        // 완료된 Todo만 표시 (status = 3)
        setFilters(prev => ({
          ...prev,
          status: 3,
          page: 1,
        }));
        break;
      case 'inProgress':
        // 진행 중인 Todo만 표시 (status = 2)
        setFilters(prev => ({
          ...prev,
          status: 2,
          page: 1,
        }));
        break;
      case 'overdue':
        // 지연된 Todo만 표시 (status = 4)
        setFilters(prev => ({
          ...prev,
          status: 4,
          page: 1,
        }));
        break;
      case 'notStarted':
        // 시작 전 Todo만 표시 (status = 1)
        setFilters(prev => ({
          ...prev,
          status: 1,
          page: 1,
        }));
        break;
      case 'onHold':
        // 보류 Todo만 표시 (status = 4)
        setFilters(prev => ({
          ...prev,
          status: 4,
          page: 1,
        }));
        break;
    }
  };

  // 현재 선택된 상태 확인 함수
  const getSelectedStatus = () => {
    if (!filters.status) return 'all';
    switch (filters.status) {
      case 3: return 'completed';
      case 2: return 'inProgress';
      case 4: return 'onHold'; // 보류와 지연을 같은 상태로 처리
      case 1: return 'notStarted';
      default: return 'all';
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleTodoSave = (todo: Todo) => {
    if (editingTodo) {
      setTodos(prev => prev.map(t => t.id === todo.id ? todo : t));
    } else {
      setTodos(prev => [todo, ...prev]);
    }
    setShowForm(false);
    setEditingTodo(undefined);
    loadData(); // 통계 업데이트를 위해
  };

  const handleTodoUpdate = (todo: Todo) => {
    setTodos(prev => prev.map(t => t.id === todo.id ? todo : t));
    
    // 상세 패널이 열려있고 같은 Todo라면 selectedTodo도 업데이트
    if (showDetailPanel && selectedTodo && selectedTodo.id === todo.id) {
      setSelectedTodo(todo);
    }
    
    loadData(); // 통계 업데이트를 위해
  };

  const handleTodoDelete = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    loadData(); // 통계 업데이트를 위해
  };

  const handleTodoClick = async (todo: Todo) => {
    // 최신 Todo 데이터를 가져와서 상세 패널에 표시
    try {
      const latestTodo = await apiService.getTodoById(todo.id);
      setSelectedTodo(latestTodo);
      setShowDetailPanel(true);
    } catch (error) {
      console.error('Todo 상세 정보 조회 실패:', error);
      // 실패 시 기존 데이터로 fallback
      setSelectedTodo(todo);
      setShowDetailPanel(true);
    }
  };

  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedTodo(null);
  };

  const handleEditFromDetail = (todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleDeleteFromDetail = async (id: number) => {
    try {
      await apiService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      loadData(); // 통계 업데이트
    } catch (error) {
      console.error('Todo 삭제 실패:', error);
    }
  };

  const handleToggleCompleteFromDetail = async (id: number) => {
    try {
      const updatedTodo = await apiService.toggleTodoComplete(id);
      
      // todos 상태 업데이트
      const newTodos = todos.map(todo => todo.id === id ? updatedTodo : todo);
      setTodos(newTodos);
      
      // selectedTodo도 즉시 업데이트
      if (selectedTodo && selectedTodo.id === id) {
        setSelectedTodo(updatedTodo);
      }
      
      // 통계 업데이트
      await loadData();
    } catch (error) {
      console.error('Todo 상태 변경 실패:', error);
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
  };

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Todo 관리</h1>
        <div style={styles.headerButtons}>
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'list' ? styles.activeViewButton : {}),
              }}
            >
              📋 리스트
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'calendar' ? styles.activeViewButton : {}),
              }}
            >
              📅 캘린더
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ExcelExportButton exportType="todos" />
            <button
              onClick={() => setShowForm(true)}
              style={styles.addButton}
            >
              + 새 Todo 추가
            </button>
          </div>
        </div>
      </div>

      {/* 통계 */}
      {stats && (
        <div style={styles.stats}>
          <div 
            style={{
              ...styles.statCard,
              ...(getSelectedStatus() === 'all' ? styles.selectedStatCard : {}),
              cursor: 'pointer',
            }}
            onClick={() => handleStatCardClick('all')}
          >
            <div style={styles.statNumber}>{stats.totalTodos}</div>
            <div style={styles.statLabel}>전체</div>
          </div>
          <div 
            style={{
              ...styles.statCard,
              ...(getSelectedStatus() === 'notStarted' ? styles.selectedStatCard : {}),
              cursor: 'pointer',
            }}
            onClick={() => handleStatCardClick('notStarted')}
          >
            <div style={styles.statNumber}>{stats.notStarted}</div>
            <div style={styles.statLabel}>시작전</div>
          </div>
          <div 
            style={{
              ...styles.statCard,
              ...(getSelectedStatus() === 'inProgress' ? styles.selectedStatCard : {}),
              cursor: 'pointer',
            }}
            onClick={() => handleStatCardClick('inProgress')}
          >
            <div style={styles.statNumber}>{stats.inProgress}</div>
            <div style={styles.statLabel}>진행중</div>
          </div>
          <div 
            style={{
              ...styles.statCard,
              ...(getSelectedStatus() === 'completed' ? styles.selectedStatCard : {}),
              cursor: 'pointer',
            }}
            onClick={() => handleStatCardClick('completed')}
          >
            <div style={styles.statNumber}>{stats.completedStatus}</div>
            <div style={styles.statLabel}>완료</div>
          </div>
          <div 
            style={{
              ...styles.statCard,
              ...(getSelectedStatus() === 'onHold' ? styles.selectedStatCard : {}),
              cursor: 'pointer',
            }}
            onClick={() => handleStatCardClick('onHold')}
          >
            <div style={styles.statNumber}>{stats.onHold}</div>
            <div style={styles.statLabel}>보류</div>
          </div>
        </div>
      )}

      {/* 필터 (리스트 뷰에서만 표시) */}
      {viewMode === 'list' && (
        <div style={styles.filters}>
        <div style={styles.filterRow}>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value ? parseInt(e.target.value) : undefined)}
            style={styles.filterSelect}
          >
            <option value="">모든 카테고리</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value ? parseInt(e.target.value) : undefined)}
            style={styles.filterSelect}
          >
            <option value="">모든 우선순위</option>
            {priorities.map(pri => (
              <option key={pri.id} value={pri.id}>{pri.name}</option>
            ))}
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value ? parseInt(e.target.value) : undefined)}
            style={styles.filterSelect}
          >
            <option value="">모든 상태</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="검색어..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value || undefined)}
            style={styles.searchInput}
          />

          <button onClick={clearFilters} style={styles.clearButton}>
            필터 초기화
          </button>
        </div>

        <div style={styles.sortRow}>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            style={styles.sortSelect}
          >
            <option value="createdAt">생성일</option>
            <option value="title">제목</option>
            <option value="priority">우선순위</option>
            <option value="dueDate">마감일</option>
          </select>

          <select
            value={filters.sortDirection || 'desc'}
            onChange={(e) => handleFilterChange('sortDirection', e.target.value as 'asc' | 'desc')}
            style={styles.sortSelect}
          >
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </div>
      </div>
      )}

      {/* 메인 콘텐츠 */}
      {viewMode === 'list' ? (
        <>
          {/* Todo 목록 */}
      <div style={styles.todoList}>
        {todos.length === 0 ? (
          <div style={styles.emptyState}>
            <p>등록된 Todo가 없습니다.</p>
            <button
              onClick={() => setShowForm(true)}
              style={styles.addButton}
            >
              첫 번째 Todo 추가하기
            </button>
          </div>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={handleTodoUpdate}
              onDelete={handleTodoDelete}
              onViewDetail={handleTodoClick}
            />
          ))
        )}
      </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={!pagination.hasPreviousPage}
                style={styles.pageButton}
              >
                이전
              </button>
              
              <span style={styles.pageInfo}>
                {pagination.pageNumber} / {pagination.totalPages} 페이지
                ({pagination.totalCount}개 항목)
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={!pagination.hasNextPage}
                style={styles.pageButton}
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : (
        /* 캘린더 뷰 */
        <CalendarView onTodoClick={handleTodoClick} />
      )}

      {/* Todo 폼 모달 */}
      {showForm && (
        <TodoForm
          todo={editingTodo}
          onSave={handleTodoSave}
          onCancel={() => {
            setShowForm(false);
            setEditingTodo(undefined);
          }}
        />
      )}

      {/* Todo 상세 패널 */}
      <TodoDetailPanel
        todo={selectedTodo}
        isOpen={showDetailPanel}
        onClose={handleCloseDetailPanel}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        onToggleComplete={handleToggleCompleteFromDetail}
        onTodoChange={(updatedTodo) => {
          // 하위 작업 변경으로 인한 Todo 업데이트
          setTodos(todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo));
          setSelectedTodo(updatedTodo);
          loadData(); // 통계 업데이트
        }}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  viewToggle: {
    display: 'flex',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    padding: '2px',
  },
  viewButton: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6c757d',
    transition: 'all 0.2s ease',
  },
  activeViewButton: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '2rem',
  },
  addButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
    flex: 1,
    transition: 'all 0.2s ease',
  },
  selectedStatCard: {
    backgroundColor: '#e3f2fd',
    border: '2px solid #007bff',
    boxShadow: '0 4px 8px rgba(0, 123, 255, 0.2)',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '0.5rem',
  },
  statLabel: {
    color: '#6c757d',
    fontSize: '0.875rem',
  },
  filters: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  },
  filterRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
  },
  sortRow: {
    display: 'flex',
    gap: '1rem',
  },
  filterSelect: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.875rem',
    minWidth: '120px',
  },
  sortSelect: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.875rem',
    minWidth: '120px',
  },
  searchInput: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.875rem',
    minWidth: '200px',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  todoList: {
    marginBottom: '2rem',
  },
  todoItem: {
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
  },
  pageButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  pageInfo: {
    color: '#6c757d',
    fontSize: '0.875rem',
  },
};

export default TodoList;
