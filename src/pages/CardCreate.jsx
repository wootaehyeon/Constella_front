import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const CardCreate = () => {
  const [searchParams] = useSearchParams();
  const country = searchParams.get("country");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl,
          country,
        }),
      });

      if (response.ok) {
        alert("카드가 등록되었습니다!");
        navigate(`/entries?country=${country}`);
      } else {
        const error = await response.json();
        alert("등록 실패: " + (error.message || "알 수 없는 오류"));
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류 발생");
    }
  };

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h2>{country}에 추억 기록하기</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15, width: 400 }}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 6 }}
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
          style={{ padding: 10, borderRadius: 6 }}
        />
        <input
          type="text"
          placeholder="이미지 URL (선택)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ padding: 10, borderRadius: 6 }}
        />
        <button type="submit" style={{ padding: 12, backgroundColor: "#1e90ff", color: "white", border: "none", borderRadius: 6 }}>
          등록하기
        </button>
      </form>
    </div>
  );
};

export default CardCreate;
