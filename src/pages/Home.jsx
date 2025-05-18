import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import worldMapData from "./custom.geo.json"; // 또는 topojson 변환된 GeoJSON


const STAR_COUNT = 100;
const STAR_RADIUS = 1.5;
const CONSTELLATION_LINE_DISTANCE = 100;
console.log("worldMapData", worldMapData);

function createStarsFromGeo(width, height) {
  const projection = d3.geoMercator()
    .translate([width / 2, height / 2])         // 화면 정중앙
    .center([0, 15])                          // 중앙아메리카 기준 위치 (예: 코스타리카 중심)
    .scale(width /6);                        // 확대 비율 적절히 조정
  const path = d3.geoPath().projection(projection);

  let stars = [];

  worldMapData.features.forEach((feature) => {
    const coordinates = feature.geometry.coordinates;

    if (feature.geometry.type === "Polygon") {
     
      coordinates[0].filter((_, i) => i % 10 === 0).forEach(([lon, lat]) => {
        const [x, y] = projection([lon, lat]);
        stars.push({
          x,
          y,
          radius: Math.random() * STAR_RADIUS + 0.5,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
          opacity: Math.random()*0.4+0.6,
        });
      });
    }

    if (feature.geometry.type === "MultiPolygon") {
      coordinates.forEach((polygon) => {
        polygon[0].filter((_, i) => i  === 0).forEach(([lon, lat]) => {
          const [x, y] = projection([lon, lat]);
          stars.push({
            x,
            y,
            radius: Math.random() * STAR_RADIUS + 0.5,
            twinkleSpeed: 0.01 + Math.random() * 0.02,
            opacity: Math.random(),
          });
        });
      });
    }
  });

  return stars;
}


export default function Home({ setIsLoggedIn }) {
  const canvasRef = useRef(null);
  const [stars, setStars] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
  const [selectedStar, setSelectedStar] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setStars(createStarsFromGeo(width, height));
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    function animate() {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 별자리 선 그리기
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONSTELLATION_LINE_DISTANCE) {
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
          }
        }
      }
      // 마우스 근처 별자리 선 그리기
      stars.forEach((star) => {
        const dx = star.x - mousePos.x;
        const dy = star.y - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        
         if (dist < CONSTELLATION_LINE_DISTANCE) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / CONSTELLATION_LINE_DISTANCE})`; // 거리 기반 밝기
    ctx.lineWidth = 1.5; // ⭐ 더 굵게
    ctx.shadowColor = "white";
    ctx.shadowBlur = 12; // ⭐ glow 효과 추가
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
  }
      });
      ctx.stroke();

      // 별 반짝임 그리기
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity >= 1 || star.opacity <= 0.6) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.shadowColor = "white";
        ctx.shadowBlur = 15;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [stars, mousePos]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const clickedStar = stars.find(
      (star) => Math.hypot(star.x - clickX, star.y - clickY) < star.radius + 5
    );
    if (clickedStar) {
      setSelectedStar(clickedStar);
    }
  };

  const closeCard = () => {
    setSelectedStar(null);
  };

  useEffect(() => {
    if (stars.length === 0) return;
    const newStars = stars.map((star, idx) => {
      const offset = (scrollY / 5) * (idx % 2 === 0 ? 1 : -1);
      return { ...star, y: star.y + offset };
    });
    setStars(newStars);
  }, [scrollY]);

  // 로그인 처리 (임시)
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
      {/* 배경 우주 이미지 */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, #000011 0%, #000000 80%), url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1350&q=80') no-repeat center/cover",
          zIndex: -2,
        }}
      />

      {/* 캔버스 */}
      <canvas
        ref={canvasRef}
        style={{ display: "block", position: "fixed", inset: 0, zIndex: -1 }}
        onMouseMove={(e) => {
          const rect = canvasRef.current.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setMousePos({ x: -9999, y: -9999 })}
        onClick={handleCanvasClick}
      />

      {/* 로그인/회원가입 */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "1.1rem",
          userSelect: "none",
          zIndex: 10,
          display: "flex",
          gap: "15px",
        }}
      >
        <span onClick={handleLogin}>로그인</span>
        <span>회원가입</span>
      </div>

      {/* 선택된 별 카드 */}
      {selectedStar && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            maxHeight: "40vh",
            background: "rgba(0, 0, 30, 0.85)",
            color: "white",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.7)",
            padding: "20px 30px",
            fontSize: 18,
            overflowY: "auto",
            animation: "slideUp 0.3s ease forwards",
            zIndex: 20,
          }}
          onClick={closeCard}
        >
          <h2>추억카드</h2>
          <p>
            이 별은 x: {Math.round(selectedStar.x)}, y: {Math.round(selectedStar.y)} 위치에 있습니다.
          </p>
          <p>여기에 추억에 대한 상세 내용을 추가하세요.</p>
          <p>(클릭 시 닫기)</p>
        </div>
      )}

      {/* 슬라이드업 애니메이션 스타일 */}
      <style>{`
        @keyframes slideUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
