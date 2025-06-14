import React from 'react';

const StatsModal = ({ visible, onClose, countryStats, summaryStats, loading, error }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(20,20,40,0.95)',
        padding: '30px',
        borderRadius: '20px',
        width: '80%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflowY: 'auto',
        color: 'white',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        <h2 style={{ color: '#FFD700', marginBottom: '20px' }}>통계</h2>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            통계 데이터를 불러오는 중...
          </div>
        )}

        {error && (
          <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        )}

        {!loading && !error && summaryStats && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#00eaff', marginBottom: '15px' }}>전체 통계</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '15px',
                borderRadius: '10px'
              }}>
                <div style={{ color: '#aaa', fontSize: '14px' }}>총 방문 국가</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summaryStats.totalCountries || 0}</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '15px',
                borderRadius: '10px'
              }}>
                <div style={{ color: '#aaa', fontSize: '14px' }}>총 일기 수</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summaryStats.totalDiaries || 0}</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '15px',
                borderRadius: '10px'
              }}>
                <div style={{ color: '#aaa', fontSize: '14px' }}>가장 많이 방문한 국가</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {summaryStats.mostVisitedCountry || '없음'}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && countryStats && countryStats.length > 0 && (
          <div>
            <h3 style={{ color: '#00eaff', marginBottom: '15px' }}>국가별 통계</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              {countryStats.map((stat, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ color: '#aaa', fontSize: '14px' }}>국가</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    {stat.countryName || stat.nameKo || '알 수 없음'}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '14px' }}>방문 횟수</div>
                  <div style={{ fontSize: '16px' }}>{stat.count || 0}회</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && (!countryStats || countryStats.length === 0) && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
            아직 방문한 국가가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsModal;