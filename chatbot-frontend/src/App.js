// Frontend: App.js
import React, { useState } from "react";
import "./App.css";
import FloatingAssistant from "./components/FloatingAssistant";

const onboardingChecklist = [
  {
    question: "Please download, sign, and upload the onboarding acknowledgment.",
    type: "upload",
    url:
      "https://tumasgrp.sharepoint.com/:t:/s/Testsite_PowerAutomate/EVVruOiHIeRPoJcnnFT-IlMBh57Swffmj-dOZfDfLfIh7A?e=ibsznb",
  },
  { question: "Complete the onboarding survey.", type: "text" },
  { question: "Set up your work account.", type: "text" },
];

const offboardingChecklist = [
  {
    question: "Please download, sign, and upload the offboarding acknowledgment.",
    type: "upload",
    url:
      "https://tumasgrp.sharepoint.com/:t:/s/Testsite_PowerAutomate/EQx2WeMLGgFMrN5-3v1LiKwBI4P7e78ig8Wwi11YIGEbMA?e=FYsrgv",
  },
  { question: "Return company equipment.", type: "text" },
  { question: "Complete the exit interview survey.", type: "text" },
];

const App = () => {
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

  const saveResponsesToDB = async () => {
    const formData = new FormData();

    const formattedResponses = currentChecklist.slice(0, currentQuestionIndex + 1).map((item) => ({
      question: item.question,
      response: item.type === "upload" ? uploadedFile?.name || "N/A" : "completed",
    }));

    formData.append(
      "process",
      currentChecklist === onboardingChecklist ? "onboarding" : "offboarding"
    );
    formData.append("responses", JSON.stringify(formattedResponses));
    if (uploadedFile) formData.append("file", uploadedFile);

    try {
      const res = await fetch("http://localhost:5000/responses", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to save responses");
      const result = await res.json();
      console.log("✅ Saved:", result);
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      console.error("❌ Error saving:", err);
    }
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
      const currentItem = currentChecklist[currentQuestionIndex];
      if (currentItem.type === "upload") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Please upload the signed acknowledgment below." },
        ]);
        setCurrentStep("uploadFile");
      } else {
        if (currentQuestionIndex < currentChecklist.length - 1) {
          const next = currentChecklist[currentQuestionIndex + 1];
          setMessages((prev) => [...prev, { sender: "bot", text: next.question }]);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Thank you for completing the process!" },
          ]);
          setCurrentStep("completed");
          saveResponsesToDB();
        }
        triggerAssistant();
      }
    }

    setInput("");
  };

  const handleProcessChoice = (type) => {
    const checklist = type === "onboarding" ? onboardingChecklist : offboardingChecklist;
    setCurrentChecklist(checklist);
    const label = type.charAt(0).toUpperCase() + type.slice(1);

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: `Great! Let's start the ${type} process.` },
      {
        sender: "bot",
        text: (
          <a href={checklist[0].url} download target="_blank" rel="noopener noreferrer">
            Download {label} Acknowledgment
          </a>
        ),
      },
      { sender: "bot", text: checklist[0].question },
    ]);
    setCurrentStep("askChecklist");
    triggerAssistant();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: `File \"${file.name}\" uploaded successfully.` },
    ]);

    if (currentQuestionIndex < currentChecklist.length - 1) {
      const next = currentChecklist[currentQuestionIndex + 1];
      setMessages((prev) => [...prev, { sender: "bot", text: next.question }]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentStep("askChecklist");
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thank you for completing the process!" },
      ]);
      setCurrentStep("completed");
      saveResponsesToDB();
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
      <FloatingAssistant isActive={assistantActive} />
    </div>
  );
};

export default App;
