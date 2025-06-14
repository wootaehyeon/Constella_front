import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const TimeCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const fetchCards = async () => {
      try {
        const response = await fetch(`/api/diaries/user/${userId}/merged`);
        if (!response.ok) throw new Error("데이터를 가져오는 중 오류가 발생했습니다.");
        const data = await response.json();
        setCards(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  if (!localStorage.getItem('userId')) return <p>로그인이 필요합니다.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h2>모든 카드 목록 (시간순)</h2>
      {cards.length === 0 ? (
        <p>아직 작성한 카드가 없습니다.</p>
      ) : (
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={30}
          slidesPerView={Math.min(cards.length, 3)}
          centeredSlides={true}
          style={{ paddingBottom: "30px", width: "100%", maxWidth: 900 }}
        >
          {cards.map((card) => (
            <SwiperSlide key={card.id}>
              <div
                style={{
                  minHeight: 220,
                  minWidth: 160,
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
                  margin: "0 auto",
                  overflow: "hidden",
                  textAlign: "center",
                  wordBreak: "break-all"
                }}
              >
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.mergedTitle || card.title}</h3>
                <p style={{ color: "#ccc", marginBottom: 8, whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: 60 }}>{card.mergedContent || card.contents}</p>
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