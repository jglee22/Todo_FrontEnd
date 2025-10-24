import React, { useState, useEffect } from 'react';
import { Todo } from '../types';
import apiService from '../services/api';

interface CalendarViewProps {
  onTodoClick: (todo: Todo) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onTodoClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('CalendarView 컴포넌트 렌더링됨');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      console.log('캘린더 Todo 로드 시작...');
      
      // 토큰 확인
      const token = localStorage.getItem('token');
      console.log('현재 토큰:', token ? '존재함' : '없음');
      
      // 캘린더에서는 모든 Todo를 가져와야 하므로 페이징 없이 요청
      // 먼저 기본 파라미터로 테스트
      console.log('API 요청 시작...');
      const todosData = await apiService.getTodos({
        page: 1,
        pageSize: 50, // 1000에서 50으로 줄임
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      
      console.log('API 응답 받음:', todosData);
      setTodos(todosData.data);
      console.log('캘린더용 Todo 데이터:', todosData.data); // 디버깅용
      
      // 마감일이 있는 Todo만 필터링해서 확인
      const todosWithDueDate = todosData.data.filter(todo => todo.dueDate);
      console.log('마감일이 있는 Todo:', todosWithDueDate);
    } catch (error: any) {
      console.error('Todo 데이터 로드 실패:', error);
      console.error('에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // 인증 에러인 경우 로그인 페이지로 리다이렉트
      if (error.response?.status === 401) {
        console.log('인증이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
        return;
      }
      
      // 다른 에러인 경우 빈 배열로 설정
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 월의 첫 번째 날과 마지막 날 계산
  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // 캘린더 그리드를 위한 날짜 배열 생성
  const getCalendarDays = (date: Date) => {
    const monthStart = getMonthStart(date);
    const monthEnd = getMonthEnd(date);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay()); // 일요일부터 시작

    const days = [];
    const current = new Date(startDate);

    // 6주 * 7일 = 42일
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // 특정 날짜의 Todo 가져오기 (시작일-마감일 기간 고려)
  const getTodosForDate = (date: Date) => {
    return todos.filter(todo => {
      // 시작일과 마감일이 모두 있는 경우 기간으로 처리
      if (todo.startDate && todo.dueDate) {
        const startDate = new Date(todo.startDate);
        const dueDate = new Date(todo.dueDate);
        const compareDate = new Date(date);
        
        // 시간을 00:00:00으로 설정하여 날짜만 비교
        startDate.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        compareDate.setHours(0, 0, 0, 0);
        
        // 시작일과 마감일 사이에 있는지 확인
        const isInRange = compareDate >= startDate && compareDate <= dueDate;
        
        if (isInRange) {
          console.log(`기간 매칭: ${date.toDateString()} - Todo: ${todo.title} (${todo.startDate} ~ ${todo.dueDate})`);
        }
        
        return isInRange;
      }
      
      // 마감일만 있는 경우 (기존 로직)
      if (todo.dueDate) {
        const todoDate = new Date(todo.dueDate);
        const compareDate = new Date(date);
        
        // 시간을 00:00:00으로 설정하여 날짜만 비교
        todoDate.setHours(0, 0, 0, 0);
        compareDate.setHours(0, 0, 0, 0);
        
        const isMatch = todoDate.getTime() === compareDate.getTime();
        
        if (isMatch) {
          console.log(`날짜 매칭: ${date.toDateString()} - Todo: ${todo.title} (${todo.dueDate})`);
        }
        
        return isMatch;
      }
      
      return false;
    });
  };

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = getCalendarDays(currentDate);
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div>캘린더 로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 캘린더 헤더 */}
      <div style={styles.header}>
        <button onClick={goToPreviousMonth} style={styles.navButton}>
          ‹
        </button>
        <h2 style={styles.monthTitle}>
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </h2>
        <button onClick={goToNextMonth} style={styles.navButton}>
          ›
        </button>
        <button onClick={goToToday} style={styles.todayButton}>
          오늘
        </button>
      </div>

      {/* 요일 헤더 */}
      <div style={styles.dayHeader}>
        {dayNames.map(day => (
          <div key={day} style={styles.dayHeaderCell}>
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div style={styles.calendarGrid}>
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const dayTodos = getTodosForDate(date);

          // 디버깅: 24일인 경우 로그 출력
          if (date.getDate() === 24 && isCurrentMonth) {
            console.log(`24일 Todo 확인:`, dayTodos);
          }

          return (
            <div
              key={index}
              style={{
                ...styles.calendarCell,
                ...(isCurrentMonth ? styles.currentMonthCell : styles.otherMonthCell),
                ...(isToday ? styles.todayCell : {}),
              }}
            >
              <div style={styles.dateNumber}>
                {date.getDate()}
              </div>
              <div style={styles.todosContainer}>
                {dayTodos.slice(0, 3).map(todo => {
                  const isStartDate = todo.startDate && new Date(todo.startDate).toDateString() === date.toDateString();
                  const isEndDate = todo.dueDate && new Date(todo.dueDate).toDateString() === date.toDateString();
                  const isRange = todo.startDate && todo.dueDate;
                  
                  return (
                    <div
                      key={todo.id}
                      onClick={() => onTodoClick(todo)}
                      style={{
                        ...styles.todoItem,
                        backgroundColor: getPriorityColor(todo.priority),
                        ...(isStartDate && isRange ? styles.startDateItem : {}),
                        ...(isEndDate && isRange ? styles.endDateItem : {}),
                        ...(isRange && !isStartDate && !isEndDate ? styles.rangeItem : {}),
                      }}
                    >
                      {isStartDate && isRange ? '▶ ' : ''}
                      {isEndDate && isRange ? '◀ ' : ''}
                      {todo.title}
                    </div>
                  );
                })}
                {dayTodos.length > 3 && (
                  <div style={styles.moreTodos}>
                    +{dayTodos.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 우선순위별 색상 함수
const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1: return '#e3f2fd'; // 낮음 - 연한 파란색
    case 2: return '#fff3e0'; // 보통 - 연한 주황색
    case 3: return '#ffebee'; // 높음 - 연한 빨간색
    default: return '#f5f5f5';
  }
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    fontSize: '1.2rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  navButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  todayButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  dayHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    marginBottom: '1px',
  },
  dayHeaderCell: {
    backgroundColor: '#f8f9fa',
    padding: '0.75rem',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    fontSize: '0.875rem',
    color: '#6c757d',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: '#dee2e6',
  },
  calendarCell: {
    backgroundColor: 'white',
    minHeight: '120px',
    padding: '0.5rem',
    border: '1px solid #dee2e6',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  currentMonthCell: {
    backgroundColor: 'white',
  },
  otherMonthCell: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
    fontWeight: 'bold',
  },
  dateNumber: {
    fontSize: '0.875rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  todosContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  todoItem: {
    fontSize: '0.75rem',
    padding: '2px 4px',
    borderRadius: '3px',
    cursor: 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  startDateItem: {
    borderLeft: '3px solid #007bff',
    fontWeight: 'bold',
  },
  endDateItem: {
    borderRight: '3px solid #007bff',
    fontWeight: 'bold',
  },
  rangeItem: {
    borderTop: '1px solid #007bff',
    borderBottom: '1px solid #007bff',
    opacity: 0.8,
  },
  moreTodos: {
    fontSize: '0.7rem',
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center' as const,
    marginTop: '2px',
  },
};

export default CalendarView;
