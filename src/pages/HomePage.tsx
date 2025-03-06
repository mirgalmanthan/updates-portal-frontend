import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../styles/home.css';
import { saveUpdate } from '../services/updatesService';

const HomePage: React.FC = () => {
  const { userRole } = useAuth();
  const [editorContent, setEditorContent] = useState('');
  const [editorJson, setEditorJson] = useState<object>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const quillRef = useRef<any>(null);
  
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

  // Helper function to convert HTML to a structured JSON object
  const convertHtmlToJson = (html: string): object => {
    // Simple conversion - you can enhance this based on your needs
    const paragraphs = html.split('<p>').filter(p => p.trim() !== '').map(p => {
      // Remove closing </p> tag and trim
      return p.replace('</p>', '').trim();
    });
    
    // Create a structured JSON object
    const jsonContent = {
      type: 'document',
      content: paragraphs.map(p => {
        // Check for formatting
        const isBold = p.includes('<strong>');
        const isItalic = p.includes('<em>');
        const isUnderline = p.includes('<u>');
        
        // Remove HTML tags for clean text
        const text = p.replace(/<\/?[^>]+(>|$)/g, '');
        
        return {
          type: 'paragraph',
          text,
          formatting: {
            bold: isBold,
            italic: isItalic,
            underline: isUnderline
          }
        };
      })
    };
    
    return jsonContent;
  };

  // Handle editor content change
  const handleEditorChange = (content: string, delta: any, source: any, editor: any) => {
    setEditorContent(content);
    
    console.log("delta", content)
    // Convert HTML to JSON
    // const jsonContent = convertHtmlToJson(content);
    setEditorJson(delta);
    
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
      
      // Pass the formatted delta to saveUpdate
      const response = await saveUpdate({ content: formattedDelta });
      
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
            <p>You are logged in as a <span className="highlight">User</span></p>
            <p>Stay up to date with the latest announcements and updates.</p>
          </div>
        )}
      </div>

      {userRole === 'user' && (
        <div className="editor-container">
          <h3>Daily Updates</h3>
          <p className="editor-instructions">Use the editor below to write your daily updates:</p>
          
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
    </div>
  );
};

export default HomePage;
