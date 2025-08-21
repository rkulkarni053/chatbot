import React, { useState, useEffect } from "react";
import "./App.css";
import Spline from '@splinetool/react-spline';

const processes = {
  onboarding: {
    name: 'Onboarding',
    questions: [
      {
        question: 'Please download, sign, and upload the onboarding acknowledgment.',
        type: 'upload',
        url: 'https://tumasgrp.sharepoint.com/:t:/s/Testsite_PowerAutomate/EVVruOiHIeRPoJcnnFT-IlMBh57Swffmj-dOZfDfLfIh7A?e=ibsznb'
      },
      { question: 'Complete the onboarding survey.', type: 'text' },
      { question: 'Set up your work account.', type: 'text' }
    ]
  },
  offboarding: {
    name: 'Offboarding',
    questions: [
      {
        question: 'Please download, sign, and upload the offboarding acknowledgment.',
        type: 'upload',
        url: 'https://tumasgrp.sharepoint.com/:t:/s/Testsite_PowerAutomate/EQx2WeMLGgFMrN5-3v1LiKwBI4P7e78ig8Wwi11YIGEbMA?e=FYsrgv'
      },
      { question: 'Return company equipment.', type: 'text' },
      { question: 'Complete the exit interview survey.', type: 'text' }
    ]
  }
};

const App = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to the IT Process Assistant! What is your name?' }
  ]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState('askName');
  const [userName, setUserName] = useState('');
  const [currentProcess, setCurrentProcess] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [assistantActive, setAssistantActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const hasSaved = React.useRef(false);
  
  // Spline loading states
  const [splineLoading, setSplineLoading] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineShouldLoad, setSplineShouldLoad] = useState(false);
  
  // Add loading timeout for Spline
  useEffect(() => {
    if (splineLoading && splineShouldLoad) {
      const timeout = setTimeout(() => {
        if (splineLoading) {
          setSplineError(true);
          setSplineLoading(false);
          console.log('Spline loading timeout - taking too long');
        }
      }, 30000); // 30 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [splineLoading, splineShouldLoad]);
  
  // Debug Spline states
  useEffect(() => {
    console.log('Spline states:', {
      shouldLoad: splineShouldLoad,
      loading: splineLoading,
      loaded: splineLoaded,
      error: splineError
    });
  }, [splineShouldLoad, splineLoading, splineLoaded, splineError]);
  
  // Dark mode state
  // Use system theme as default if no user preference
  const getPreferredTheme = () => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const [darkMode, setDarkMode] = useState(getPreferredTheme);

  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (darkMode) {
      appContainer?.classList.add('dark-mode');
    } else {
      appContainer?.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Listen for system theme changes if user hasn't chosen a theme
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(media.matches);
      }
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const triggerAssistant = () => {
    setAssistantActive(true);
    setTimeout(() => setAssistantActive(false), 800);
    
    // Trigger Spline loading on first user interaction
    if (!splineShouldLoad) {
      setSplineShouldLoad(true);
    }
  };

  // Render message text as is (no mode label)
  const renderMessageText = (msg) => msg.text;

 const askQuestion = (index) => {
  if (!processes[currentProcess] || !processes[currentProcess].questions[index]) {
    console.error("Invalid process or question index");
    return;
  }
  const question = processes[currentProcess].questions[index];
  
  if (question.type === 'upload') {
    setMessages(prev => [...prev, 
      { sender: 'bot', text: (
        <a href={question.url} download className="download-link" target="_blank" rel="noopener noreferrer">
          <i className="icon-download"></i> Download {processes[currentProcess].name} Acknowledgment
        </a>
      )},
      { sender: 'bot', text: question.question }
    ]);
    setCurrentStep('awaitUpload');
  } else {
    setMessages(prev => [...prev, { sender: 'bot', text: question.question }]);
    setCurrentStep('askQuestion');
  }
  };


  const handleProcessChoice = (process) => {
    if (currentProcess) return; // Prevents double execution and duplicate messages
    if (!processes[process]) {
      console.error(`Invalid process: ${process}`);
      return;
    }
    setCurrentProcess(process);
    setMessages(prev => [
      ...prev,
      { sender: 'bot', text: `Great! Let's start the ${processes[process].name} process.` }
    ]);
    setCurrentQuestionIndex(0);
    // askQuestion(0); // <-- Remove this line
  };

  // Add useEffect to trigger askQuestion(0) when currentProcess changes
  React.useEffect(() => {
    if (currentProcess) {
      askQuestion(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProcess]);
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFile(file);
    setMessages(prev => [...prev, 
      { sender: 'bot', text: `File "${file.name}" uploaded successfully.` }
    ]);
    // Save file name as response for current question
    const currentQ = processes[currentProcess].questions[currentQuestionIndex].question;
    setUserResponses(prev => ({ ...prev, [currentQ]: file.name }));

    const newProgress = ((currentQuestionIndex + 1) / processes[currentProcess].questions.length) * 100;
    setProgress(newProgress);
    
    if (currentQuestionIndex < processes[currentProcess].questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      askQuestion(currentQuestionIndex + 1);
    } else {
      setMessages(prev => [...prev, 
        { sender: 'bot', text: 'Thank you for completing the process!' }
      ]);
      setCurrentStep('completed');
      saveResponsesToDB();
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    // Save user response for current question
    if (currentStep === 'askQuestion') {
      const currentQ = processes[currentProcess].questions[currentQuestionIndex].question;
      setUserResponses(prev => ({ ...prev, [currentQ]: input }));
    }
    setInput('');

    switch (currentStep) {
      case 'askName':
        setUserName(input);
        setCurrentStep('chooseProcess');
        setMessages(prev => [...prev, 
          { sender: 'bot', text: `Nice to meet you, ${input}!` }
        ]);
        break;
        
      case 'askQuestion':
        const newProgress = ((currentQuestionIndex + 1) / processes[currentProcess].questions.length) * 100;
        setProgress(newProgress);
        
        if (currentQuestionIndex < processes[currentProcess].questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          askQuestion(currentQuestionIndex + 1);
        } else {
          setCurrentStep('completed');
          // Ensure the last response is saved before saving to DB
          const currentQ = processes[currentProcess].questions[currentQuestionIndex].question;
          setUserResponses(prev => {
            const updated = { ...prev, [currentQ]: input };
            setTimeout(() => saveResponsesToDB(updated), 0);
            return updated;
          });
        }
        break;
        
      default:
        break;
    }
  };

  const saveResponsesToDB = async (responsesObj = userResponses) => {
    if (hasSaved.current) return;
    hasSaved.current = true;
    setLoading(true);
    const formData = new FormData();
    
    const formattedResponses = processes[currentProcess].questions.map((question, index) => {
      let userResponse = responsesObj[question.question];
      if (question.type === 'upload') {
        userResponse = uploadedFile ? uploadedFile.name : 'Not uploaded';
      }
      
      return {
        question: question.question,
        response: userResponse || 'Not answered'
      };
    });

    formData.append('process', currentProcess);
    formData.append('responses', JSON.stringify(formattedResponses));
    if (uploadedFile) formData.append('file', uploadedFile);

    try {
      const response = await fetch('http://localhost:5600/responses', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save responses');
      
      setIsSubmitted(true);
      setProgress(100);
      setMessages(prev => [...prev, 
        { sender: 'bot', text: `Thank you for completing the ${processes[currentProcess].name} process!` },
        { sender: 'bot', text: 'Your responses have been successfully saved.' }
      ]);
    } catch (error) {
      setMessages(prev => [...prev, 
        { sender: 'bot', text: 'There was an error saving your responses. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div className="app-container"
        style={{
          flexBasis: '100%',
          maxWidth: 480,
          width: '100%',
          minWidth: 0,
          flexShrink: 1
        }}
      >
        {/* --- All your chat app code below here --- */}
                 <div className="chat-app" onClick={() => {
           if (!splineShouldLoad) {
             setSplineShouldLoad(true);
             setSplineLoading(true);
           }
         }}>
           <div className="chat-header">
            <div className="header-content">
              <h1>IT Process Assistant</h1>
              {/* Dark mode toggle button */}
              <button
                className="dark-mode-toggle"
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 24,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: 'inherit',
                  zIndex: 10
                }}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => {
                  setDarkMode(dm => {
                    const newMode = !dm;
                    localStorage.setItem('darkMode', newMode);
                    return newMode;
                  });
                }}
              >
                {darkMode ? (
                  <span role="img" aria-label="Light mode">☀️</span>
                ) : (
                  <span role="img" aria-label="Dark mode">🌙</span>
                )}
              </button>
              {currentProcess && (
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                  <span className="progress-text">{Math.round(progress)}% Complete</span>
                </div>
              )}
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender} ${darkMode ? 'dark' : 'light'}`}>
                {typeof msg.text === 'string' ? renderMessageText(msg) : msg.text}
              </div>
            ))}
            {loading && (
              <div className="message bot loading-message">
                <div className="loading-spinner"></div>
                <span>Saving your responses...</span>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            {isSubmitted ? (
              <div className="completion-screen">
                <div className="completion-icon">✓</div>
                <h2>Process Completed Successfully!</h2>
                <p>Your {currentProcess && processes[currentProcess].name} process is now complete.</p>
                <button 
                  className="start-new-btn"
                  onClick={() => window.location.reload()}
                >
                  Start New Process
                </button>
              </div>
            ) : currentStep === 'chooseProcess' ? (
              <div className="process-selection">
                <button 
                  className="process-btn onboarding"
                  onClick={() => handleProcessChoice('onboarding')}
                >
                  <i className="icon-user-plus"></i>
                  <span>Onboarding</span>
                </button>
                <button 
                  className="process-btn offboarding"
                  onClick={() => handleProcessChoice('offboarding')}
                >
                  <i className="icon-user-minus"></i>
                  <span>Offboarding</span>
                </button>
              </div>
            ) : currentStep === 'awaitUpload' ? (
              <div className="file-upload-container">
                <div className="upload-instructions">
                  <strong>Step 1:</strong> Download the document using the link above.<br/>
                  <strong>Step 2:</strong> Sign the document.<br/>
                  <strong>Step 3:</strong> Upload the signed PDF below.
                </div>
                <input 
                  type="file" 
                  id="file-upload"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <label htmlFor="file-upload" className="file-upload-btn">
                  <i className="icon-upload"></i>
                  <span>Choose PDF File</span>
                </label>
                {uploadedFile && (
                  <div className="file-info">
                    <i className="icon-file"></i>
                    <span>{uploadedFile.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-input-container">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response..."
                  className="message-input"
                  disabled={loading}
                  style={{ color: darkMode ? 'var(--dm-dark)' : 'var(--dark-color)' }}
                />
                <button 
                  onClick={handleSendMessage}
                  className="send-btn"
                  disabled={!input.trim() || loading}
                  aria-label="Send"
                >
                  <span className="arrow" aria-label="Send">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 11H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 4L19 11L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* --- End of chat app code --- */}
      </div>
      <div
        className="spline-area"
        style={{ flex: 1, height: "100vh", background: "#f5f7fa", display: 'block' }}
      >
        {splineLoading && (
          <div className="spline-loading">
            <div className="loading-spinner"></div>
            <p>Loading 3D Scene...</p>
          </div>
        )}
        
        {!splineShouldLoad && (
          <div className="spline-placeholder" onClick={() => {
            setSplineShouldLoad(true);
            setSplineLoading(true);
          }}>
            <div className="placeholder-icon">🎨</div>
            <p>Interactive 3D Scene</p>
            <small>Click here to load the 3D scene</small>
          </div>
        )}
        
        {splineError && (
          <div className="spline-error">
            <div className="error-icon">⚠️</div>
            <p>3D Scene Failed to Load</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        )}
        
        {splineShouldLoad && (
          <>
            {splineLoading && (
              <div className="spline-loading">
                <div className="loading-spinner"></div>
                <p>Loading 3D Scene...</p>
                <small>This may take a few moments</small>
                <button 
                  onClick={() => {
                    setSplineLoading(false);
                    setSplineError(true);
                  }} 
                  className="cancel-btn"
                  style={{ marginTop: '1rem' }}
                >
                  Cancel Loading
                </button>
              </div>
            )}
            
            <Spline 
              scene="https://prod.spline.design/NvbiDbYncf06kC4w/scene.splinecode"
              // Fallback to a simpler scene if needed:
              // scene="https://prod.spline.design/6Wq1Q7YGyM-iab9x/scene.splinecode"
              onLoad={() => {
                console.log('Spline onLoad triggered');
                setSplineLoading(false);
                setSplineLoaded(true);
                console.log('Spline scene loaded successfully');
              }}
              onError={(error) => {
                console.log('Spline onError triggered:', error);
                setSplineLoading(false);
                setSplineError(true);
                console.error('Spline loading error:', error);
              }}
              style={{ 
                display: splineLoaded ? 'block' : 'none',
                opacity: splineLoaded ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out'
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
