import React from "react";

const MascotAssistant = ({ parallaxOffset = 0, isActive = false }) => {
  return (
    <div
      className="mascot-assistant"
      style={{
        position: "fixed",
        bottom: 30 + parallaxOffset,
        right: 30,
        zIndex: 1000,
        cursor: "pointer",
        transition: "transform 0.6s cubic-bezier(.4,2,.6,1), bottom 0.6s cubic-bezier(.4,2,.6,1)",
        transform: isActive ? "scale(1.15)" : "scale(1)",
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <dotlottie-player
        src="https://lottie.host/afb131d6-938e-4365-9b56-565c35bc84fe/X3F2UjKzd5.lottie"
        background="transparent"
        speed="1"
        style={{ width: "100px", height: "100px" }}
        loop
        autoplay
      ></dotlottie-player>
    </div>
  );
};

export default MascotAssistant; 