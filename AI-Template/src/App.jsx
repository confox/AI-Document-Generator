import { useState, useEffect, useRef, useCallback } from "react";
import { DOCS } from "@/docs.js";
import { STORAGE_KEY, SETTINGS_KEY, DEFAULT_SETTINGS, ACCENTS } from "@/constants.js";
import { buildDocPrompt, buildAllPrompt } from "@/utils/prompt.js";
import { useDebounce } from "@/hooks/useDebounce.js";
import { TweaksPanel } from "@/components/TweaksPanel.jsx";
import { TerminalDirection } from "@/layouts/TerminalDirection.jsx";
import { ComposeDirection } from "@/layouts/ComposeDirection.jsx";
import { ManuscriptDirection } from "@/layouts/ManuscriptDirection.jsx";

const validateAccent = (accent) =>
  ACCENTS.some((a) => a.value === accent) ? accent : DEFAULT_SETTINGS.accent;

export default function App() {
  const [activeDoc, setActiveDoc] = useState(0);
  const [allValues, setAllValues] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (!s) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(s);
      return { ...DEFAULT_SETTINGS, ...parsed, accent: validateAccent(parsed.accent) };
    } catch { return DEFAULT_SETTINGS; }
  });
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [copyState, setCopyState] = useState(null);
  const [exportState, setExportState] = useState(null);

  const debouncedValues = useDebounce(allValues, 500);
  const debouncedSettings = useDebounce(settings, 500);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedValues)); }, [debouncedValues]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(debouncedSettings)); }, [debouncedSettings]);

  const doc = DOCS[activeDoc];
  const docValues = allValues[doc.id] || {};

  const handleChange = (fieldId, value) => {
    setAllValues((prev) => ({ ...prev, [doc.id]: { ...prev[doc.id], [fieldId]: value } }));
  };

  const flash = (setter, val = "ok") => { setter(val); setTimeout(() => setter(null), 2000); };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(buildDocPrompt(doc, docValues))
      .then(() => flash(setCopyState))
      .catch(() => flash(setCopyState, "err"));
  }, [doc, docValues]);

  const handleExportAll = useCallback(() => {
    navigator.clipboard.writeText(buildAllPrompt(allValues))
      .then(() => flash(setExportState))
      .catch(() => flash(setExportState, "err"));
  }, [allValues]);

  const handleSelectDoc = (i) => { setActiveDoc(i); setCopyState(null); };

  const copyRef = useRef(null);
  copyRef.current = handleCopy;
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); copyRef.current(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const densityScale = settings.density === "compact" ? 0.88 : settings.density === "comfy" ? 1.12 : 1;
  const safeAccent = validateAccent(settings.accent);
  const rootStyle = {
    "--accent": safeAccent,
    "--accent-soft": `color-mix(in oklch, ${safeAccent} 22%, transparent)`,
    "--accent-glow": `color-mix(in oklch, ${safeAccent} 60%, transparent)`,
    "--d": densityScale,
  };

  const dirProps = {
    docs: DOCS, activeDoc, onSelectDoc: handleSelectDoc,
    docValues, allValues, onChange: handleChange,
    onCopy: handleCopy, onExportAll: handleExportAll,
    copyState, exportState, settings,
  };

  return (
    <div className={`app theme-${settings.theme}`} style={rootStyle}>
      {settings.direction === "terminal" && <TerminalDirection {...dirProps} />}
      {settings.direction === "compose" && <ComposeDirection {...dirProps} />}
      {settings.direction === "manuscript" && <ManuscriptDirection {...dirProps} />}

      <button
        onClick={() => setTweaksOpen((o) => !o)}
        aria-label="Toggle tweaks panel"
        style={{
          position: "fixed", bottom: 18, left: 18, zIndex: 998,
          width: 34, height: 34, borderRadius: "var(--r-md)",
          background: tweaksOpen ? "var(--accent)" : "var(--bg-2)",
          border: `1px solid ${tweaksOpen ? "var(--accent)" : "var(--line-2)"}`,
          color: tweaksOpen ? "var(--accent-ink)" : "var(--ink-2)",
          fontSize: 15,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          transition: "background 0.2s, color 0.2s, border-color 0.2s",
        }}
      >
        ⚙
      </button>

      {tweaksOpen && (
        <TweaksPanel settings={settings} onChange={setSettings} onClose={() => setTweaksOpen(false)} />
      )}
    </div>
  );
}
