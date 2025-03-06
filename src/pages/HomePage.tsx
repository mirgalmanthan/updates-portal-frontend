import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';

const HomePage: React.FC = () => {
  const { userRole } = useAuth();
  
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours < 12) {
      return 'Good morning';
    } else if (hours < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  return (
    <div className="home-container">
      <div className="greeting-card">
        <h1>{getCurrentTime()}</h1>
        <h2>Welcome to the Updates Portal</h2>
        {userRole === 'admin' ? (
          <div className="role-specific-content">
            <p>You are logged in as an <span className="highlight">Administrator</span></p>
            <p>From here, you can manage updates, users, and system settings.</p>
          </div>
        ) : (
          <div className="role-specific-content">
            <p>You are logged in as a <span className="highlight">User</span></p>
            <p>Stay up to date with the latest announcements and updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
