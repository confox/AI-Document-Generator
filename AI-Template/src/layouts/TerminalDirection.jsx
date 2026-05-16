import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar.jsx";
import { PromptPreview } from "@/components/PromptPreview.jsx";
import { LineInput } from "@/components/inputs/LineInput.jsx";
import { BlockInput } from "@/components/inputs/BlockInput.jsx";
import { ListInput } from "@/components/inputs/ListInput.jsx";
import { getCopyLabel } from "@/utils/ui.js";

export function TerminalDirection({ docs, activeDoc, onSelectDoc, docValues, allValues, onChange, onCopy, onExportAll, copyState, exportState, settings }) {
  const doc = docs[activeDoc];
  const [focusedIdx, setFocusedIdx] = useState(null);
  const hidden = settings.sidebar === "hidden";

  useEffect(() => { setFocusedIdx(null); }, [activeDoc]);

  const copyLabel = getCopyLabel(copyState, { idle: "$ copy_as_prompt", ok: "✓ copied!", err: "✗ failed" });
  const exportLabel = getCopyLabel(exportState, { idle: "export", ok: "✓ exported!", err: "✗ failed" });

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: hidden ? "1fr" : "auto 1fr",
      gridTemplateRows: "1fr 28px",
      height: "100%",
      overflow: "hidden",
      fontFamily: "var(--font-mono)",
    }}>
      {!hidden && (
        <Sidebar variant="terminal" docs={docs} activeDoc={activeDoc} onSelectDoc={onSelectDoc} allValues={allValues} settings={settings} />
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
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: "var(--ink-4)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}># {doc.n}</div>
              <div style={{ fontSize: 22, color: "var(--ink-0)", fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2 }}>{doc.title}</div>
              <div style={{ color: "var(--ink-2)", marginTop: 6, fontSize: 12 }}>
                <span style={{ color: "var(--accent)" }}>// </span>{doc.purpose}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {doc.sections.map((s, i) => {
                const fid = `${doc.id}-${s.id}`;
                const focused = focusedIdx === i;
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
                        className="field-card"
                        style={{ borderRadius: "var(--r-sm)" }}
                        onFocus={() => setFocusedIdx(i)}
                        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusedIdx(null); }}
                      >
                        {s.kind === "line" ? (
                          <LineInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint}
                            style={{ padding: "9px 12px", color: "var(--ink-0)", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.55 }} />
                        ) : s.kind === "list" ? (
                          <ListInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint}
                            wrapperStyle={{ padding: "8px 10px", fontFamily: "var(--font-mono)", fontSize: 12 }}
                            rowStyle={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 4px", borderBottom: "1px solid var(--line)" }}
                            badgeStyle={null}
                            inputExtraStyle={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                            addStyle={{ color: "var(--ink-4)", fontSize: 11, padding: "6px 4px", textAlign: "left", fontFamily: "var(--font-mono)", width: "100%" }}
                          />
                        ) : (
                          <BlockInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint} rows={s.rows}
                            style={{ padding: "9px 12px", color: "var(--ink-0)", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.55 }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 32, padding: "10px 14px", border: "1px dashed var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--ink-3)", fontSize: 11, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--accent)" }}>?</span>
              <span><span style={{ color: "var(--ink-1)", fontWeight: 500 }}>⌘↵</span> copy prompt</span>
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
      </div>
    </div>
  );
}
