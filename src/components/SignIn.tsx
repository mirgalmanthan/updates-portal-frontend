import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signin.css";
import { useAuth } from "../context/AuthContext";

interface SignInProps {
  title?: string;
  registerLink?: string;
  registerText?: string;
  loginButtonText?: string;
  identifierLabel?: string;
  identifierType?: "email" | "text";
  identifierPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  registerLinkText?: string;
  isAdminLogin?: boolean;
}

const SignIn: React.FC<SignInProps> = ({
  title = "Sign In",
  registerLink = "/register",
  registerText = "Register here",
  loginButtonText = "Login",
  identifierLabel = "Email",
  identifierType = "email",
  identifierPlaceholder = "Enter your email",
  passwordLabel = "Password",
  passwordPlaceholder = "Enter your password",
  registerLinkText = "Don't have an account?",
  isAdminLogin = false
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMessage, setLoginMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const { adminLogin, userLogin, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginMessage(null);
    clearError();
    
    try {
      let success;
      
      if (isAdminLogin) {
        // Admin login
        success = await adminLogin({ username: identifier, password });
      } else {
        // User login
        success = await userLogin({ email: identifier, password });
      }
      
      if (success) {
        setLoginMessage({
          type: 'success',
          text: `${isAdminLogin ? 'Admin' : 'User'} login successful!`
        });
        // Redirect to home page after successful login
        setTimeout(() => {
          navigate('/home');
        }, 1000); // Short delay to show success message
      } else {
        setLoginMessage({
          type: 'error',
          text: error || 'Login failed. Please check your credentials.'
        });
      }
    } catch (err) {
      setLoginMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-form-container">
        <h2>{title}</h2>
        
        {loginMessage && (
          <div className={`message ${loginMessage.type}`}>
            {loginMessage.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">{identifierLabel}</label>
            <input
              type={identifierType}
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder={identifierPlaceholder}
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{passwordLabel}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={passwordPlaceholder}
              disabled={isSubmitting}
            />
          </div>
          <button 
            type="submit" 
            className="signin-button"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Signing in...' : loginButtonText}
          </button>
        </form>
        {(registerLinkText || registerText) && (
          <div className="register-link">
            {registerLinkText} {registerText && <a href={registerLink}>{registerText}</a>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;
