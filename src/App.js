import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage"; // ✅ 새 웰컴 페이지
import Home from "./pages/Home";
import GlobeViewer from "./pages/GlobeViewer";
import CardList from "./pages/CardList";
import CardDetail from "./pages/CardDetail";
import CardCreate from "./pages/CardCreate";
import MyPage from "./pages/mypage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "false" ? false : true;
  });

  return (
    <Router>
      <Routes>
        {/* 웰컴 페이지: 앱 첫 진입 */}
        <Route path="/" element={<WelcomePage />} />

        {/* 로그인 페이지 */}
        <Route path="/home" element={<Home setIsLoggedIn={setIsLoggedIn} />} />

        {/* 지구본 페이지 */}
        <Route 
          path="/globe" 
          element={isLoggedIn ? <GlobeViewer /> : <Navigate to="/home" />} 
        />

        {/* 카드 리스트 */}
        <Route 
          path="/entries" 
          element={isLoggedIn ? <CardList /> : <Navigate to="/home" />} 
        />

        {/* 카드 작성 */}
        <Route 
          path="/entries/create" 
          element={isLoggedIn ? <CardCreate /> : <Navigate to="/home" />} 
        />

        {/* 카드 상세 */}
        <Route 
          path="/entries/:id" 
          element={isLoggedIn ? <CardDetail /> : <Navigate to="/home" />} 
        />

        {/* 마이페이지 */}
        <Route 
          path="/mypage" 
          element={isLoggedIn ? <MyPage /> : <Navigate to="/home" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
