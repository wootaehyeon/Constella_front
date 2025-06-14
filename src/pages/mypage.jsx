import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CardList from "./timeCard"; // 카드 리스트 컴포넌트 (시간순 카드들)
import StarsCanvas from "../components/StarsCanvas"; // 별자리 컴포넌트 (별자리 캔버스)
import StatsModal from "../components/StatsModal";
import Constellation2DMinimap from "../components/Constellation2DMinimap";
import ConstellationHistory from "../components/ConstellationHistory";

const MyPage = () => {
  const [mode, setMode] = useState("cards"); // "cards" or "stars"
  const [constellationPins, setConstellationPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(false);
  const navigate = useNavigate();

  // 별자리 핀 리스트 받아오기
  useEffect(() => {
    if (mode !== "stars") return;
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error('userId가 없습니다! (mypage)');
      setLoadingPins(false);
      return;
    }
    setLoadingPins(true);
    fetch(`http://localhost:8080/api/constellation/saved/${userId}`) // 수정된 엔드포인트
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error('별자리 핀 로드 실패: ' + res.status + ' ' + errorText);
        }
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          console.warn('별자리 핀 응답이 JSON이 아닙니다 (mypage): ', await res.text());
          return [];
        }
      })
      .then(data => {
        console.log('마이페이지 별자리 핀 불러오기 응답:', data);
        setConstellationPins(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('마이페이지 별자리 핀 API 에러:', err);
        setConstellationPins([]);
      })
      .finally(() => setLoadingPins(false));
  }, [mode]);

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
          {mode === "cards" ? <CardList /> : <ConstellationHistory />}
        </div>
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: 20 }}>
          <button
            onClick={() => setMode("stars")}
            style={{
              padding: "12px 32px",
              border: mode === "stars" ? "2px solid #ffd700" : "2px solid #fff",
              background: mode === "stars" ? "rgba(30,30,60,0.95)" : "rgba(255,255,255,0.08)",
              color: mode === "stars" ? "#ffd700" : "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 30,
              boxShadow: mode === "stars" ? "0 0 16px 2px #ffd70088" : "0 0 8px 1px #fff2",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(.4,2,.6,1)",
              outline: "none",
              position: "relative",
            }}
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = "0 0 24px 6px #ffd700cc, 0 0 8px 2px #fff6";
              e.currentTarget.style.background = "rgba(40,40,80,0.98)";
              e.currentTarget.style.color = "#fffbe6";
              e.currentTarget.style.border = "2px solid #ffd700";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = mode === "stars" ? "0 0 16px 2px #ffd70088" : "0 0 8px 1px #fff2";
              e.currentTarget.style.background = mode === "stars" ? "rgba(30,30,60,0.95)" : "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = mode === "stars" ? "#ffd700" : "#fff";
              e.currentTarget.style.border = mode === "stars" ? "2px solid #ffd700" : "2px solid #fff";
            }}
          >
            ★ 별자리 히스토리
          </button>
          <button
            onClick={() => setMode("cards")}
            style={{
              padding: "12px 32px",
              border: mode === "cards" ? "2px solid #00eaff" : "2px solid #fff",
              background: mode === "cards" ? "rgba(10,30,60,0.95)" : "rgba(255,255,255,0.08)",
              color: mode === "cards" ? "#00eaff" : "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 30,
              boxShadow: mode === "cards" ? "0 0 16px 2px #00eaff88" : "0 0 8px 1px #fff2",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(.4,2,.6,1)",
              outline: "none",
              position: "relative",
            }}
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = "0 0 24px 6px #00eaffcc, 0 0 8px 2px #fff6";
              e.currentTarget.style.background = "rgba(20,40,80,0.98)";
              e.currentTarget.style.color = "#e0f7ff";
              e.currentTarget.style.border = "2px solid #00eaff";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = mode === "cards" ? "0 0 16px 2px #00eaff88" : "0 0 8px 1px #fff2";
              e.currentTarget.style.background = mode === "cards" ? "rgba(10,30,60,0.95)" : "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = mode === "cards" ? "#00eaff" : "#fff";
              e.currentTarget.style.border = mode === "cards" ? "2px solid #00eaff" : "2px solid #fff";
            }}
          >
            ✦ 모든 카드 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
