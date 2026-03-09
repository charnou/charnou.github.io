const KEYS = {
  roadmap: "aqa-roadmap",
  alternatives: "aqa-alternatives",
  softskills: "aqa-softskills",
  advice: "aqa-advice",
  glossary: "aqa-glossary",
  months: "aqa-months",
  notes: "aqa-notes",
};

const OLD_KEY = "aqa-v5";

function readKey(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeKey(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function splitChecks(ck) {
  const roadmap = {};
  const alternatives = {};
  const softskills = {};
  const advice = {};
  for (const [id, val] of Object.entries(ck)) {
    if (id.startsWith("alt-")) alternatives[id] = val;
    else if (id.startsWith("ss-")) softskills[id] = val;
    else if (id.startsWith("adv-")) advice[id] = val;
    else roadmap[id] = val;
  }
  return { roadmap, alternatives, softskills, advice };
}

export async function load() {
  // Migrate from old single-key format
  const old = readKey(OLD_KEY);
  if (old) {
    save(old);
    localStorage.removeItem(OLD_KEY);
    return old;
  }

  const roadmap = readKey(KEYS.roadmap);
  const alternatives = readKey(KEYS.alternatives);
  const softskills = readKey(KEYS.softskills);
  const advice = readKey(KEYS.advice);
  const glossary = readKey(KEYS.glossary);
  const months = readKey(KEYS.months);

  const notes = readKey(KEYS.notes);

  const hasAny = roadmap || alternatives || softskills || advice || glossary || months || notes;
  if (!hasAny) return null;

  const ck = {
    ...(roadmap || {}),
    ...(alternatives || {}),
    ...(softskills || {}),
    ...(advice || {}),
  };

  const result = {};
  if (Object.keys(ck).length) result.ck = ck;
  if (glossary) result.gk = glossary;
  if (months) result.em = months;
  if (notes) result.notes = notes;

  return Object.keys(result).length ? result : null;
}

export async function save({ ck, em, gk, notes }) {
  const { roadmap, alternatives, softskills, advice } = splitChecks(ck || {});
  writeKey(KEYS.roadmap, roadmap);
  writeKey(KEYS.alternatives, alternatives);
  writeKey(KEYS.softskills, softskills);
  writeKey(KEYS.advice, advice);
  writeKey(KEYS.glossary, gk || {});
  writeKey(KEYS.months, em || {});
  writeKey(KEYS.notes, notes || {});
}
