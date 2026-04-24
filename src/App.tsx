import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from './components/AdminDashboard';
import { DriverSignature } from './components/DriverSignature';
import { Login } from './components/Login';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <AdminDashboard username={username} /> : <Login onLogin={handleLogin} />} 
          />
          <Route path="/sign/:id" element={<DriverSignature />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
