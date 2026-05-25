import { useState, useEffect, useRef } from "react";

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

const STORIES = [
  {
    title: "O Coelho e a Lua",
    emoji: "🐰",
    text: `Era uma vez um coelhinho chamado Pip, que toda noite subia ao topo da colina para conversar com a Lua.

"Lua, por que você brilha tão forte?" perguntou Pip certa noite.

A Lua sorriu e respondeu baixinho: "Brilho para que todas as crianças e animais possam dormir com segurança, sabendo que alguém está de olho neles."

Pip fechou os olhos, sentiu o vento suave e pensou: "Que bom é saber que estamos protegidos..." E dormiu tranquilo até o amanhecer. 🌙`,
  },
  {
    title: "A Nuvem Preguiçosa",
    emoji: "☁️",
    text: `No céu cheio de nuvens, havia uma chamada Fofa que adorava flutuar devagar, devagar...

Enquanto as outras nuvens corriam com o vento, Fofa preferia dançar suavemente sobre as casas adormecidas.

"Por que você vai tão devagar?" perguntavam as outras.

"Porque o melhor momento do dia," disse Fofa, "é quando tudo fica quietinho e as estrelas aparecem para nos abraçar."

Naquela noite, Fofa pousou gentilmente sobre a cidade e cobriu todos com uma camada quentinha de sonhos bons. 💤`,
  },
  {
    title: "O Peixinho das Estrelas",
    emoji: "🐟",
    text: `Num lago encantado vivia Bolinha, um peixinho prateado que nadava só de noite.

Ele coletava o reflexo das estrelas na água e os guardava em seu coração.

"Por que você guarda as estrelas?" perguntou uma rã curiosa.

"Para dar a quem tiver medo do escuro," respondeu Bolinha com ternura.

Naquela noite, ele nadou até a beira do lago e soprou uma estrelinha para cada criança que dormia, enchendo seus sonhos de luz dourada. ✨`,
  },
];

const BREATHING_STEPS = [
  { label: "Inspire...", duration: 4, color: "#a8d8ea", scale: 1.3 },
  { label: "Segure...", duration: 4, color: "#ffd3b6", scale: 1.3 },
  { label: "Expire...", duration: 6, color: "#b5ead7", scale: 1.0 },
];

const SOUNDS = [
  { label: "Chuva", emoji: "🌧️", freq: "chuva" },
  { label: "Ondas", emoji: "🌊", freq: "ondas" },
  { label: "Floresta", emoji: "🌿", freq: "floresta" },
  { label: "Silêncio", emoji: "🌙", freq: null },
];

function useAmbientSound(type) {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  const stop = () => {
    nodesRef.current.forEach((n) => {
      try { n.stop(); } catch (_) {}
    });
    nodesRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  };

  const play = (soundType) => {
    stop();
    if (!soundType) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    if (soundType === "chuva") {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.08;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1200;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = 0.4;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      nodesRef.current = [src];
    } else if (soundType === "ondas") {
      [0.08, 0.05, 0.03].forEach((amp, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 0.15 + i * 0.07;
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.1 + i * 0.03;
        lfoGain.gain.value = amp * ctx.sampleRate * 0.001;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        gain.gain.value = amp;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        lfo.start();
        nodesRef.current.push(osc, lfo);
      });
      // add noise layer
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.05;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;
      const g = ctx.createGain();
      g.gain.value = 0.3;
      src.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      src.start();
      nodesRef.current.push(src);
    } else if (soundType === "floresta") {
      [220, 330, 440, 165].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0.015 + i * 0.005;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        nodesRef.current.push(osc);
      });
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.03;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 600;
      const g = ctx.createGain();
      g.gain.value = 0.15;
      src.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      src.start();
      nodesRef.current.push(src);
    }
  };

  useEffect(() => () => stop(), []);
  return { play, stop };
}

export default function SonoInfantil() {
  const [tab, setTab] = useState("inicio");
  const [storyIdx, setStoryIdx] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [breathStep, setBreathStep] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [activeSound, setActiveSound] = useState(null);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const breathRef = useRef(null);
  const timerRef = useRef(null);
  const { play, stop } = useAmbientSound();

  // Breathing logic
  useEffect(() => {
    if (!breathing) {
      clearInterval(breathRef.current);
      setBreathStep(0);
      setBreathProgress(0);
      return;
    }
    let step = 0;
    let elapsed = 0;
    const tick = 100;
    breathRef.current = setInterval(() => {
      elapsed += tick / 1000;
      const dur = BREATHING_STEPS[step].duration;
      setBreathProgress(elapsed / dur);
      if (elapsed >= dur) {
        elapsed = 0;
        step = (step + 1) % BREATHING_STEPS.length;
        setBreathStep(step);
      }
    }, tick);
    return () => clearInterval(breathRef.current);
  }, [breathing]);

  // Timer logic
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      clearInterval(timerRef.current);
      if (timeLeft <= 0 && timerActive) setTimerActive(false);
      return;
    }
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const handleSound = (s) => {
    if (activeSound === s.freq) {
      stop();
      setActiveSound(null);
    } else {
      play(s.freq);
      setActiveSound(s.freq);
    }
  };

  const startTimer = (mins) => {
    setTimeLeft(mins * 60);
    setTimerActive(true);
    setTimer(mins);
  };

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const story = STORIES[storyIdx];
  const bStep = BREATHING_STEPS[breathStep];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d1b3e 0%, #1a2a5e 40%, #0d2240 70%, #0a1628 100%)",
      fontFamily: "'Georgia', serif",
      color: "#e8e0f0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {STARS.map((s) => (
          <div key={s.id} style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.7,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes twinkle { from { opacity: 0.2; transform: scale(0.8); } to { opacity: 1; transform: scale(1.2); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes moonGlow { 0%,100% { box-shadow: 0 0 40px 10px #ffd68044; } 50% { box-shadow: 0 0 80px 20px #ffd68066; } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        @keyframes breathScale { }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: inherit; transition: all 0.3s; }
        .tab-btn:hover { opacity: 0.85; }
        .sound-btn { transition: all 0.3s; cursor: pointer; }
        .sound-btn:hover { transform: scale(1.08); }
      `}</style>

      {/* Moon */}
      <div style={{
        position: "fixed", top: 28, right: 48, width: 90, height: 90,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #fff9e6, #ffd680 60%, #ffaa20)",
        animation: "moonGlow 4s ease-in-out infinite, float 6s ease-in-out infinite",
        boxShadow: "0 0 50px 12px #ffd68044",
        zIndex: 1,
      }} />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 520, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 28, animation: "fadeIn 0.8s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 6 }}>🌙</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: "normal", letterSpacing: 1, color: "#f0e6ff" }}>
            Hora de Dormir
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#9fb3d8", letterSpacing: 0.5 }}>
            um cantinho tranquilo para as crianças
          </p>
        </div>

        {/* Content */}
        <div style={{ animation: "fadeIn 0.6s ease" }}>

          {tab === "inicio" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { key: "historias", emoji: "📖", label: "Histórias", desc: "Contos para sonhar" },
                  { key: "respiracao", emoji: "🫧", label: "Respiração", desc: "Acalmar o corpinho" },
                  { key: "sons", emoji: "🎵", label: "Sons", desc: "Natureza e silêncio" },
                  { key: "timer", emoji: "⏳", label: "Timer", desc: "Apagar a luz" },
                ].map((item) => (
                  <button key={item.key} className="tab-btn" onClick={() => setTab(item.key)} style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 20,
                    padding: "22px 14px",
                    textAlign: "center",
                    color: "#e8e0f0",
                    backdropFilter: "blur(8px)",
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{item.emoji}</div>
                    <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#9fb3d8" }}>{item.desc}</div>
                  </button>
                ))}
              </div>
              <button className="tab-btn" onClick={() => setTab("sobre")} style={{
                width: "100%", marginTop: 14, padding: "14px",
                borderRadius: 20, textAlign: "center",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#9fb3d8", fontSize: 13,
                backdropFilter: "blur(8px)",
              }}>
                ℹ️ Sobre o App
              </button>
            </div>
          )}

          {tab === "historias" && (
            <div>
              <button className="tab-btn" onClick={() => setTab("inicio")} style={{ color: "#9fb3d8", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                ← Voltar
              </button>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", padding: 24, backdropFilter: "blur(8px)" }}>
                <div style={{ textAlign: "center", fontSize: 44, marginBottom: 8 }}>{story.emoji}</div>
                <h2 style={{ textAlign: "center", margin: "0 0 18px", fontSize: 20, fontWeight: "normal", color: "#f0e6ff" }}>{story.title}</h2>
                <p style={{ lineHeight: 1.85, fontSize: 15, color: "#cdd8ee", whiteSpace: "pre-line", margin: 0 }}>{story.text}</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
                  {STORIES.map((_, i) => (
                    <button key={i} className="tab-btn" onClick={() => setStoryIdx(i)} style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: i === storyIdx ? "#ffd680" : "rgba(255,255,255,0.2)",
                      border: "none", padding: 0,
                    }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="tab-btn" onClick={() => setStoryIdx((storyIdx - 1 + STORIES.length) % STORIES.length)} style={{
                    flex: 1, padding: "10px", borderRadius: 12,
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e8e0f0", fontSize: 14,
                  }}>← Anterior</button>
                  <button className="tab-btn" onClick={() => setStoryIdx((storyIdx + 1) % STORIES.length)} style={{
                    flex: 1, padding: "10px", borderRadius: 12,
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e8e0f0", fontSize: 14,
                  }}>Próxima →</button>
                </div>
              </div>
            </div>
          )}

          {tab === "respiracao" && (
            <div>
              <button className="tab-btn" onClick={() => { setTab("inicio"); setBreathing(false); }} style={{ color: "#9fb3d8", fontSize: 13, marginBottom: 16 }}>
                ← Voltar
              </button>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", padding: 28, backdropFilter: "blur(8px)", textAlign: "center" }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: "normal", color: "#f0e6ff" }}>Respiração Mágica</h2>
                <p style={{ margin: "0 0 28px", fontSize: 13, color: "#9fb3d8" }}>Inspire 4s · Segure 4s · Expire 6s</p>

                {/* Breathing circle */}
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
                  <div style={{
                    width: 160, height: 160, borderRadius: "50%",
                    background: `radial-gradient(circle, ${bStep.color}33 0%, ${bStep.color}11 70%)`,
                    border: `3px solid ${bStep.color}66`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: breathing ? `scale(${1 + (bStep.scale - 1) * breathProgress})` : "scale(1)",
                    transition: "transform 0.1s linear, background 0.8s ease, border-color 0.8s ease",
                    boxShadow: breathing ? `0 0 40px 8px ${bStep.color}33` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 15, color: bStep.color, transition: "color 0.5s" }}>{breathing ? bStep.label : "Pronto?"}</div>
                      {breathing && (
                        <div style={{ fontSize: 13, color: "#9fb3d8", marginTop: 4 }}>
                          {Math.ceil(bStep.duration - breathProgress * bStep.duration)}s
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button className="tab-btn" onClick={() => setBreathing(!breathing)} style={{
                  padding: "14px 48px", borderRadius: 40,
                  background: breathing ? "rgba(255,100,100,0.2)" : "rgba(168,216,234,0.2)",
                  border: `1px solid ${breathing ? "rgba(255,100,100,0.4)" : "rgba(168,216,234,0.4)"}`,
                  color: "#e8e0f0", fontSize: 16, cursor: "pointer",
                }}>
                  {breathing ? "⏹ Parar" : "▶ Começar"}
                </button>

                <p style={{ marginTop: 20, fontSize: 12, color: "#7a90b8", lineHeight: 1.6 }}>
                  Respire devagar junto com o círculo.<br />Isso ajuda o corpinho a relaxar e dormir. 💫
                </p>
              </div>
            </div>
          )}

          {tab === "sons" && (
            <div>
              <button className="tab-btn" onClick={() => { setTab("inicio"); stop(); setActiveSound(null); }} style={{ color: "#9fb3d8", fontSize: 13, marginBottom: 16 }}>
                ← Voltar
              </button>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", padding: 24, backdropFilter: "blur(8px)" }}>
                <h2 style={{ textAlign: "center", margin: "0 0 6px", fontSize: 20, fontWeight: "normal", color: "#f0e6ff" }}>Sons da Natureza</h2>
                <p style={{ textAlign: "center", margin: "0 0 24px", fontSize: 13, color: "#9fb3d8" }}>Toque para ativar o som ambiente</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {SOUNDS.map((s) => (
                    <button key={s.label} className="sound-btn tab-btn" onClick={() => handleSound(s)} style={{
                      padding: "20px 10px",
                      borderRadius: 16,
                      background: activeSound === s.freq ? "rgba(255,214,128,0.2)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${activeSound === s.freq ? "rgba(255,214,128,0.5)" : "rgba(255,255,255,0.1)"}`,
                      color: activeSound === s.freq ? "#ffd680" : "#e8e0f0",
                      textAlign: "center",
                      boxShadow: activeSound === s.freq ? "0 0 20px rgba(255,214,128,0.15)" : "none",
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>{s.emoji}</div>
                      <div style={{ fontSize: 14 }}>{s.label}</div>
                      {activeSound === s.freq && <div style={{ fontSize: 10, marginTop: 4, color: "#ffd680" }}>● tocando</div>}
                    </button>
                  ))}
                </div>
                <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#7a90b8" }}>
                  Os sons são gerados pelo navegador e tocam em loop suave 🎶
                </p>
              </div>
            </div>
          )}

          {tab === "timer" && (
            <div>
              <button className="tab-btn" onClick={() => { setTab("inicio"); setTimerActive(false); setTimeLeft(0); }} style={{ color: "#9fb3d8", fontSize: 13, marginBottom: 16 }}>
                ← Voltar
              </button>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", padding: 28, backdropFilter: "blur(8px)", textAlign: "center" }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: "normal", color: "#f0e6ff" }}>Timer do Sono</h2>
                <p style={{ margin: "0 0 24px", fontSize: 13, color: "#9fb3d8" }}>Quanto tempo até apagar a luz?</p>

                {timerActive && timeLeft > 0 ? (
                  <div>
                    <div style={{
                      fontSize: 56, fontWeight: "normal", letterSpacing: 4,
                      color: "#ffd680", marginBottom: 8,
                      animation: "float 3s ease-in-out infinite",
                    }}>{fmtTime(timeLeft)}</div>
                    <p style={{ fontSize: 13, color: "#9fb3d8", marginBottom: 24 }}>restam para apagar a luz 🕯️</p>
                    <button className="tab-btn" onClick={() => { setTimerActive(false); setTimeLeft(0); }} style={{
                      padding: "12px 36px", borderRadius: 40,
                      background: "rgba(255,100,100,0.2)", border: "1px solid rgba(255,100,100,0.4)",
                      color: "#e8e0f0", fontSize: 14,
                    }}>Cancelar</button>
                  </div>
                ) : timeLeft === 0 && !timerActive && timer ? (
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🌙</div>
                    <p style={{ fontSize: 16, color: "#f0e6ff" }}>Hora de dormir! Boa noite! 😴</p>
                    <button className="tab-btn" onClick={() => setTimer(null)} style={{
                      marginTop: 16, padding: "12px 36px", borderRadius: 40,
                      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                      color: "#e8e0f0", fontSize: 14,
                    }}>Novo timer</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[5, 10, 15, 20, 30, 45].map((m) => (
                      <button key={m} className="tab-btn sound-btn" onClick={() => startTimer(m)} style={{
                        padding: "18px 8px", borderRadius: 16,
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "#e8e0f0", fontSize: 15,
                      }}>
                        <div style={{ fontSize: 13, color: "#9fb3d8" }}>min</div>
                        <div style={{ fontSize: 22, fontWeight: "bold", color: "#ffd680" }}>{m}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

          {tab === "sobre" && (
            <div>
              <button className="tab-btn" onClick={() => setTab("inicio")} style={{ color: "#9fb3d8", fontSize: 13, marginBottom: 16 }}>
                ← Voltar
              </button>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", padding: 28, backdropFilter: "blur(8px)" }}>
                <div style={{ textAlign: "center", fontSize: 48, marginBottom: 12 }}>🌙</div>
                <h2 style={{ textAlign: "center", margin: "0 0 6px", fontSize: 22, fontWeight: "normal", color: "#f0e6ff" }}>Hora de Dormir</h2>
                <p style={{ textAlign: "center", margin: "0 0 24px", fontSize: 12, color: "#9fb3d8", letterSpacing: 1 }}>um cantinho tranquilo para as crianças</p>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, marginBottom: 20 }}>
                  <p style={{ margin: "0 0 14px", fontSize: 14, color: "#cdd8ee", lineHeight: 1.8 }}>
                    O <strong style={{ color: "#f0e6ff" }}>Hora de Dormir</strong> é um app pensado com carinho para ajudar crianças a relaxar e adormecer com mais tranquilidade no fim do dia.
                  </p>
                  <p style={{ margin: "0 0 14px", fontSize: 14, color: "#cdd8ee", lineHeight: 1.8 }}>
                    Sabemos que a hora de dormir pode ser difícil — para os pequenos e para os pais. Por isso reunimos neste app ferramentas simples e gentis que criam um ritual noturno acolhedor.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {[
                    { emoji: "📖", title: "Histórias", desc: "Contos curtos e tranquilos narrados em linguagem simples, feitos para acalmar a imaginação antes de dormir." },
                    { emoji: "🫧", title: "Respiração Mágica", desc: "Exercício de respiração guiada 4-4-6, cientificamente comprovado para ativar o sistema de relaxamento do corpo." },
                    { emoji: "🎵", title: "Sons da Natureza", desc: "Chuva, ondas do mar e floresta em loop suave, criando um ambiente sonoro tranquilizante." },
                    { emoji: "⏳", title: "Timer do Sono", desc: "Defina quanto tempo falta para apagar a luz — ajuda a criar uma rotina previsível para a criança." },
                  ].map((f) => (
                    <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ fontSize: 24, flexShrink: 0 }}>{f.emoji}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: "#f0e6ff", marginBottom: 4 }}>{f.title}</div>
                        <div style={{ fontSize: 12, color: "#9fb3d8", lineHeight: 1.6 }}>{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#7a90b8", lineHeight: 1.7 }}>
                    Feito com 💙 para famílias que querem transformar a hora de dormir em um momento especial de conexão e paz.
                  </p>
                  <p style={{ margin: "10px 0 0", fontSize: 11, color: "#4a5e80" }}>versão 1.0 · gratuito e sem anúncios</p>
                </div>
              </div>
            </div>
          )}

        {/* Footer */}
        {tab === "inicio" && (
          <p style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "#4a5e80" }}>
            ✨ Boa noite e bons sonhos ✨
          </p>
        )}
      </div>
    </div>
  );
}
