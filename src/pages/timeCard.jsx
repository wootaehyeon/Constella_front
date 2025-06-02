
import React, { useEffect, useState } from "react";

const TimeCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/diaries");
        if (!response.ok) throw new Error("�����͸� �ҷ����� ���߽��ϴ�.");
        const data = await response.json();

        // �ð��� ���� (�ֱ� ���� ����)
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
      <h2>��� ī�� ���� (�ð���)</h2>
      {cards.length === 0 ? (
        <p>��ϵ� ī�尡 �����ϴ�.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cards.map((card) => (
            <li key={card.id} style={{
              backgroundColor: "#1e1e2f",
              marginBottom: "15px",
              padding: "15px",
              borderRadius: "8px"
            }}>
              <h3>{card.title}</h3>
              <p>{card.contents}</p>
              <p><strong>��¥:</strong> {card.date}</p>
              {card.images && card.images.length > 0 && (
                <div>
                  {card.images.map((url, idx) => (
                    <img key={idx} src={url} alt={`Card ${idx}`} style={{ maxWidth: "100%", marginTop: "10px" }} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TimeCard;

