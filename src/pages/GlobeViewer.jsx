import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import CardOverlay from "../components/CardOverlay";
import StatsModal from "../components/StatsModal";
import { useNavigate } from "react-router-dom";
import StarsCanvas from "../components/StarsCanvas";
import CountryManager from "../components/CountryManager";
import Constellation2DMinimap from "../components/Constellation2DMinimap";
import '../styles/TopBar.css'; 

const GlobeViewer = () => {
  const globeRef = useRef(null);
  const overlayCanvasRef = useRef(null); // 2D 오버레이 캔버스
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [countryStats, setCountryStats] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [countries, setCountries] = useState([]);
  const [showCountryManager, setShowCountryManager] = useState(false);
  const [constellationPins, setConstellationPins] = useState([]);
  const [showConstellation, setShowConstellation] = useState(false);
  const [constellationProgress, setConstellationProgress] = useState(0); // ⭐️ 진행 상태
  const [view2D, setView2D] = useState(false); // 2D 뷰 상태 추가
  const [constellationUpdateTrigger, setConstellationUpdateTrigger] = useState(0); // 별자리 업데이트 트리거 추가
  const navigate = useNavigate();
  const cameraRef = useRef(null);
  const rendererRef = useRef();
  const sceneRef = useRef(new THREE.Scene());
  const glowMaterialRef = useRef(null);

  // 카메라 초기화 함수
  const initCamera = () => {
    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 500;
    return camera;
  };

  // 나라 목록 API에서 받아오기
  useEffect(() => {
    fetch("http://localhost:8080/api/countries")
      .then(res => {
        if (!res.ok) throw new Error('API Error: ' + res.status);
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Not a JSON response');
        }
      })
      .then(data => {
        if (Array.isArray(data)) setCountries(data);
        else setCountries([]);
      })
      .catch((err) => {
        console.error('나라 목록 API 에러:', err);
        setCountries([]);
      });
  }, [showCountryManager]); // 나라 추가 후 새로고침

  // 통계 데이터를 가져오는 함수
  const fetchStats = async (userId) => {
    console.log(`[fetchStats] 통계 데이터 로드 시작 for userId: ${userId}`);
    try {
      setLoadingStats(true);
      setStatsError(null);

      // 전체 통계 가져오기
      console.log(`[fetchStats] summary API 호출 시도: http://localhost:8080/api/stats/summary/${userId}`);
      const summaryResponse = await fetch(`http://localhost:8080/api/stats/summary/${userId}`);
      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        throw new Error('통계 요약 데이터 로드 실패: ' + summaryResponse.status + ' ' + errorText);
      }
      const summaryData = await summaryResponse.json();
      console.log('[fetchStats] summary API 응답 성공:', summaryData);
      setSummaryStats(summaryData);

      // 국가별 통계 가져오기
      console.log(`[fetchStats] by-country API 호출 시도: http://localhost:8080/api/stats/by-country/${userId}`);
      const countryResponse = await fetch(`http://localhost:8080/api/stats/by-country/${userId}`);
      if (!countryResponse.ok) {
        const errorText = await countryResponse.text();
        throw new Error('국가별 통계 데이터 로드 실패: ' + countryResponse.status + ' ' + errorText);
      }
      const countryData = await countryResponse.json();
      console.log('[fetchStats] by-country API 응답 성공:', countryData);
      setCountryStats(Array.isArray(countryData) ? countryData : []);

    } catch (error) {
      console.error('[fetchStats] 통계 데이터 로드 중 오류:', error);
      setStatsError(error.message);
      setSummaryStats(null);
      setCountryStats([]);
    } finally {
      setLoadingStats(false);
      console.log('[fetchStats] 통계 데이터 로드 완료 (성공 또는 실패)');
    }
  };

  // 통계 데이터 로드
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log(`[useEffect] userId from localStorage: ${userId}`);
    if (!userId) {
      console.error('[useEffect] userId가 없습니다! 통계 로드 건너뛰기.');
      return;
    }
    console.log('[useEffect] fetchStats 함수 호출.');
    fetchStats(userId);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log('[Constellation Pins Fetch useEffect] Checking userId and fetching pins. Trigger:', constellationUpdateTrigger);
    if (!userId || userId.trim() === '') {
      console.error('[Constellation Pins Fetch useEffect] userId가 없습니다! 별자리 핀 로드 건너뛰기.');
      setConstellationPins([]);
      return;
    }

    const fetchConstellationPins = async () => {
      try {
        console.log(`[Constellation Pins Fetch useEffect] 별자리 핀 불러오기 시도: http://localhost:8080/api/constellation/saved/${userId}`);
        const res = await fetch(`http://localhost:8080/api/constellation/saved/${userId}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error('별자리 핀 로드 실패:', res.status, errorText);
          throw new Error('API Error: ' + res.status + ' ' + errorText);
        }
        const contentType = res.headers.get('content-type');
        let data = [];
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const textResponse = await res.text();
          console.warn('별자리 핀 응답이 JSON이 아닙니다:', textResponse);
        }
        console.log('별자리 핀 불러오기 응답:', data);
        setConstellationPins(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('별자리 API 에러:', err);
        setConstellationPins([]);
      }
    };

    fetchConstellationPins();
  }, [constellationUpdateTrigger]); // <--- 의존성 추가

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    console.log('별자리 핀:', constellationPins);
  }, [constellationPins]);

  useEffect(() => {
    const container = globeRef.current;
    if (!container) return;

    // 중복 방지: 기존 domElement 있으면 제거
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // 카메라 초기화
    const camera = initCamera();
    cameraRef.current = camera;

    // gData를 countries에서 변환
    const gData = Array.isArray(countries) ? countries.map(country => ({
      lat: country.lat,
      lng: country.lng,
      size: 20,
      color: country.color || "gold",
      id: country.code || country.nameKo,
      name: country.nameKo
    })) : [];

    // 디버깅용 로그
    console.log('constellationPins:', constellationPins);
    console.log('gData:', gData);

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

    // ⭐ 별자리(핀 연결) 3D 선만 (showConstellation이 true일 때만)
    if (showConstellation && constellationPins && constellationPins.length > 0) {
      const GLOBE_RADIUS = 120; // 지구본 반지름을 마커와 동일하게 조정
      const NUM_CURVE_POINTS = 100; // 곡선의 부드러움을 위한 포인트 수
      const LINE_ELEVATION = 0.5; // 선이 지구본 표면에서 얼마나 떠 있을지 (단위: 지구본 반지름의 %)
      
      // lat/lng -> 3D 좌표 변환 (지구본 표면에 맞춤)
      const latLngToVector3 = (lat, lng, radius = GLOBE_RADIUS) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      };

      // pinPoints: 핀(나라) 순서대로 3D 좌표
      const pinPoints = constellationPins
        .map(pin => {
          if (typeof pin.lat === 'number' && typeof pin.lng === 'number') {
            return latLngToVector3(pin.lat, pin.lng);
          }
          const match = gData.find(c =>
            c.id === pin.locationCode ||
            c.id === pin.nameKo ||
            c.name === pin.locationCode ||
            c.name === pin.nameKo
          );
          if (match) {
            return latLngToVector3(match.lat, match.lng);
          }
          console.warn('No lat/lng for pin:', pin);
          return null;
        })
        .filter(Boolean);

      if (pinPoints.length > 1) {
        // 지구본 표면을 따라가는 곡선 생성 함수
        const createSurfaceCurve = (start, end) => {
          const points = [];
          const startNormal = start.clone().normalize();
          const endNormal = end.clone().normalize();
          
          // 대원을 따라 부드러운 곡선 생성
          for (let i = 0; i <= NUM_CURVE_POINTS; i++) {
            const t = i / NUM_CURVE_POINTS;
            // 구면 선형 보간
            const dot = startNormal.dot(endNormal);
            const theta = Math.acos(Math.min(Math.max(dot, -1), 1));
            const sinTheta = Math.sin(theta);
            
            let point;
            if (Math.abs(sinTheta) < 0.001) {
              point = startNormal.clone().lerp(endNormal, t);
            } else {
              const a = Math.sin((1 - t) * theta) / sinTheta;
              const b = Math.sin(t * theta) / sinTheta;
              point = startNormal.clone().multiplyScalar(a).add(endNormal.clone().multiplyScalar(b));
            }
            
            // 곡선을 지구본 표면에서 살짝 띄우기
            const elevation = 1 + LINE_ELEVATION * Math.sin(Math.PI * t); // 중간에서 가장 높게
            points.push(point.multiplyScalar(GLOBE_RADIUS * elevation));
          }
          return points;
        };

        // 모든 연결점에 대한 곡선 포인트 생성
        let allCurvePoints = [];
        for (let i = 0; i < pinPoints.length - 1; i++) {
          const curvePoints = createSurfaceCurve(pinPoints[i], pinPoints[i + 1]);
          allCurvePoints.push(...curvePoints);
        }

        // 빛나는 선 효과를 위한 재질 생성
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xFFD700,
          transparent: true,
          opacity: 0.8,
          linewidth: 2
        });

        // 발광 효과를 위한 두 번째 선
        const glowLineMaterial = new THREE.LineBasicMaterial({
          color: 0xFFD700,
          transparent: true,
          opacity: 0.3,
          linewidth: 6
        });

        // 기본 라인 생성
        const lineGeometry = new THREE.BufferGeometry();
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);

        // 발광 라인 생성
        const glowLineGeometry = new THREE.BufferGeometry();
        const glowLine = new THREE.Line(glowLineGeometry, glowLineMaterial);
        scene.add(glowLine);

        // 파티클 시스템 생성
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
          color: 0xFFD700,
          size: 1.5,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.8
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // 애니메이션
        let progress = 0;
        const animateConstellation = () => {
          progress += 0.01;
          const currentProgress = Math.min(progress, 1);
          
          // 현재 진행도까지의 포인트 계산
          const currentPointCount = Math.floor(currentProgress * allCurvePoints.length);
          const currentPoints = allCurvePoints.slice(0, currentPointCount);
          
          // 라인 업데이트
          if (line.geometry) line.geometry.dispose();
          lineGeometry.setFromPoints(currentPoints);
          
          // 발광 라인 업데이트
          if (glowLine.geometry) glowLine.geometry.dispose();
          glowLineGeometry.setFromPoints(currentPoints);
          
          // 파티클 업데이트
          if (currentPointCount > 0) {
            const particlePositions = [];
            for (let i = 0; i < currentPointCount; i += 3) {
              particlePositions.push(allCurvePoints[i]);
            }
            if (particles.geometry) particles.geometry.dispose();
            particleGeometry.setFromPoints(particlePositions);
          }
          
          updateConstellationProgress(currentProgress);
          
          if (currentProgress < 1) {
            requestAnimationFrame(animateConstellation);
          }
        };
        
        animateConstellation();

        // cleanup 함수에 추가할 내용
        return () => {
          scene.remove(line);
          scene.remove(glowLine);
          scene.remove(particles);
          lineGeometry.dispose();
          glowLineGeometry.dispose();
          particleGeometry.dispose();
          lineMaterial.dispose();
          glowLineMaterial.dispose();
          particleMaterial.dispose();
        };
      }
    }

    const webglRenderer = new THREE.WebGLRenderer({ alpha: true });
    webglRenderer.setClearColor(0x000000, 0); // 투명
    rendererRef.current = webglRenderer;

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

    // ⭐ 별자리(핀 연결) 2D 오버레이 선 (showConstellation이 true일 때만)
    let pinPoints = [];
    const GLOBE_RADIUS_2D = 120; // 2D 렌더링에 사용될 반지름 (3D와 일관성 유지)
    if (showConstellation && constellationPins && constellationPins.length > 0) {
      // 2D 렌더링을 위한 lat/lng -> 3D 벡터 변환 함수 (여기서만 사용)
      const latLngToVector3For2D = (lat, lng, radius = GLOBE_RADIUS_2D) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      };

      // constellationPins에서 직접 lat/lng를 사용하여 pinPoints 생성
      pinPoints = constellationPins
        .map(pin => {
          if (typeof pin.lat === 'number' && typeof pin.lng === 'number') {
            return latLngToVector3For2D(pin.lat, pin.lng);
          }
          console.warn('2D 오버레이: 핀에 유효한 lat/lng가 없습니다:', pin);
          return null;
        })
        .filter(Boolean);
    }
    // 2D 오버레이 선 그리기 함수
    const drawOverlayLine = () => {
      if (!overlayCanvasRef.current || !cameraRef.current) return;
      const canvas = overlayCanvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showConstellation && pinPoints.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.beginPath();

        const maxIndex = Math.floor(constellationProgress * (pinPoints.length - 1)) + 1;
        pinPoints.slice(0, maxIndex).forEach((pt, i) => {
          const vector = pt.clone().project(cameraRef.current);
          const x = (vector.x + 1) / 2 * canvas.width;
          const y = (-vector.y + 1) / 2 * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        
        ctx.stroke();
        ctx.restore();
      }
    };
    let animationId;
    const animate = () => {
      controls.update();
      webglRenderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      drawOverlayLine(); // 매 프레임마다 2D 오버레이 선 갱신
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (cameraRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
      }
      if (webglRenderer) {
        webglRenderer.setSize(window.innerWidth, window.innerHeight);
      }
      if (labelRenderer) {
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      animationId && cancelAnimationFrame(animationId);
      // controls 해제
      controls && controls.dispose && controls.dispose();
      // 씬의 모든 오브젝트 해제
      scene && scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose && obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose && m.dispose());
          } else {
            obj.material.dispose && obj.material.dispose();
          }
        }
      });
      // renderer 해제
      if (webglRenderer) {
        webglRenderer.forceContextLoss && webglRenderer.forceContextLoss();
        webglRenderer.dispose && webglRenderer.dispose();
        if (webglRenderer.domElement && webglRenderer.domElement.parentNode) {
          webglRenderer.domElement.parentNode.removeChild(webglRenderer.domElement);
        }
      }
      if (labelRenderer && labelRenderer.domElement && labelRenderer.domElement.parentNode) {
        labelRenderer.domElement.parentNode.removeChild(labelRenderer.domElement);
      }
      // container 비우기 (혹시 남아있을 domElement 제거)
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [countries, constellationPins, showConstellation]);

  // ⭐ 별자리 저장(생성) API 호출 함수
  const saveConstellation = async () => {
    const userId = localStorage.getItem('userId');
    let countryCodes = [];
    if (constellationPins && constellationPins.length > 0) {
      countryCodes = constellationPins.map(pin => pin.locationCode || pin.code || pin.id || pin.nameKo || pin.name).filter(Boolean);
    } else if (countries && countries.length > 0) {
      countryCodes = countries.map(c => c.code || c.id || c.nameKo || c.name).filter(Boolean);
    }

    if (!userId || countryCodes.length === 0) {
      alert('별자리를 저장할 나라가 없습니다.');
      return false;
    }

    // 백엔드 요청 형식에 맞게 pinOrder와 name 필드 사용
    const requestBody = {
      userId: parseInt(userId),
      pinOrder: countryCodes,
      name: "나만의 별자리 " + new Date().toLocaleDateString()
    };

    try {
      const res = await fetch('http://localhost:8080/api/constellation/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('별자리 저장 실패 응답:', res.status, errorText);
        throw new Error('별자리 저장 실패: ' + errorText);
      }
      
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        console.log('별자리 저장 성공 응답 (JSON):', data);
      } else {
        console.log('별자리 저장 성공 응답 (텍스트):', await res.text());
      }
      
      // 성공적으로 저장/업데이트 후 트리거 값 증가
      setConstellationUpdateTrigger(prev => prev + 1);

      return true;
    } catch (err) {
      console.error('별자리 저장 중 오류 발생:', err);
      alert('별자리 저장 중 오류 발생: ' + err.message);
      return false;
    }
  };

  // 2D 별자리 캔버스 컴포넌트
  const Constellation2DView = ({ pins, onClose }) => {
    const canvasRef = useRef(null);
    const [mapImage] = useState(new Image());
    
    useEffect(() => {
      mapImage.src = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_ShadedRelief_Bathymetry&FORMAT=image/jpeg&TRANSPARENT=FALSE&HEIGHT=1024&WIDTH=2048&CRS=EPSG:4326&BBOX=-90,-180,90,180&STYLES=";
      mapImage.onload = drawMap;
    }, []);

    const drawMap = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !pins.length) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width = window.innerWidth * 0.8;
      const height = canvas.height = width * 0.5;

      // 지도 그리기
      ctx.drawImage(mapImage, 0, 0, width, height);

      // 좌표 변환 함수
      const toCanvasCoords = (lat, lng) => [
        (lng + 180) * (width / 360),
        (90 - lat) * (height / 180)
      ];

      // 별 그리기 함수
      const drawStar = (x, y, size = 15) => {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const longAngle = angle + Math.PI / 10;
          const shortAngle = angle - Math.PI / 10;
          
          if (i === 0) {
            ctx.moveTo(
              x + Math.cos(angle) * size,
              y + Math.sin(angle) * size
            );
          }
          
          // 별의 뾰족한 부분
          ctx.lineTo(
            x + Math.cos(longAngle) * (size * 0.4),
            y + Math.sin(longAngle) * (size * 0.4)
          );
          
          // 별의 다음 꼭지점
          ctx.lineTo(
            x + Math.cos(shortAngle) * (size * 0.4),
            y + Math.sin(shortAngle) * (size * 0.4)
          );
          
          ctx.lineTo(
            x + Math.cos(angle + 2 * Math.PI / 5) * size,
            y + Math.sin(angle + 2 * Math.PI / 5) * size
          );
        }
        ctx.closePath();
        return ctx;
      };

      // 빛나는 선 그리기
      const drawGlowingLine = (x1, y1, x2, y2) => {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 215, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.8)');

        // 외부 발광 효과
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.lineWidth = 8;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 메인 라인
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      };

      // 별자리 선 그리기
      const points = pins.map(pin => {
        const [x, y] = toCanvasCoords(pin.lat, pin.lng);
        return { x, y, name: pin.nameKo || pin.name };
      });

      // 선 먼저 그리기
      for (let i = 0; i < points.length - 1; i++) {
        drawGlowingLine(
          points[i].x, points[i].y,
          points[i + 1].x, points[i + 1].y
        );
      }

      // 별과 텍스트 그리기
      points.forEach(({ x, y, name }) => {
        // 별 그리기
        ctx.save();
        // 별 외부 발광
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FFD700';
        drawStar(x, y).fill();
        
        // 내부 별
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFF';
        drawStar(x, y, 8).fill();
        ctx.restore();

        // 국가명 표시
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(name, x, y - 20);
        ctx.restore();
      });
    }, [pins, mapImage]);

    useEffect(() => {
      drawMap();
      window.addEventListener('resize', drawMap);
      return () => window.removeEventListener('resize', drawMap);
    }, [drawMap]);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          position: 'relative',
          width: '80vw',
          background: '#111',
          borderRadius: 20,
          padding: 20,
          boxShadow: '0 0 30px rgba(255,215,0,0.3)'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: 24,
              cursor: 'pointer',
              zIndex: 1
            }}
          >
            ×
          </button>
          <h2 style={{
            color: '#FFD700',
            textAlign: 'center',
            marginBottom: 20,
            textShadow: '0 0 10px rgba(255,215,0,0.5)'
          }}>
            🌟 나만의 별자리
          </h2>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 10
            }}
          />
          <div style={{
            color: 'white',
            textAlign: 'center',
            marginTop: 15,
            fontSize: 14
          }}>
            방문 국가: {pins.map(p => p.nameKo || p.name).join(' → ')}
          </div>
        </div>
      </div>
    );
  };

  // handleShowConstellation 함수 수정
  const handleShowConstellation = async () => {
    const userId = localStorage.getItem("userId");
    console.log(`[handleShowConstellation] 사용자 ID: ${userId}`);
    if (!userId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 나라가 하나도 없으면 추가하라고 안내
    if (countries.length === 0) {
      alert("별자리를 만들려면 먼저 나라를 추가해주세요!");
      setShowCountryManager(true);
      return;
    }

    const currentShowConstellation = showConstellation;
    console.log(`[handleShowConstellation] 현재 showConstellation 상태: ${currentShowConstellation}`);
    
    if (!currentShowConstellation) {
      try {
        setConstellationProgress(0);
        // 별자리를 보여주기 전에 항상 최신 데이터를 불러옴
        // 이전에 constellationUpdateTrigger를 증가시켰으므로, useEffect가 이미 새 데이터를 가져왔을 것임.
        // 여기서는 그냥 showConstellation을 true로 설정하여 렌더링만 트리거합니다.
        console.log('[handleShowConstellation] 별자리 보기 활성화. 최신 핀 데이터 사용.');
        setShowConstellation(true);
        setView2D(true);

        // 만약 저장된 별자리가 없어서 새로 생성해야 하는 경우, saveConstellation을 호출
        // 이 로직은 saveConstellation 내에서 constellationUpdateTrigger를 증가시키므로
        // 위 useEffect를 통해 자동으로 핀 데이터가 다시 로드됩니다.
        // if (!constellationPins || constellationPins.length === 0) {
        //   console.log('[handleShowConstellation] 현재 핀 데이터가 없어 새 별자리 저장 시도.');
        //   await saveConstellation();
        // }

      } catch (error) {
        console.error('[handleShowConstellation] 별자리 데이터 처리 중 오류:', error);
        alert('별자리 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        setConstellationPins([]);
        setShowConstellation(false);
        setView2D(false);
      }
    } else {
      console.log('[handleShowConstellation] 별자리 숨기기. 상태 초기화.');
      setConstellationPins([]);
      setConstellationProgress(0);
      setShowConstellation(false);
      setView2D(false);
    }
  };

  // 별자리 애니메이션 진행도 업데이트 함수
  const updateConstellationProgress = (progress) => {
    setConstellationProgress(Math.min(Math.max(progress, 0), 1));
  };

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
      {/* 2D 오버레이 선 */}
      <canvas
        ref={overlayCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 2,
          background: 'transparent'
        }}
      />
      {/* 컨텐츠 오버레이 */}
      <div style={{ position: "relative", zIndex: 1, width: "100vw", height: "100vh" }}>
        {/* New Top Bar */}
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.6)",
          padding: "20px 40px", // 상하좌우 패딩 유지
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 30,
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          backdropFilter: "blur(5px)",
        }}>
          {/* Left: Constella Logo (이미지) */}
          <div
            style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', cursor: 'pointer' }}
            onClick={() => navigate("/globe")} // 로고 클릭 시 홈으로 이동 (선택 사항)
          >
            <img
              src="/images/constella_logo.png" // 여기에 실제 이미지 경로가 올바르게 입력되었는지 확인해주세요!
              alt="Constella Logo"
              style={{
                height: '90px',
                width: '90px', // 로고 이미지 높이를 더 크게 조정
                marginRight: '20px', // 이미지와 버튼 그룹 사이의 간격 조정
              }}
            />
          </div>

          {/* Right: All Buttons Group */}
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}> {/* 버튼 간격 유지 */}
            <button
              onClick={saveConstellation}
              className="top-bar-button"
              style={{
                background: "transparent",
                border: "none",
                padding: "12px 25px",
                color: "#FFD700",
                cursor: "pointer",
                borderRadius: 0,
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.3s ease",
                whiteSpace: 'nowrap',
              }}
            >
              별자리 저장
            </button>

            <button
              onClick={handleShowConstellation}
              className="top-bar-button"
              style={{
                background: showConstellation ? "rgba(255,215,0,0.2)" : "transparent",
                border: showConstellation ? "1px solid #FFD700" : "none",
                padding: "12px 25px",
                color: "white",
                cursor: "pointer",
                borderRadius: 0,
                fontSize: "15px",
                fontWeight: 700,
                transition: "all 0.3s ease",
                whiteSpace: 'nowrap',
              }}
            >
              별자리 {showConstellation ? "끄기" : "보기"}
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className="top-bar-button"
              style={{
                background: "transparent",
                border: "none",
                padding: "12px 25px",
                color: "white",
                cursor: "pointer",
                borderRadius: 0,
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.3s ease",
                whiteSpace: 'nowrap',
              }}
            >
              통계 보기
            </button>

            <button
              onClick={() => setShowCountryManager(true)}
              className="top-bar-button"
              style={{
                background: "transparent",
                border: "none",
                padding: "12px 25px",
                color: "white",
                cursor: "pointer",
                borderRadius: 0,
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.3s ease",
                whiteSpace: 'nowrap',
              }}
            >
              나라 추가
            </button>
            
            <button
              onClick={() => navigate("/mypage")}
              className="top-bar-button"
              style={{
                background: "transparent",
                border: "none",
                padding: "12px 25px",
                color: "white",
                cursor: "pointer",
                borderRadius: 0,
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.3s ease",
                whiteSpace: 'nowrap',
              }}
            >
              마이페이지
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('userId');
                navigate('/login');
              }}
              className="top-bar-button"
              style={{
                background: "transparent",
                border: "none",
                padding: "12px 25px",
                color: "white",
                cursor: "pointer",
                borderRadius: 0,
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.3s ease",
                whiteSpace: 'nowrap',
              }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Existing showCountryManager div (moved outside the new top bar) */}
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

        {/* Globe container - adjusted top position */}
        <div
          ref={globeRef}
          style={{
            width: "100%",
            height: "calc(100% - 70px)", // <-- 고정 상단바 높이만큼 제외
            position: "absolute",
            top: "70px",
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
          summaryStats={summaryStats}
          loading={loadingStats}
          error={statsError}
        />
        {/* 2D 별자리 미니맵 (showConstellation이 true일 때만) */}
        {showConstellation && (
          <>
            {/* 미니맵: 왼쪽 상단 고정 */}
            <div style={{
              position: "fixed",
              top: 90,
              left: 40,
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start"
            }}>
              <Constellation2DMinimap pins={constellationPins} style={{ marginBottom: 8, boxShadow: "0 2px 16px #000a" }} />
            </div>
            {/* 정보: 오른쪽 상단 고정 */}
            <div style={{
              position: "fixed",
              top: 140,
              right: 40,
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end"
            }}>
              <div style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#FFD700",
                marginBottom: 8,
                textShadow: "0 2px 8px #000a"
              }}>
                🌟 나만의 별자리
              </div>
              <div style={{
                fontSize: 16,
                color: "#FFD700",
                marginBottom: 4
              }}>
                방문 국가: {constellationPins.map(p => p.nameKo).join(", ")}
              </div>
              <div style={{ fontSize: 13, color: "#fff" }}>여행의 추억을 별자리로!</div>
            </div>
          </>
        )}
        {/* 2D 별자리 뷰 */}
        {view2D && showConstellation && (
          <Constellation2DView
            pins={constellationPins}
            onClose={() => {
              setShowConstellation(false);
              setView2D(false);
              setConstellationPins([]);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GlobeViewer;
