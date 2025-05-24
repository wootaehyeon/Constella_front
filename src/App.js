import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import GlobeViewer from "./pages/GlobeViewer";
import MyPage from "./pages/mypage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

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
          path="/mypage" 
          element={isLoggedIn ? <MyPage /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
