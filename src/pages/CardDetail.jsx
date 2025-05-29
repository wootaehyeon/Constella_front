import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CardDetail = () => {
  const { id } = useParams();
  const [card, setCard] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/cards/${id}`)
      .then(res => res.json())
      .then(data => setCard(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!card) return <div style={{ color: "white" }}>로딩 중...</div>;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "zoomIn 0.3s ease"
    }}>
      <div style={{
        width: 500,
        background: "#222",
        padding: 30,
        borderRadius: 15,
        boxShadow: "0 0 20px rgba(255,255,255,0.2)"
      }}>
        <h2>{card.title}</h2>
        <p>{card.content}</p>
        <p><strong>국가:</strong> {card.country}</p>
        {card.imageUrl && <img src={card.imageUrl} style={{ maxWidth: "100%", marginTop: 20 }} />}
      </div>

      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CardDetail;
