import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import SignIn from './components/SignIn'
import Register from './components/Register'
import HomePage from './pages/HomePage'
import { AuthProvider, useAuth } from './context/AuthContext'

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  
  const toggleLoginType = () => {
    setLoginType(loginType === 'user' ? 'admin' : 'user');
  };

  // Dynamically set the navbar tab based on current login type
  const navbarTabs = [
    { 
      name: loginType === 'user' ? "Admin" : "User Login", 
      onClick: toggleLoginType 
    }
  ];

  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar title='Updates Portal' tabs={navbarTabs}></Navbar>
          
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/" element={
              loginType === 'user' ? (
                <SignIn 
                  title="User Login"
                  identifierLabel="Email"
                  identifierType="email"
                  identifierPlaceholder="Enter your email"
                  loginButtonText="Sign In"
                  registerText="Create an account"
                  registerLink="/register"
                  isAdminLogin={false}
                />
              ) : (
                <SignIn 
                  title="Admin Login"
                  identifierLabel="Username"
                  identifierType="text"
                  identifierPlaceholder="Enter your username"
                  loginButtonText="Admin Login"
                  isAdminLogin={true}
                />
              )
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
