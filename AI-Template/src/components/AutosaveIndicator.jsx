export function AutosaveIndicator({ label = "Autosaved", style }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, ...style }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--good)", flexShrink: 0 }} />
      <span>{label}</span>
    </span>
  );
}
