import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import CardOverlay from "../components/CardOverlay";
import StatsModal from "../components/StatsModal"; // 추가
import { useNavigate } from "react-router-dom";

const countryNameMap = {
  KOR: "대한민국", USA: "미국", FRA: "프랑스", JPN: "일본",
  CHN: "중국", GBR: "영국", DEU: "독일", ITA: "이탈리아",
  ESP: "스페인", RUS: "러시아", BRA: "브라질", AUS: "호주",
  IND: "인도", CAN: "캐나다", MEX: "멕시코",
};

const gData = [
  { lat: 37.5665, lng: 126.978, size: 20, color: "red", id: "KOR" },
  { lat: 35.6895, lng: 139.6917, size: 20, color: "white", id: "JPN" },
  { lat: 39.9042, lng: 116.4074, size: 20, color: "gold", id: "CHN" },
  { lat: 48.8566, lng: 2.3522, size: 20, color: "blue", id: "FRA" },
  { lat: 51.5072, lng: -0.1276, size: 20, color: "navy", id: "GBR" },
  { lat: 40.7128, lng: -74.006, size: 20, color: "green", id: "USA" },
  { lat: 55.7558, lng: 37.6173, size: 20, color: "crimson", id: "RUS" },
  { lat: -33.8688, lng: 151.2093, size: 20, color: "orange", id: "AUS" },
  { lat: 52.52, lng: 13.405, size: 20, color: "black", id: "DEU" },
  { lat: 41.9028, lng: 12.4964, size: 20, color: "tomato", id: "ITA" },
  { lat: 19.4326, lng: -99.1332, size: 20, color: "lime", id: "MEX" },
  { lat: -23.5505, lng: -46.6333, size: 20, color: "yellow", id: "BRA" },
];

const GlobeViewer = () => {
  const globeRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [countryStats, setCountryStats] = useState([]);
  const navigate = useNavigate();

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
        const label = countryNameMap[d.id] || d.id;
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
  }, []);

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
  );
};

export default GlobeViewer;
