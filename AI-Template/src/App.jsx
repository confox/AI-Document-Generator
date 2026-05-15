import { useState, useEffect } from "react";
import { DOCS } from "./docs.js";

const STORAGE_KEY = "ai-docs-values";
const FONT_SERIF = "'Georgia', 'Times New Roman', serif";
const FONT_MONO = "'Courier New', monospace";

function DocCard({ doc, isActive, onClick, filledCount }) {
  const [hovered, setHovered] = useState(false);
  const complete = filledCount === doc.sections.length;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${doc.label}: ${doc.title}`}
      aria-current={isActive ? "page" : undefined}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${doc.color}, #000)`
          : hovered
          ? "rgba(255,255,255,0.07)"
          : "rgba(255,255,255,0.04)",
        border: `2px solid ${
          isActive
            ? doc.accent
            : hovered
            ? "rgba(255,255,255,0.18)"
            : "rgba(255,255,255,0.08)"
        }`,
        borderRadius: "14px",
        padding: "18px 20px",
        textAlign: "left",
        transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        color: "#fff",
        width: "100%",
        boxShadow: isActive ? `0 0 24px ${doc.accent}40` : "none",
        position: "relative",
      }}
    >
      <div aria-hidden="true" style={{ fontSize: "22px", marginBottom: "6px" }}>
        {doc.icon}
      </div>
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "2px",
          color: doc.accent,
          fontFamily: FONT_MONO,
          marginBottom: "4px",
        }}
      >
        #{doc.number}
      </div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: "700",
          fontFamily: FONT_SERIF,
          lineHeight: 1.3,
        }}
      >
        {doc.label}
      </div>

      {filledCount > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: complete ? "#69f0ae" : doc.accent,
            boxShadow: complete
              ? "0 0 6px rgba(105, 240, 174, 0.5)"
              : `0 0 6px ${doc.accent}80`,
          }}
        />
      )}
    </button>
  );
}

function AutoTextarea({ id, value, onChange, placeholder, accentColor }) {
  return (
    <textarea
      id={id}
      ref={(node) => {
        if (node) {
          node.style.height = "auto";
          node.style.height = node.scrollHeight + "px";
        }
      }}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
      }}
      placeholder={placeholder}
      rows={3}
      style={{
        width: "100%",
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "14px 16px",
        color: "#e8e8e8",
        fontSize: "14px",
        lineHeight: "1.7",
        fontFamily: FONT_MONO,
        resize: "none",
        overflow: "hidden",
        minHeight: "90px",
        transition: "border-color 0.2s",
      }}
      onFocus={(e) => (e.target.style.borderColor = `${accentColor}80`)}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  );
}

function DocumentForm({ doc, values, onChange, onClear }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const filledSections = doc.sections.filter(
    (s) => (values[s.id] || "").trim()
  ).length;

  const exportText = () => {
    let text = `# ${doc.title}\n`;
    text += `> ${doc.subtitle}\n\n`;
    doc.sections.forEach((s) => {
      text += `## ${s.title}\n${values[s.id] || "(empty)"}\n\n`;
    });
    text += `---\n💡 ${doc.goldenRule}`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    });
  };

  const copyLabel = copyError ? "✗ Failed" : copied ? "✓ Copied!" : "Copy as Prompt";

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${doc.color} 0%, #050505 100%)`,
          borderRadius: "20px",
          padding: "32px 36px",
          marginBottom: "24px",
          border: `1px solid ${doc.accent}30`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `${doc.accent}12`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "3px",
            color: doc.accent,
            fontFamily: FONT_MONO,
            marginBottom: "8px",
          }}
        >
          DOCUMENT #{doc.number} — {doc.label}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <h2
            style={{
              fontFamily: FONT_SERIF,
              fontSize: "clamp(22px, 3vw, 34px)",
              fontWeight: "900",
              color: "#fff",
              margin: "0 0 8px",
            }}
          >
            <span aria-hidden="true">{doc.icon} </span>
            {doc.title}
          </h2>
          <div
            aria-label={`${filledSections} of ${doc.sections.length} sections filled`}
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "11px",
              fontFamily: FONT_MONO,
              color:
                filledSections === doc.sections.length
                  ? "#69f0ae"
                  : "rgba(255,255,255,0.4)",
              whiteSpace: "nowrap",
              marginTop: "4px",
              transition: "color 0.3s",
            }}
          >
            {filledSections} / {doc.sections.length} sections
          </div>
        </div>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontStyle: "italic",
            margin: 0,
            fontSize: "15px",
          }}
        >
          {doc.subtitle}
        </p>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {doc.sections.map((section) => {
          const fieldId = `${doc.id}-${section.id}`;
          return (
            <div
              key={section.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "22px 24px",
              }}
            >
              <label
                htmlFor={fieldId}
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: doc.accent,
                  marginBottom: "10px",
                  fontFamily: FONT_MONO,
                }}
              >
                <span aria-hidden="true">✦ </span>
                {section.title}
              </label>
              <AutoTextarea
                id={fieldId}
                value={values[section.id] || ""}
                onChange={(val) => onChange(section.id, val)}
                placeholder={section.hint}
                accentColor={doc.accent}
              />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "28px",
          padding: "20px 24px",
          background: `${doc.accent}10`,
          border: `1px solid ${doc.accent}30`,
          borderRadius: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: doc.accent,
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          <span aria-hidden="true">👉 </span>
          {doc.goldenRule}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClear}
            aria-label={`Clear all fields in ${doc.title}`}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "10px 16px",
              fontWeight: "600",
              fontSize: "13px",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
          >
            Clear
          </button>
          <button
            onClick={handleCopy}
            aria-label={`Copy ${doc.title} as prompt`}
            style={{
              background: copyError ? "#ff5252" : doc.accent,
              color: "#000",
              border: "none",
              borderRadius: "8px",
              padding: "10px 22px",
              fontWeight: "800",
              fontSize: "13px",
              letterSpacing: "0.5px",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {copyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeDoc, setActiveDoc] = useState(0);
  const [allValues, setAllValues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [exportedAll, setExportedAll] = useState(false);
  const [exportError, setExportError] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allValues));
  }, [allValues]);

  const docValues = allValues[DOCS[activeDoc].id] || {};

  const handleChange = (fieldId, value) => {
    setAllValues((prev) => ({
      ...prev,
      [DOCS[activeDoc].id]: {
        ...prev[DOCS[activeDoc].id],
        [fieldId]: value,
      },
    }));
  };

  const handleClear = () => {
    setAllValues((prev) => ({
      ...prev,
      [DOCS[activeDoc].id]: {},
    }));
  };

  const handleExportAll = () => {
    let text = "";
    DOCS.forEach((doc) => {
      const vals = allValues[doc.id] || {};
      text += `# ${doc.title}\n> ${doc.subtitle}\n\n`;
      doc.sections.forEach((s) => {
        text += `## ${s.title}\n${vals[s.id] || "(empty)"}\n\n`;
      });
      text += `---\n💡 ${doc.goldenRule}\n\n\n`;
    });
    navigator.clipboard.writeText(text.trim()).then(() => {
      setExportedAll(true);
      setTimeout(() => setExportedAll(false), 2000);
    }).catch(() => {
      setExportError(true);
      setTimeout(() => setExportError(false), 2000);
    });
  };

  const filledCount = (docId) => {
    const vals = allValues[docId] || {};
    const doc = DOCS.find((d) => d.id === docId);
    return doc.sections.filter((s) => (vals[s.id] || "").trim()).length;
  };

  const doc = DOCS[activeDoc];

  const exportLabel = exportError
    ? "✗ Failed"
    : exportedAll
    ? "✓ All Copied!"
    : "Export All";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: "13px",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "2px",
            fontWeight: "700",
          }}
        >
          D4RKWOLF
        </span>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "1.5px",
            color: "rgba(255,255,255,0.2)",
            fontFamily: FONT_MONO,
          }}
        >
          STUDIOS
        </span>
        <span
          aria-hidden="true"
          style={{
            width: "1px",
            height: "16px",
            background: "rgba(255,255,255,0.15)",
          }}
        />
        <span
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.5)",
            fontWeight: "500",
          }}
        >
          AI Project Document Templates
        </span>
        <button
          onClick={handleExportAll}
          aria-label="Export all five documents as a combined prompt"
          style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,0.06)",
            color: exportedAll
              ? "#69f0ae"
              : exportError
              ? "#ff5252"
              : "rgba(255,255,255,0.6)",
            border: `1px solid ${
              exportedAll
                ? "rgba(105, 240, 174, 0.25)"
                : exportError
                ? "rgba(255, 82, 82, 0.25)"
                : "rgba(255,255,255,0.12)"
            }`,
            borderRadius: "8px",
            padding: "7px 16px",
            fontSize: "12px",
            fontWeight: "700",
            fontFamily: FONT_MONO,
            letterSpacing: "0.5px",
            transition: "background 0.2s, color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!exportedAll && !exportError) {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
            }
          }}
          onMouseLeave={(e) => {
            if (!exportedAll && !exportError) {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }
          }}
        >
          {exportLabel}
        </button>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 57px)" }}>
        {/* Sidebar */}
        <nav
          aria-label="Documents"
          style={{
            width: "200px",
            minWidth: "200px",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflowY: "auto",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.25)",
              marginBottom: "8px",
              paddingLeft: "4px",
            }}
          >
            DOCUMENTS
          </div>
          {DOCS.map((d, i) => (
            <DocCard
              key={d.id}
              doc={d}
              isActive={activeDoc === i}
              onClick={() => setActiveDoc(i)}
              filledCount={filledCount(d.id)}
            />
          ))}

          <div
            aria-hidden="true"
            style={{
              marginTop: "auto",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: "9px",
              letterSpacing: "1.5px",
              color: "rgba(255,255,255,0.18)",
              fontFamily: FONT_MONO,
              textAlign: "center",
            }}
          >
            D4RKWOLF STUDIOS
          </div>
        </nav>

        {/* Main */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px",
            display: "flex",
            gap: "24px",
          }}
        >
          <DocumentForm
            doc={doc}
            values={docValues}
            onChange={handleChange}
            onClear={handleClear}
          />
        </main>
      </div>
    </div>
  );
}
