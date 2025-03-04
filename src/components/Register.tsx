import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MessageOverlay from './MessageOverlay';
import '../styles/signin.css'; // Reusing the signin styles

interface RegisterProps {
  title?: string;
  loginLink?: string;
  loginText?: string;
}

const Register: React.FC<RegisterProps> = ({
  title = "Register",
  loginLink = "/",
  loginText = "Already have an account? Login here",
}) => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'DEVELOPER' // Default role
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        setShowSuccessMessage(true);
        // Redirect to login page after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate('/');
        }, 5000);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Registration failed. Please try again.'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showSuccessMessage && (
        <MessageOverlay
          type="success"
          message="Registration Request Sent!"
          subMessage="Your request has been sent for approval. You will be redirected to the login page shortly."
        />
      )}
      
      <div className="signin-container">
        <div className="signin-form-container">
          <h2>{title}</h2>
          
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="DEVELOPER">Developer</option>
                <option value="TESTER">Tester</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="signin-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="register-link">
            <a href={loginLink}>{loginText}</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
