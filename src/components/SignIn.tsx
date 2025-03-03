import React, { useState } from "react";
import "../styles/signin.css";

interface SignInProps {
  title?: string;
  onSubmit?: (identifier: string, password: string) => void;
  registerLink?: string;
  registerText?: string;
  loginButtonText?: string;
  identifierLabel?: string;
  identifierType?: "email" | "text";
  identifierPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  registerLinkText?: string;
}

const SignIn: React.FC<SignInProps> = ({
  title = "Sign In",
  onSubmit,
  registerLink = "/register",
  registerText = "Register here",
  loginButtonText = "Login",
  identifierLabel = "Email",
  identifierType = "email",
  identifierPlaceholder = "Enter your email",
  passwordLabel = "Password",
  passwordPlaceholder = "Enter your password",
  registerLinkText = "Don't have an account?"
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(identifier, password);
    } else {
      // Default behavior if no onSubmit handler is provided
      console.log("Login attempt with:", { identifier, password });
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-form-container">
        <h2>{title}</h2>
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
            />
          </div>
          <button type="submit" className="signin-button">
            {loginButtonText}
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
