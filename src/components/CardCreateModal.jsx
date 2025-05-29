import React, { useState } from 'react';

const CardCreateModal = ({ country, onClose, onComplete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("contents", content);
    formData.append("locationCode", country);
    formData.append("date", new Date().toISOString().split("T")[0]);

    try {
      const res = await fetch("http://localhost:8080/api/diaries", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("등록 실패");

    onClose();
    onComplete();
  } catch (err) {
    alert("카드 등록 실패: " + err.message);
  }
  };

  return (
    <div style={{
      position: "fixed",
      top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      background: "rgba(0,0,40,0.9)",
      backdropFilter: "blur(10px)",
      padding: 30,
      borderRadius: 16,
      zIndex: 1100,
      color: "white",
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)"
    }}>
      <h3>새 추억 작성</h3>
      <input
        placeholder="제목"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <textarea
        placeholder="내용"
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{ width: "100%", height: 100 }}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleSubmit} style={{ marginRight: 10 }}>등록</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
};

export default CardCreateModal;
