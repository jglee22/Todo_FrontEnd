import React, { useState, useEffect } from 'react';
import { Todo, TodoDto, Category, Priority, Status, SubTask } from '../types';
import apiService from '../services/api';
import subTaskService from '../services/subTaskService';

interface TodoFormProps {
  todo?: Todo;
  onSave: (todo: Todo) => void;
  onCancel: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ todo, onSave, onCancel }) => {
  const [formData, setFormData] = useState<TodoDto>({
    title: todo?.title || '',
    description: todo?.description || '',
    status: todo?.status || 1,
    category: todo?.category || 1,
    priority: todo?.priority || 1,
    startDate: todo?.startDate ? todo.startDate.split('T')[0] : '',
    dueDate: todo?.dueDate ? todo.dueDate.split('T')[0] : '',
    tags: todo?.tags || '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, prioritiesData, statusesData] = await Promise.all([
          apiService.getCategories(),
          apiService.getPriorities(),
          apiService.getStatuses(),
        ]);
        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setStatuses(statusesData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'status' || name === 'category' || name === 'priority') {
      // 빈 문자열이면 기본값 사용
      if (value === '') {
        const defaultValue = 1;
        setFormData(prev => ({
          ...prev,
          [name]: defaultValue,
        }));
      } else {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          setFormData(prev => ({
            ...prev,
            [name]: numValue,
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim() === '') return;

    const newSubTask: SubTask = {
      id: Date.now(), // 임시 ID (실제로는 서버에서 생성)
      title: newSubTaskTitle.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
      order: subTasks.length + 1,
    };

    setSubTasks(prev => [...prev, newSubTask]);
    setNewSubTaskTitle('');
  };

  const handleRemoveSubTask = (index: number) => {
    setSubTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const todoData = {
        ...formData,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00` : undefined,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : undefined,
      };

      let savedTodo: Todo;
      if (todo) {
        savedTodo = await apiService.updateTodo(todo.id, todoData);
      } else {
        savedTodo = await apiService.createTodo(todoData);
        
        // 새 Todo 생성 후 하위 작업들 추가
        if (subTasks.length > 0) {
          for (const subTask of subTasks) {
            await subTaskService.createSubTask(savedTodo.id, { title: subTask.title });
          }
        }
      }
      onSave(savedTodo);
    } catch (error) {
      console.error('Todo 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{todo ? 'Todo 수정' : '새 Todo 추가'}</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="title" style={styles.label}>제목 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="description" style={styles.label}>설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={styles.textarea}
            />
          </div>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label htmlFor="status" style={styles.label}>상태</label>
              <select
                id="status"
                name="status"
                value={formData.status.toString()}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">상태를 선택하세요</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="category" style={styles.label}>카테고리</label>
              <select
                id="category"
                name="category"
                value={formData.category.toString()}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label htmlFor="priority" style={styles.label}>우선순위</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority.toString()}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">우선순위를 선택하세요</option>
                {priorities.map(pri => (
                  <option key={pri.id} value={pri.id}>{pri.name}</option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              {/* 빈 공간으로 레이아웃 균형 맞추기 */}
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label htmlFor="startDate" style={styles.label}>시작일</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="dueDate" style={styles.label}>마감일</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="tags" style={styles.label}>태그 (쉼표로 구분)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="예: 중요, 긴급, 프로젝트"
              style={styles.input}
            />
          </div>

          {/* 하위 작업 섹션 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>하위 작업</label>
            <div style={styles.subTaskContainer}>
              <div style={styles.subTaskInputGroup}>
                <input
                  type="text"
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubTask();
                    }
                  }}
                  placeholder="하위 작업 제목을 입력하세요"
                  style={styles.subTaskInput}
                />
                <button
                  type="button"
                  onClick={handleAddSubTask}
                  style={styles.addSubTaskButton}
                >
                  추가
                </button>
              </div>
              
              {subTasks.length > 0 && (
                <div style={styles.subTaskList}>
                  {subTasks.map((subTask, index) => (
                    <div key={subTask.id} style={styles.subTaskItem}>
                      <span style={styles.subTaskText}>
                        {index + 1}. {subTask.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubTask(index)}
                        style={styles.removeSubTaskButton}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onCancel} style={styles.cancelButton}>
              취소
            </button>
            <button type="submit" disabled={isLoading} style={styles.saveButton}>
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
  title: {
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#555',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white',
    boxSizing: 'border-box' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  subTaskContainer: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
  },
  subTaskInputGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  subTaskInput: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  addSubTaskButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  subTaskList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  subTaskItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
  },
  subTaskText: {
    fontSize: '0.9rem',
    color: '#333',
  },
  removeSubTaskButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '0.25rem 0.5rem',
    border: 'none',
    borderRadius: '3px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};

export default TodoForm;