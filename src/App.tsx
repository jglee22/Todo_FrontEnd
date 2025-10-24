import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodoList from './components/TodoList';
import AdminDashboard from './components/AdminDashboard';
import Dashboard from './components/Dashboard';
import MESDashboard from './components/MESDashboard';
import EquipmentDashboard from './components/EquipmentDashboard';
import NotificationBell from './components/NotificationBell';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
      }}>
        로딩 중...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div style={styles.layout}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>Todo App</h1>
          <nav style={styles.nav}>
            <a href="/" style={styles.navLink}>📊 대시보드</a>
            <a href="/todos" style={styles.navLink}>📝 Todo 목록</a>
                     <a href="/mes" style={styles.navLink}>🏭 MES 대시보드</a>
                     <a href="/equipment" style={styles.navLink}>🔧 설비 관리</a>
                     {user?.role === 2 && (
                       <a href="/admin" style={styles.navLink}>👑 관리자</a>
                     )}
          </nav>
          <div style={styles.userInfo}>
            <NotificationBell />
            <span style={styles.username}>안녕하세요, {user?.username}님!</span>
            {user?.role === 2 && (
              <span style={styles.adminBadge}>👑 관리자</span>
            )}
            <button onClick={logout} style={styles.logoutButton}>
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
      }}>
        로딩 중...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 2) { // Admin role = 2
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={styles.app}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/todos"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TodoList />
                  </Layout>
                </ProtectedRoute>
              }
            />
                     <Route
                       path="/mes"
                       element={
                         <ProtectedRoute>
                           <Layout>
                             <MESDashboard />
                           </Layout>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/equipment"
                       element={
                         <ProtectedRoute>
                           <Layout>
                             <EquipmentDashboard />
                           </Layout>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/admin"
                       element={
                         <AdminRoute>
                           <Layout>
                             <AdminDashboard />
                           </Layout>
                         </AdminRoute>
                       }
                     />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: '#343a40',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nav: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
    fontSize: '0.95rem',
  },
  logo: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  username: {
    fontSize: '0.875rem',
    color: '#e9ecef',
  },
  adminBadge: {
    fontSize: '0.75rem',
    color: '#ffc107',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid #6c757d',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  main: {
    flex: 1,
    padding: '2rem 0',
  },
};

export default App;