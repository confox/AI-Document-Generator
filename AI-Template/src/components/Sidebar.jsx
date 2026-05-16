import { useState } from "react";
import { countFilled } from "@/utils/prompt.js";
import { ProgressDot } from "@/components/ProgressDot.jsx";

// ─── Terminal variant item ─────────────────────────────────────
function TerminalItem({ d, selected, icons, filled, onClick }) {
  const hasFill = filled > 0;
  return (
    <button
      onClick={onClick}
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
}

// ─── Compose variant item ──────────────────────────────────────
function ComposeItem({ d, selected, icons, filled, onClick }) {
  const [hovered, setHovered] = useState(false);
  const pct = d.sections.length > 0 ? filled / d.sections.length : 0;
  const complete = pct === 1 && d.sections.length > 0;
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

// ─── Manuscript variant item ───────────────────────────────────
function ManuscriptItem({ d, selected, icons, filled, onClick }) {
  return (
    <button
      onClick={onClick}
      title={d.title}
      style={{
        display: "flex", alignItems: "center", gap: icons ? 0 : 10,
        justifyContent: icons ? "center" : "flex-start",
        padding: icons ? "4px 0" : "7px 6px",
        borderRadius: "var(--r-sm)",
        background: selected && !icons ? "var(--bg-2)" : "transparent",
        width: "100%",
        transition: "background 0.1s",
      }}
    >
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
}

// ─── Sidebar shell ─────────────────────────────────────────────
export function Sidebar({ variant, docs, activeDoc, onSelectDoc, allValues, settings }) {
  const icons = settings.sidebar === "icons";

  // Compute fill counts once; pass down to items to avoid redundant calls
  const fillCounts = docs.map((d) => countFilled(d, allValues[d.id] || {}));
  const totalFilled = fillCounts.reduce((acc, n) => acc + n, 0);
  const totalSections = docs.reduce((acc, d) => acc + d.sections.length, 0);
  const completedDocs = fillCounts.filter((n, i) => n === docs[i].sections.length).length;
  const overallPct = totalSections > 0 ? Math.round((totalFilled / totalSections) * 100) : 0;

  const ItemComponent = variant === "terminal" ? TerminalItem
    : variant === "manuscript" ? ManuscriptItem
    : ComposeItem;

  if (variant === "terminal") {
    const sidebarW = icons ? 56 : 252;
    return (
      <div style={{ width: sidebarW, background: "var(--bg-1)", display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid var(--line)" }}>
        <div style={{ height: 38, padding: "0 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line)", color: "var(--ink-2)", fontSize: 11, flexShrink: 0 }}>
          <span style={{ color: "var(--accent)" }}>❯</span>
          {!icons && <span>ai-template</span>}
          {!icons && <span style={{ marginLeft: "auto", color: "var(--ink-3)" }}>main</span>}
        </div>
        <div style={{ padding: "10px 0", overflowY: "auto", flex: 1 }}>
          {!icons && (
            <div style={{ padding: "4px 16px 6px", color: "var(--ink-4)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>docs/</div>
          )}
          {docs.map((d, i) => (
            <ItemComponent key={d.id} d={d} selected={activeDoc === i} icons={icons} filled={fillCounts[i]} onClick={() => onSelectDoc(i)} />
          ))}
          {!icons && (
            <>
              <div style={{ padding: "20px 16px 4px", color: "var(--ink-4)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>output/</div>
              <div style={{ padding: "0 14px 0 36px", height: 24, display: "flex", alignItems: "center", color: "var(--ink-3)", fontSize: 12 }}>
                <span>prompt.md</span>
              </div>
            </>
          )}
        </div>
        {!icons && (
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-3)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--good)", fontSize: 8 }}>●</span>
                <span style={{ color: "var(--ink-2)" }}>{completedDocs}/{docs.length} docs</span>
              </div>
              <span style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 10 }}>{overallPct}%</span>
            </div>
            <div className="progress-track" style={{ height: 2 }}>
              <div className="progress-fill" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "compose") {
    return (
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
        {docs.map((d, i) => (
          <ItemComponent key={d.id} d={d} selected={activeDoc === i} icons={icons} filled={fillCounts[i]} onClick={() => onSelectDoc(i)} />
        ))}
        {!icons && (
          <>
            <div style={{ height: 1, background: "var(--line)", margin: "12px 4px 8px" }} />
            <div style={{ padding: "2px 8px 8px", fontSize: 11, color: "var(--ink-3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>Overall</span>
                <span style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{overallPct}%</span>
              </div>
              <div className="progress-track" style={{ height: 3 }}>
                <div className="progress-fill" style={{ width: `${overallPct}%` }} />
              </div>
            </div>
          </>
        )}
      </nav>
    );
  }

  // manuscript
  return (
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
      {docs.map((d, i) => (
        <ItemComponent key={d.id} d={d} selected={activeDoc === i} icons={icons} filled={fillCounts[i]} onClick={() => onSelectDoc(i)} />
      ))}
      <div style={{ flex: 1 }} />
      {!icons && (
        <div style={{ padding: 10, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600, marginBottom: 3 }}>Local-first</div>
          <div style={{ fontSize: 10, color: "var(--ink-3)", lineHeight: 1.55 }}>All data stays on your machine. Nothing leaves this window.</div>
        </div>
      )}
    </div>
  );
}
