import React, { useEffect, useState } from "react";

const CountryManager = () => {
  const [countries, setCountries] = useState([]);
  const [newCountry, setNewCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 나라 목록 조회
  const fetchCountries = () => {
    fetch("http://localhost:8080/api/countries")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCountries(data);
        else setCountries([]);
      })
      .catch(() => setCountries([]));
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // 나라 추가 (이름만 보냄)
  const handleAddCountry = async (e) => {
    e.preventDefault();
    setError("");
    if (!newCountry.trim()) {
      setError("나라 이름을 입력하세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameKo: newCountry.trim() })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "추가 실패");
      }
      setNewCountry("");
      fetchCountries();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: "#222", padding: 24, borderRadius: 16, minWidth: 320,
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)", color: "white"
    }}>
      <form onSubmit={handleAddCountry} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={newCountry}
          onChange={e => setNewCountry(e.target.value)}
          placeholder="나라 이름 입력 (예: 대한민국)"
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #444",
            background: "#181818", color: "white", fontSize: 16
          }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            background: "linear-gradient(90deg, #FFD700, #FFB300)",
            color: "#222", border: "none", borderRadius: 8, padding: "10px 18px",
            fontWeight: "bold", fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #0002"
          }}
          disabled={loading}
        >
          {loading ? "추가중..." : "추가"}
        </button>
      </form>
      {error && <div style={{ color: "#FF5555", marginBottom: 8 }}>{error}</div>}
      <div style={{ maxHeight: 180, overflowY: "auto", marginTop: 8 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {Array.isArray(countries) && countries.map(country => (
            <li key={country.id || country.name} style={{
              padding: "8px 0", borderBottom: "1px solid #333", fontSize: 15
            }}>
              <span style={{ color: "#FFD700", fontWeight: 500 }}>{country.name}</span>
              {country.lat && country.lng && (
                <span style={{ color: "#aaa", fontSize: 13, marginLeft: 8 }}>
                  ({country.lat.toFixed(2)}, {country.lng.toFixed(2)})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CountryManager; 