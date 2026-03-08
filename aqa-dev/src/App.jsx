import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import confetti from "canvas-confetti";
import { motivations } from "./data/motivations";
import { plan } from "./data/plan";
import { alternatives } from "./data/alternatives";
import { softSkills } from "./data/softSkills";
import { advice } from "./data/advice";
import { glossary } from "./data/glossary";
import { resources } from "./data/resources";
import { Chevron } from "./components/Chevron";
import { SearchButton } from "./components/SearchButton";
import { load, save } from "./utils/storage";

const TABS = [
  { id: "road", i: "\u{1F5FA}\uFE0F", l: "\u0420\u043E\u0430\u0434\u043C\u0430\u043F" },
  { id: "alt", i: "\u{1F500}", l: "\u0410\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u044B" },
  { id: "soft", i: "\u{1F91D}", l: "Soft Skills" },
  { id: "tips", i: "\u{1F4A1}", l: "\u0421\u043E\u0432\u0435\u0442\u044B" },
  { id: "dict", i: "\u{1F4D6}", l: "\u0421\u043B\u043E\u0432\u0430\u0440\u044C" },
  { id: "res", i: "\u{1F4DA}", l: "\u0420\u0435\u0441\u0443\u0440\u0441\u044B" },
  { id: "notes", i: "\u{1F4DD}", l: "\u041A\u043E\u043D\u0441\u043F\u0435\u043A\u0442" },
];

export default function App() {
  const [ck, sC] = useState({});
  const [ex, sE] = useState({});
  const [em, sM] = useState({ 1: true, 2: true, 3: true, 4: true });
  const [gk, sGK] = useState({});
  const [notes, sN] = useState({});
  const getTabFromHash = () => {
    const hash = window.location.hash.slice(1);
    return TABS.some((t) => t.id === hash) ? hash : "road";
  };
  const [tab, sT] = useState(getTabFromHash);
  const [gf, sG] = useState("");
  const [ok, sO] = useState(false);
  const sv2 = useRef(null);

  const setTab = useCallback((id) => {
    sT(id);
    window.location.hash = id;
  }, []);

  useEffect(() => {
    const onHash = () => sT(getTabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    load().then((s) => {
      if (s?.ck) sC(s.ck);
      if (s?.em) sM(s.em);
      if (s?.gk) sGK(s.gk);
      if (s?.notes) sN(s.notes);
      sO(true);
    });
  }, []);

  useEffect(() => {
    if (!ok) return;
    clearTimeout(sv2.current);
    sv2.current = setTimeout(() => save({ ck, em, gk, notes }), 400);
  }, [ck, em, gk, notes, ok]);

  const scrolledRef = useRef(false);
  useEffect(() => {
    if (!ok || scrolledRef.current || tab !== "road") return;
    scrolledRef.current = true;
    for (const mo of plan) {
      for (const w of mo.weeks) {
        for (const t of w.tasks) {
          if (!ck[t.id]) {
            sM((p) => ({ ...p, [mo.month]: true }));
            setTimeout(() => {
              const el = document.querySelector(`[data-task-id="${t.id}"]`);
              if (!el) return;
              let cancelled = false;
              const cancel = () => { cancelled = true; };
              window.addEventListener("wheel", cancel, { once: true, passive: true });
              window.addEventListener("touchstart", cancel, { once: true, passive: true });
              window.addEventListener("pointerdown", cancel, { once: true, passive: true });
              const rect = el.getBoundingClientRect();
              const targetY = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;
              const startY = window.scrollY;
              const dist = targetY - startY;
              const duration = Math.min(800, Math.abs(dist) * 0.6);
              let start = null;
              const step = (ts) => {
                if (cancelled) return cleanup();
                if (!start) start = ts;
                const p = Math.min((ts - start) / duration, 1);
                const ease = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
                window.scrollTo(0, startY + dist * ease);
                if (p < 1) requestAnimationFrame(step);
                else cleanup();
              };
              const cleanup = () => {
                window.removeEventListener("wheel", cancel);
                window.removeEventListener("touchstart", cancel);
                window.removeEventListener("pointerdown", cancel);
              };
              requestAnimationFrame(step);
            }, 300);
            return;
          }
        }
      }
    }
  }, [ok]);

  const tg = useCallback(
    (id, e) => {
      if (!ck[id] && e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 25,
          spread: 50,
          startVelocity: 18,
          gravity: 0.4,
          scalar: 0.7,
          ticks: 300,
          decay: 0.94,
          origin: { x, y },
          colors: ["#3CC78C", "#58A6FF", "#F778BA", "#F0883E", "#D2A8FF"],
        });
      }
      sC((p) => ({ ...p, [id]: !p[id] }));
    },
    [ck]
  );
  const te = useCallback(
    (id) => sE((p) => ({ ...p, [id]: !p[id] })),
    []
  );
  const tm = useCallback(
    (m) => sM((p) => ({ ...p, [m]: !p[m] })),
    []
  );
  const tgk = useCallback(
    (term, e) => {
      if (!gk[term] && e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 30,
          spread: 55,
          startVelocity: 18,
          gravity: 0.4,
          scalar: 0.7,
          ticks: 300,
          decay: 0.94,
          origin: { x, y },
          colors: ["#3CC78C", "#58A6FF", "#F778BA", "#F0883E", "#D2A8FF"],
        });
      }
      sGK((p) => ({ ...p, [term]: !p[term] }));
    },
    [gk]
  );

  const all = [
    ...plan.flatMap((m) => m.weeks.flatMap((w) => w.tasks)),
    ...alternatives,
    ...softSkills,
    ...advice,
  ];
  const tot = all.length;
  const dn = all.filter((t) => ck[t.id]).length;
  const pct = tot ? Math.round((dn / tot) * 100) : 0;

  const ms = (m) => {
    const t = m.weeks.flatMap((w) => w.tasks);
    const d = t.filter((x) => ck[x.id]).length;
    return {
      d,
      n: t.length,
      p: t.length ? Math.round((d / t.length) * 100) : 0,
      h: t.reduce((a, x) => a + parseFloat(x.time), 0),
    };
  };

  const mn = "'JetBrains Mono',monospace";

  const formatDesc = (text) => {
    if (!text) return text;
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith("`") && p.endsWith("`")) {
        return (
          <code
            key={i}
            style={{
              fontFamily: mn,
              background: "#1C2128",
              padding: "1px 5px",
              borderRadius: 3,
              color: "#E6EDF3",
              fontSize: 11,
            }}
          >
            {p.slice(1, -1)}
          </code>
        );
      }
      return p;
    });
  };

  const scrollTargetRef = useRef(null);

  const goToTask = useCallback((taskId) => {
    let targetTab = "road";
    if (taskId.startsWith("alt-")) targetTab = "alt";
    else if (taskId.startsWith("ss-")) targetTab = "soft";
    else if (taskId.startsWith("adv-")) targetTab = "tips";

    if (targetTab === "road") {
      const mo = plan.find((m) =>
        m.weeks.some((w) => w.tasks.some((t) => t.id === taskId))
      );
      if (mo) sM((p) => ({ ...p, [mo.month]: true }));
    }

    scrollTargetRef.current = taskId;
    setTab(targetTab);
    sE((p) => ({ ...p, [taskId]: true }));
  }, [setTab]);

  const rT = (t, c) => {
    const d = ck[t.id];
    const o = ex[t.id];
    return (
      <div
        key={t.id}
        data-task-id={t.id}
        ref={scrollTargetRef.current === t.id ? (el) => {
          if (el) {
            scrollTargetRef.current = null;
            requestAnimationFrame(() =>
              el.scrollIntoView({ behavior: "smooth", block: "center" })
            );
          }
        } : undefined}
        style={{
          borderRadius: 7,
          background: d ? c + "06" : "transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "6px 7px",
            cursor: "pointer",
          }}
          onClick={() => te(t.id)}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              tg(t.id, e);
            }}
            style={{
              padding: 4,
              margin: -4,
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            <div
              className={d ? "check-pop" : undefined}
              style={{
                width: 17,
                height: 17,
                borderRadius: 5,
                marginTop: 2,
                border: d ? "none" : "2px solid #30363D",
                background: d ? c : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background .2s, border .2s",
              }}
            >
              {d && (
                <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6.5L5 9L9.5 3.5"
                    stroke="#fff"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <span
            style={{
              flex: 1,
              fontSize: 13,
              lineHeight: "19px",
              color: d ? "#484F58" : "#C9D1D9",
              textDecoration: d ? "line-through" : "none",
            }}
          >
            {t.text}
          </span>
          {notes[t.id] && (
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z"
                stroke="#484F58"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span
            style={{
              fontSize: 10,
              fontFamily: mn,
              color: "#484F58",
              background: "#21262D",
              padding: "2px 5px",
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            {t.time}
          </span>
          <div
            style={{
              transform: o ? "rotate(180deg)" : "none",
              transition: "transform .15s",
              flexShrink: 0,
            }}
          >
            <Chevron s={12} />
          </div>
        </div>
        <AnimatePresence initial={false}>
          {o && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "2px 7px 10px 32px" }}>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: "17px",
                    color: "#8B949E",
                    margin: "0 0 8px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {formatDesc(t.desc)}
                </p>
                <div style={{ fontSize: 10, color: "#484F58", marginBottom: 4 }}>
                  Готовые гугл запросы, просто нажми:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {t.s.map((q, i) => (
                    <SearchButton key={i} q={q} />
                  ))}
                </div>
                <textarea
                  value={notes[t.id] || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    sN((p) => {
                      if (!v) {
                        const { [t.id]: _, ...rest } = p;
                        return rest;
                      }
                      return { ...p, [t.id]: v };
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Заметки..."
                  style={{
                    width: "100%",
                    minHeight: 60,
                    marginTop: 10,
                    background: "#0D1117",
                    border: "1px solid #21262D",
                    borderRadius: 6,
                    padding: "8px 10px",
                    color: "#E6EDF3",
                    fontSize: 12,
                    fontFamily: "inherit",
                    lineHeight: "17px",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const rM = (m) => (
    <div
      key={m.id}
      data-platform
      style={{
        background: m.c + "10",
        border: `1px solid ${m.c}30`,
        borderRadius: 8,
        padding: "10px 14px",
        margin: "8px 0",
      }}
    >
      <div style={{ fontSize: 13, lineHeight: "20px", color: m.c }}>
        {m.text}
      </div>
    </div>
  );

  if (!ok)
    return (
      <div
        style={{
          background: "#0D1117",
          color: "#8B949E",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Загрузка...
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans','Segoe UI',system-ui,sans-serif",
        background: "#0D1117",
        color: "#E6EDF3",
        minHeight: "100vh",
        paddingBottom: 20,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}html{scrollbar-gutter:stable}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#161B22}::-webkit-scrollbar-thumb{background:#30363D;border-radius:3px}@keyframes checkPop{0%{transform:scale(1)}40%{transform:scale(1.3)}100%{transform:scale(1)}}.check-pop{animation:checkPop .25s ease}`}</style>

      {/* Header */}
      <div
        data-platform
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#0D1117ee",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #21262D",
          padding: "8px 0 0",
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <div>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                AQA Roadmap
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#484F58",
                  fontFamily: mn,
                  marginLeft: 6,
                }}
              >
                v5 · {dn}/{tot}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 80,
                  height: 6,
                  background: "#21262D",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    background:
                      pct === 100
                        ? "#3CC78C"
                        : "linear-gradient(90deg,#E86F3C,#3C8CE8,#8C3CE8,#3CC78C)",
                    backgroundSize: "400%",
                    width: `${pct}%`,
                    transition: "width .5s",
                  }}
                />
              </div>
              <span
                style={{ fontSize: 10, fontFamily: mn, color: "#8B949E" }}
              >
                {pct}%
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              paddingBottom: 8,
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "#21262D" : "transparent",
                  border: "none",
                  borderRadius: "6px 6px 0 0",
                  padding: "6px 8px",
                  cursor: "pointer",
                  color: tab === t.id ? "#E6EDF3" : "#8B949E",
                  fontSize: 11,
                  fontWeight: tab === t.id ? 600 : 400,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  borderBottom:
                    tab === t.id
                      ? "2px solid #58A6FF"
                      : "2px solid transparent",
                }}
              >
                <span style={{ fontSize: 12 }}>{t.i}</span>
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "14px 10px 0" }}>
       <AnimatePresence mode="wait">
       <motion.div
         key={tab}
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.15, ease: "easeInOut" }}
       >
        {/* Roadmap Tab */}
        {tab === "road" && (
          <>
            {rM(motivations[0])}
            {plan.map((mo, mi) => {
              const st = ms(mo);
              const isE = em[mo.month];
              return (
                <div key={mo.month} style={{ marginBottom: 10 }}>
                  <button
                    data-platform
                    onClick={() => tm(mo.month)}
                    style={{
                      width: "100%",
                      background: "#161B22",
                      border: "1px solid #21262D",
                      borderRadius: isE ? "10px 10px 0 0" : 10,
                      padding: "12px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: mo.color + "18",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: mo.color,
                        fontFamily: mn,
                        flexShrink: 0,
                      }}
                    >
                      {mo.month}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#E6EDF3",
                        }}
                      >
                        {mo.title}
                      </div>
                      <div style={{ fontSize: 10, color: "#484F58" }}>
                        {st.d}/{st.n} · ~{st.h}ч
                      </div>
                    </div>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <svg width={38} height={38} viewBox="0 0 38 38">
                        <circle
                          cx={19}
                          cy={19}
                          r={15}
                          fill="none"
                          stroke="#21262D"
                          strokeWidth={2.5}
                        />
                        <circle
                          cx={19}
                          cy={19}
                          r={15}
                          fill="none"
                          stroke={mo.color}
                          strokeWidth={2.5}
                          strokeDasharray={`${st.p * 0.942} 94.2`}
                          strokeLinecap="round"
                          transform="rotate(-90 19 19)"
                          style={{ transition: "stroke-dasharray .5s" }}
                        />
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 600,
                          fontFamily: mn,
                          color: st.p === 100 ? mo.color : "#8B949E",
                        }}
                      >
                        {st.p}%
                      </div>
                    </div>
                    <div
                      style={{
                        transform: isE ? "rotate(180deg)" : "none",
                        transition: "transform .2s",
                      }}
                    >
                      <Chevron />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isE && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          style={{
                            background: "#161B22",
                            border: "1px solid #21262D",
                            borderTop: "none",
                            borderRadius: "0 0 10px 10px",
                            padding: "4px 14px 12px",
                          }}
                        >
                          {mo.weeks.map((w, wi) => (
                            <div key={wi} style={{ marginTop: wi > 0 ? 14 : 4 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  marginBottom: 6,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    fontFamily: mn,
                                    color: mo.color,
                                    background: mo.color + "15",
                                    padding: "2px 6px",
                                    borderRadius: 3,
                                  }}
                                >
                                  {w.week}
                                </span>
                                <span style={{ fontSize: 11, color: "#8B949E" }}>
                                  {w.sub}
                                </span>
                              </div>
                              {w.tasks.map((t) => rT(t, mo.color))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {mi === 0 && rM(motivations[1])}
                  {mi === 1 && rM(motivations[2])}
                  {mi === 2 && rM(motivations[3])}
                </div>
              );
            })}
            {rM(motivations[4])}
          </>
        )}

        {/* Alternatives Tab */}
        {tab === "alt" && (
          <>
            <p style={{ fontSize: 13, color: "#8B949E", marginBottom: 10 }}>
              Обзорное знакомство — для кругозора и собеседований. Глубоко НЕ
              нужно.
            </p>
            {rM({
              id: "ma",
              text: "🧭 Твой основной стек — Playwright + JS/TS. Остальное — для общего развития!",
              c: "#F0883E",
            })}
            <div
              data-platform
              style={{
                background: "#161B22",
                borderRadius: 10,
                border: "1px solid #21262D",
                padding: "4px 14px 8px",
              }}
            >
              {alternatives.map((t) => rT(t, "#F0883E"))}
            </div>
          </>
        )}

        {/* Soft Skills Tab */}
        {tab === "soft" && (
          <>
            <p style={{ fontSize: 13, color: "#8B949E", marginBottom: 10 }}>
              Технические навыки — 50% успеха. Вторые 50% — коммуникация и
              мышление.
            </p>
            {rM({
              id: "ms",
              text: "🌈 Soft skills развиваются с практикой. Осознанность — уже половина дела!",
              c: "#D2A8FF",
            })}
            <div
              data-platform
              style={{
                background: "#161B22",
                borderRadius: 10,
                border: "1px solid #21262D",
                padding: "4px 14px 8px",
              }}
            >
              {softSkills.map((t) => rT(t, "#D2A8FF"))}
            </div>
          </>
        )}

        {/* Tips Tab */}
        {tab === "tips" && (
          <>
            <p style={{ fontSize: 13, color: "#8B949E", marginBottom: 10 }}>
              Практические советы от тех кто прошёл этот путь.
            </p>
            {rM({
              id: "t1",
              text: "💖 Ты уже на правильном пути! Сам факт что ты учишься — говорит о целеустремлённости!",
              c: "#F778BA",
            })}
            <div
              data-platform
              style={{
                background: "#161B22",
                borderRadius: 10,
                border: "1px solid #21262D",
                padding: "4px 14px 8px",
              }}
            >
              {advice.slice(0, 5).map((t) => rT(t, "#F778BA"))}
            </div>
            {rM({
              id: "t2",
              text: "🌟 В начале НОРМАЛЬНО чувствовать себя потерянной. Через 2–3 месяца всё встанет на свои места. Обещаю!",
              c: "#F0883E",
            })}
            <div
              data-platform
              style={{
                background: "#161B22",
                borderRadius: 10,
                border: "1px solid #21262D",
                padding: "4px 14px 8px",
              }}
            >
              {advice.slice(5).map((t) => rT(t, "#F778BA"))}
            </div>
            {rM({
              id: "t3",
              text: "🚀 Каждый отказ — БЕСПЛАТНАЯ тренировка. Следующее собеседование будет ЛУЧШЕ!",
              c: "#3CC78C",
            })}
          </>
        )}

        {/* Dictionary Tab */}
        {tab === "dict" && (() => {
          const filtered = gf
            ? glossary.filter(
                (g) =>
                  g.t.toLowerCase().includes(gf.toLowerCase()) ||
                  g.d.toLowerCase().includes(gf.toLowerCase())
              )
            : glossary;
          const newTerms = filtered.filter((g) => !gk[g.t]);
          const learned = filtered.filter((g) => gk[g.t]);
          const gItem = (g, isLearned) => (
            <motion.div
              key={g.t}
              layoutId={g.t}
              layout="position"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{
                layout: { type: "spring", stiffness: 30, damping: 12, mass: 2 },
                opacity: { duration: 0.6, ease: "easeInOut" },
                scale: { duration: 0.5, ease: "easeInOut" },
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                borderBottom: "1px solid #21262D",
                position: "relative",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: isLearned ? "#3CC78C" : "#58A6FF",
                    fontSize: 12,
                    fontFamily: mn,
                  }}
                >
                  {g.t}
                </span>
                <span style={{ color: "#484F58" }}> — </span>
                <span
                  style={{
                    color: isLearned ? "#484F58" : "#8B949E",
                    fontSize: 12,
                  }}
                >
                  {g.d}
                </span>
              </div>
              <div
                onClick={(e) => tgk(g.t, e)}
                className={isLearned ? "check-pop" : undefined}
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  flexShrink: 0,
                  border: isLearned ? "none" : "2px solid #30363D",
                  background: isLearned ? "#3CC78C" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background .2s, border .2s",
                }}
              >
                {isLearned && (
                  <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.5L5 9L9.5 3.5"
                      stroke="#fff"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </motion.div>
          );
          return (
            <LayoutGroup>
              <input
                value={gf}
                onChange={(e) => sG(e.target.value)}
                placeholder={`Поиск среди ${glossary.length} терминов...`}
                style={{
                  width: "100%",
                  background: "#161B22",
                  border: "1px solid #21262D",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#E6EDF3",
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                  marginBottom: 10,
                }}
              />

              {/* New terms */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#58A6FF",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Новые
                </span>
                <motion.span
                  key={newTerms.length}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  style={{
                    fontSize: 10,
                    fontFamily: mn,
                    color: "#484F58",
                    display: "inline-block",
                  }}
                >
                  {newTerms.length}
                </motion.span>
              </div>
              <div
                style={{
                  background: "#161B22",
                  borderRadius: 10,
                  border: "1px solid #21262D",
                  padding: "8px 14px",
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                <AnimatePresence mode="popLayout">
                  {newTerms.length > 0 ? (
                    newTerms.map((g) => gItem(g, false))
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        textAlign: "center",
                        padding: "16px 0",
                        fontSize: 12,
                        color: "#484F58",
                      }}
                    >
                      Все термины выучены!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Learned terms */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#3CC78C",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Выученные
                </span>
                <motion.span
                  key={learned.length}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  style={{
                    fontSize: 10,
                    fontFamily: mn,
                    color: "#484F58",
                    display: "inline-block",
                  }}
                >
                  {learned.length}
                </motion.span>
              </div>
              <div
                style={{
                  background: "#161B22",
                  borderRadius: 10,
                  border: "1px solid #21262D",
                  padding: "8px 14px",
                  minHeight: 50,
                  overflow: "hidden",
                }}
              >
                <AnimatePresence mode="popLayout">
                  {learned.length > 0 ? (
                    learned.map((g) => gItem(g, true))
                  ) : (
                    <motion.div
                      key="empty-learned"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        textAlign: "center",
                        padding: "16px 0",
                        fontSize: 12,
                        color: "#484F58",
                      }}
                    >
                      Отмечай выученные слова
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          );
        })()}

        {/* Resources Tab */}
        {tab === "res" && (
          <>
            {resources.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "#161B22",
                  borderRadius: 10,
                  border: "1px solid #21262D",
                  padding: "12px 14px",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#8B949E",
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {r.c}
                </div>
                {r.i.map((x, j) => (
                  <div
                    key={j}
                    style={{
                      fontSize: 12,
                      color: "#C9D1D9",
                      padding: "3px 0 3px 10px",
                      borderLeft: "2px solid #21262D",
                      lineHeight: "18px",
                    }}
                  >
                    {x}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Notes Tab */}
        {tab === "notes" && (() => {
          const hasNotes = Object.keys(notes).length > 0;
          if (!hasNotes) return (
            <div style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#484F58",
              fontSize: 13,
            }}>
              Пока нет заметок. Откройте любой элемент и напишите заметку в поле снизу.
            </div>
          );

          const sections = [];

          // Roadmap notes
          plan.forEach((mo) => {
            const items = [];
            mo.weeks.forEach((w) => {
              w.tasks.forEach((t) => {
                if (notes[t.id]) items.push(t);
              });
            });
            if (items.length) {
              sections.push({
                title: `Месяц ${mo.month}: ${mo.title}`,
                color: mo.color,
                items,
              });
            }
          });

          // Alternatives notes
          const altItems = alternatives.filter((t) => notes[t.id]);
          if (altItems.length) {
            sections.push({ title: "Альтернативы", color: "#F0883E", items: altItems });
          }

          // Soft skills notes
          const ssItems = softSkills.filter((t) => notes[t.id]);
          if (ssItems.length) {
            sections.push({ title: "Soft Skills", color: "#D2A8FF", items: ssItems });
          }

          // Advice notes
          const advItems = advice.filter((t) => notes[t.id]);
          if (advItems.length) {
            sections.push({ title: "Советы", color: "#F778BA", items: advItems });
          }

          return sections.map((sec, si) => (
            <div key={si} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                color: sec.color,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                {sec.title}
              </div>
              <div style={{
                background: "#161B22",
                borderRadius: 10,
                border: "1px solid #21262D",
                padding: "8px 14px",
              }}>
                {sec.items.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => goToTask(t.id)}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #21262D",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#C9D1D9",
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <span>{t.text}</span>
                      <svg width={10} height={10} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
                        <path d="M4.5 2L8.5 6L4.5 10" stroke="#8B949E" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "#8B949E",
                      lineHeight: "17px",
                      whiteSpace: "pre-line",
                      paddingLeft: 10,
                      borderLeft: `2px solid ${sec.color}40`,
                    }}>
                      {notes[t.id]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}

       </motion.div>
       </AnimatePresence>
        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid #161B22",
          }}
        >
          <div style={{ fontSize: 10, color: "#30363D", fontFamily: mn }}>
            прогресс сохраняется автоматически
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#21262D",
              fontFamily: mn,
              marginTop: 8,
              letterSpacing: 0.5,
            }}
          >
            made by Stanislau Charnou
          </div>
        </div>
      </div>
    </div>
  );
}
