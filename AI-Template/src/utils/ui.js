export function getCopyLabel(state, { idle = "Copy prompt", ok = "✓ Copied!", err = "✗ Failed" } = {}) {
  return state === "ok" ? ok : state === "err" ? err : idle;
}
