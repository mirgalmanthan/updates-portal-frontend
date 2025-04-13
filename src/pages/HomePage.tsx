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
import adminService, { UserUpdate } from '../services/adminService';

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
  const [userUpdates, setUserUpdates] = useState<UserUpdate[]>([]);
  const [isCreatingMail, setIsCreatingMail] = useState(false);
  const [mailMessage, setMailMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  

  // Fetch registration requests when admin tab is active
  useEffect(() => {
    if (userRole === 'admin') {
      if (activeTab === 'registrations') {
        fetchRegistrationRequests();
      } else if (activeTab === 'updates') {
        fetchUpdates();
      }
    }
  }, [userRole, activeTab, adminSelectedDate]);

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

  // Function to fetch updates for selected date
  const fetchUpdates = async () => {
    setIsLoadingUpdates(true);
    try {
      const response = await adminService.getUpdates(adminSelectedDate);
      if (response.success && response.data) {
        setUserUpdates(response.data.updates);
      } else {
        console.error('Failed to fetch updates:', response.error);
      }
    } catch (error) {
      console.error('An error occurred while fetching updates:', error);
    } finally {
      setIsLoadingUpdates(false);
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




  // useEffect(() => {
  //   const updateTheme = () => {
  //     let hour = new Date().getHours();
  //     const root = document.documentElement; // Target :root for global styles

  //     if (hour >= 6 && hour < 12) {
  //       root.style.setProperty("--background-current", "var(--background-morning)");
  //       // root.style.setProperty("--navbar-text-current", "var(--navbar-text-morning)");
  //     } else if (hour >= 12 && hour < 18) {
  //       root.style.setProperty("--background-current", "var(--background-afternoon)");
  //       // root.style.setProperty("--navbar-text-current", "var(--navbar-text-afternoon)");
  //     } else {
  //       root.style.setProperty("--background-current", "var(--background-night)");
  //       root.style.setProperty("--navbar-text-current", "var(--navbar-text-night)");
  //     }
  //   };

  //   updateTheme(); // Run on load
  //   const interval = setInterval(updateTheme, 60000); // Update every minute

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, []);

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }], // Bullet list inside toolbar
      [{ indent: '-1' }, { indent: '+1' }]
    ]
  };

  // Quill editor formats
  const formats = [
    'bold', 'italic', 'underline',
    'list', 'indent' // Removed 'bullet'
  ];


  // Handle editor content change
  const handleEditorChange = (content: string) => {
    setEditorContent(content);
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
          <div className="role-specific-content">
            <p>You are logged in as a <span className="highlight">{userRole!.charAt(0).toUpperCase() + userRole?.slice(1)}</span></p>
            <p>From here, you can submit and manage your daily updates.</p>
          </div>
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
            <div className="tab-navigation" style={{ marginBottom: '20px' }}>
              <button
                style={{
                  padding: '10px 20px',
                  marginRight: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'registrations' ? '#007bff' : '#e9ecef',
                  color: activeTab === 'registrations' ? 'white' : '#333'
                }}
                onClick={() => setActiveTab('registrations')}
              >
                Registration Requests
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  marginRight: '10px',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'updates' ? '#007bff' : '#e9ecef',
                  color: activeTab === 'updates' ? 'white' : '#333'
                }}
                onClick={() => setActiveTab('updates')}
              >
                View Updates
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'leaves' ? '#007bff' : '#e9ecef',
                  color: activeTab === 'leaves' ? 'white' : '#333'
                }
                }
                onClick={() => setActiveTab('leaves')}>
                Leaves
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'registrations' ? (
                <div className="registrations-tab">
                  <h4>User Registration Requests</h4>
                  {requestActionMessage && (
                    <div style={{ ...styles.message, ...(styles as any)[`&.${requestActionMessage.type}`] }}>
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
              ) : activeTab === 'updates' ? (
                <div className="updates-tab">
                  <h4>View Daily Updates</h4>

                  <div className="date-selector" style={{ marginBottom: '20px' }}>
                    <label htmlFor="admin-update-date" style={{ marginRight: '10px' }}>Select date to view updates: </label>
                    <input
                      type="date"
                      id="admin-update-date"
                      value={adminSelectedDate}
                      onChange={(e) => setAdminSelectedDate(e.target.value)}
                      max={formattedToday}
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>

                  <div className="updates-list" style={{ marginBottom: '30px' }}>
                    {isLoadingUpdates ? (
                      <div className="loading-message">Loading updates...</div>
                    ) : userUpdates.length === 0 ? (
                      <div className="no-updates-message">No updates found for selected date</div>
                    ) : (
                      <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' }}>Name</th>
                              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' }}>Role</th>
                              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' }}>Updates</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userUpdates.map(update => (
                              <tr key={update._id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{update.name}</td>
                                <td style={{ padding: '12px' }}>{update.role}</td>
                                <td style={{ padding: '12px' }}>
                                  <div className="ql-container ql-snow" style={{ border: 'none' }}>
                                    <div
                                      className="ql-editor"
                                      style={{ padding: '0' }}
                                      dangerouslySetInnerHTML={{
                                        __html: update.updates.ops.map((op: { insert?: string; attributes?: { bold?: boolean; underline?: boolean; list?: string } }) => {
                                          let html = op.insert || '';
                                          if (op.attributes) {
                                            if (op.attributes.bold) html = `<strong>${html}</strong>`;
                                            if (op.attributes.underline) html = `<u>${html}</u>`;
                                            if (op.attributes.list === 'bullet') html = `<li>${html}</li>`;
                                          }
                                          return html;
                                        }).join('')
                                      }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  {userUpdates.length > 0 && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                      <button
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          opacity: isCreatingMail ? 0.7 : 1
                        }}
                        onClick={async () => {
                          setIsCreatingMail(true);
                          setMailMessage(null);
                          try {
                            const response = await adminService.createMailForDate(adminSelectedDate);
                            if (response.success) {
                              setMailMessage({
                                type: 'success',
                                text: 'Email created and sent successfully!'
                              });
                            } else {
                              setMailMessage({
                                type: 'error',
                                text: response.error || 'Failed to create and send email'
                              });
                            }
                          } catch (error) {
                            setMailMessage({
                              type: 'error',
                              text: 'An error occurred while creating and sending email'
                            });
                          } finally {
                            setIsCreatingMail(false);
                          }
                        }}
                        disabled={isCreatingMail}
                      >
                        {isCreatingMail ? 'Creating and Sending Email...' : 'Create and Send Email'}
                      </button>
                      {mailMessage && (
                        <div
                          style={{
                            marginTop: '10px',
                            padding: '10px',
                            borderRadius: '4px',
                            backgroundColor: mailMessage.type === 'success' ? '#dff0d8' : '#f2dede',
                            color: mailMessage.type === 'success' ? '#3c763d' : '#a94442',
                            border: `1px solid ${mailMessage.type === 'success' ? '#d6e9c6' : '#ebccd1'}`
                          }}
                        >
                          {mailMessage.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeTab === 'leaves' && (
                <div className="leaves-tab">
                  <h4 style={{paddingBottom: '20px'}}>Add and Edit leaves</h4>


                  <div className="date-selector" style={{ marginBottom: '20px' }}>
                    <label htmlFor="admin-update-date" style={{ marginRight: '10px' }}>Add leave for user: </label>
                    <select id='users' >
                      <option>Manthan Mirgal</option>
                      <option>Atharv Bidwe</option>
                      <option>Manisha Yadav</option>
                      <option>Ruchika Mungekar</option>
                      <option>Shraddha Sonde</option>
                    </select>
                    <input
                      type="date"
                      id="admin-update-date"
                      value={adminSelectedDate}
                      onChange={(e) => setAdminSelectedDate(e.target.value)}
                      max={formattedToday}
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                    <label htmlFor='admin-update-date' style={{ marginRight: '10px'}}> To </label>
                    <input
                      type="date"
                      id="admin-update-date"
                      value={adminSelectedDate}
                      onChange={(e) => setAdminSelectedDate(e.target.value)}
                      max={formattedToday}
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                    <div>
                    <button
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          opacity: isCreatingMail ? 0.7 : 1
                        }}
                        >
                        Add Leave
                      </button>
                    </div>
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
