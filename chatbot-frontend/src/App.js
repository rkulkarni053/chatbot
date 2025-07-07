import React, { useState } from "react";
import "./App.css";
import FloatingAssistant from "./components/FloatingAssistant";

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

  const triggerAssistant = () => {
    setAssistantActive(true);
    setTimeout(() => setAssistantActive(false), 800);
  };

 const askQuestion = (index) => {
  if (!processes[currentProcess] || !processes[currentProcess].questions[index]) {
    console.error("Invalid process or question index");
    return;
  }
  const question = processes[currentProcess].questions[index];
  
  if (question.type === 'upload') {
    setMessages(prev => [...prev, 
      { sender: 'bot', text: (
        <a href={question.url} download className="download-link">
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
      const response = await fetch('http://localhost:5000/responses', {
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
    <div className="app-container">
      <div className="chat-app">
        <div className="chat-header">
          <div className="header-content">
            <h1>IT Process Assistant</h1>
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
            <div key={index} className={`message ${msg.sender}`}>
              {typeof msg.text === 'string' ? msg.text : msg.text}
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
              />
              <button 
                onClick={handleSendMessage}
                className="send-btn"
                disabled={!input.trim() || loading}
              >
                <i className="icon-send"></i>
              </button>
            </div>
          )}
        </div>
      </div>
      <FloatingAssistant isActive={assistantActive} />
      {/* Debug Panel Start */}
      <div style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 9999
      }}>
        <div><strong>Debug Info</strong></div>
        <div>currentStep: {currentStep}</div>
        <div>currentProcess: {currentProcess ? currentProcess : 'null'}</div>
        <div>currentQuestionIndex: {currentQuestionIndex}</div>
      </div>
      {/* Debug Panel End */}
    </div>
  );
};

export default App;
