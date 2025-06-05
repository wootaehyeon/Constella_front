import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const StatsModal = ({ visible, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [countryStats, setCountryStats] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (!visible) return;

    // 요약 통계 요청 (StatsController에 맞게 엔드포인트 변경)
    fetch("http://localhost:8080/api/stats/summary")
      .then((res) => res.json())
      .then(setSummary)
      .catch(() => setSummary(null));

    // 나라별 통계 요청 (StatsController에 맞게 엔드포인트 변경)
    fetch("http://localhost:8080/api/stats/by-country")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCountryStats(data);
        } else {
          setCountryStats([]);
        }
      })
      .catch(() => setCountryStats([]));

    fetch("http://localhost:8080/api/countries")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCountries(data);
        else setCountries([]);
      })
      .catch(() => setCountries([]));
  }, []);

  if (!visible) return null;

  const chartData = {
    labels: countryStats.map((item) => item.countryName),
    datasets: [
      {
        label: "작성된 일기 수",
        data: countryStats.map((item) => item.count),
        backgroundColor: "rgba(255, 215, 0, 0.6)",
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...countryStats.map(item => item.count), 5),
        ticks: { stepSize: 1 }
      }
    }
  };

  const gData = Array.isArray(countries) ? countries.map(country => ({
    lat: country.lat,
    lng: country.lng,
    size: 20,
    color: country.color || "gold",
    id: country.code || country.name,
    name: country.name
  })) : [];

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        width: "80%", maxWidth: 700,
        background: "#111", borderRadius: 16,
        padding: 30, color: "white", position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 15, right: 20,
          background: "transparent", color: "white",
          border: "none", fontSize: 20, cursor: "pointer"
        }}>✕</button>

        <h2 style={{ marginBottom: 20 }}>📊 여행 일기 통계</h2>

        {summary && (
          <div style={{ marginBottom: 30 }}>
            <p>✏️ 총 작성한 일기 수: <b>{summary.totalDiaries}</b></p>
            <p>🌍 방문한 국가 수: <b>{summary.totalCountries}</b></p>
            <p>📍 가장 많이 간 나라: <b>{summary.mostVisitedCountry}</b></p>
          </div>
        )}

        <div style={{ background: "#222", padding: 20, borderRadius: 12 }}>
          {countryStats.length === 0 ? (
            <div style={{ color: "#aaa", textAlign: "center", padding: 40 }}>
              표시할 통계 데이터가 없습니다.
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>

        <ul>
          {Array.isArray(countries) && countries.map(country => (
            <li key={country.id || country.name}>{country.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StatsModal;