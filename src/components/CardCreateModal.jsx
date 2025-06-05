import React, { useState } from 'react';

const CardCreateModal = ({ country, countryName, latitude, longitude, onClose, onComplete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("contents", content);
    formData.append("locationCode", country);
    formData.append("date", date || new Date().toISOString().split("T")[0]);
    formData.append("latitude", latitude.toString());
    formData.append("longitude", longitude.toString());

    images.forEach((file) => {
      formData.append("images", file);
    });

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>{countryName} 여행 일기 작성</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>
      </div>

      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: '8px', borderRadius: '4px', border: '1px solid #4a90e2' }}
      />

      <textarea
        placeholder="내용"
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{ width: "100%", height: 100, marginBottom: 10, padding: '8px', borderRadius: '4px', border: '1px solid #4a90e2' }}
      />

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: '8px', borderRadius: '4px', border: '1px solid #4a90e2' }}
      />

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>이미지 첨부</label>
        <input
          type="file"
          multiple
          onChange={e => setImages(Array.from(e.target.files))}
          style={{ width: "100%", padding: '8px', borderRadius: '4px', border: '1px solid #4a90e2' }}
        />
        {images.length > 0 && (
          <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
            {images.length}개의 이미지 선택됨
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "10px",
            background: "#666",
            border: "none",
            borderRadius: "5px",
            color: "white",
            cursor: "pointer"
          }}
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            padding: "10px",
            background: "#4a90e2",
            border: "none",
            borderRadius: "5px",
            color: "white",
            cursor: "pointer"
          }}
        >
          작성하기
        </button>
      </div>
    </div>
  );
};

export default CardCreateModal;
