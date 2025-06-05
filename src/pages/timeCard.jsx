import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const TimeCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/diaries/all");
        if (!response.ok) throw new Error("데이터를 가져오는 중 오류가 발생했습니다.");
        const data = await response.json();
        // 날짜 필드가 없으면 id 기준 최신순 정렬
        const sorted = data.sort((a, b) => b.id - a.id);
        setCards(sorted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h2>모든 카드 목록 (시간순)</h2>
      {cards.length === 0 ? (
        <p>등록된 카드가 없습니다.</p>
      ) : (
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={30}
          slidesPerView={3}
          centeredSlides={true}
          style={{ paddingBottom: "30px", width: "100%", maxWidth: 900 }}
        >
          {cards.map((card) => (
            <SwiperSlide key={card.id}>
              <div
                style={{
                  height: 220,
                  padding: 16,
                  background: "rgba(30,30,47,0.95)",
                  borderRadius: 16,
                  backdropFilter: "blur(6px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  width: 160,
                  margin: "0 auto"
                }}
              >
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{card.mergedTitle || card.title}</h3>
                <p style={{ color: "#ccc", marginBottom: 8 }}>{card.mergedContent || card.contents}</p>
                <p style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>날짜: {card.date}</p>
                {(card.imageUrls && card.imageUrls.length > 0) && (
                  <img
                    src={card.imageUrls[0]}
                    alt="thumbnail"
                    style={{ width: "100%", height: 100, objectFit: "cover", marginTop: 10, borderRadius: 8 }}
                  />
                )}
                {(card.images && card.images.length > 0) && (
                  <img
                    src={card.images[0]}
                    alt="thumbnail"
                    style={{ width: "100%", height: 100, objectFit: "cover", marginTop: 10, borderRadius: 8 }}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default TimeCard;