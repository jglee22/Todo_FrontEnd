import React, { useState, useEffect } from 'react';
import { SubTask, CreateSubTaskRequest } from '../types';
import subTaskService from '../services/subTaskService';

interface SubTaskListProps {
  todoId: number;
  onSubTaskChange?: () => void;
}

const SubTaskList: React.FC<SubTaskListProps> = ({ todoId, onSubTaskChange }) => {
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    loadSubTasks();
  }, [todoId]);

  const loadSubTasks = async () => {
    try {
      setLoading(true);
      const data = await subTaskService.getSubTasks(todoId);
      setSubTasks(data);
    } catch (error) {
      console.error('하위 작업 목록 로드 실패:', error);
      alert('하위 작업 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const request: CreateSubTaskRequest = { title: newTaskTitle.trim() };
      const newTask = await subTaskService.createSubTask(todoId, request);
      setSubTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
      setIsAddingTask(false);
      onSubTaskChange?.();
    } catch (error) {
      console.error('하위 작업 추가 실패:', error);
      alert('하위 작업 추가에 실패했습니다.');
    }
  };

  const handleToggleTask = async (subTaskId: number) => {
    try {
      const updatedTask = await subTaskService.toggleSubTask(subTaskId);
      setSubTasks(prev => 
        prev.map(task => 
          task.id === subTaskId ? updatedTask : task
        )
      );
      
      // 자동 완료 체크 및 알림
      const newCompletedCount = subTasks.filter(task => 
        task.id === subTaskId ? updatedTask.isCompleted : task.isCompleted
      ).length;
      
      if (newCompletedCount === subTasks.length && subTasks.length > 0) {
        // 모든 하위 작업이 완료된 경우
        setTimeout(() => {
          alert('🎉 모든 하위 작업이 완료되었습니다! Todo가 자동으로 완료 처리됩니다.');
          // 메인 리스트 새로고침을 위해 부모 컴포넌트에 알림
          onSubTaskChange?.();
        }, 100);
      }
      
      onSubTaskChange?.();
    } catch (error) {
      console.error('하위 작업 상태 변경 실패:', error);
      alert('하위 작업 상태 변경에 실패했습니다.');
    }
  };

  const handleUpdateTask = async (subTaskId: number) => {
    if (!editingTitle.trim()) return;

    try {
      const updatedTask = await subTaskService.updateSubTask(subTaskId, { title: editingTitle.trim() });
      setSubTasks(prev => 
        prev.map(task => 
          task.id === subTaskId ? updatedTask : task
        )
      );
      setEditingId(null);
      setEditingTitle('');
      onSubTaskChange?.();
    } catch (error) {
      console.error('하위 작업 수정 실패:', error);
      alert('하위 작업 수정에 실패했습니다.');
    }
  };

  const handleDeleteTask = async (subTaskId: number) => {
    if (!window.confirm('하위 작업을 삭제하시겠습니까?')) return;

    try {
      await subTaskService.deleteSubTask(subTaskId);
      setSubTasks(prev => prev.filter(task => task.id !== subTaskId));
      onSubTaskChange?.();
    } catch (error) {
      console.error('하위 작업 삭제 실패:', error);
      alert('하위 작업 삭제에 실패했습니다.');
    }
  };

  const startEditing = (task: SubTask) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const completedCount = subTasks.filter(task => task.isCompleted).length;
  const totalCount = subTasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>하위 작업</h3>
        {totalCount > 0 && (
          <div style={styles.progress}>
            <span style={styles.progressText}>
              {completedCount}/{totalCount} 완료 ({progressPercentage}%)
              {progressPercentage === 100 && (
                <span style={styles.autoCompleteText}> ✨ 자동완료!</span>
              )}
            </span>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${progressPercentage}%`,
                  backgroundColor: progressPercentage === 100 ? '#28a745' : '#4caf50'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={styles.loading}>하위 작업을 불러오는 중...</div>
      ) : (
        <>
          {/* 하위 작업 목록 */}
          <div style={styles.taskList}>
            {subTasks.map(task => (
              <div key={task.id} style={styles.taskItem}>
                <div style={styles.taskContent}>
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    style={styles.checkbox}
                  />
                  
                  {editingId === task.id ? (
                    <div style={styles.editContainer}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateTask(task.id)}
                        style={styles.editInput}
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateTask(task.id)}
                        style={styles.saveButton}
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEditing}
                        style={styles.cancelButton}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <span 
                      style={{
                        ...styles.taskTitle,
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        opacity: task.isCompleted ? 0.6 : 1
                      }}
                    >
                      {task.title}
                    </span>
                  )}
                </div>
                
                {editingId !== task.id && (
                  <div style={styles.taskActions}>
                    <button
                      onClick={() => startEditing(task)}
                      style={styles.editButton}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={styles.deleteButton}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 새 하위 작업 추가 */}
          {isAddingTask ? (
            <div style={styles.addContainer}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="하위 작업 제목을 입력하세요"
                style={styles.addInput}
                autoFocus
              />
              <button
                onClick={handleAddTask}
                style={styles.addButton}
              >
                추가
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
                style={styles.cancelAddButton}
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              style={styles.addTaskButton}
            >
              + 하위 작업 추가
            </button>
          )}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: '20px',
    padding: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  progressText: {
    fontSize: '12px',
    color: '#666',
    minWidth: '80px'
  },
  progressBar: {
    width: '100px',
    height: '6px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease'
  },
  autoCompleteText: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: '12px'
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    padding: '20px'
  },
  taskList: {
    marginBottom: '16px'
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  taskContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  taskTitle: {
    fontSize: '14px',
    color: '#333',
    flex: 1
  },
  taskActions: {
    display: 'flex',
    gap: '4px'
  },
  editButton: {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  editContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  editInput: {
    flex: 1,
    padding: '4px 8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  saveButton: {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  addContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0'
  },
  addInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  addButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelAddButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  addTaskButton: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px dashed #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default SubTaskList;
