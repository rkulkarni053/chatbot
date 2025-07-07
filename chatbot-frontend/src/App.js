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
    if (!processes[process]) {
      console.error(`Invalid process: ${process}`);
      return;
    }
    setCurrentProcess(process);
    setMessages(prev => [...prev, 
      { sender: 'bot', text: `Great! Let's start the ${processes[process].name} process.` }
    ]);
    setCurrentQuestionIndex(0);
    askQuestion(0);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFile(file);
    setMessages(prev => [...prev, 
      { sender: 'bot', text: `File "${file.name}" uploaded successfully.` }
    ]);

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
          setMessages(prev => [...prev, 
            { sender: 'bot', text: 'Thank you for completing the process!' }
          ]);
          setCurrentStep('completed');
          saveResponsesToDB();
        }
        break;
        
      default:
        break;
    }
  };

  const saveResponsesToDB = async () => {
    setLoading(true);
    const formData = new FormData();
    
    const formattedResponses = processes[currentProcess].questions.map((question, index) => {
      let userResponse;
      if (question.type === 'upload') {
        userResponse = uploadedFile ? uploadedFile.name : 'Not uploaded';
      } else {
        const responseIndex = messages.findIndex(msg => 
          msg.sender === 'bot' && (msg.text === question.question || msg.text.props?.children === question.question)
        );
        userResponse = responseIndex !== -1 && messages[responseIndex + 1]?.sender === 'user' 
          ? messages[responseIndex + 1].text 
          : 'completed';
      }
      
      return {
        question: question.question,
        response: userResponse
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
              <input 
                type="file" 
                id="file-upload"
                onChange={handleFileUpload}
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-upload-btn">
                <i className="icon-upload"></i>
                <span>Choose File</span>
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
    </div>
  );
};

export default App;
