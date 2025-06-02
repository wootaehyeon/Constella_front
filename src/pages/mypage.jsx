import React, { useState, useEffect } from "react";
import CardList from "./timeCard"; // 카드 리스트 컴포넌트 (시간순 카드들)
import MyConstellation from "./MyConstellation"; // 별자리 컴포넌트 (별자리 캔버스)

const MyPage = () => {
  const [mode, setMode] = useState("cards"); // "cards" or "stars"

  return (
    <div style={{ background: "#eee", minHeight: "100vh", padding: 40, textAlign: "center" }}>
      <h2>my page</h2>

      <div style={{ width: "80%", height: "400px", margin: "20px auto", background: "#bbb", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
        {mode === "cards" ? <CardList /> : <MyConstellation />}
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
  );
};

export default MyPage;
