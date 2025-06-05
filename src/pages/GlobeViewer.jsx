import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import CardOverlay from "../components/CardOverlay";
import StatsModal from "../components/StatsModal";
import { useNavigate } from "react-router-dom";
import StarsCanvas from "../components/StarsCanvas";
import CountryManager from "../components/CountryManager";

const GlobeViewer = () => {
  const globeRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [countryStats, setCountryStats] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showCountryManager, setShowCountryManager] = useState(false);
  const navigate = useNavigate();

  // 나라 목록 API에서 받아오기
  useEffect(() => {
    fetch("http://localhost:8080/api/countries")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCountries(data);
        else setCountries([]);
      })
      .catch(() => setCountries([]));
  }, [showCountryManager]); // 나라 추가 후 새로고침

  useEffect(() => {
    fetch("http://localhost:8080/api/diaries/stats")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCountryStats(data);
        else setCountryStats([]);
      })
      .catch(() => setCountryStats([]));
  }, []);

  useEffect(() => {
    const container = globeRef.current;
    if (!container) return;

    // gData를 countries에서 변환
    const gData = Array.isArray(countries) ? countries.map(country => ({
      lat: country.lat,
      lng: country.lng,
      size: 20,
      color: country.color || "gold",
      id: country.code || country.nameKo,
      name: country.nameKo
    })) : [];

    const markerSvg = (label, color, size = 30) => `
  <div style="display: flex; flex-direction: column; align-items: center;">
    <svg viewBox="-4 0 36 36" width="${size}" height="${size}" style="color: ${color};">
      <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
      <circle fill="black" cx="14" cy="14" r="7"></circle>
    </svg>
    <div style="margin-top: 4px; color: white; font-size: 12px; font-weight: bold; text-shadow: 0 0 3px rgba(0,0,0,0.8);">
      ${label}
    </div>
  </div>
`;

    const globe = new ThreeGlobe()
      .globeImageUrl(
        "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_ShadedRelief_Bathymetry&FORMAT=image/jpeg&TRANSPARENT=FALSE&HEIGHT=1024&WIDTH=2048&CRS=EPSG:4326&BBOX=-90,-180,90,180&STYLES="
      )
      .htmlElementsData(gData)
      .htmlElement((d) => {
        const el = document.createElement("div");
        const label = d.name || d.id;
        el.innerHTML = markerSvg(label, d.color, d.size);
        el.style.cursor = "pointer";
        el.style.pointerEvents = "auto";
        el.onclick = () => setSelectedCountry({ code: d.id, name: label });
        return el;
      })
      .htmlElementVisibilityModifier((el, isVisible) => {
        el.style.opacity = isVisible ? 1 : 0;
      });

    const scene = new THREE.Scene();
    scene.add(globe);
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 500;

    const webglRenderer = new THREE.WebGLRenderer({ alpha: true });
    webglRenderer.setClearColor(0x000000, 0);

    const labelRenderer = new CSS2DRenderer();
    webglRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    webglRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";

    container.appendChild(webglRenderer.domElement);
    container.appendChild(labelRenderer.domElement);

    const controls = new TrackballControls(camera, webglRenderer.domElement);
    controls.minDistance = 101;
    controls.rotateSpeed = 5;
    controls.zoomSpeed = 0.8;

    globe.setPointOfView(camera);
    controls.addEventListener("change", () => globe.setPointOfView(camera));

    const animate = () => {
      controls.update();
      webglRenderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      webglRenderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container) container.innerHTML = "";
    };
  }, [countries]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      {/* 우주 배경 */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }}>
        <StarsCanvas />
      </div>
      {/* 컨텐츠 오버레이 */}
      <div style={{ position: "relative", zIndex: 1, width: "100vw", height: "100vh" }}>
        <button
          onClick={() => setShowStats(!showStats)}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid white",
            padding: "8px 16px",
            color: "white",
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          📊 통계 보기
        </button>
        <button
          onClick={() => navigate("/mypage")}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid white",
            padding: "8px 16px",
            color: "white",
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          🧑‍🚀 마이페이지
        </button>
        <button
          onClick={() => setShowCountryManager(true)}
          style={{
            position: "absolute",
            top: 70,
            right: 20,
            zIndex: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid white",
            padding: "8px 16px",
            color: "white",
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          ➕ 나라 추가
        </button>
        {showCountryManager && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{ background: "#222", padding: 30, borderRadius: 16, minWidth: 320, color: "white", position: "relative" }}>
              <button onClick={() => setShowCountryManager(false)} style={{ position: "absolute", top: 10, right: 15, background: "transparent", color: "white", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
              <CountryManager />
            </div>
          </div>
        )}
        <div
          ref={globeRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "auto",
          }}
        />
        {selectedCountry && (
          <CardOverlay
            country={selectedCountry.code}
            countryName={selectedCountry.name}
            onClose={() => setSelectedCountry(null)}
          />
        )}
        <StatsModal
          visible={showStats}
          onClose={() => setShowStats(false)}
          countryStats={countryStats}
        />
      </div>
    </div>
  );
};

export default GlobeViewer;
