import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import SignIn from './components/SignIn'
import Register from './components/Register'
import { AuthProvider } from './context/AuthContext'

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
