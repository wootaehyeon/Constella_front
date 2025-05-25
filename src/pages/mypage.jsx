import React, { useEffect, useState } from 'react';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    username: '디버그 사용자'
  });

  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          setEditName(data.username);
        }
      } catch (err) {
        console.error('에러:', err);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8080/api/users/me', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editName,
          password: editPassword,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setUserInfo(updated);
        alert('정보 수정 완료!');
        setShowModal(false);
      } else {
        alert('정보 수정 실패!');
      }
    } catch (err) {
      console.error('에러:', err);
      alert('서버 오류!');
    }
  };

  return (
    <div style={pageStyle}>
      <h1>{userInfo ? `${userInfo.username}님의 화면이에요` : '로그인이 필요합니다'}</h1>

      {userInfo && (
        <div style={btnContainer}>
          <button style={buttonStyle} onClick={() => setShowModal(true)}>내 정보 수정</button>
          <button 
            style={{ ...buttonStyle, backgroundColor: '#32cd32' }} 
            onClick={() => navigate('/collectcard')}  // ✅ 페이지 이동
          >
            카드 모아보기
          </button>
        </div>
      )}

      {showModal && (
        <div style={modalStyle}>
          <h3>내 정보 수정</h3>
          <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="이름" style={inputStyle} />
          <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="새 비밀번호" style={inputStyle} />
          <button onClick={handleSave} style={{ ...buttonStyle, marginTop: '10px' }}>저장</button>
          <button onClick={() => setShowModal(false)} style={{ ...buttonStyle, backgroundColor: 'gray', marginTop: '10px' }}>취소</button>
        </div>
      )}
    </div>
  );
};

// 배경 이미지 (별자리 이미지 URL)
const pageStyle = {
  width: '100vw',
  height: '100vh',
  background: 'url("https://images.unsplash.com/photo-1602861913150-6c3d0192ec16?auto=format&fit=crop&w=1470&q=80") no-repeat center/cover',
  color: 'white',
  fontFamily: 'Orbitron, sans-serif',
  padding: '40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const btnContainer = { display: 'flex', flexDirection: 'row', gap: '20px', marginTop: '40px' };
const buttonStyle = { padding: '15px', backgroundColor: '#1e90ff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer' };
const modalStyle = { position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', background: 'rgba(0,0,30,0.95)', padding: '30px', borderRadius: '12px', boxShadow: '0 0 15px rgba(255,255,255,0.2)' };
const inputStyle = { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '6px', border: 'none' };

export default MyPage;
