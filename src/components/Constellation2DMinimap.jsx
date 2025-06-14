import React, { useRef, useEffect } from "react";

function Constellation2DMinimap({ pins, style }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!pins || pins.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = 220;
    const h = canvas.height = 220;
    // lat/lng를 2D로 변환 (간단히 정규화)
    const toXY = ({ lat, lng }) => [
      ((lng + 180) / 360) * w,
      ((90 - lat) / 180) * h
    ];
    ctx.clearRect(0, 0, w, h);
    // 선 그리기
    ctx.beginPath();
    pins.forEach((pin, i) => {
      const [x, y] = toXY(pin);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 별(핀) 그리기
    pins.forEach(pin => {
      const [x, y] = toXY(pin);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.stroke();
    });
  }, [pins]);
  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', top: 30, left: 30, background: 'rgba(0,0,0,0.7)', borderRadius: 16, zIndex: 20, boxShadow: '0 2px 12px #0008', ...style }} width={220} height={220} />
  );
}

export default Constellation2DMinimap; 