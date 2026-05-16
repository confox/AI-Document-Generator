import { useState } from "react";

export function ListInput({ id, value, onChange, placeholder, wrapperStyle, rowStyle, badgeStyle, badgePadLength = 1, inputExtraStyle, addStyle }) {
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
            <span style={badgeStyle}>{String(i + 1).padStart(badgePadLength, "0")}</span>
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
