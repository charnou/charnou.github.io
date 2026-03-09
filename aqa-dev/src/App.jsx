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

  // lava lamp color variants for each base hex color
  const lavaGrad = (hex) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    const lighter = `rgb(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+40)})`;
    const warmer = `rgb(${Math.min(255,r+30)},${Math.max(0,g-20)},${Math.max(0,b-30)})`;
    const deeper = `rgb(${Math.max(0,r-25)},${Math.max(0,g-15)},${Math.max(0,b-10)})`;
    return `linear-gradient(90deg,${hex},${lighter},${warmer},${deeper},${lighter},${hex})`;
  };
  const lavaSub = (hex) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    const l = `rgb(${Math.min(255,r+15)},${Math.min(255,g+15)},${Math.min(255,b+15)})`;
    const w = `rgb(${Math.min(255,r+10)},${Math.max(0,g-8)},${Math.max(0,b-10)})`;
    return `linear-gradient(90deg,${hex},${l},${w},${hex})`;
  };

  const synColors = { kw: "#569CD6", str: "#CE9178", num: "#B5CEA8", bi: "#569CD6", obj: "#4EC9B0", op: "#D4D4D4", fn: "#DCDCAA", plain: "#E6EDF3" };
  const synRe = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`|\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|import|export|from|async|await|try|catch|throw|typeof|instanceof|of|in|default)\b|\b(?:true|false|null|undefined|NaN|this)\b|\b(?:console|document|window|Math|Promise|Array|Object|String|Number|Error|JSON|Date|RegExp|Map|Set)\b|\b\d+(?:\.\d+)?\b|=>|===|!==|\.{3}|&&|\|\||\?\?)/g;
  const kwSet = new Set(["const","let","var","function","return","if","else","for","while","do","switch","case","break","continue","new","class","import","export","from","async","await","try","catch","throw","typeof","instanceof","of","in","default"]);
  const biSet = new Set(["true","false","null","undefined","NaN","this"]);
  const objSet = new Set(["console","document","window","Math","Promise","Array","Object","String","Number","Error","JSON","Date","RegExp","Map","Set"]);
  const synHL = (code, key) => {
    const spans = []; let last = 0; let m;
    synRe.lastIndex = 0;
    while ((m = synRe.exec(code)) !== null) {
      if (m.index > last) spans.push(<span key={`${key}p${last}`} style={{ color: synColors.plain }}>{code.slice(last, m.index)}</span>);
      const t = m[0]; let c = synColors.plain;
      if (/^['"`]/.test(t)) c = synColors.str;
      else if (kwSet.has(t)) c = synColors.kw;
      else if (biSet.has(t)) c = synColors.bi;
      else if (objSet.has(t)) c = synColors.obj;
      else if (/^\d/.test(t)) c = synColors.num;
      else if (/^(=>|===|!==|\.{3}|&&|\|\||\?\?)$/.test(t)) c = synColors.op;
      spans.push(<span key={`${key}t${m.index}`} style={{ color: c }}>{t}</span>);
      last = synRe.lastIndex;
    }
    if (last < code.length) spans.push(<span key={`${key}e`} style={{ color: synColors.plain }}>{code.slice(last)}</span>);
    return spans.length ? spans : code;
  };
  const abbrRe = /(?<![a-zA-Z])([A-Z][A-Z0-9]{1,}(?:\/[A-Z0-9]+)*)(?![a-zA-Z])/g;
  const hlAbbr = (text, key) => {
    const res = []; let last = 0; let m;
    abbrRe.lastIndex = 0;
    while ((m = abbrRe.exec(text)) !== null) {
      if (m.index > last) res.push(text.slice(last, m.index));
      res.push(<span key={`${key}${m.index}`} style={{ color: "#B1BAC4" }}>{m[0]}</span>);
      last = abbrRe.lastIndex;
    }
    if (last === 0) return text;
    if (last < text.length) res.push(text.slice(last));
    return res;
  };
  const fmtText = (text, key) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.flatMap((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <span key={`${key}b${i}`} style={{ color: "#E6EDF3", fontWeight: 500, borderBottom: "1px dotted #484F58" }}>{p.slice(2, -2)}</span>;
      }
      return hlAbbr(p, `${key}a${i}`);
    });
  };
  const fmtCode = (code) => {
    if (code.length < 35 || !code.includes('{')) return code;
    // don't expand single-statement blocks (e.g. function foo() { return x; })
    const inner = code.slice(code.indexOf('{') + 1, code.lastIndexOf('}'));
    if ((inner.match(/;/g) || []).length < 2) return code;
    let r = '', ind = 0;
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (ch === '{') {
        ind++;
        const sp = r.length > 0 && !r.endsWith(' ') && !r.endsWith('\n') ? ' ' : '';
        r += sp + '{\n' + '  '.repeat(ind);
        while (i + 1 < code.length && code[i + 1] === ' ') i++;
      } else if (ch === '}') {
        ind = Math.max(0, ind - 1);
        r = r.replace(/\s+$/, '');
        r += '\n' + '  '.repeat(ind) + '}';
      } else if (ch === ';' && ind > 0 && i + 1 < code.length && code[i + 1] !== '}' && code[i + 1] !== '\n') {
        r += ';\n' + '  '.repeat(ind);
        while (i + 1 < code.length && code[i + 1] === ' ') i++;
      } else if (ch === ' ' && (r.endsWith('\n') || r.endsWith('  '))) {
        // skip leading/trailing spaces (we add our own indentation)
      } else {
        r += ch;
      }
    }
    return r;
  };
  const formatDesc = (text) => {
    if (!text) return text;
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith("`") && p.endsWith("`")) {
        const raw = p.slice(1, -1);
        const fmt = fmtCode(raw);
        const isBlock = fmt !== raw;
        return (
          <code
            key={i}
            style={{
              fontFamily: mn,
              background: "#1C2128",
              padding: isBlock ? "6px 10px" : "1px 5px",
              borderRadius: isBlock ? 5 : 3,
              fontSize: 11,
              display: isBlock ? "block" : "inline",
              whiteSpace: isBlock ? "pre" : "normal",
              margin: isBlock ? "4px 0" : undefined,
              overflowX: isBlock ? "auto" : undefined,
              lineHeight: isBlock ? "18px" : undefined,
            }}
          >
            {synHL(fmt, `c${i}`)}
          </code>
        );
      }
      return <span key={i}>{fmtText(p, `t${i}`)}</span>;
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
          transition: "background .4s ease",
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
              className={d ? "lava-glow" : undefined}
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
                "--gc": c + "60",
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
              color: d ? "#6E7681" : "#C9D1D9",
              textDecoration: d ? "line-through" : "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {t.text}
            {notes[t.id] && (
              <svg
                width={10}
                height={10}
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0, opacity: 0.6 }}
              >
                <path
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z"
                  stroke={c}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
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
                    color: "#9CA3AF",
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
      <div style={{ fontSize: 13, lineHeight: "20px" }}>
        <span className="lava-s" style={{ backgroundImage: lavaSub(m.c) }}>{m.text}</span>
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}html{scrollbar-gutter:stable}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#161B22}::-webkit-scrollbar-thumb{background:#30363D;border-radius:3px}@keyframes checkPop{0%{transform:scale(1)}40%{transform:scale(1.3)}100%{transform:scale(1)}}.check-pop{animation:checkPop .25s ease}@keyframes lavaFlow{0%{background-position:0% 50%}20%{background-position:80% 50%}40%{background-position:160% 50%}60%{background-position:260% 50%}80%{background-position:340% 50%}100%{background-position:400% 50%}}.lava{background-size:400% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:lavaFlow 18s ease-in-out infinite alternate}.lava-s{background-size:400% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:lavaFlow 25s ease-in-out infinite alternate}@keyframes lavaGlow{0%,100%{filter:brightness(1);box-shadow:0 0 3px var(--gc,transparent)}35%{filter:brightness(1.15);box-shadow:0 0 8px var(--gc,transparent)}65%{filter:brightness(0.92);box-shadow:0 0 4px var(--gc,transparent)}}.lava-glow{animation:checkPop .25s ease,lavaGlow 12s ease-in-out infinite}@keyframes glowPulse{0%,100%{box-shadow:0 0 2px var(--gc,transparent)}50%{box-shadow:0 0 6px var(--gc,transparent)}}.glow-btn{animation:glowPulse 6s ease-in-out infinite}@keyframes lavaPulse{0%,100%{filter:brightness(1) drop-shadow(0 0 1px var(--gc,transparent))}40%{filter:brightness(1.15) drop-shadow(0 0 3px var(--gc,transparent))}70%{filter:brightness(0.9) drop-shadow(0 0 1px var(--gc,transparent))}}`}</style>

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
                    animation: pct < 100 ? "lavaFlow 18s ease-in-out infinite alternate" : "none",
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
                        fontFamily: mn,
                        flexShrink: 0,
                      }}
                    >
                      <span className="lava" style={{ backgroundImage: lavaGrad(mo.color) }}>{mo.month}</span>
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
                      <svg width={38} height={38} viewBox="0 0 38 38" style={{ "--gc": mo.color + "40", animation: st.p > 0 && st.p < 100 ? "lavaPulse 12s ease-in-out infinite" : "none" }}>
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
                                  className="lava"
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    fontFamily: mn,
                                    backgroundImage: lavaGrad(mo.color),
                                    padding: "2px 6px",
                                    borderRadius: 3,
                                    position: "relative",
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
                layout: { type: "spring", stiffness: 14, damping: 11, mass: 4 },
                opacity: { duration: 0.25, ease: "easeOut" },
                scale: { duration: 0.2, ease: "easeOut" },
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
                  className="lava-s"
                  style={{
                    fontWeight: 600,
                    fontSize: 12,
                    fontFamily: mn,
                    backgroundImage: isLearned ? lavaSub("#3CC78C") : lavaSub("#58A6FF"),
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
                className={isLearned ? "lava-glow" : undefined}
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
                  "--gc": "#3CC78C60",
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
                data-platform
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
                data-platform
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
                data-platform
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
              <div className="lava-s" style={{
                fontSize: 10,
                fontWeight: 600,
                backgroundImage: lavaSub(sec.color),
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                {sec.title}
              </div>
              <div data-platform style={{
                background: "#161B22",
                borderRadius: 10,
                border: "1px solid #21262D",
                padding: "8px 14px",
              }}>
                {sec.items.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #21262D",
                    }}
                  >
                    <div style={{
                      fontSize: 13,
                      color: "#C9D1D9",
                      lineHeight: "19px",
                      whiteSpace: "pre-line",
                      paddingLeft: 10,
                      borderLeft: `2px solid ${sec.color}60`,
                      marginBottom: 6,
                    }}>
                      {notes[t.id]}
                    </div>
                    <div
                      onClick={() => goToTask(t.id)}
                      style={{
                        fontSize: 11,
                        color: "#8B949E",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                        paddingLeft: 10,
                      }}
                    >
                      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.6 }}>
                        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z" stroke="#8B949E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ borderBottom: "1px dotted #484F58" }}>{t.text}</span>
                      <svg width={8} height={8} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                        <path d="M4.5 2L8.5 6L4.5 10" stroke="#484F58" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
