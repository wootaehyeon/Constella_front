import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardList from "./timeCard"; // 카드 리스트 컴포넌트 (시간순 카드들)
import StarsCanvas from "../components/StarsCanvas"; // 별자리 컴포넌트 (별자리 캔버스)
import StatsModal from "../components/StatsModal";

const MyPage = () => {
  const [mode, setMode] = useState("cards"); // "cards" or "stars"
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100vw", overflow: "hidden", background: "black" }}>
      {/* 별자리 배경 */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }}>
        <StarsCanvas />
      </div>
      {/* X 버튼 */}
      <button
        onClick={() => navigate("/globe")}
        style={{
          position: "fixed",
          top: 24,
          right: 32,
          zIndex: 10,
          background: "rgba(255,255,255,0.15)",
          border: "none",
          color: "white",
          fontSize: 32,
          fontWeight: 700,
          cursor: "pointer",
          borderRadius: "50%",
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        aria-label="GlobeViewer로 돌아가기"
      >
        ×
      </button>
      {/* 컨텐츠 오버레이 */}
      <div style={{ position: "relative", zIndex: 1, padding: 40, textAlign: "center" }}>
        <h2 style={{ color: "white", fontWeight: 700 }}>my page</h2>
        <div style={{ width: "80%", minHeight: "400px", margin: "20px auto", background: "rgba(100,100,100,0.5)", borderRadius: "12px", overflow: "hidden", position: "relative", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {mode === "cards" ? <CardList /> : <div style={{ width: "100%", height: "400px" }}></div>}
        </div>
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: 20 }}>
          <button onClick={() => setMode("stars")} style={{ padding: "10px 20px", border: "1px solid red", background: "#fff" }}>
            내 별자리 보기
          </button>
          <button onClick={() => setMode("cards")} style={{ padding: "10px 20px", border: "1px solid red", background: "#fff" }}>
            모든 카드 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
