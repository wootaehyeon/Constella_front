import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';
import Constellation2DMinimap from './Constellation2DMinimap';
import { useNavigate } from 'react-router-dom';

const ConstellationHistory = () => {
  const [constellationHistory, setConstellationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log('별자리 히스토리 useEffect 실행, userId:', userId);
    
    if (!userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`[ConstellationHistory] 히스토리 API 호출 시도: http://localhost:8080/api/constellation/history/${userId}`);
        const response = await fetch(`http://localhost:8080/api/constellation/history/${userId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          let parsedError = {};
          try {
            parsedError = JSON.parse(errorText);
          } catch (e) {
            parsedError.message = errorText;
          }

          console.error(`[ConstellationHistory] 히스토리 로드 실패 (${response.status}):`, parsedError);
          if (response.status === 404) {
            setError(`사용자 정보를 찾을 수 없습니다. (ID: ${userId}) 또는 히스토리 없음: ${parsedError.message || '알 수 없는 오류'}`);
          } else {
            throw new Error(`히스토리 데이터를 가져오는데 실패했습니다: ${response.status} ${parsedError.message || errorText}`);
          }
          return;
        }
        
        const contentType = response.headers.get('content-type');
        let data = [];
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          console.log('[ConstellationHistory] 원본 API 응답 데이터:', data);
        } else {
          const textResponse = await response.text();
          console.warn('[ConstellationHistory] 별자리 히스토리 응답이 JSON이 아닙니다 (텍스트):', textResponse);
          data = [];
        }

        // 백엔드 응답이 `data.content` 형태로 온다고 가정
        const historyContent = Array.isArray(data.content) ? data.content : [];
        console.log('[ConstellationHistory] 처리된 히스토리 데이터:', historyContent);
        setConstellationHistory(historyContent);

      } catch (err) {
        console.error('[ConstellationHistory] 별자리 히스토리 로드 중 오류:', err);
        setError(err.message || '별자리 히스토리 로드 중 알 수 없는 오류 발생');
        setConstellationHistory([]);
      } finally {
        setLoading(false);
        console.log('[ConstellationHistory] 히스토리 로드 완료 (성공 또는 실패)');
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ color: '#FFD700', fontSize: 20, textAlign: 'center', marginTop: 40 }}>
        별자리 히스토리 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#FFD700', textAlign: 'center', marginTop: 40 }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18 }}>{error}</div>
        <div style={{ fontSize: 14, color: '#aaa', marginTop: 8 }}>
          문제가 지속되면 관리자에게 문의하세요.
        </div>
      </div>
    );
  }

  if (constellationHistory.length === 0) {
    return (
      <div style={{ color: '#FFD700', textAlign: 'center', marginTop: 40 }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>🌟</div>
        <div style={{ fontSize: 18 }}>아직 저장된 별자리 히스토리가 없습니다.</div>
        <div style={{ fontSize: 14, color: '#aaa', marginTop: 8 }}>
          새로운 나라를 방문하고 별자리를 만들어보세요!
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Swiper
        effect={'cards'}
        grabCursor={true}
        modules={[Navigation, EffectCards]}
        navigation
        className="constellation-history-swiper"
        style={{ padding: '50px 0' }}
      >
        {constellationHistory.map((constellation, index) => (
          <SwiperSlide key={index}>
            <div style={{
              background: 'rgba(20,20,40,0.95)',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,215,0,0.2)',
              height: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ flex: 1, marginBottom: 20, position: 'relative' }}>
                <Constellation2DMinimap pins={constellation.pins} />
              </div>
              <div style={{ color: '#FFD700', marginBottom: 12, fontSize: 18, fontWeight: 600 }}>
                {new Date(constellation.createdAt).toLocaleDateString()} 의 별자리
              </div>
              <div style={{ color: '#fff', fontSize: 14 }}>
                방문 국가: {constellation.pins.map(pin => pin.nameKo || pin.name).join(' → ')}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <style>{`
        .constellation-history-swiper .swiper-slide {
          background: transparent;
        }
        .constellation-history-swiper .swiper-button-next,
        .constellation-history-swiper .swiper-button-prev {
          color: #FFD700;
        }
        .constellation-history-swiper .swiper-button-disabled {
          opacity: 0.35;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ConstellationHistory; 