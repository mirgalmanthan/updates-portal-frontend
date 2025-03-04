import React from 'react';
import '../styles/messageOverlay.css';

interface MessageOverlayProps {
  type: 'success' | 'error';
  message: string;
  subMessage?: string;
}

const MessageOverlay: React.FC<MessageOverlayProps> = ({ type, message, subMessage }) => {
  return (
    <div className="message-overlay">
      <div className={`message-content ${type}`}>
        <div className="message-icon">
          {type === 'success' ? '✓' : '⚠'}
        </div>
        <h2>{message}</h2>
        {subMessage && <p>{subMessage}</p>}
      </div>
    </div>
  );
};

export default MessageOverlay;
