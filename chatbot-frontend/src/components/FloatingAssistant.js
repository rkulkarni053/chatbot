import React, { useEffect, useState } from "react";
import "./FloatingAssistant.css";
import botImage from "../assets/assistant-bot.svg";

const FloatingAssistant = ({ isActive }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 800); // Matches your existing duration
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div className={`floating-assistant ${shouldAnimate ? "active" : ""}`}>
      <img src={botImage} alt="Assistant Bot" className="assistant-icon" />
    </div>
  );
};

export default FloatingAssistant;
