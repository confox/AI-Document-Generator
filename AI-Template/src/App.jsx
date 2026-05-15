import { useState, useEffect, useRef, useCallback } from "react";
import { DOCS } from "./docs.js";

// ─── Constants ────────────────────────────────────────────────
const STORAGE_KEY = "ai-docs-values";
const SETTINGS_KEY = "ai-docs-settings";

const DEFAULT_SETTINGS = {
  theme: "dark",
  accent: "#e8b84b",
  sidebar: "labeled",
  density: "cozy",
  direction: "compose",
};

const ACCENTS = [
  { value: "#e8b84b", label: "Amber" },
  { value: "#a78bfa", label: "Purple" },
  { value: "#5ee6e6", label: "Cyan" },
  { value: "#5ad19f", label: "Green" },
  { value: "#ff7ad9", label: "Pink" },
  { value: "#c1c8d2", label: "Slate" },
];

// ─── Utilities ────────────────────────────────────────────────
function buildDocPrompt(doc, vals) {
  let text = `# ${doc.title}\n> ${doc.purpose}\n\n`;
  doc.sections.forEach((s) => {
    text += `## ${s.title}\n`;
    const v = vals[s.id] || "";
    if (s.kind === "list") {
      const items = v.split("\n").filter((l) => l.trim());
      text += items.length > 0 ? items.map((i) => `- ${i}`).join("\n") : "(empty)";
    } else {
      text += v.trim() || "(empty)";
    }
    text += "\n\n";
  });
  return text.trim();
}

function buildAllPrompt(allValues) {
  return DOCS.map((d) => buildDocPrompt(d, allValues[d.id] || {})).join("\n\n---\n\n");
}

function countFilled(doc, vals) {
  return doc.sections.filter((s) => {
    const v = vals[s.id] || "";
    return s.kind === "list" ? v.split("\n").some((l) => l.trim()) : v.trim().length > 0;
  }).length;
}

// ─── Hooks ────────────────────────────────────────────────────
function useAutoGrow(value) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    }
  }, [value]);
  return ref;
}

// ─── Primitive inputs ─────────────────────────────────────────
function LineInput({ id, value, onChange, placeholder, style }) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ display: "block", width: "100%", ...style }}
    />
  );
}

function BlockInput({ id, value, onChange, placeholder, rows, style }) {
  const ref = useAutoGrow(value);
  return (
    <textarea
      id={id}
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ display: "block", width: "100%", minHeight: `${(rows || 3) * 24}px`, overflow: "hidden", ...style }}
    />
  );
}

function ListInput({ id, value, onChange, placeholder, wrapperStyle, rowStyle, badgeStyle, inputExtraStyle, addStyle }) {
  const items = value ? value.split("\n") : [""];
  const displayItems = items.length ? items : [""];
  const [addHovered, setAddHovered] = useState(false);

  const setItem = (i, v) => {
    const updated = [...displayItems];
    updated[i] = v;
    onChange(updated.join("\n").replace(/\n+$/, ""));
  };

  const addItem = () => onChange(value ? value + "\n" : "");

  return (
    <div style={wrapperStyle}>
      {displayItems.map((item, i) => (
        <div key={i} style={rowStyle}>
          {badgeStyle && (
            <span style={badgeStyle}>{String(i + 1).padStart(badgeStyle.padStart || 1, "0")}</span>
          )}
          <input
            id={i === 0 ? id : undefined}
            type="text"
            value={item}
            onChange={(e) => setItem(i, e.target.value)}
            placeholder={i === 0 ? placeholder : `Item ${i + 1}…`}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--ink-0)", ...inputExtraStyle }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        onMouseEnter={() => setAddHovered(true)}
        onMouseLeave={() => setAddHovered(false)}
        style={{
          ...addStyle,
          color: addHovered ? "var(--ink-0)" : addStyle?.color,
          transition: "color 0.15s",
        }}
      >
        + Add item
      </button>
    </div>
  );
}

// ─── KBD badge ────────────────────────────────────────────────
function KBD({ children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 18, height: 18, padding: "0 4px",
      borderRadius: 4, border: "1px solid var(--line-2)",
      color: "var(--ink-3)", fontSize: 10, fontFamily: "var(--font-mono)",
    }}>
      {children}
    </span>
  );
}

// ─── Progress dot ─────────────────────────────────────────────
function ProgressDot({ pct, complete, active }) {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
      border: `1.5px solid ${complete ? "var(--good)" : pct > 0 ? "var(--accent)" : active ? "var(--accent)" : "var(--line-2)"}`,
      background: complete ? "var(--good)" : "transparent",
      position: "relative", overflow: "hidden",
    }}>
      {!complete && pct > 0 && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${pct * 100}%`,
          background: "var(--accent)",
          opacity: 0.7,
        }} />
      )}
    </div>
  );
}

// ─── Tweaks panel ─────────────────────────────────────────────
function TweaksPanel({ settings, onChange, onClose }) {
  const seg = (options, key) => (
    <div style={{ display: "flex", borderRadius: "var(--r-sm)", overflow: "hidden", border: "1px solid var(--line-2)" }}>
      {options.map(([val, lbl], i) => (
        <button
          key={val}
          onClick={() => onChange({ ...settings, [key]: val })}
          style={{
            flex: 1, height: 30, fontSize: 12,
            background: settings[key] === val ? "var(--bg-3)" : "var(--bg-2)",
            color: settings[key] === val ? "var(--ink-0)" : "var(--ink-2)",
            fontWeight: settings[key] === val ? 600 : 400,
            borderRight: i < options.length - 1 ? "1px solid var(--line-2)" : "none",
          }}
        >
          {lbl}
        </button>
      ))}
    </div>
  );

  const sectionLabel = (text) => (
    <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 10, marginTop: 4 }}>
      {text}
    </div>
  );

  const fieldLabel = (text) => (
    <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 8 }}>{text}</div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 248,
        background: "var(--bg-1)", borderLeft: "1px solid var(--line)",
        zIndex: 1000, display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 40px rgba(0,0,0,0.35)",
      }}>
        {/* Header */}
        <div style={{
          height: 48, padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink-0)", letterSpacing: -0.2 }}>Tweaks</span>
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24, borderRadius: "var(--r-xs)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--ink-3)", fontSize: 16, lineHeight: 1,
              background: "var(--bg-2)",
            }}
          >×</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Direction */}
          <div>
            {sectionLabel("Direction")}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                ["terminal", "01 · Terminal", "TUI-forward, split pane"],
                ["compose", "02 · Compose", "Linear/Raycast-style"],
                ["manuscript", "03 · Manuscript", "Document-first canvas"],
              ].map(([val, lbl, sub]) => (
                <button
                  key={val}
                  onClick={() => onChange({ ...settings, direction: val })}
                  style={{
                    padding: "9px 12px", borderRadius: "var(--r-sm)", textAlign: "left",
                    background: settings.direction === val ? "var(--accent-soft)" : "var(--bg-2)",
                    border: `1px solid ${settings.direction === val ? "var(--accent)" : "var(--line)"}`,
                  }}
                >
                  <div style={{
                    fontSize: 12, fontFamily: "var(--font-mono)",
                    color: settings.direction === val ? "var(--accent)" : "var(--ink-1)",
                    fontWeight: settings.direction === val ? 600 : 500,
                    marginBottom: 2,
                  }}>{lbl}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            {sectionLabel("Theme")}
            {fieldLabel("Mode")}
            {seg([["dark", "Dark"], ["light", "Light"]], "theme")}
          </div>

          {/* Accent */}
          <div>
            {fieldLabel("Accent")}
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {ACCENTS.map((a) => {
                const isSelected = settings.accent === a.value;
                return (
                  <button
                    key={a.value}
                    onClick={() => onChange({ ...settings, accent: a.value })}
                    aria-label={`${a.label} accent${isSelected ? " (selected)" : ""}`}
                    style={{
                      width: 30, height: 30, borderRadius: "var(--r-sm)",
                      background: a.value,
                      outline: isSelected ? `2px solid var(--ink-0)` : "2px solid transparent",
                      outlineOffset: 2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <span style={{ fontSize: 14, color: "#0a0a0a", fontWeight: 700, lineHeight: 1 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout */}
          <div>
            {sectionLabel("Layout")}
            {fieldLabel("Sidebar")}
            <div style={{
              background: "var(--bg-2)", border: "1px solid var(--line-2)",
              borderRadius: "var(--r-sm)", padding: "0 10px", height: 34,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "relative",
            }}>
              <select
                value={settings.sidebar}
                onChange={(e) => onChange({ ...settings, sidebar: e.target.value })}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
              >
                <option value="labeled">Labeled</option>
                <option value="icons">Icons only</option>
                <option value="hidden">Hidden</option>
              </select>
              <span style={{ fontSize: 12, color: "var(--ink-1)", pointerEvents: "none" }}>
                {settings.sidebar === "labeled" ? "Labeled" : settings.sidebar === "icons" ? "Icons only" : "Hidden"}
              </span>
              <span style={{ color: "var(--ink-3)", fontSize: 11, pointerEvents: "none" }}>▾</span>
            </div>
          </div>

          {/* Density */}
          <div>
            {fieldLabel("Density")}
            {seg([["compact", "Compact"], ["cozy", "Cozy"], ["comfy", "Comfy"]], "density")}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Prompt preview (shared) ──────────────────────────────────
function PromptPreview({ doc, vals }) {
  const text = buildDocPrompt(doc, vals);
  return (
    <pre style={{ margin: 0, fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 }}>
      {text.split("\n").map((ln, i) => {
        if (ln.startsWith("# ")) return <div key={i} style={{ color: "var(--accent)", fontWeight: 600 }}>{ln}</div>;
        if (ln.startsWith("## ")) return <div key={i} style={{ color: "var(--info)", marginTop: 8, fontWeight: 500 }}>{ln}</div>;
        if (ln === "(empty)") return <div key={i} style={{ color: "var(--ink-4)", fontStyle: "italic" }}>{ln}</div>;
        if (ln.startsWith("- ")) return <div key={i} style={{ color: "var(--ink-2)", paddingLeft: 4 }}>{ln}</div>;
        if (ln.startsWith(">")) return <div key={i} style={{ color: "var(--ink-3)", fontStyle: "italic" }}>{ln}</div>;
        return <div key={i} style={{ color: "var(--ink-1)" }}>{ln}</div>;
      })}
    </pre>
  );
}

// ══════════════════════════════════════════════════════════════
// DIRECTION 1: TERMINAL
// ══════════════════════════════════════════════════════════════
function TerminalDirection({ docs, activeDoc, onSelectDoc, docValues, allValues, onChange, onCopy, onExportAll, copyState, exportState, settings }) {
  const doc = docs[activeDoc];
  const [focusedIdx, setFocusedIdx] = useState(null);
  const icons = settings.sidebar === "icons";
  const hidden = settings.sidebar === "hidden";

  useEffect(() => { setFocusedIdx(null); }, [activeDoc]);

  const totalFilled = docs.reduce((acc, d) => acc + countFilled(d, allValues[d.id] || {}), 0);
  const totalSections = docs.reduce((acc, d) => acc + d.sections.length, 0);
  const completedDocs = docs.filter((d) => countFilled(d, allValues[d.id] || {}) === d.sections.length).length;
  const pct = totalSections > 0 ? Math.round((totalFilled / totalSections) * 100) : 0;

  const copyLabel = copyState === "ok" ? "✓ copied!" : copyState === "err" ? "✗ failed" : "$ copy_as_prompt";
  const exportLabel = exportState === "ok" ? "✓ exported!" : exportState === "err" ? "✗ failed" : "export";

  const sidebarW = icons ? 56 : 252;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: hidden ? "1fr" : `${sidebarW}px 1fr`,
      gridTemplateRows: "1fr 28px",
      height: "100%",
      overflow: "hidden",
      fontFamily: "var(--font-mono)",
    }}>
      {/* Sidebar */}
      {!hidden && (
        <div style={{ background: "var(--bg-1)", display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid var(--line)" }}>
          {/* Sidebar header */}
          <div style={{ height: 38, padding: "0 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line)", color: "var(--ink-2)", fontSize: 11, flexShrink: 0 }}>
            <span style={{ color: "var(--accent)" }}>❯</span>
            {!icons && <span>ai-template</span>}
            {!icons && <span style={{ marginLeft: "auto", color: "var(--ink-3)" }}>main</span>}
          </div>
          {/* File tree */}
          <div style={{ padding: "10px 0", overflowY: "auto", flex: 1 }}>
            {!icons && (
              <div style={{ padding: "4px 16px 6px", color: "var(--ink-4)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>docs/</div>
            )}
            {docs.map((d, i) => {
              const selected = activeDoc === i;
              const filled = countFilled(d, allValues[d.id] || {});
              const hasFill = filled > 0;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDoc(i)}
                  aria-current={selected ? "page" : undefined}
                  title={d.title}
                  style={{
                    position: "relative", display: "flex", alignItems: "center", gap: 10,
                    padding: icons ? "0" : "0 14px 0 18px",
                    height: 28, width: "100%", textAlign: "left",
                    color: selected ? "var(--ink-0)" : "var(--ink-2)", fontSize: 12,
                    background: selected ? "var(--bg-3)" : "transparent",
                    justifyContent: icons ? "center" : "flex-start",
                    transition: "background 0.1s",
                  }}
                >
                  {selected && <div style={{ position: "absolute", left: 0, top: 4, bottom: 4, width: 2, background: "var(--accent)", borderRadius: "0 1px 1px 0" }} />}
                  {!icons && <span style={{ width: 18, color: selected ? "var(--accent)" : "var(--ink-4)", fontSize: 11, textAlign: "right", flexShrink: 0, fontWeight: selected ? 600 : 400 }}>{d.n}</span>}
                  {icons ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: "var(--r-sm)",
                      border: `1px solid ${selected ? "var(--accent)" : "var(--line-2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: selected ? "var(--accent)" : "var(--ink-2)", fontSize: 11, fontWeight: 600,
                    }}>{d.n}</div>
                  ) : (
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: selected ? "var(--ink-0)" : "var(--ink-2)" }}>
                      {d.n}_{d.id}.md
                    </span>
                  )}
                  {!icons && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: selected ? "var(--accent)" : hasFill ? "var(--ink-3)" : "var(--bg-4)",
                    }} />
                  )}
                </button>
              );
            })}
            {!icons && (
              <>
                <div style={{ padding: "20px 16px 4px", color: "var(--ink-4)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>output/</div>
                <div style={{ padding: "0 14px 0 36px", height: 24, display: "flex", alignItems: "center", color: "var(--ink-3)", fontSize: 12 }}>
                  <span>prompt.md</span>
                </div>
              </>
            )}
          </div>
          {/* Sidebar footer */}
          {!icons && (
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-3)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--good)", fontSize: 8 }}>●</span>
                  <span style={{ color: "var(--ink-2)" }}>{completedDocs}/{docs.length} docs</span>
                </div>
                <span style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 10 }}>{pct}%</span>
              </div>
              <div style={{ height: 2, borderRadius: 1, background: "var(--bg-3)", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 1, transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main: form + prompt split */}
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", overflow: "hidden" }}>
        {/* Form pane */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-0)", borderLeft: hidden ? "none" : "1px solid var(--line)" }}>
          <div style={{ height: 38, padding: "0 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)", fontSize: 12, flexShrink: 0 }}>
            <span style={{ color: "var(--ink-3)" }}>docs/</span>
            <span style={{ color: "var(--ink-0)", fontWeight: 500 }}>{doc.n}_{doc.id}.md</span>
            <span style={{ color: "var(--warn)", marginLeft: 2 }}>●</span>
            <span style={{ marginLeft: "auto", color: "var(--ink-3)" }}>{doc.sections.length} fields</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 60px" }}>
            {/* Doc title block */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: "var(--ink-4)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}># {doc.n}</div>
              <div style={{ fontSize: 22, color: "var(--ink-0)", fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2 }}>{doc.title}</div>
              <div style={{ color: "var(--ink-2)", marginTop: 6, fontSize: 12 }}>
                <span style={{ color: "var(--accent)" }}>// </span>{doc.purpose}
              </div>
            </div>
            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {doc.sections.map((s, i) => {
                const fid = `${doc.id}-${s.id}`;
                const focused = focusedIdx === i;
                const fieldBorderColor = focused ? "var(--accent)" : "var(--line-2)";
                const fieldShadow = focused ? "0 0 0 3px var(--accent-soft)" : "none";
                return (
                  <div key={s.id} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 22, paddingTop: 3, flexShrink: 0,
                      color: focused ? "var(--accent)" : "var(--ink-4)",
                      fontSize: 11, textAlign: "right", fontWeight: focused ? 600 : 400,
                      transition: "color 0.15s",
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: focused ? "var(--accent)" : "var(--ink-3)", transition: "color 0.15s" }}>▎</span>
                        <label htmlFor={fid} style={{ flex: 1, color: focused ? "var(--ink-0)" : "var(--ink-1)", fontSize: 12, fontWeight: focused ? 500 : 400, transition: "color 0.15s" }}>{s.title}</label>
                        <span style={{ color: "var(--ink-4)", fontSize: 10 }}>
                          {s.kind === "list" ? "list" : s.kind === "block" ? "multi" : "single"}
                        </span>
                      </div>
                      <div
                        onFocus={() => setFocusedIdx(i)}
                        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusedIdx(null); }}
                      >
                        {s.kind === "line" ? (
                          <LineInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint}
                            style={{ background: "var(--bg-1)", border: `1px solid ${fieldBorderColor}`, borderRadius: "var(--r-sm)", padding: "9px 12px", color: "var(--ink-0)", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.55, boxShadow: fieldShadow, transition: "border-color 0.15s, box-shadow 0.15s" }} />
                        ) : s.kind === "list" ? (
                          <ListInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint}
                            wrapperStyle={{ background: "var(--bg-1)", border: `1px solid ${fieldBorderColor}`, borderRadius: "var(--r-sm)", padding: "8px 10px", fontFamily: "var(--font-mono)", fontSize: 12, boxShadow: fieldShadow, transition: "border-color 0.15s, box-shadow 0.15s" }}
                            rowStyle={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 4px", borderBottom: "1px solid var(--line)" }}
                            badgeStyle={null}
                            inputExtraStyle={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                            addStyle={{ color: "var(--ink-4)", fontSize: 11, padding: "6px 4px", textAlign: "left", fontFamily: "var(--font-mono)", width: "100%" }}
                          />
                        ) : (
                          <BlockInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint} rows={s.rows}
                            style={{ background: "var(--bg-1)", border: `1px solid ${fieldBorderColor}`, borderRadius: "var(--r-sm)", padding: "9px 12px", color: "var(--ink-0)", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.55, boxShadow: fieldShadow, transition: "border-color 0.15s, box-shadow 0.15s" }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Hint footer */}
            <div style={{ marginTop: 32, padding: "10px 14px", border: "1px dashed var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--ink-3)", fontSize: 11, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--accent)" }}>?</span>
              <span>
                <span style={{ color: "var(--ink-1)", fontWeight: 500 }}>⌘↵</span> copy prompt
              </span>
            </div>
          </div>
        </div>

        {/* Prompt pane */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-1)", borderLeft: "1px solid var(--line)" }}>
          <div style={{ height: 38, padding: "0 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)", fontSize: 12, flexShrink: 0 }}>
            <span style={{ color: "var(--ink-3)" }}>output/</span>
            <span style={{ color: "var(--ink-0)", fontWeight: 500 }}>prompt.md</span>
            <span style={{ marginLeft: "auto", padding: "2px 8px", fontSize: 10, color: "var(--good)", border: "1px solid var(--good)", borderRadius: 999, opacity: 0.8 }}>live</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
            <PromptPreview doc={doc} vals={docValues} />
          </div>
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--line)", display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={onCopy} style={{
              flex: 1, height: 36,
              background: copyState === "err" ? "var(--danger)" : copyState === "ok" ? "var(--good)" : "var(--accent)",
              color: copyState === "ok" ? "#000" : "var(--accent-ink)",
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
              borderRadius: "var(--r-sm)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.2s",
            }}>
              <span>{copyLabel}</span>
              {!copyState && <span style={{ opacity: 0.55, fontSize: 11 }}>⌘↵</span>}
            </button>
            <button onClick={onExportAll} style={{
              height: 36, padding: "0 12px",
              color: exportState === "ok" ? "var(--good)" : exportState === "err" ? "var(--danger)" : "var(--ink-1)",
              border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-mono)", fontSize: 12,
              transition: "color 0.2s",
            }}>
              {exportLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        gridColumn: "1 / -1",
        display: "flex", alignItems: "center", padding: "0 14px", gap: 16,
        background: "var(--bg-1)", borderTop: "1px solid var(--line)",
        color: "var(--ink-3)", fontSize: 11, letterSpacing: 0.2, fontFamily: "var(--font-mono)",
      }}>
        <span><span style={{ color: "var(--accent)" }}>~/AI-Template</span></span>
        <span>⎇ main</span>
        <span style={{ color: "var(--good)" }}>● autosaved</span>
        <span style={{ marginLeft: "auto" }}>UTF-8 · LF</span>
        <span style={{ color: "var(--ink-2)" }}>
          <span style={{ color: "var(--ink-1)" }}>{activeDoc + 1}</span>/{docs.length} docs
        </span>
        <span style={{ color: "var(--accent)", cursor: "default" }}>⌘K</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DIRECTION 2: COMPOSE
// ══════════════════════════════════════════════════════════════
function ComposeDirection({ docs, activeDoc, onSelectDoc, docValues, allValues, onChange, onCopy, onExportAll, copyState, exportState, settings }) {
  const doc = docs[activeDoc];
  const [tab, setTab] = useState("edit");
  const [focusedId, setFocusedId] = useState(null);
  const icons = settings.sidebar === "icons";
  const hidden = settings.sidebar === "hidden";

  useEffect(() => { setTab("edit"); setFocusedId(null); }, [activeDoc]);

  const totalSections = docs.reduce((a, d) => a + d.sections.length, 0);
  const totalFilled = docs.reduce((a, d) => a + countFilled(d, allValues[d.id] || {}), 0);
  const overallPct = totalSections > 0 ? Math.round((totalFilled / totalSections) * 100) : 0;
  const completedDocs = docs.filter((d) => countFilled(d, allValues[d.id] || {}) === d.sections.length).length;

  const copyLabel = copyState === "ok" ? "✓ Copied!" : copyState === "err" ? "✗ Failed" : "Copy prompt";
  const exportLabel = exportState === "ok" ? "✓ Copied!" : exportState === "err" ? "✗ Failed" : "Export";

  const scrollToField = (fieldId) => {
    setFocusedId(fieldId);
    const el = document.getElementById(`cfield-${fieldId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const inp = document.getElementById(fieldId);
    if (inp) setTimeout(() => inp.focus(), 300);
  };

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateRows: "52px 1fr", overflow: "hidden" }}>

      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", gap: 14, padding: "0 16px",
        background: "var(--bg-1)", borderBottom: "1px solid var(--line)", fontSize: 12,
        flexShrink: 0,
      }}>
        {/* Logo + breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "var(--r-sm)",
            background: "linear-gradient(135deg, var(--accent), color-mix(in oklch, var(--accent) 55%, #000))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent-ink)", fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}>◆</div>
          <span style={{ color: "var(--ink-1)", fontWeight: 600, fontSize: 13 }}>AI Docs</span>
          <span style={{ color: "var(--ink-4)" }}>›</span>
          <span style={{ color: "var(--ink-0)", fontSize: 13 }}>{doc.short}</span>
        </div>

        {/* Command bar */}
        <div style={{
          flex: 1, maxWidth: 360, height: 30, margin: "0 auto",
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bg-2)", border: "1px solid var(--line-2)",
          borderRadius: "var(--r-md)", padding: "0 12px", color: "var(--ink-3)",
        }}>
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 12, flex: 1, color: "var(--ink-4)" }}>Search docs, jump to field…</span>
          <span style={{ display: "flex", gap: 3 }}><KBD>⌘</KBD><KBD>K</KBD></span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-3)", fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--good)" }} />
            <span>Autosaved</span>
          </span>
          <div style={{ width: 1, height: 16, background: "var(--line-2)" }} />
          <button onClick={onExportAll} style={{
            height: 28, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)",
            color: exportState === "ok" ? "var(--good)" : exportState === "err" ? "var(--danger)" : "var(--ink-2)",
            fontSize: 12, background: "var(--bg-2)",
          }}>{exportLabel}</button>
          <button onClick={onCopy} style={{
            height: 28, padding: "0 14px",
            background: copyState === "err" ? "var(--danger)" : "var(--accent)",
            color: "var(--accent-ink)",
            borderRadius: "var(--r-sm)", fontSize: 12, fontWeight: 600,
          }}>{copyLabel}</button>
        </div>
      </header>

      {/* Body — MUST have overflow hidden so FAB anchors correctly */}
      <div style={{ display: "flex", overflow: "hidden" }}>

        {/* Sidebar */}
        {!hidden && (
          <nav aria-label="Documents" style={{
            width: icons ? 64 : 272, minWidth: icons ? 64 : 272,
            background: "var(--bg-1)", borderRight: "1px solid var(--line)",
            padding: icons ? "12px 8px" : "12px 10px",
            display: "flex", flexDirection: "column", gap: 2, overflowY: "auto",
            flexShrink: 0,
          }}>
            {!icons && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "4px 8px 10px", color: "var(--ink-4)",
                fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2,
              }}>
                <span>Documents</span>
                <span style={{ color: "var(--ink-2)", textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  {completedDocs}<span style={{ color: "var(--ink-4)" }}>/{docs.length}</span>
                </span>
              </div>
            )}

            {docs.map((d, i) => {
              const selected = activeDoc === i;
              const filled = countFilled(d, allValues[d.id] || {});
              const pct = d.sections.length > 0 ? filled / d.sections.length : 0;
              const complete = pct === 1 && d.sections.length > 0;
              return (
                <SidebarDoc
                  key={d.id}
                  d={d}
                  selected={selected}
                  icons={icons}
                  pct={pct}
                  complete={complete}
                  onClick={() => onSelectDoc(i)}
                />
              );
            })}

            {!icons && (
              <>
                <div style={{ height: 1, background: "var(--line)", margin: "12px 4px 8px" }} />
                <div style={{ padding: "2px 8px 8px", fontSize: 11, color: "var(--ink-3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span>Overall</span>
                    <span style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{overallPct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "var(--bg-3)", overflow: "hidden" }}>
                    <div style={{ width: `${overallPct}%`, height: "100%", background: "var(--accent)", borderRadius: 2, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              </>
            )}
          </nav>
        )}

        {/* Content area — overflow hidden required for FAB positioning */}
        <div style={{
          flex: 1, minWidth: 0, overflow: "hidden",
          display: "grid", gridTemplateColumns: "1fr 240px",
          position: "relative", background: "var(--bg-0)",
        }}>
          {/* Editor */}
          <div style={{ overflowY: "auto", minWidth: 0 }}>
            <div style={{ padding: "32px 52px 140px" }}>
              {/* Doc meta */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)",
                  background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 999,
                }}>DOC {doc.n}</span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{doc.purpose}</span>
              </div>
              <h1 style={{
                fontFamily: "var(--font-display)", margin: "0 0 4px",
                fontSize: 30, fontWeight: 600, letterSpacing: -0.7, color: "var(--ink-0)",
              }}>{doc.title}</h1>
              <div style={{ color: "var(--ink-4)", fontSize: 11, fontFamily: "var(--font-mono)", marginBottom: 24, letterSpacing: 0.2 }}>
                ~/AI-Template/docs/{doc.n}_{doc.id}.md
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", marginBottom: 20, borderBottom: "1px solid var(--line)" }}>
                {[["edit", "Edit"], ["preview", "Preview"]].map(([val, lbl]) => (
                  <button key={val} onClick={() => setTab(val)} style={{
                    padding: "8px 14px", fontSize: 12,
                    color: tab === val ? "var(--ink-0)" : "var(--ink-3)",
                    borderBottom: tab === val ? "2px solid var(--accent)" : "2px solid transparent",
                    marginBottom: -1, fontWeight: tab === val ? 600 : 400,
                    background: "transparent",
                  }}>{lbl}</button>
                ))}
                <div style={{ padding: "8px 14px", fontSize: 12, color: "var(--ink-4)", display: "flex", alignItems: "center", gap: 5 }}>
                  AI suggest
                  <span style={{ padding: "1px 5px", fontSize: 9, borderRadius: 999, background: "var(--bg-3)", color: "var(--ink-4)" }}>BETA</span>
                </div>
              </div>

              {/* Fields or Preview */}
              {tab === "edit" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {doc.sections.map((s) => {
                    const fid = `${doc.id}-${s.id}`;
                    const focused = focusedId === fid;
                    const fs = {
                      background: "var(--bg-1)",
                      border: `1px solid ${focused ? "var(--accent)" : "var(--line-2)"}`,
                      borderRadius: "var(--r-md)",
                      boxShadow: focused ? "0 0 0 3px var(--accent-soft)" : "none",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    };
                    return (
                      <div key={s.id} id={`cfield-${fid}`}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 7 }}>
                          <label htmlFor={fid} style={{ fontSize: 12, fontWeight: 600, color: focused ? "var(--ink-0)" : "var(--ink-1)", transition: "color 0.15s" }}>{s.title}</label>
                          <span style={{ fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>
                            {s.kind === "list" ? "list" : s.kind === "line" ? "short text" : "long text"}
                          </span>
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>
                            {(docValues[s.id] || "").length > 0 ? `${(docValues[s.id] || "").length} chars` : ""}
                          </span>
                        </div>
                        <div
                          onFocus={() => setFocusedId(fid)}
                          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusedId(null); }}
                        >
                          {s.kind === "line" ? (
                            <LineInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint}
                              style={{ ...fs, height: 38, padding: "0 14px", fontSize: 13, color: "var(--ink-0)" }} />
                          ) : s.kind === "list" ? (
                            <ListInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint}
                              wrapperStyle={{ ...fs, padding: "4px 6px" }}
                              rowStyle={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 8px", borderBottom: "1px solid var(--line)" }}
                              badgeStyle={{ minWidth: 20, height: 20, borderRadius: "var(--r-xs)", background: "var(--bg-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--font-mono)", flexShrink: 0, padding: "0 4px", textAlign: "center", padStart: 1 }}
                              inputExtraStyle={{ fontSize: 13, padding: "0" }}
                              addStyle={{ color: "var(--ink-3)", fontSize: 12, padding: "8px 16px", textAlign: "left", width: "100%" }}
                            />
                          ) : (
                            <BlockInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint} rows={s.rows}
                              style={{ ...fs, padding: "12px 14px", fontSize: 13, color: "var(--ink-0)", lineHeight: 1.65 }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: "var(--bg-1)", border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: "20px 24px" }}>
                  <PromptPreview doc={doc} vals={docValues} />
                </div>
              )}
            </div>
          </div>

          {/* Outline rail */}
          <div style={{ borderLeft: "1px solid var(--line)", padding: "24px 16px", overflowY: "auto", background: "var(--bg-0)" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--ink-4)", marginBottom: 10 }}>Outline</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {doc.sections.map((s) => {
                const fid = `${doc.id}-${s.id}`;
                const active = focusedId === fid;
                const filled = (docValues[s.id] || "").trim().length > 0 ||
                  (s.kind === "list" && (docValues[s.id] || "").split("\n").some((l) => l.trim()));
                return (
                  <button key={s.id} onClick={() => scrollToField(fid)} style={{
                    display: "flex", alignItems: "center", gap: 9, padding: "6px 8px",
                    borderRadius: "var(--r-xs)",
                    background: active ? "var(--accent-soft)" : "transparent",
                    color: active ? "var(--ink-0)" : filled ? "var(--ink-2)" : "var(--ink-3)",
                    fontSize: 11, textAlign: "left", width: "100%",
                    transition: "background 0.1s, color 0.1s",
                  }}>
                    <span style={{
                      width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                      border: `1.5px solid ${active ? "var(--accent)" : filled ? "var(--ink-3)" : "var(--line-2)"}`,
                      background: filled && !active ? "var(--ink-3)" : "transparent",
                      transition: "border-color 0.15s",
                    }} />
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                  </button>
                );
              })}
            </div>
            {/* Tip card */}
            <div style={{ marginTop: 20, padding: 12, background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                <span style={{
                  width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                  background: "var(--accent-soft)", color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                }}>i</span>
                <span style={{ color: "var(--ink-1)", fontSize: 11, fontWeight: 600 }}>Tip</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.6 }}>{doc.goldenRule}</div>
            </div>
          </div>

          {/* FAB — absolutely positioned over the outline rail area */}
          <div style={{
            position: "absolute", right: 18, bottom: 20,
            display: "flex", gap: 8, alignItems: "center", zIndex: 10,
            pointerEvents: "none",
          }}>
            <div style={{
              height: 34, padding: "0 12px",
              background: "var(--bg-2)", border: "1px solid var(--line-2)",
              borderRadius: 999,
              display: "flex", alignItems: "center", gap: 6,
              color: "var(--ink-2)", fontSize: 11,
              pointerEvents: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--good)" }} />
              <span>Autosaved</span>
            </div>
            <button onClick={onCopy} style={{
              height: 42, padding: "0 18px",
              background: copyState === "err" ? "var(--danger)" : "var(--accent)",
              color: "var(--accent-ink)",
              borderRadius: 999, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 8px 24px -6px var(--accent-glow)",
              pointerEvents: "auto",
              transition: "opacity 0.15s",
            }}>
              {copyLabel}
              {!copyState && <span style={{ display: "flex", gap: 3 }}><KBD>⌘</KBD><KBD>↵</KBD></span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarDoc({ d, selected, icons, pct, complete, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-current={selected ? "page" : undefined}
      title={d.title}
      style={{
        display: "flex", alignItems: "center", gap: icons ? 0 : 10,
        padding: icons ? "6px 0" : "7px 8px",
        justifyContent: icons ? "center" : "flex-start",
        borderRadius: "var(--r-sm)",
        background: selected ? "var(--bg-3)" : hovered ? "var(--bg-2)" : "transparent",
        textAlign: "left", minHeight: 38, width: "100%",
        transition: "background 0.1s",
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: "var(--r-xs)", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
        background: selected ? "var(--accent)" : hovered ? "var(--bg-3)" : "var(--bg-2)",
        color: selected ? "var(--accent-ink)" : "var(--ink-2)",
        border: `1px solid ${selected ? "var(--accent)" : "var(--line)"}`,
        transition: "background 0.1s, border-color 0.1s",
      }}>{d.n}</div>
      {!icons && (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: selected ? 600 : 500, color: selected ? "var(--ink-0)" : "var(--ink-1)" }}>{d.short}</div>
            <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.purpose}</div>
          </div>
          <ProgressDot pct={pct} complete={complete} active={selected} />
        </>
      )}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// DIRECTION 3: MANUSCRIPT
// ══════════════════════════════════════════════════════════════
function ManuscriptDirection({ docs, activeDoc, onSelectDoc, docValues, allValues, onChange, onCopy, onExportAll, copyState, exportState, settings }) {
  const doc = docs[activeDoc];
  const icons = settings.sidebar === "icons";
  const hidden = settings.sidebar === "hidden";
  const [previewOpen, setPreviewOpen] = useState(true);
  const [focusedIdx, setFocusedIdx] = useState(null);

  useEffect(() => { setFocusedIdx(null); }, [activeDoc]);

  const completedDocs = docs.filter((d) => countFilled(d, allValues[d.id] || {}) === d.sections.length).length;
  const copyLabel = copyState === "ok" ? "✓ Copied!" : copyState === "err" ? "✗ Failed" : "Copy prompt";

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateRows: "60px 1fr", overflow: "hidden" }}>
      {/* Stepper header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "0 20px",
        background: "var(--bg-1)", borderBottom: "1px solid var(--line)", gap: 16,
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "var(--r-sm)",
            background: "var(--bg-2)", border: "1px solid var(--line-2)",
            display: "grid", placeItems: "center",
            color: "var(--accent)", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-mono)",
          }}>◴</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-0)", lineHeight: 1.15 }}>AI Project Docs</div>
            <div style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>d4rkwolf · draft</div>
          </div>
        </div>

        {/* Stepper */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "var(--bg-0)", border: "1px solid var(--line)",
          borderRadius: 999, padding: 3,
        }}>
          {docs.map((d, i) => {
            const active = activeDoc === i;
            const done = countFilled(d, allValues[d.id] || {}) === d.sections.length && !active;
            return (
              <div key={d.id} style={{ display: "flex", alignItems: "center" }}>
                <button onClick={() => onSelectDoc(i)} style={{
                  height: 28, padding: active ? "0 12px" : "0 7px",
                  borderRadius: 999,
                  display: "flex", alignItems: "center", gap: 7,
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "var(--accent-ink)" : done ? "var(--ink-1)" : "var(--ink-3)",
                  fontSize: 11, fontWeight: 500, fontFamily: "var(--font-mono)",
                  transition: "background 0.2s, padding 0.2s",
                }}>
                  <span style={{
                    width: 17, height: 17, borderRadius: "50%",
                    display: "grid", placeItems: "center",
                    background: done ? "var(--good)" : active ? "rgba(0,0,0,0.15)" : "var(--bg-3)",
                    color: done ? "#000" : active ? "var(--accent-ink)" : "var(--ink-3)",
                    fontSize: 9, fontWeight: 700,
                  }}>{done ? "✓" : d.n}</span>
                  {active && <span style={{ fontFamily: "var(--font-sans)", fontSize: 12 }}>{d.short}</span>}
                </button>
                {i < docs.length - 1 && <div style={{ width: 5, height: 1, background: "var(--line-2)" }} />}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-3)", fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--good)" }} />
            Saved locally
          </span>
          <button onClick={onExportAll} style={{
            height: 28, padding: "0 12px",
            background: "var(--bg-2)", border: "1px solid var(--line-2)",
            color: exportState === "ok" ? "var(--good)" : exportState === "err" ? "var(--danger)" : "var(--ink-1)",
            fontSize: 12, borderRadius: "var(--r-sm)",
          }}>
            {exportState === "ok" ? "✓ Exported!" : exportState === "err" ? "✗ Failed" : "Export All"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{
        display: "grid",
        gridTemplateColumns: hidden ? "1fr" : icons ? "58px 1fr" : "220px 1fr",
        overflow: "hidden",
      }}>
        {/* Sidebar */}
        {!hidden && (
          <div style={{
            background: "var(--bg-1)", borderRight: "1px solid var(--line)",
            padding: icons ? "16px 6px" : "18px 12px",
            display: "flex", flexDirection: "column", gap: icons ? 6 : 2,
            overflowY: "auto",
          }}>
            {!icons && (
              <div style={{ padding: "2px 6px 12px", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-4)" }}>
                Chapters
              </div>
            )}
            {docs.map((d, i) => {
              const selected = activeDoc === i;
              const filled = countFilled(d, allValues[d.id] || {});
              return (
                <button key={d.id} onClick={() => onSelectDoc(i)} title={d.title} style={{
                  display: "flex", alignItems: "center", gap: icons ? 0 : 10,
                  justifyContent: icons ? "center" : "flex-start",
                  padding: icons ? "4px 0" : "7px 6px",
                  borderRadius: "var(--r-sm)",
                  background: selected && !icons ? "var(--bg-2)" : "transparent",
                  width: "100%",
                  transition: "background 0.1s",
                }}>
                  <div style={{
                    width: icons ? 38 : 30, height: icons ? 38 : 30,
                    borderRadius: icons ? "var(--r-md)" : "var(--r-sm)", flexShrink: 0,
                    background: selected ? "var(--accent)" : "var(--bg-3)",
                    color: selected ? "var(--accent-ink)" : "var(--ink-2)",
                    border: `1px solid ${selected ? "var(--accent)" : "var(--line)"}`,
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                    transition: "background 0.15s, border-color 0.15s",
                  }}>{d.n}</div>
                  {!icons && (
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: selected ? 600 : 500, color: selected ? "var(--ink-0)" : "var(--ink-1)", lineHeight: 1.3 }}>{d.short}</div>
                      <div style={{ fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {filled}/{d.sections.length} fields
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
            <div style={{ flex: 1 }} />
            {!icons && (
              <div style={{ padding: 10, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
                <div style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600, marginBottom: 3 }}>Local-first</div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", lineHeight: 1.55 }}>All data stays on your machine. Nothing leaves this window.</div>
              </div>
            )}
          </div>
        )}

        {/* Canvas */}
        <div style={{ position: "relative", background: "var(--bg-0)", overflowY: "auto" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 52px 200px" }}>
            {/* Doc meta strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginBottom: 14 }}>
              <span>DOC {doc.n}</span>
              <span>·</span>
              <span>{doc.sections.length} fields</span>
              <span>·</span>
              <span>draft</span>
            </div>

            <h1 style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-display)",
              fontSize: 44, fontWeight: 600, letterSpacing: -1.4,
              color: "var(--ink-0)", lineHeight: 1.05,
            }}>{doc.title}</h1>
            <p style={{ margin: "0 0 36px", color: "var(--ink-3)", fontSize: 15, lineHeight: 1.6, maxWidth: 560 }}>
              {doc.purpose}. Empty fields appear as{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 13 }}>&lt;todo&gt;</span>{" "}
              in the generated prompt.
            </p>

            <div style={{ height: 1, background: "var(--line)", marginBottom: 0 }} />

            {/* Sections */}
            <div>
              {doc.sections.map((s, i) => {
                const fid = `${doc.id}-${s.id}`;
                const focused = focusedIdx === i;
                const underline = focused ? "inset 0 -2px 0 var(--accent)" : "inset 0 -1px 0 var(--line)";
                const v = docValues[s.id] || "";
                const filled = s.kind === "list" ? v.split("\n").some((l) => l.trim()) : v.trim().length > 0;
                return (
                  <div key={s.id} style={{
                    display: "grid", gridTemplateColumns: "40px 1fr", gap: 16,
                    padding: "22px 0", borderBottom: "1px solid var(--line)",
                  }}>
                    <div style={{
                      paddingTop: 7, textAlign: "right",
                      color: focused ? "var(--accent)" : filled ? "var(--ink-3)" : "var(--ink-4)",
                      fontFamily: "var(--font-mono)", fontSize: 11,
                      transition: "color 0.15s",
                    }}>
                      § {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                        <label htmlFor={fid} style={{
                          fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500,
                          color: focused ? "var(--ink-0)" : "var(--ink-1)", letterSpacing: -0.2,
                          transition: "color 0.15s",
                        }}>{s.title}</label>
                        <span style={{ fontSize: 9, color: "var(--ink-4)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1.2 }}>{s.kind}</span>
                      </div>
                      <div
                        onFocus={() => setFocusedIdx(i)}
                        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusedIdx(null); }}
                      >
                        {s.kind === "list" ? (
                          <ListInput id={fid} value={v} onChange={(val) => onChange(s.id, val)} placeholder={s.hint}
                            wrapperStyle={{ display: "flex", flexDirection: "column" }}
                            rowStyle={{ display: "flex", alignItems: "center", gap: 14, padding: "7px 0", boxShadow: "inset 0 -1px 0 var(--line)" }}
                            badgeStyle={{ width: 18, color: focused ? "var(--accent)" : "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, flexShrink: 0, textAlign: "right", padStart: 2 }}
                            inputExtraStyle={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--ink-0)" }}
                            addStyle={{ padding: "8px 0", display: "flex", alignItems: "center", gap: 8, color: "var(--ink-3)", fontSize: 12, fontFamily: "var(--font-mono)", textAlign: "left", width: "100%" }}
                          />
                        ) : s.kind === "block" ? (
                          <BlockInput id={fid} value={v} onChange={(val) => onChange(s.id, val)} placeholder={s.hint} rows={s.rows}
                            style={{ width: "100%", background: "transparent", boxShadow: underline, padding: "6px 0", fontSize: 15, color: "var(--ink-0)", fontFamily: "var(--font-sans)", lineHeight: 1.65, transition: "box-shadow 0.15s" }} />
                        ) : (
                          <LineInput id={fid} value={v} onChange={(val) => onChange(s.id, val)} placeholder={s.hint}
                            style={{ height: 36, background: "transparent", boxShadow: underline, padding: "0", fontSize: 15, color: "var(--ink-0)", fontFamily: "var(--font-sans)", transition: "box-shadow 0.15s" }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating preview card */}
          {previewOpen ? (
            <div style={{
              position: "sticky", top: 20, float: "right",
              marginRight: 20, marginTop: -200,
              width: 272,
              background: "var(--bg-1)", border: "1px solid var(--line-2)",
              borderRadius: "var(--r-lg)", overflow: "hidden",
              boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
            }}>
              <div style={{
                height: 32, padding: "0 10px",
                display: "flex", alignItems: "center", gap: 7,
                borderBottom: "1px solid var(--line)",
                fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <span style={{ flex: 1, marginLeft: 4 }}>prompt.md</span>
                <span style={{ color: "var(--good)", fontSize: 10 }}>live</span>
                <button onClick={() => setPreviewOpen(false)} style={{ color: "var(--ink-4)", fontSize: 14, marginLeft: 4, lineHeight: 1 }}>×</button>
              </div>
              <div style={{
                padding: 12, maxHeight: 200, overflow: "hidden",
                fontFamily: "var(--font-mono)", fontSize: 10.5, lineHeight: 1.7,
                position: "relative",
              }}>
                <PromptPreview doc={doc} vals={docValues} />
                <div style={{
                  position: "absolute", left: 0, right: 0, bottom: 0, height: 48,
                  background: "linear-gradient(to bottom, transparent, var(--bg-1))",
                  pointerEvents: "none",
                }} />
              </div>
              <div style={{ display: "flex", gap: 6, padding: 8, borderTop: "1px solid var(--line)" }}>
                <button onClick={onCopy} style={{
                  flex: 1, height: 30,
                  background: copyState === "err" ? "var(--danger)" : "var(--accent)",
                  color: "var(--accent-ink)", borderRadius: "var(--r-sm)",
                  fontSize: 11, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  {copyLabel}
                  {!copyState && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.65 }}>⌘↵</span>}
                </button>
                <button onClick={onExportAll} style={{
                  width: 30, height: 30,
                  border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)",
                  color: "var(--ink-2)", display: "grid", placeItems: "center", fontSize: 14,
                }}>↗</button>
              </div>
            </div>
          ) : (
            <div style={{ position: "sticky", top: 20, float: "right", marginRight: 20, marginTop: -40 }}>
              <button onClick={() => setPreviewOpen(true)} style={{
                height: 28, padding: "0 12px",
                background: "var(--bg-1)", border: "1px solid var(--line-2)",
                borderRadius: "var(--r-sm)", fontSize: 11, color: "var(--ink-2)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>prompt.md</span>
                <span>↗</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [activeDoc, setActiveDoc] = useState(0);
  const [allValues, setAllValues] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [settings, setSettings] = useState(() => {
    try { const s = localStorage.getItem(SETTINGS_KEY); return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; }
  });
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [copyState, setCopyState] = useState(null);
  const [exportState, setExportState] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(allValues)); }, [allValues]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

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

  // ⌘↵ keyboard shortcut
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
  const rootStyle = {
    "--accent": settings.accent,
    "--accent-soft": `color-mix(in oklch, ${settings.accent} 22%, transparent)`,
    "--accent-glow": `color-mix(in oklch, ${settings.accent} 60%, transparent)`,
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

      {/* Tweaks toggle button */}
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
