export function loadFromHash(setMany) {
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const decoded = JSON.parse(atob(hash));
    setMany(decoded);
  } catch {}
}
