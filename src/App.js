import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import GlobeViewer from "./pages/GlobeViewer";
import CardList from "./pages/CardList";
import CardDetail from "./pages/CardDetail";
import CardCreate from "./pages/CardCreate"; // ✅ 카드 작성 페이지 추가

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "false"; // ✅ 올바른 판별
  });

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isLoggedIn ? <Navigate to="/globe" /> : <Home setIsLoggedIn={setIsLoggedIn} />
          } 
        />

        <Route 
          path="/globe" 
          element={isLoggedIn ? <GlobeViewer /> : <Navigate to="/" />} 
        />

        <Route 
          path="/entries" 
          element={isLoggedIn ? <CardList /> : <Navigate to="/" />} 
        />

        <Route 
          path="/entries/create" 
          element={isLoggedIn ? <CardCreate /> : <Navigate to="/" />} 
        />

        <Route 
          path="/entries/:id" 
          element={isLoggedIn ? <CardDetail /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
