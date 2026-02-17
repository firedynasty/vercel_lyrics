import { useState, useRef, useEffect, useCallback } from "react";

const SAMPLE_DATA = [
  { en: "S-E-O-U-L, in an unfamiliar city where we first met", kr: "S-E-O-U-L, 처음 만난 낯선 도시에서", rom: "S-E-O-U-L, cheoeum mannan nachseon dosieseo" },
  { en: "Shining among people", kr: "사람들 사이에 빛이 나는", rom: "salamdeul saie bich-i naneun" },
  { en: "With a cool boy with a guitar, yeah", kr: "기타를 멘 멋진 소년과, yeah", rom: "gitaleul men meosjin sonyeongwa, yeah" },
  { en: "(Load your full lyrics JSON file using the button above)", kr: "(위 버튼으로 가사 JSON 파일을 불러오세요)", rom: "(Click 'Load Lyrics File' to get started)" },
];

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap";

export default function LyricsViewer() {
  const [lines, setLines] = useState(SAMPLE_DATA);
  const [showEn, setShowEn] = useState(true);
  const [showKr, setShowKr] = useState(true);
  const [showRom, setShowRom] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef(null);
  const animRef = useRef(null);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setLines(data);
          setFileName(file.name);
          setActiveLine(-1);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }
      } catch {
        alert("Invalid JSON. Expected an array of objects with 'en', 'kr', 'rom' keys.");
      }
    };
    reader.readAsText(file);
  }, []);

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".json")) handleFile(file);
  }, [handleFile]);

  useEffect(() => {
    if (scrollSpeed === 0) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      el.scrollTop += scrollSpeed * 30 * dt;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [scrollSpeed]);

  const toggleStyle = (active) => ({
    padding: "8px 18px",
    borderRadius: "999px",
    border: active ? "1.5px solid rgba(255,183,77,0.9)" : "1.5px solid rgba(255,255,255,0.15)",
    background: active ? "rgba(255,183,77,0.15)" : "rgba(255,255,255,0.04)",
    color: active ? "#FFB74D" : "rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    fontSize: 14,
    transition: "all 0.25s ease",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  });

  const visibleCount = [showEn, showKr, showRom].filter(Boolean).length;

  return (
    <>
      <link href={FONTS_URL} rel="stylesheet" />
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "linear-gradient(170deg, #0a0a1a 0%, #0f1628 35%, #1a1035 70%, #0d0d20 100%)",
          color: "#fff",
          fontFamily: "'Outfit', sans-serif",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        {/* Ambient glow effects */}
        <div style={{
          position: "fixed", top: -120, right: -120, width: 400, height: 400,
          background: "radial-gradient(circle, rgba(255,183,77,0.08) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "fixed", bottom: -80, left: -80, width: 350, height: 350,
          background: "radial-gradient(circle, rgba(130,100,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Drag overlay */}
        {isDragging && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(10,10,26,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "3px dashed rgba(255,183,77,0.5)",
            margin: 16, borderRadius: 20,
          }}>
            <div style={{ fontSize: 22, color: "#FFB74D", fontWeight: 500 }}>
              Drop your lyrics JSON file here
            </div>
          </div>
        )}

        {/* Header */}
        <header style={{
          padding: "20px 24px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, position: "relative", zIndex: 10,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #FFB74D, #FF8A65)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#0a0a1a",
              boxShadow: "0 4px 20px rgba(255,183,77,0.25)",
            }}>서</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "0.02em" }}>
                Seoul Lyrics
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 400, marginTop: 1 }}>
                {fileName ? `📄 ${fileName}` : "Load a lyrics file to begin"}
              </div>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              padding: "9px 20px", borderRadius: 10,
              background: "linear-gradient(135deg, rgba(255,183,77,0.2), rgba(255,138,101,0.15))",
              border: "1px solid rgba(255,183,77,0.3)",
              color: "#FFB74D", fontFamily: "'Outfit', sans-serif",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Load Lyrics File
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={onFileChange}
            style={{ display: "none" }} />
        </header>

        {/* Controls bar */}
        <div style={{
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14, position: "relative", zIndex: 10,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          {/* Language toggles */}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={toggleStyle(showEn)} onClick={() => setShowEn(p => !p)}>
              English
            </button>
            <button style={toggleStyle(showKr)} onClick={() => setShowKr(p => !p)}>
              한국어
            </button>
            <button style={toggleStyle(showRom)} onClick={() => setShowRom(p => !p)}>
              Romanized
            </button>
          </div>

          {/* Scroll speed */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
              Auto-scroll
            </span>
            <input
              type="range" min={0} max={5} step={0.5} value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
              style={{
                width: 100, accentColor: "#FFB74D", cursor: "pointer",
              }}
            />
            <span style={{
              fontSize: 12, color: scrollSpeed > 0 ? "#FFB74D" : "rgba(255,255,255,0.3)",
              fontFamily: "'Space Mono', monospace", fontWeight: 700, minWidth: 28,
            }}>
              {scrollSpeed > 0 ? `${scrollSpeed}x` : "Off"}
            </span>
          </div>
        </div>

        {/* Lyrics body */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: "auto", padding: "28px 24px 120px",
            position: "relative", zIndex: 10,
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {visibleCount === 0 && (
            <div style={{
              textAlign: "center", padding: 60,
              color: "rgba(255,255,255,0.25)", fontSize: 16, fontWeight: 400,
            }}>
              Turn on at least one language toggle above
            </div>
          )}
          {lines.map((line, i) => {
            const isActive = activeLine === i;
            return (
              <div
                key={i}
                onClick={() => setActiveLine(isActive ? -1 : i)}
                style={{
                  padding: "16px 20px",
                  marginBottom: 6,
                  borderRadius: 14,
                  cursor: "pointer",
                  background: isActive
                    ? "rgba(255,183,77,0.07)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(255,183,77,0.15)"
                    : "1px solid transparent",
                  transition: "all 0.3s ease",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {showEn && line.en && (
                  <div style={{
                    fontSize: isActive ? 20 : 17,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                    lineHeight: 1.5,
                    transition: "all 0.3s ease",
                    marginBottom: (showKr || showRom) ? 6 : 0,
                  }}>
                    {line.en}
                  </div>
                )}
                {showKr && line.kr && (
                  <div style={{
                    fontSize: isActive ? 19 : 16,
                    fontWeight: isActive ? 500 : 400,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    color: isActive ? "#FFB74D" : "rgba(255,183,77,0.6)",
                    lineHeight: 1.6,
                    transition: "all 0.3s ease",
                    marginBottom: showRom ? 4 : 0,
                  }}>
                    {line.kr}
                  </div>
                )}
                {showRom && line.rom && (
                  <div style={{
                    fontSize: isActive ? 14 : 13,
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 400,
                    color: isActive ? "rgba(180,160,255,0.8)" : "rgba(180,160,255,0.35)",
                    lineHeight: 1.5,
                    transition: "all 0.3s ease",
                    letterSpacing: "0.02em",
                  }}>
                    {line.rom}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Format hint footer */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "12px 24px",
          background: "linear-gradient(to top, rgba(10,10,26,0.95) 60%, transparent)",
          zIndex: 20, textAlign: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: 11, color: "rgba(255,255,255,0.2)",
            fontFamily: "'Space Mono', monospace",
          }}>
            JSON format: [ {"{"}"en": "...", "kr": "...", "rom": "..."{"}"}, ... ]
          </div>
        </div>
      </div>
    </>
  );
}

