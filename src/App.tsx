import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import SignIn from './components/SignIn'

function App() {
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  
  const handleSignIn = (identifier: string, password: string) => {
    console.log(`${loginType} login attempt with:`, { identifier, password });
    // Here you would typically handle authentication, e.g., API call to your backend
  };

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
    <>
      <div>
        <Navbar title='Updates Portal' tabs={navbarTabs}></Navbar>
        
        {loginType === 'user' ? (
          <SignIn 
            title="User Login"
            onSubmit={handleSignIn}
            identifierLabel="Email"
            identifierType="email"
            identifierPlaceholder="Enter your email"
            loginButtonText="Sign In"
            registerText="Create an account"
          />
        ) : (
          <SignIn 
            title="Admin Login"
            onSubmit={handleSignIn}
            identifierLabel="Username"
            identifierType="text"
            identifierPlaceholder="Enter your username"
            loginButtonText="Admin Login"
          />
        )}
      </div>
    </>
  )
}

export default App
