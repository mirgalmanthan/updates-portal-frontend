import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../styles/home.css';

// Styles for registration requests
const styles = {
  registrationRequestCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  requestDetails: {
    flex: 1
  },
  requestActions: {
    display: 'flex',
    gap: '8px'
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#45a049'
    }
  },
  rejectButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#da190b'
    }
  },
  message: {
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '4px',
    '&.success': {
      backgroundColor: '#dff0d8',
      color: '#3c763d',
      border: '1px solid #d6e9c6'
    },
    '&.error': {
      backgroundColor: '#f2dede',
      color: '#a94442',
      border: '1px solid #ebccd1'
    }
  }
};
import { saveUpdate } from '../services/updatesService';
import authService, { RegistrationRequest } from '../services/authService';

const HomePage: React.FC = () => {
  // Registration requests state
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestActionMessage, setRequestActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { userRole } = useAuth();
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const quillRef = useRef<any>(null);
  
  // Get today's date in YYYY-MM-DD format for the date picker default value
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(formattedToday);
  
  // Admin dashboard state
  const [activeTab, setActiveTab] = useState('registrations');
  const [adminSelectedDate, setAdminSelectedDate] = useState(formattedToday);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);

  // Fetch registration requests when admin tab is active
  useEffect(() => {
    if (userRole === 'admin' && activeTab === 'registrations') {
      fetchRegistrationRequests();
    }
  }, [userRole, activeTab]);

  // Function to fetch registration requests
  const fetchRegistrationRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await authService.getRegistrationRequests();
      if (response.success && response.data) {
        setRegistrationRequests(response.data.requests);
      } else {
        setRequestActionMessage({
          type: 'error',
          text: response.error || 'Failed to fetch registration requests'
        });
      }
    } catch (error) {
      setRequestActionMessage({
        type: 'error',
        text: 'An error occurred while fetching registration requests'
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Function to handle registration request actions (accept/reject)
  const handleRegistrationAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await (action === 'accept' 
        ? authService.acceptRegistration(requestId)
        : authService.rejectRegistration(requestId));

      if (response.success) {
        setRequestActionMessage({
          type: 'success',
          text: `Successfully ${action}ed registration request`
        });
        // Refresh the registration requests list
        fetchRegistrationRequests();
      } else {
        setRequestActionMessage({
          type: 'error',
          text: response.error || `Failed to ${action} registration request`
        });
      }
    } catch (error) {
      setRequestActionMessage({
        type: 'error',
        text: `An error occurred while ${action}ing registration request`
      });
    }
  };
  
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

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ]
  };

  // Quill editor formats
  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet', 'indent',
  ];

 

  // Handle editor content change
  const handleEditorChange = (content: string, delta: any, source: any, editor: any) => {
    setEditorContent(content);
    
    console.log("delta", content)
    // Convert HTML to JSON
    // const jsonContent = convertHtmlToJson(content);
    
    // console.log('HTML Content:', content);
    // console.log('JSON Content:', jsonContent);
  };

  const handleSaveUpdate = async () => {
    if (!editorContent.trim()) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Get the Quill editor instance
      const quillEditor = quillRef.current.getEditor();
      
      // Get the contents as a Delta object
      const delta = quillEditor.getContents();
      
      // Format the delta in the required structure
      const formattedDelta = {
        ops: delta.ops
      };
      
      console.log('Final Quill Delta:', formattedDelta);
      console.log('Selected date:', selectedDate);
      
      // Pass the formatted delta and selected date to saveUpdate
      const response = await saveUpdate({ 
        content: formattedDelta,
        date: selectedDate 
      });
      
      if (response.success) {
        setSaveMessage({
          type: 'success',
          text: 'Your update has been saved successfully!'
        });
        // Optionally clear the editor after successful save
        // setEditorContent('');
      } else {
        setSaveMessage({
          type: 'error',
          text: response.error || 'Failed to save your update. Please try again.'
        });
      }
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSaving(false);
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
          <div className="role-specific-content"></div>
        )}
      </div>

      {userRole === 'user' && (
        <div className="editor-container">
          <h3>Daily Updates</h3>
          <p className="editor-instructions">Use the editor below to write your daily updates:</p>
          
          <div className="date-selector">
            <label htmlFor="update-date">Select date for this update: </label>
            <input 
              type="date" 
              id="update-date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              max={formattedToday} // Prevent selecting future dates
            />
          </div>
          
          {saveMessage && (
            <div className={`message ${saveMessage.type}`}>
              {saveMessage.text}
            </div>
          )}
          
          <div className="quill-editor">
            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={editorContent}
              onChange={handleEditorChange}
              modules={modules}
              formats={formats}
              placeholder="Write your daily updates here..."
            />
          </div>
          <div className="editor-actions">
            <button 
              className="save-button" 
              onClick={handleSaveUpdate}
              disabled={!editorContent.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </div>
      )}
      
      {userRole === 'admin' && (
        <div className="admin-dashboard">
          <h3>Admin Dashboard</h3>
          
          <div className="dashboard-tabs">
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`}
                onClick={() => setActiveTab('registrations')}
              >
                Registration Requests
              </button>
              <button 
                className={`tab-button ${activeTab === 'updates' ? 'active' : ''}`}
                onClick={() => setActiveTab('updates')}
              >
                View Updates
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'registrations' && (
                <div className="registrations-tab">
                  <h4>User Registration Requests</h4>
                  {requestActionMessage && (
                    <div style={{...styles.message, ...(styles as any)[`&.${requestActionMessage.type}`]}}>
                      {requestActionMessage.text}
                    </div>
                  )}
                  <div className="registration-list">
                    {isLoadingRequests ? (
                      <div className="loading-message">Loading registration requests...</div>
                    ) : registrationRequests.length === 0 ? (
                      <div className="no-requests-message">No pending registration requests</div>
                    ) : (
                      registrationRequests.map(request => (
                        <div key={request._id} style={styles.registrationRequestCard}>
                          <div style={styles.requestDetails}>
                            <h5>{request.full_name}</h5>
                            <p><strong>Email:</strong> {request.email}</p>
                            <p><strong>Role:</strong> {request.role}</p>
                          </div>
                          <div style={styles.requestActions}>
                            <button
                              style={styles.acceptButton}
                              onClick={() => handleRegistrationAction(request._id, 'accept')}
                            >
                              Accept
                            </button>
                            <button
                              style={styles.rejectButton}
                              onClick={() => handleRegistrationAction(request._id, 'reject')}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                  </div>
                </div>
              )}
              
              {activeTab === 'updates' && (
                <div className="updates-tab">
                  <h4>View Updates by Date</h4>
                  <div className="date-selector admin-date-selector">
                    <label htmlFor="admin-update-date">Select date: </label>
                    <input 
                      type="date" 
                      id="admin-update-date" 
                      value={adminSelectedDate} 
                      onChange={(e) => setAdminSelectedDate(e.target.value)}
                      max={formattedToday}
                    />
                    <button 
                      className="view-button"
                      onClick={() => setIsLoadingUpdates(true)}
                      disabled={isLoadingUpdates}
                    >
                      {isLoadingUpdates ? 'Loading...' : 'View Updates'}
                    </button>
                  </div>
                  
                  <div className="updates-list">
                    {isLoadingUpdates ? (
                      <div className="loading-updates">
                        <p>Loading updates...</p>
                      </div>
                    ) : (
                      <p className="empty-state">No updates for the selected date.</p>
                      /* Updates will be listed here when functionality is implemented */
                    )}
                  </div>
                  
                  <div className="mail-info">
                    <p>Clicking the button below will trigger the backend to create and send a mail containing all updates for {adminSelectedDate}.</p>
                  </div>
                  
                  <div className="mail-actions">
                    <button 
                      className="send-button"
                      onClick={() => setIsSendingMail(true)}
                      disabled={isSendingMail || !isLoadingUpdates}
                    >
                      {isSendingMail ? 'Sending...' : 'Send Mail for Selected Date'}
                    </button>
                  </div>
                </div>
              )}
              

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
