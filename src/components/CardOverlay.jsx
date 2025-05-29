import React, { useEffect, useState } from "react";
import CardCreateModal from "./CardCreateModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const countryNameMap = {
  KOR: "대한민국",
  USA: "미국",
  FRA: "프랑스",
  JPN: "일본",
  CHN: "중국",
  GBR: "영국",
  DEU: "독일",
  ITA: "이탈리아",
  ESP: "스페인",
  RUS: "러시아",
  BRA: "브라질",
  AUS: "호주",
  IND: "인도",
  CAN: "캐나다",
  MEX: "멕시코",
};

const CardOverlay = ({ country, onClose }) => {
  const [cards, setCards] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const refetchCards = () => {
    fetch(`http://localhost:8080/api/diaries/merge/${country}`)
      .then((res) => res.json())
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .catch(() => setCards([]));
  };

  useEffect(() => {
    refetchCards();
  }, [country]);

  const handleCardCreated = () => {
    setShowCreate(false);
    refetchCards();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 14,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          zIndex: 11,
          position: "relative",
          background: "rgba(0,0,30,0.7)",
          backdropFilter: "blur(15px)",
          borderRadius: 20,
          padding: 30,
          marginTop: 80,
          width: "80%",
          maxWidth: 800,
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2>{countryNameMap[country] || country}의 추억들</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#ccc",
              fontSize: "1.2rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={30}
          slidesPerView={3}
          centeredSlides={true}
          style={{ paddingBottom: "30px" }}
        >
          {cards.map((card) => (
            <SwiperSlide key={card.id}>
              <div
                style={{
                  height: 240,
                  padding: 20,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 16,
                  backdropFilter: "blur(6px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <h4>{card.mergedTitle}</h4>
                <p style={{ fontSize: 12, color: "#ccc" }}>
                  {card.mergedContent.slice(0, 60)}...
                </p>
              </div>
            </SwiperSlide>
          ))}

          {/* Always show + card */}
          <SwiperSlide>
            <div
              onClick={() => setShowCreate(true)}
              style={{
                height: 240,
                border: "2px dashed white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                borderRadius: 16,
                cursor: "pointer",
                opacity: 0.6,
              }}
            >
              ＋
            </div>
          </SwiperSlide>
        </Swiper>

        {showCreate && (
          <CardCreateModal
            country={country}
            onClose={() => setShowCreate(false)}
            onComplete={handleCardCreated}
          />
        )}
      </div>
    </div>
  );
};

export default CardOverlay;
