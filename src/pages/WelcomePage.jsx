import React from "react";
import { useNavigate } from "react-router-dom";
import StarsCanvas from "../components/StarsCanvas";
import { Typewriter } from 'react-simple-typewriter';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/home");
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        zIndex: 1,
        textAlign: "center",
      }}
    >
      <StarsCanvas />

      <h1 style={{ fontSize: "3rem", marginBottom: 10 }}>
        <span role="img" aria-label="star">🌌</span>{' '}
        Welcome to <span style={{ color: "#8ab4f8" }}>Constella</span>
      </h1>

      <p style={{ fontSize: "1.2rem", marginBottom: 40 }}>
        <Typewriter
          words={['전 세계의 별자리를 여행하는 당신을 위한 감성 다이어리']}
          loop={false}
          cursor
          cursorStyle="|"
          typeSpeed={80}
          deleteSpeed={0}
          delaySpeed={4000}
        />
      </p>

      <button
        onClick={handleStart}
        style={{
          padding: "12px 28px",
          fontSize: "1rem",
          backgroundColor: "#8ab4f8",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          color: "white",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        시작하기
      </button>
    </div>
  );
};

export default WelcomePage;
