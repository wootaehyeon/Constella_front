import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const CardList = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const country = searchParams.get("country");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8080/api/diaries/merge/${country}`)
      .then((res) => {
        if (!res.ok) throw new Error("서버 오류: " + res.status);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCards(data);
        } else {
          console.error("응답이 배열이 아님:", data);
          setCards([]);
        }
      })
      .catch((err) => {
        console.error("💥 fetch 에러:", err);
        setCards([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [country]);

  const handleCreateCard = () => {
    navigate(`/entries/create?country=${country}`);
  };

  const handleCardClick = (cardId) => {
    navigate(`/entries/${cardId}`);
  };

  return (
    <>
      {/* 🌌 우주 배경 */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(0,0,30,0.6), rgba(0,0,0,1)), url('https://images.unsplash.com/photo-1586165368502-1cb812b83f1e?auto=format&fit=crop&w=1500&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />

      <div
        style={{
          minHeight: "100vh",
          padding: "80px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "white",
        }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: 40 }}>
          {country}의 추억들
        </h2>

        {loading ? (
          <p>로딩 중...</p>
        ) : cards.length === 0 ? (
          // 📭 등록된 카드가 없을 때
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
            }}
          >
            <div
              onClick={handleCreateCard}
              style={{
                width: 260,
                height: 200,
                background: "rgba(255,255,255,0.05)",
                border: "2px dashed #ccc",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                color: "#aaa",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#aaa";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ＋
            </div>
          </div>
        ) : (
          // 🧾 카드 리스트가 있을 때
          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={{
                  width: 260,
                  minHeight: 200,
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 20,
                  padding: 20,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.03)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <h3 style={{ margin: 0 }}>{card.mergedTitle}</h3>
                <p style={{ fontSize: 14, color: "#ddd" }}>
                  {card.mergedContent
                    ? card.mergedContent.slice(0, 60) + "..."
                    : "내용 없음"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CardList;
