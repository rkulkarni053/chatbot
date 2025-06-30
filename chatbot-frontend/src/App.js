import React, { useState } from "react";
import "./App.css";
import FloatingAssistant from "./components/FloatingAssistant";

const App = () => {
  // Checklists
  const onboardingChecklist = [
    "Please download, sign, and upload the onboarding acknowledgment.",
    "Complete the onboarding survey.",
    "Set up your work account.",
  ];

  const offboardingChecklist = [
    "Please download, sign, and upload the offboarding acknowledgment.",
    "Return company equipment.",
    "Complete the exit interview survey.",
  ];

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Good morning! What is your name?" },
  ]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState("askName");
  const [userName, setUserName] = useState("");
  const [currentChecklist, setCurrentChecklist] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [assistantActive, setAssistantActive] = useState(false);

  const triggerAssistant = () => {
    setAssistantActive(true);
    setTimeout(() => setAssistantActive(false), 800);
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    if (currentStep === "askName") {
      setUserName(input);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Nice to meet you, ${input}!` },
        {
          sender: "bot",
          text: "Would you like to perform an onboarding or offboarding process?",
        },
      ]);
      setCurrentStep("chooseProcess");
      triggerAssistant();
    } else if (currentStep === "askChecklist") {
      const currentQuestion = currentChecklist[currentQuestionIndex];
      if (currentQuestion.includes("upload")) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Please upload the signed acknowledgment below." },
        ]);
        setCurrentStep("uploadFile");
        triggerAssistant();
      } else {
        if (currentQuestionIndex < currentChecklist.length - 1) {
          const next = currentChecklist[currentQuestionIndex + 1];
          setMessages((prev) => [...prev, { sender: "bot", text: next }]);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Thank you for completing the process!" },
          ]);
          setCurrentStep("completed");
        }
        triggerAssistant();
      }
    }

    setInput("");
  };

  const handleProcessChoice = (type) => {
    let checklist, link, label;
    if (type === "onboarding") {
      checklist = onboardingChecklist;
      link =
        "https://tumasgrp.sharepoint.com/:t:/s/Testsite_PowerAutomate/EVVruOiHIeRPoJcnnFT-IlMBh57Swffmj-dOZfDfLfIh7A?e=ibsznb";
      label = "Onboarding";
    } else {
      checklist = offboardingChecklist;
      link =
        "https://tumasgrp.sharepoint.com/:t:/s/Testsite_PowerAutomate/EQx2WeMLGgFMrN5-3v1LiKwBI4P7e78ig8Wwi11YIGEbMA?e=FYsrgv";
      label = "Offboarding";
    }

    setCurrentChecklist(checklist);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: `Great! Let's start the ${label.toLowerCase()} process.` },
      {
        sender: "bot",
        text: (
          <a
            href={link}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Download {label} Acknowledgment
          </a>
        ),
      },
      { sender: "bot", text: checklist[0] },
    ]);
    setCurrentStep("askChecklist");
    triggerAssistant();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);

    // Add a message confirming the file upload
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: `File "${file.name}" uploaded successfully.` },
    ]);

    // Check if there are more checklist items
    if (currentQuestionIndex < currentChecklist.length - 1) {
      const nextQuestion = currentChecklist[currentQuestionIndex + 1];
      setMessages((prev) => [...prev, { sender: "bot", text: nextQuestion }]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentStep("askChecklist");
    } else {
      // If no more checklist items, complete the process
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thank you for completing the process!" },
      ]);
      setCurrentStep("completed");
    }

    triggerAssistant();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">IT Process Checklist</div>
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${
                msg.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          {currentStep === "chooseProcess" ? (
            <div>
              <button onClick={() => handleProcessChoice("onboarding")}>Onboarding</button>
              <button onClick={() => handleProcessChoice("offboarding")}>Offboarding</button>
            </div>
          ) : currentStep === "uploadFile" ? (
            <input type="file" onChange={handleFileUpload} />
          ) : (
            <>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSendMessage}>Send</button>
            </>
          )}
        </div>
      </div>

      {/* Floating Assistant */}
      <FloatingAssistant isActive={assistantActive} />
    </div>
  );
};

export default App;
