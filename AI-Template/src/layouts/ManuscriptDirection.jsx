import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar.jsx";
import { PromptPreview } from "@/components/PromptPreview.jsx";
import { AutosaveIndicator } from "@/components/AutosaveIndicator.jsx";
import { LineInput } from "@/components/inputs/LineInput.jsx";
import { BlockInput } from "@/components/inputs/BlockInput.jsx";
import { ListInput } from "@/components/inputs/ListInput.jsx";
import { countFilled } from "@/utils/prompt.js";
import { getCopyLabel } from "@/utils/ui.js";

export function ManuscriptDirection({ docs, activeDoc, onSelectDoc, docValues, allValues, onChange, onCopy, onExportAll, copyState, exportState, settings }) {
  const doc = docs[activeDoc];
  const hidden = settings.sidebar === "hidden";
  const [previewOpen, setPreviewOpen] = useState(true);
  const [focusedIdx, setFocusedIdx] = useState(null);

  useEffect(() => { setFocusedIdx(null); }, [activeDoc]);

  const copyLabel = getCopyLabel(copyState);

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateRows: "60px 1fr", overflow: "hidden" }}>
      {/* Stepper header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "0 20px",
        background: "var(--bg-1)", borderBottom: "1px solid var(--line)", gap: 16,
        flexShrink: 0,
      }}>
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

        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <AutosaveIndicator label="Saved locally" style={{ color: "var(--ink-3)", fontSize: 11 }} />
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
        gridTemplateColumns: hidden ? "1fr" : "auto 1fr",
        overflow: "hidden",
      }}>
        {!hidden && (
          <Sidebar variant="manuscript" docs={docs} activeDoc={activeDoc} onSelectDoc={onSelectDoc} allValues={allValues} settings={settings} />
        )}

        {/* Canvas — flex row so preview panel is outside the scroll flow */}
        <div style={{ display: "flex", overflow: "hidden", background: "var(--bg-0)" }}>
          {/* Scrollable content column */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 52px 200px" }}>
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
                              badgeStyle={{ width: 18, color: focused ? "var(--accent)" : "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, flexShrink: 0, textAlign: "right" }}
                              badgePadLength={2}
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
          </div>

          {/* Preview panel column — outside scroll flow, no float/sticky needed */}
          <div style={{
            flexShrink: 0,
            width: previewOpen ? 312 : 48,
            padding: "20px 20px 20px 0",
            transition: "width 0.2s",
          }}>
            {previewOpen ? (
              <div style={{
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
              <button onClick={() => setPreviewOpen(true)} style={{
                height: 28, padding: "0 12px",
                background: "var(--bg-1)", border: "1px solid var(--line-2)",
                borderRadius: "var(--r-sm)", fontSize: 11, color: "var(--ink-2)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>prompt.md</span>
                <span>↗</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
