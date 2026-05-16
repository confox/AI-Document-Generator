import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar.jsx";
import { PromptPreview } from "@/components/PromptPreview.jsx";
import { AutosaveIndicator } from "@/components/AutosaveIndicator.jsx";
import { KBD } from "@/components/KBD.jsx";
import { LineInput } from "@/components/inputs/LineInput.jsx";
import { BlockInput } from "@/components/inputs/BlockInput.jsx";
import { ListInput } from "@/components/inputs/ListInput.jsx";
import { getCopyLabel } from "@/utils/ui.js";

export function ComposeDirection({ docs, activeDoc, onSelectDoc, docValues, allValues, onChange, onCopy, onExportAll, copyState, exportState, settings }) {
  const doc = docs[activeDoc];
  const [tab, setTab] = useState("edit");
  const [focusedId, setFocusedId] = useState(null);
  const hidden = settings.sidebar === "hidden";

  useEffect(() => { setTab("edit"); setFocusedId(null); }, [activeDoc]);

  const copyLabel = getCopyLabel(copyState);
  const exportLabel = getCopyLabel(exportState, { idle: "Export", ok: "✓ Copied!", err: "✗ Failed" });

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

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <AutosaveIndicator style={{ color: "var(--ink-3)", fontSize: 11 }} />
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

      {/* Body */}
      <div style={{ display: "flex", overflow: "hidden" }}>
        {!hidden && (
          <Sidebar variant="compose" docs={docs} activeDoc={activeDoc} onSelectDoc={onSelectDoc} allValues={allValues} settings={settings} />
        )}

        {/* Content area */}
        <div style={{
          flex: 1, minWidth: 0, overflow: "hidden",
          display: "grid", gridTemplateColumns: "1fr 240px",
          position: "relative", background: "var(--bg-0)",
        }}>
          {/* Editor */}
          <div style={{ overflowY: "auto", minWidth: 0 }}>
            <div style={{ padding: "32px 52px 140px" }}>
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
              </div>

              {tab === "edit" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {doc.sections.map((s) => {
                    const fid = `${doc.id}-${s.id}`;
                    const focused = focusedId === fid;
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
                          className="field-card"
                          onFocus={() => setFocusedId(fid)}
                          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusedId(null); }}
                        >
                          {s.kind === "line" ? (
                            <LineInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint}
                              style={{ height: 38, padding: "0 14px", fontSize: 13, color: "var(--ink-0)" }} />
                          ) : s.kind === "list" ? (
                            <ListInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint}
                              wrapperStyle={{ padding: "4px 6px" }}
                              rowStyle={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 8px", borderBottom: "1px solid var(--line)" }}
                              badgeStyle={{ minWidth: 20, height: 20, borderRadius: "var(--r-xs)", background: "var(--bg-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--font-mono)", flexShrink: 0, padding: "0 4px", textAlign: "center" }}
                              badgePadLength={1}
                              inputExtraStyle={{ fontSize: 13, padding: "0" }}
                              addStyle={{ color: "var(--ink-3)", fontSize: 12, padding: "8px 16px", textAlign: "left", width: "100%" }}
                            />
                          ) : (
                            <BlockInput id={fid} value={docValues[s.id] || ""} onChange={(v) => onChange(s.id, v)} placeholder={s.hint} rows={s.rows}
                              style={{ padding: "12px 14px", fontSize: 13, color: "var(--ink-0)", lineHeight: 1.65 }} />
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

          {/* FAB */}
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
              <AutosaveIndicator />
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
