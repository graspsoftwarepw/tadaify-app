/**
 * Shared theme toggle used by both the style-guide control and the dashboard
 * appbar. `dark` on <html> drives the style-guide tokens + the isolation
 * contract; `dark-mode` on <body> drives the reused app dashboard CSS.
 */
export function toggleTheme(): boolean {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  document.body.classList.toggle("dark-mode", next);
  return next;
}
